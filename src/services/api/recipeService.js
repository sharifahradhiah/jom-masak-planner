import { supabase } from '../supabaseClient';
import { ApiError } from './client';
import { CUSTOM_RECIPE_TAG } from '../../data/mockRecipes';

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    color: row.color,
    cuisine: row.cuisine,
    mealTypes: row.meal_types,
    tags: row.tags,
    leftoverFriendly: row.leftover_friendly,
    calories: row.calories,
    prepTime: row.prep_time,
    servings: row.servings,
    ingredients: row.ingredients,
    isCustom: row.owner_id !== null,
  };
}

export async function getRecipes(filters = {}) {
  let query = supabase.from('recipes').select('*');

  if (filters.mealType) {
    query = query.contains('meal_types', [filters.mealType]);
  }
  if (filters.query) {
    query = query.ilike('name', `%${filters.query}%`);
  }
  if (filters.tags && filters.tags.length) {
    query = query.contains('tags', filters.tags);
  }
  if (filters.cuisine) {
    query = query.eq('cuisine', filters.cuisine);
  }

  const { data, error } = await query;
  if (error) throw new ApiError(error.message, 'FETCH_FAILED');
  return data.map(mapRow);
}

export async function getRecipeById(id) {
  const { data, error } = await supabase.from('recipes').select('*').eq('id', id).maybeSingle();
  if (error) throw new ApiError(error.message, 'FETCH_FAILED');
  return data ? mapRow(data) : null;
}

export async function createRecipe(recipe) {
  if (!recipe.name || !recipe.mealTypes?.length) {
    throw new ApiError('Recipe needs a name and at least one meal type.', 'INVALID_RECIPE');
  }
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new ApiError('You need to be signed in to create a recipe.', 'NOT_AUTHENTICATED');
  }

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      owner_id: user.id,
      name: recipe.name,
      emoji: recipe.emoji || '🍽️',
      color: recipe.color || 'terracotta',
      cuisine: recipe.cuisine || 'Custom',
      meal_types: recipe.mealTypes,
      tags: Array.from(new Set([...(recipe.tags || []), CUSTOM_RECIPE_TAG.id])),
      leftover_friendly: recipe.leftoverFriendly || false,
      calories: Number(recipe.calories) || 0,
      prep_time: Number(recipe.prepTime) || 0,
      servings: Number(recipe.servings) || 1,
      ingredients: recipe.ingredients || [],
    })
    .select()
    .single();
  if (error) throw new ApiError(error.message, 'CREATE_FAILED');
  return mapRow(data);
}

export async function updateRecipe(id, updates) {
  const patch = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.emoji !== undefined) patch.emoji = updates.emoji;
  if (updates.color !== undefined) patch.color = updates.color;
  if (updates.cuisine !== undefined) patch.cuisine = updates.cuisine;
  if (updates.mealTypes !== undefined) patch.meal_types = updates.mealTypes;
  if (updates.tags !== undefined) patch.tags = updates.tags;
  if (updates.leftoverFriendly !== undefined) patch.leftover_friendly = updates.leftoverFriendly;
  if (updates.calories !== undefined) patch.calories = Number(updates.calories);
  if (updates.prepTime !== undefined) patch.prep_time = Number(updates.prepTime);
  if (updates.servings !== undefined) patch.servings = Number(updates.servings);
  if (updates.ingredients !== undefined) patch.ingredients = updates.ingredients;

  const { data, error } = await supabase
    .from('recipes')
    .update(patch)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new ApiError(error.message, 'UPDATE_FAILED');
  if (!data) throw new ApiError('Only custom recipes can be edited.', 'NOT_EDITABLE');
  return mapRow(data);
}

export async function deleteRecipe(id) {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw new ApiError(error.message, 'DELETE_FAILED');
  return true;
}
