import { Clock, Users, Sparkles } from 'lucide-react';
import Badge from '../ui/Badge';
import { DIET_TAGS, CUSTOM_RECIPE_TAG } from '../../data/mockRecipes';

const TAG_LABELS = Object.fromEntries(
  [...DIET_TAGS, CUSTOM_RECIPE_TAG].map((tag) => [tag.id, tag.label])
);

export default function RecipeCard({ recipe, onClick }) {
  const isMyRecipe = recipe.tags.includes(CUSTOM_RECIPE_TAG.id);
  const displayTags = isMyRecipe
    ? [CUSTOM_RECIPE_TAG.id, ...recipe.tags.filter((t) => t !== CUSTOM_RECIPE_TAG.id)]
    : recipe.tags;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-2xl border border-cream-200 bg-white p-4 text-left transition-shadow hover:shadow-card"
    >
      <div className="flex w-full items-start justify-between">
        <span className="text-3xl">{recipe.emoji}</span>
        {recipe.isCustom && (
          <Badge tone="honey" icon={Sparkles}>
            Mine
          </Badge>
        )}
      </div>
      <p className="font-display text-sm font-semibold leading-snug text-ink-900">{recipe.name}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {recipe.prepTime}m
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" /> {recipe.servings}
        </span>
        <span>{recipe.calories} kcal</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {displayTags.slice(0, 3).map((t) => (
          <Badge key={t} tone={t === CUSTOM_RECIPE_TAG.id ? 'honey' : 'sage'} className="text-[10px]">
            {TAG_LABELS[t] || t}
          </Badge>
        ))}
      </div>
    </button>
  );
}
