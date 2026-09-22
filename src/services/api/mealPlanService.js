import { supabase } from '../supabaseClient';
import { ApiError } from './client';
import { isPast } from '../../utils/date';

function mapRow(row) {
  return {
    id: row.id,
    date: row.date,
    mealType: row.meal_type,
    recipeId: row.recipe_id,
    servings: row.servings,
    source: row.source,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

/** Returns planned meals between startDate and endDate (inclusive, 'YYYY-MM-DD'). */
export async function getPlannedMeals(userId, startDate, endDate) {
  let query = supabase.from('planned_meals').select('*').eq('user_id', userId);
  if (startDate) {
    query = query.gte('date', startDate).lte('date', endDate || startDate);
  }
  const { data, error } = await query;
  if (error) throw new ApiError(error.message, 'FETCH_FAILED');
  return data.map(mapRow);
}

export async function addPlannedMeal(userId, entry) {
  if (!entry.date || !entry.mealType || !entry.recipeId) {
    throw new ApiError('Meal needs a date, meal type, and recipe.', 'INVALID_MEAL');
  }
  if (isPast(entry.date)) {
    throw new ApiError('Cannot plan a meal for a past date.', 'PAST_DATE');
  }
  const { data, error } = await supabase
    .from('planned_meals')
    .insert({
      user_id: userId,
      date: entry.date,
      meal_type: entry.mealType,
      recipe_id: entry.recipeId,
      servings: entry.servings || 2,
      source: entry.source || 'manual',
      notes: entry.notes || '',
    })
    .select()
    .single();
  if (error) throw new ApiError(error.message, 'CREATE_FAILED');
  return mapRow(data);
}

/** Bulk insert — used when accepting an AI-generated week or adding a plan. */
export async function addPlannedMeals(userId, entries) {
  const rows = entries
    .filter((entry) => !isPast(entry.date))
    .map((entry) => ({
      user_id: userId,
      date: entry.date,
      meal_type: entry.mealType,
      recipe_id: entry.recipeId,
      servings: entry.servings || 2,
      source: entry.source || 'ai',
      notes: entry.notes || '',
    }));
  if (!rows.length) return [];

  const { data, error } = await supabase.from('planned_meals').insert(rows).select();
  if (error) throw new ApiError(error.message, 'CREATE_FAILED');
  return data.map(mapRow);
}

export async function updatePlannedMeal(userId, mealId, updates) {
  const current = await supabase
    .from('planned_meals')
    .select('date')
    .eq('id', mealId)
    .eq('user_id', userId)
    .maybeSingle();
  if (current.error) throw new ApiError(current.error.message, 'FETCH_FAILED');
  if (!current.data) throw new ApiError('Meal not found.', 'NOT_FOUND');
  if (isPast(current.data.date) || isPast(updates.date || current.data.date)) {
    throw new ApiError('Cannot update a meal on a past date.', 'PAST_DATE');
  }

  const patch = {};
  if (updates.date !== undefined) patch.date = updates.date;
  if (updates.mealType !== undefined) patch.meal_type = updates.mealType;
  if (updates.recipeId !== undefined) patch.recipe_id = updates.recipeId;
  if (updates.servings !== undefined) patch.servings = updates.servings;
  if (updates.source !== undefined) patch.source = updates.source;
  if (updates.notes !== undefined) patch.notes = updates.notes;

  const { data, error } = await supabase
    .from('planned_meals')
    .update(patch)
    .eq('id', mealId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw new ApiError(error.message, 'UPDATE_FAILED');
  return mapRow(data);
}

export async function removePlannedMeal(userId, mealId) {
  const { error } = await supabase
    .from('planned_meals')
    .delete()
    .eq('id', mealId)
    .eq('user_id', userId);
  if (error) throw new ApiError(error.message, 'DELETE_FAILED');
  return true;
}

export async function clearRange(userId, startDate, endDate) {
  const { error } = await supabase
    .from('planned_meals')
    .delete()
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);
  if (error) throw new ApiError(error.message, 'DELETE_FAILED');
  return true;
}
