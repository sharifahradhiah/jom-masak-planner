import { useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useToast } from '../contexts/ToastContext';
import { DIET_TAGS, CUSTOM_RECIPE_TAG } from '../data/mockRecipes';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';
import ChipToggle from '../components/ui/ChipToggle';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import RecipeCard from '../components/meals/RecipeCard';
import RecipeDetailModal from '../components/meals/RecipeDetailModal';
import RecipeFormModal from '../components/meals/RecipeFormModal';
import AddToPlanModal from '../components/meals/AddToPlanModal';

const SCOPE_OPTIONS = [
  { value: 'all', label: 'All recipes' },
  { value: 'mine', label: 'My recipes' },
];

export default function RecipesPage() {
  const { recipes, addMeal, createCustomRecipe, deleteCustomRecipe } = useMealPlan();
  const { showToast } = useToast();

  const [scope, setScope] = useState('all');
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [addingRecipe, setAddingRecipe] = useState(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (scope === 'mine' && !r.isCustom) return false;
      if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (activeTags.length && !activeTags.every((t) => r.tags.includes(t))) return false;
      return true;
    });
  }, [recipes, scope, query, activeTags]);

  async function handleSaveNewRecipe(recipe) {
    const created = await createCustomRecipe(recipe);
    showToast(`${created.name} added to your recipes`);
  }

  async function handleConfirmAddToPlan({ date, mealType }) {
    try {
      await addMeal({ date, mealType, recipeId: addingRecipe.id });
      showToast(`${addingRecipe.name} added to ${date}`);
      setSelectedRecipe(null);
    } catch (err) {
      showToast(err.message || "Couldn't save that meal", 'info');
    }
  }

  async function handleDelete(recipe) {
    await deleteCustomRecipe(recipe.id);
    setSelectedRecipe(null);
    showToast('Recipe deleted', 'info');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Recipes"
        subtitle="Browse the library or manage the meals you've created."
        action={
          <Button onClick={() => setCreating(true)} size="sm">
            <Plus className="h-4 w-4" /> New recipe
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SegmentedControl options={SCOPE_OPTIONS} value={scope} onChange={setScope} />
          <div className="flex items-center gap-2 rounded-xl border border-cream-300 bg-white px-3 py-2 sm:w-72">
            <Search className="h-4 w-4 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-300"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
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
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={scope === 'mine' ? "You haven't created any recipes yet" : 'No recipes match your filters'}
          description={
            scope === 'mine'
              ? 'Add your family favorites so they show up when planning meals.'
              : 'Try clearing search or filters.'
          }
          action={
            scope === 'mine' && (
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> Create your first recipe
              </Button>
            )
          }
        />
      )}

      <RecipeDetailModal
        open={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        recipe={selectedRecipe}
        onAddToPlan={() => setAddingRecipe(selectedRecipe)}
        onDelete={handleDelete}
      />

      <AddToPlanModal
        open={!!addingRecipe}
        onClose={() => setAddingRecipe(null)}
        recipe={addingRecipe}
        onConfirm={handleConfirmAddToPlan}
      />

      <RecipeFormModal open={creating} onClose={() => setCreating(false)} onSave={handleSaveNewRecipe} />
    </PageContainer>
  );
}
