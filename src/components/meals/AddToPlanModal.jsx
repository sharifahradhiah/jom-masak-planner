import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ChipToggle from '../ui/ChipToggle';
import { todayISO } from '../../utils/date';
import { MEAL_TYPES } from '../../data/mockRecipes';

const MEAL_TYPE_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

export default function AddToPlanModal({ open, onClose, recipe, onConfirm }) {
  const [date, setDate] = useState(todayISO());
  const [mealType, setMealType] = useState(recipe?.mealTypes?.[0] || 'dinner');
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    setSaving(true);
    try {
      await onConfirm({ date, mealType });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!recipe) return null;

  return (
    <Modal open={open} onClose={onClose} size="sm" title={`Add "${recipe.name}" to planner`}>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-600">Date</label>
          <input
            type="date"
            value={date}
            min={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-terracotta-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-600">Meal</label>
          <div className="flex flex-wrap gap-2">
            {(recipe.mealTypes?.length ? recipe.mealTypes : MEAL_TYPES).map((type) => (
              <ChipToggle
                key={type}
                label={MEAL_TYPE_LABEL[type]}
                selected={mealType === type}
                onClick={() => setMealType(type)}
              />
            ))}
          </div>
        </div>
        <Button onClick={handleConfirm} loading={saving} className="w-full justify-center">
          Add to planner
        </Button>
      </div>
    </Modal>
  );
}
