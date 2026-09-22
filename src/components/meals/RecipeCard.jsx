import { Clock, Users, Sparkles } from 'lucide-react';
import Badge from '../ui/Badge';

export default function RecipeCard({ recipe, onClick }) {
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
        {recipe.tags.slice(0, 2).map((t) => (
          <Badge key={t} tone="sage" className="text-[10px]">
            {t}
          </Badge>
        ))}
      </div>
    </button>
  );
}
