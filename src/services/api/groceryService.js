import { request } from './client';
import { readStore, writeStore } from '../storage';
import { generateId } from '../../utils/id';

const CHECKED_KEY = 'groceryChecked';
const EXTRA_ITEMS_KEY = 'groceryExtraItems';

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

export function getCheckedState(userId) {
  return request(() => readStore(CHECKED_KEY, {})[userId] || {}, { latency: 50 });
}

export function setItemChecked(userId, itemId, checked) {
  return request(() => {
    const all = readStore(CHECKED_KEY, {});
    all[userId] = { ...(all[userId] || {}), [itemId]: checked };
    writeStore(CHECKED_KEY, all);
    return all[userId];
  }, { latency: 40 });
}

export function getExtraItems(userId) {
  return request(() => readStore(EXTRA_ITEMS_KEY, {})[userId] || [], { latency: 50 });
}

export function addExtraItem(userId, item) {
  return request(() => {
    const all = readStore(EXTRA_ITEMS_KEY, {});
    const list = all[userId] || [];
    const newItem = { id: generateId('grocery'), name: item.name, category: item.category || 'Other', qty: item.qty || '' };
    all[userId] = [...list, newItem];
    writeStore(EXTRA_ITEMS_KEY, all);
    return newItem;
  }, { latency: 80 });
}

export function removeExtraItem(userId, itemId) {
  return request(() => {
    const all = readStore(EXTRA_ITEMS_KEY, {});
    all[userId] = (all[userId] || []).filter((i) => i.id !== itemId);
    writeStore(EXTRA_ITEMS_KEY, all);
    return true;
  }, { latency: 50 });
}

export { CATEGORY_ORDER };
