import { Plus, X, RotateCcw } from 'lucide-react';

const TYPE_ICON_TONE = {
  breakfast: 'text-honey-500',
  lunch: 'text-sage-500',
  dinner: 'text-terracotta-500',
  snack: 'text-ink-500',
};

export default function MealSlot({ mealType, recipe, onAdd, onRemove, onSwap, compact = false, disabled = false }) {
  if (!recipe) {
    if (disabled) {
      return (
        <div
          className={`flex w-full items-center gap-2 rounded-xl border border-dashed border-cream-300 bg-cream-100 px-3 text-left text-sm font-medium text-ink-300 ${
            compact ? 'py-2' : 'py-3'
          }`}
          title="Past dates can't be planned"
        >
          <Plus className="h-4 w-4" />
          Add {mealType}
        </div>
      );
    }
    return (
      <button
        onClick={onAdd}
        className={`flex w-full items-center gap-2 rounded-xl border border-dashed border-cream-400 bg-cream-50 px-3 text-left text-sm font-medium text-ink-400 hover:border-terracotta-300 hover:text-terracotta-600 ${
          compact ? 'py-2' : 'py-3'
        }`}
      >
        <Plus className="h-4 w-4" />
        Add {mealType}
      </button>
    );
  }

  return (
    <div className="group flex items-center gap-2.5 rounded-xl border border-cream-200 bg-white px-3 py-2.5 shadow-card">
      <span className="text-lg leading-none">{recipe.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-ink-900 sm:truncate" title={recipe.name}>
          {recipe.name}
        </p>
        {!compact && <p className="text-xs text-ink-400">{recipe.calories} kcal · {recipe.prepTime}m</p>}
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        {onSwap && !disabled && (
          <button
            onClick={onSwap}
            className="rounded-lg p-1 text-ink-400 hover:bg-cream-200 hover:text-ink-700"
            aria-label="Swap meal"
            title="Swap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={onRemove}
          className="rounded-lg p-1 text-ink-400 hover:bg-terracotta-50 hover:text-terracotta-600"
          aria-label="Remove meal"
          title="Remove"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export { TYPE_ICON_TONE };
