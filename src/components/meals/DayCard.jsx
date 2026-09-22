import { MEAL_TYPES } from '../../data/mockRecipes';
import { formatDayLong, formatMonthShort, getDayNumber, isToday, isPast } from '../../utils/date';
import MealSlot from './MealSlot';

export default function DayCard({ date, mealsByType, getRecipeById, onAddMeal, onRemoveMeal, onSwapMeal }) {
  const today = isToday(date);
  const disabled = isPast(date);
  return (
    <div className="rounded-2xl border border-cream-300 bg-cream-50 p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className={`flex h-11 w-11 flex-col items-center justify-center rounded-xl ${
            today ? 'bg-terracotta-500 text-white' : 'bg-white text-ink-900 border border-cream-300'
          }`}
        >
          <span className="text-[10px] font-semibold uppercase leading-none opacity-80">
            {formatMonthShort(date)}
          </span>
          <span className="font-display text-base font-semibold leading-tight">
            {getDayNumber(date)}
          </span>
        </div>
        <div>
          <p className="font-display text-base font-semibold text-ink-900">{formatDayLong(date)}</p>
          {today && <p className="text-xs font-medium text-terracotta-600">Today</p>}
        </div>
      </div>
      <div className="space-y-2">
        {MEAL_TYPES.map((type) => {
          const meal = mealsByType[type];
          const recipe = meal ? getRecipeById(meal.recipeId) : null;
          return (
            <MealSlot
              key={type}
              mealType={type}
              recipe={recipe}
              onAdd={() => onAddMeal(date, type)}
              onRemove={() => onRemoveMeal(meal)}
              onSwap={() => onSwapMeal(date, type, meal)}
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
}
