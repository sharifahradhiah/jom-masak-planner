import { supabase } from '../supabaseClient';
import { ApiError } from './client';

const CATEGORY_ORDER = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Grains & Pantry',
  'Spices',
  'Other',
];

/** Pure aggregation: planned meals + recipe lookup -> grouped grocery list. */
export function deriveGroceryList(plannedMeals, recipeLookup) {
  const map = new Map();

  plannedMeals.forEach((meal) => {
    const recipe = recipeLookup(meal.recipeId);
    if (!recipe) return;
    const servingFactor = (meal.servings || recipe.servings) / recipe.servings;
    recipe.ingredients.forEach((ing) => {
      const key = `${ing.name.toLowerCase()}__${ing.unit}`;
      const scaledQty = Math.round(ing.qty * servingFactor * 100) / 100;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.qty += scaledQty;
        existing.usedIn.add(recipe.name);
      } else {
        map.set(key, {
          id: key,
          name: ing.name,
          unit: ing.unit,
          qty: scaledQty,
          category: ing.category || 'Other',
          usedIn: new Set([recipe.name]),
        });
      }
    });
  });

  const items = Array.from(map.values()).map((item) => ({
    ...item,
    usedIn: Array.from(item.usedIn),
  }));

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: items
      .filter((i) => i.category === category)
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0);

  return grouped;
}

export async function getCheckedState(userId) {
  const { data, error } = await supabase
    .from('grocery_checked')
    .select('item_id, checked')
    .eq('user_id', userId);
  if (error) throw new ApiError(error.message, 'FETCH_FAILED');
  return Object.fromEntries(data.map((row) => [row.item_id, row.checked]));
}

export async function setItemChecked(userId, itemId, checked) {
  const { error } = await supabase
    .from('grocery_checked')
    .upsert({ user_id: userId, item_id: itemId, checked });
  if (error) throw new ApiError(error.message, 'UPDATE_FAILED');
  return getCheckedState(userId);
}

export async function getExtraItems(userId) {
  const { data, error } = await supabase
    .from('grocery_extra_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw new ApiError(error.message, 'FETCH_FAILED');
  return data.map((row) => ({ id: row.id, name: row.name, category: row.category, qty: row.qty }));
}

export async function addExtraItem(userId, item) {
  const { data, error } = await supabase
    .from('grocery_extra_items')
    .insert({
      user_id: userId,
      name: item.name,
      category: item.category || 'Other',
      qty: item.qty || '',
    })
    .select()
    .single();
  if (error) throw new ApiError(error.message, 'CREATE_FAILED');
  return { id: data.id, name: data.name, category: data.category, qty: data.qty };
}

export async function removeExtraItem(userId, itemId) {
  const { error } = await supabase
    .from('grocery_extra_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);
  if (error) throw new ApiError(error.message, 'DELETE_FAILED');
  return true;
}

export { CATEGORY_ORDER };
