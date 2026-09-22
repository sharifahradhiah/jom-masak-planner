import { useMemo, useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ChipToggle from '../ui/ChipToggle';
import Badge from '../ui/Badge';
import { DIET_TAGS, CUSTOM_RECIPE_TAG, RECIPE_EMOJIS } from '../../data/mockRecipes';
import { CATEGORY_ORDER } from '../../services/api/groceryService';

const MEAL_TYPE_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

const EMPTY_INGREDIENT = { name: '', qty: 1, unit: '', category: 'Produce' };

export default function RecipePickerModal({
  open,
  onClose,
  mealType,
  date,
  recipes,
  onSelectRecipe,
  onCreateRecipe,
}) {
  const [mode, setMode] = useState('browse');
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({
    name: '',
    emoji: '🍽️',
    cuisine: '',
    calories: '',
    prepTime: '',
    servings: 2,
    ingredients: [{ ...EMPTY_INGREDIENT }],
  });

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (mealType && !r.mealTypes.includes(mealType)) return false;
      if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (activeTags.length && !activeTags.every((t) => r.tags.includes(t))) return false;
      return true;
    });
  }, [recipes, mealType, query, activeTags]);

  function resetAndClose() {
    setMode('browse');
    setQuery('');
    setActiveTags([]);
    setCreateError('');
    setForm({
      name: '',
      emoji: '🍽️',
      cuisine: '',
      calories: '',
      prepTime: '',
      servings: 2,
      ingredients: [{ ...EMPTY_INGREDIENT }],
    });
    onClose();
  }

  function updateIngredient(idx, updates) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) => (i === idx ? { ...ing, ...updates } : ing)),
    }));
  }

  function addIngredientRow() {
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { ...EMPTY_INGREDIENT }] }));
  }

  function removeIngredientRow(idx) {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const recipe = await onCreateRecipe({
        name: form.name,
        emoji: form.emoji || '🍽️',
        cuisine: form.cuisine || 'Custom',
        calories: form.calories,
        prepTime: form.prepTime,
        servings: form.servings,
        mealTypes: [mealType],
        tags: [],
        ingredients: form.ingredients
          .filter((i) => i.name.trim())
          .map((i) => ({ ...i, qty: Number(i.qty) || 1 })),
      });
      onSelectRecipe(recipe);
      resetAndClose();
    } catch (err) {
      setCreateError(err.message || 'Could not save this recipe. Try again.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      size="lg"
      title={
        mealType
          ? `Add ${MEAL_TYPE_LABEL[mealType] || mealType}${date ? ` · ${date}` : ''}`
          : 'Add a meal'
      }
    >
      <div className="mb-4 inline-flex rounded-xl bg-cream-200 p-1">
        {['browse', 'create'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
              mode === m ? 'bg-white text-ink-900 shadow-card' : 'text-ink-500'
            }`}
          >
            {m === 'browse' ? 'Browse recipes' : 'Create your own'}
          </button>
        ))}
      </div>

      {mode === 'browse' ? (
        <div>
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2">
            <Search className="h-4 w-4 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-300"
            />
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {[...DIET_TAGS, CUSTOM_RECIPE_TAG].map((tag) => (
              <ChipToggle
                key={tag.id}
                label={tag.label}
                selected={activeTags.includes(tag.id)}
                onClick={() =>
                  setActiveTags((prev) =>
                    prev.includes(tag.id) ? prev.filter((t) => t !== tag.id) : [...prev, tag.id]
                  )
                }
                className="px-3 py-1 text-xs"
              />
            ))}
          </div>
          <div className="grid max-h-[52vh] gap-2 overflow-y-auto sm:grid-cols-2">
            {filtered.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => {
                  onSelectRecipe(recipe);
                  resetAndClose();
                }}
                className="flex items-center gap-3 rounded-xl border border-cream-200 bg-white p-3 text-left hover:border-terracotta-300 hover:shadow-card"
              >
                <span className="text-2xl">{recipe.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{recipe.name}</p>
                  <p className="text-xs text-ink-400">
                    {recipe.calories} kcal · {recipe.prepTime}m · {recipe.cuisine}
                  </p>
                </div>
                <Badge tone={recipe.color || 'ink'}>{recipe.mealTypes[0]}</Badge>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-2 py-8 text-center text-sm text-ink-400">
                No recipes match — try clearing filters or create your own.
              </p>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
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
                placeholder="Mom's chicken adobo"
                className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-terracotta-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
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
                onClick={addIngredientRow}
                className="flex items-center gap-1 text-xs font-semibold text-terracotta-600"
              >
                <Plus className="h-3.5 w-3.5" /> Add ingredient
              </button>
            </div>
            <div className="space-y-2">
              {form.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    placeholder="Ingredient"
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, { name: e.target.value })}
                    className="flex-1 rounded-lg border border-cream-300 bg-cream-50 px-2.5 py-1.5 text-sm outline-none focus:border-terracotta-400"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={ing.qty}
                    onChange={(e) => updateIngredient(idx, { qty: e.target.value })}
                    className="w-16 rounded-lg border border-cream-300 bg-cream-50 px-2.5 py-1.5 text-sm outline-none focus:border-terracotta-400"
                  />
                  <input
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(idx, { unit: e.target.value })}
                    className="w-20 rounded-lg border border-cream-300 bg-cream-50 px-2.5 py-1.5 text-sm outline-none focus:border-terracotta-400"
                  />
                  <select
                    value={ing.category}
                    onChange={(e) => updateIngredient(idx, { category: e.target.value })}
                    className="w-32 rounded-lg border border-cream-300 bg-cream-50 px-2 py-1.5 text-xs outline-none focus:border-terracotta-400"
                  >
                    {CATEGORY_ORDER.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeIngredientRow(idx)}
                    className="rounded-lg p-1.5 text-ink-400 hover:bg-terracotta-50 hover:text-terracotta-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {createError && <p className="text-sm font-medium text-terracotta-600">{createError}</p>}

          <Button type="submit" className="w-full justify-center" loading={creating}>
            Save & add to {date}
          </Button>
        </form>
      )}
    </Modal>
  );
}
