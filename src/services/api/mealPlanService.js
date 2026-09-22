import { request, ApiError } from './client';
import { readStore, writeStore } from '../storage';
import { generateId } from '../../utils/id';
import { isPast } from '../../utils/date';

const PLANNED_MEALS_KEY = 'plannedMeals';

function getAll(userId) {
  const all = readStore(PLANNED_MEALS_KEY, {});
  return all[userId] || [];
}

function saveAll(userId, meals) {
  const all = readStore(PLANNED_MEALS_KEY, {});
  all[userId] = meals;
  writeStore(PLANNED_MEALS_KEY, all);
}

/** Returns planned meals between startDate and endDate (inclusive, 'YYYY-MM-DD'). */
export function getPlannedMeals(userId, startDate, endDate) {
  return request(() => {
    const meals = getAll(userId);
    if (!startDate) return meals;
    return meals.filter((m) => m.date >= startDate && m.date <= (endDate || startDate));
  }, { latency: 150 });
}

export function addPlannedMeal(userId, entry) {
  return request(() => {
    if (!entry.date || !entry.mealType || !entry.recipeId) {
      throw new ApiError('Meal needs a date, meal type, and recipe.', 'INVALID_MEAL');
    }
    if (isPast(entry.date)) {
      throw new ApiError('Cannot plan a meal for a past date.', 'PAST_DATE');
    }
    const meals = getAll(userId);
    const newMeal = {
      id: generateId('meal'),
      date: entry.date,
      mealType: entry.mealType,
      recipeId: entry.recipeId,
      servings: entry.servings || 2,
      source: entry.source || 'manual',
      notes: entry.notes || '',
      createdAt: new Date().toISOString(),
    };
    meals.push(newMeal);
    saveAll(userId, meals);
    return newMeal;
  });
}

/** Bulk insert — used when accepting an AI-generated week or adding a plan. */
export function addPlannedMeals(userId, entries) {
  return request(() => {
    const meals = getAll(userId);
    const created = entries.filter((entry) => !isPast(entry.date)).map((entry) => ({
      id: generateId('meal'),
      date: entry.date,
      mealType: entry.mealType,
      recipeId: entry.recipeId,
      servings: entry.servings || 2,
      source: entry.source || 'ai',
      notes: entry.notes || '',
      createdAt: new Date().toISOString(),
    }));
    const merged = [...meals, ...created];
    saveAll(userId, merged);
    return created;
  }, { latency: 400 });
}

export function updatePlannedMeal(userId, mealId, updates) {
  return request(() => {
    const meals = getAll(userId);
    const idx = meals.findIndex((m) => m.id === mealId);
    if (idx === -1) throw new ApiError('Meal not found.', 'NOT_FOUND');
    if (isPast(meals[idx].date) || isPast(updates.date || meals[idx].date)) {
      throw new ApiError('Cannot update a meal on a past date.', 'PAST_DATE');
    }
    meals[idx] = { ...meals[idx], ...updates };
    saveAll(userId, meals);
    return meals[idx];
  });
}

export function removePlannedMeal(userId, mealId) {
  return request(() => {
    const meals = getAll(userId).filter((m) => m.id !== mealId);
    saveAll(userId, meals);
    return true;
  }, { latency: 100 });
}

export function clearRange(userId, startDate, endDate) {
  return request(() => {
    const meals = getAll(userId).filter((m) => !(m.date >= startDate && m.date <= endDate));
    saveAll(userId, meals);
    return true;
  }, { latency: 100 });
}
