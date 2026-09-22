import { Fragment } from 'react';
import { MEAL_TYPES } from '../../data/mockRecipes';
import { formatDay, getDayNumber, isToday, isPast } from '../../utils/date';
import MealSlot from './MealSlot';

const MEAL_TYPE_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

export default function WeekGrid({ weekDates, plannedMeals, getRecipeById, onAddMeal, onRemoveMeal, onSwapMeal }) {
  function findMeal(date, type) {
    return plannedMeals.find((m) => m.date === date && m.mealType === type);
  }

  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-cream-300 bg-cream-50 md:block">
      <div className="grid min-w-[880px] grid-cols-[100px_repeat(7,1fr)]">
        <div className="border-b border-cream-300 bg-white/60" />
        {weekDates.map((date) => (
          <div
            key={date}
            className={`flex flex-col items-center gap-0.5 border-b border-l border-cream-300 py-3 ${
              isToday(date) ? 'bg-terracotta-50' : 'bg-white/60'
            }`}
          >
            <span className="text-[11px] font-semibold uppercase text-ink-400">{formatDay(date)}</span>
            <span
              className={`font-display text-lg font-semibold ${
                isToday(date) ? 'text-terracotta-600' : 'text-ink-900'
              }`}
            >
              {getDayNumber(date)}
            </span>
          </div>
        ))}

        {MEAL_TYPES.map((type) => (
          <Fragment key={type}>
            <div className="flex items-center border-t border-cream-300 px-3 py-3 text-sm font-semibold text-ink-700">
              {MEAL_TYPE_LABEL[type]}
            </div>
            {weekDates.map((date) => {
              const meal = findMeal(date, type);
              const recipe = meal ? getRecipeById(meal.recipeId) : null;
              return (
                <div key={`${type}-${date}`} className="border-l border-t border-cream-300 p-2">
                  <MealSlot
                    mealType={type}
                    recipe={recipe}
                    compact
                    onAdd={() => onAddMeal(date, type)}
                    onRemove={() => onRemoveMeal(meal)}
                    onSwap={() => onSwapMeal(date, type, meal)}
                    disabled={isPast(date)}
                  />
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
