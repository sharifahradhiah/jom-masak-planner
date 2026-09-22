import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ChipToggle from '../ui/ChipToggle';
import { DIET_TAGS, CUISINES, MEAL_TYPES, RECIPE_EMOJIS } from '../../data/mockRecipes';
import { CATEGORY_ORDER } from '../../services/api/groceryService';

const MEAL_TYPE_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
const EMPTY_INGREDIENT = { name: '', qty: 1, unit: '', category: 'Produce' };
const EMPTY_FORM = {
  name: '',
  emoji: '🍽️',
  cuisine: '',
  calories: '',
  prepTime: '',
  servings: 2,
  mealTypes: [],
  tags: [],
  ingredients: [{ ...EMPTY_INGREDIENT }],
};

export default function RecipeFormModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setForm(EMPTY_FORM);
    setError('');
  }

  function toggle(key, value) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));
  }

  function updateIngredient(idx, updates) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) => (i === idx ? { ...ing, ...updates } : ing)),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.mealTypes.length === 0) return;
    setError('');
    setSaving(true);
    try {
      await onSave({
        ...form,
        emoji: form.emoji || '🍽️',
        cuisine: form.cuisine || 'Custom',
        ingredients: form.ingredients
          .filter((i) => i.name.trim())
          .map((i) => ({ ...i, qty: Number(i.qty) || 1 })),
      });
      reset();
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save this recipe. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      size="lg"
      title="Create your own meal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="w-20">
            <label className="mb-1 block text-xs font-medium text-ink-600">Emoji</label>
            <select
              value={form.emoji}
              onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-1 py-2 text-center text-lg outline-none focus:border-terracotta-400"
            >
              {RECIPE_EMOJIS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-ink-600">Meal name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Mom's fried chicken"
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-terracotta-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-600">
            When do you eat this? <span className="text-terracotta-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((type) => (
              <ChipToggle
                key={type}
                label={MEAL_TYPE_LABEL[type]}
                selected={form.mealTypes.includes(type)}
                onClick={() => toggle('mealTypes', type)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-600">Tags</label>
          <div className="flex flex-wrap gap-2">
            {DIET_TAGS.map((tag) => (
              <ChipToggle
                key={tag.id}
                label={tag.label}
                selected={form.tags.includes(tag.id)}
                onClick={() => toggle('tags', tag.id)}
                className="px-3 py-1 text-xs"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1 block text-xs font-medium text-ink-600">Cuisine</label>
            <select
              value={form.cuisine}
              onChange={(e) => setForm((f) => ({ ...f, cuisine: e.target.value }))}
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-2 py-2 text-sm outline-none focus:border-terracotta-400"
            >
              <option value="">Custom</option>
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">Calories</label>
            <input
              type="number"
              min="0"
              value={form.calories}
              onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-terracotta-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">Prep (min)</label>
            <input
              type="number"
              min="0"
              value={form.prepTime}
              onChange={(e) => setForm((f) => ({ ...f, prepTime: e.target.value }))}
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-terracotta-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">Servings</label>
            <input
              type="number"
              min="1"
              value={form.servings}
              onChange={(e) => setForm((f) => ({ ...f, servings: e.target.value }))}
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-terracotta-400"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium text-ink-600">Ingredients (for grocery list)</label>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, ingredients: [...f.ingredients, { ...EMPTY_INGREDIENT }] }))
              }
              className="flex items-center gap-1 text-xs font-semibold text-terracotta-600"
            >
              <Plus className="h-3.5 w-3.5" /> Add ingredient
            </button>
          </div>
          <div className="space-y-2">
            {form.ingredients.map((ing, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <input
                  placeholder="Ingredient"
                  value={ing.name}
                  onChange={(e) => updateIngredient(idx, { name: e.target.value })}
                  className="w-full rounded-lg border border-cream-300 bg-cream-50 px-2.5 py-1.5 text-sm outline-none focus:border-terracotta-400 sm:w-auto sm:flex-1"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Qty"
                  value={ing.qty}
                  onChange={(e) => updateIngredient(idx, { qty: e.target.value })}
                  className="w-16 flex-1 rounded-lg border border-cream-300 bg-cream-50 px-2.5 py-1.5 text-sm outline-none focus:border-terracotta-400 sm:flex-none"
                />
                <input
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(idx, { unit: e.target.value })}
                  className="w-20 flex-1 rounded-lg border border-cream-300 bg-cream-50 px-2.5 py-1.5 text-sm outline-none focus:border-terracotta-400 sm:flex-none"
                />
                <select
                  value={ing.category}
                  onChange={(e) => updateIngredient(idx, { category: e.target.value })}
                  className="w-full flex-1 rounded-lg border border-cream-300 bg-cream-50 px-2 py-1.5 text-xs outline-none focus:border-terracotta-400 sm:w-32 sm:flex-none"
                >
                  {CATEGORY_ORDER.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }))
                  }
                  className="shrink-0 rounded-lg p-1.5 text-ink-400 hover:bg-terracotta-50 hover:text-terracotta-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm font-medium text-terracotta-600">{error}</p>}

        <Button type="submit" className="w-full justify-center" loading={saving} disabled={form.mealTypes.length === 0}>
          Save recipe
        </Button>
      </form>
    </Modal>
  );
}
