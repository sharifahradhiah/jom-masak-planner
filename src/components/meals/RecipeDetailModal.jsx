import { Clock, Users, Flame, CalendarPlus, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function RecipeDetailModal({ open, onClose, recipe, onAddToPlan, onDelete }) {
  if (!recipe) return null;

  return (
    <Modal open={open} onClose={onClose} title={recipe.name} size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{recipe.emoji}</span>
          <div className="flex flex-wrap gap-3 text-sm text-ink-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {recipe.prepTime} min
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {recipe.servings} servings
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4" /> {recipe.calories} kcal
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge tone="ink">{recipe.cuisine}</Badge>
          {recipe.tags.map((t) => (
            <Badge key={t} tone="sage">
              {t}
            </Badge>
          ))}
          {recipe.mealTypes.map((m) => (
            <Badge key={m} tone="terracotta">
              {m}
            </Badge>
          ))}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink-900">Ingredients</p>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ing) => (
              <li
                key={ing.name}
                className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2 text-sm text-ink-700"
              >
                <span>{ing.name}</span>
                <span className="text-ink-400">
                  {ing.qty} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={onAddToPlan} className="flex-1 justify-center">
            <CalendarPlus className="h-4 w-4" /> Add to planner
          </Button>
          {recipe.isCustom && (
            <Button onClick={() => onDelete(recipe)} variant="danger" size="icon" title="Delete recipe">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
