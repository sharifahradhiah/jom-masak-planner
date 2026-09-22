import { request, ApiError } from './client';
import { readStore, writeStore } from '../storage';
import { generateId } from '../../utils/id';
import { RECIPES } from '../../data/mockRecipes';

const CUSTOM_RECIPES_KEY = 'customRecipes';

function getCustomRecipes() {
  return readStore(CUSTOM_RECIPES_KEY, []);
}

function saveCustomRecipes(recipes) {
  writeStore(CUSTOM_RECIPES_KEY, recipes);
}

function allRecipes() {
  return [...getCustomRecipes(), ...RECIPES];
}

export function getRecipes(filters = {}) {
  return request(() => {
    let list = allRecipes();
    if (filters.mealType) {
      list = list.filter((r) => r.mealTypes.includes(filters.mealType));
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (filters.tags && filters.tags.length) {
      list = list.filter((r) => filters.tags.every((t) => r.tags.includes(t)));
    }
    if (filters.cuisine) {
      list = list.filter((r) => r.cuisine === filters.cuisine);
    }
    return list;
  });
}

export function getRecipeById(id) {
  return request(() => allRecipes().find((r) => r.id === id) || null, { latency: 60 });
}

export function createRecipe(recipe) {
  return request(() => {
    if (!recipe.name || !recipe.mealTypes?.length) {
      throw new ApiError('Recipe needs a name and at least one meal type.', 'INVALID_RECIPE');
    }
    const custom = getCustomRecipes();
    const newRecipe = {
      id: generateId('rc'),
      emoji: recipe.emoji || '🍽️',
      color: recipe.color || 'terracotta',
      cuisine: recipe.cuisine || 'Custom',
      calories: Number(recipe.calories) || 0,
      prepTime: Number(recipe.prepTime) || 0,
      servings: Number(recipe.servings) || 1,
      tags: recipe.tags || [],
      ingredients: recipe.ingredients || [],
      isCustom: true,
      ...recipe,
    };
    custom.unshift(newRecipe);
    saveCustomRecipes(custom);
    return newRecipe;
  });
}

export function updateRecipe(id, updates) {
  return request(() => {
    const custom = getCustomRecipes();
    const idx = custom.findIndex((r) => r.id === id);
    if (idx === -1) throw new ApiError('Only custom recipes can be edited.', 'NOT_EDITABLE');
    custom[idx] = { ...custom[idx], ...updates };
    saveCustomRecipes(custom);
    return custom[idx];
  });
}

export function deleteRecipe(id) {
  return request(() => {
    const custom = getCustomRecipes().filter((r) => r.id !== id);
    saveCustomRecipes(custom);
    return true;
  }, { latency: 100 });
}
