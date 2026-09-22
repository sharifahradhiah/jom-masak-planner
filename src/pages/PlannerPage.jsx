import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useToast } from '../contexts/ToastContext';
import {
  todayISO,
  getWeekDates,
  addDays,
  formatRange,
  formatDayLong,
  formatMonthYear,
  isPast,
} from '../utils/date';
import { MEAL_TYPES } from '../data/mockRecipes';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';
import Button from '../components/ui/Button';
import DayCard from '../components/meals/DayCard';
import WeekGrid from '../components/meals/WeekGrid';
import MonthGrid from '../components/meals/MonthGrid';
import RecipePickerModal from '../components/meals/RecipePickerModal';
import AISuggestModal from '../components/meals/AISuggestModal';

const VIEW_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function PlannerPage() {
  const { user } = useAuth();
  const { recipes, plannedMeals, getRecipeById, addMeal, addMeals, removeMeal, createCustomRecipe } =
    useMealPlan();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || todayISO());
  const [picker, setPicker] = useState(null); // { date, mealType, replaceMealId }
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('ai') === '1') {
      setAiOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('ai');
      setSearchParams(next, { replace: true });
    }
    const meal = searchParams.get('meal');
    const date = searchParams.get('date');
    if (meal && date && MEAL_TYPES.includes(meal)) {
      setPicker({ date, mealType: meal });
      const next = new URLSearchParams(searchParams);
      next.delete('meal');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const mealsByDayAndType = useCallback(
    (date) => {
      const map = {};
      MEAL_TYPES.forEach((type) => {
        map[type] = plannedMeals.find((m) => m.date === date && m.mealType === type) || null;
      });
      return map;
    },
    [plannedMeals]
  );

  function openPicker(date, mealType, replaceMealId) {
    if (isPast(date)) {
      showToast("Can't plan for a past date", 'info');
      return;
    }
    setPicker({ date, mealType, replaceMealId });
  }

  async function handleSelectRecipe(recipe) {
    if (!picker) return;
    try {
      if (picker.replaceMealId) {
        await removeMeal(picker.replaceMealId);
      }
      await addMeal({
        date: picker.date,
        mealType: picker.mealType,
        recipeId: recipe.id,
        servings: user?.preferences?.householdSize,
        source: 'manual',
      });
      showToast(`${recipe.name} added to ${picker.date}`);
    } catch (err) {
      showToast(err.message || "Couldn't save that meal", 'info');
    }
  }

  async function handleRemoveMeal(meal) {
    if (!meal) return;
    await removeMeal(meal.id);
    showToast('Meal removed', 'info');
  }

  async function handleAcceptAIPlan(suggestions) {
    const conflicts = plannedMeals.filter((m) =>
      suggestions.some((s) => s.date === m.date && s.mealType === m.mealType)
    );
    await Promise.all(conflicts.map((m) => removeMeal(m.id)));
    await addMeals(suggestions.map((s) => ({ ...s, source: 'ai' })));
    showToast(`Added ${suggestions.length} AI-suggested meals to your planner!`);
  }

  function shiftDate(amount, unit) {
    setSelectedDate((d) => addDays(d, unit === 'week' ? amount * 7 : amount));
  }

  return (
    <PageContainer>
      <PageHeader
        title="Plan my week"
        subtitle="Build your own meals, or let AI do the heavy lifting."
        action={
          <Button onClick={() => setAiOpen(true)} variant="secondary" size="sm" className="sm:hidden">
            <Sparkles className="h-4 w-4" /> AI
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl options={VIEW_OPTIONS} value={viewMode} onChange={setViewMode} />
        <div className="flex items-center gap-2">
          {viewMode !== 'monthly' && (
            <div className="flex items-center gap-1 rounded-xl border border-cream-300 bg-white px-1 py-1">
              <button
                onClick={() => shiftDate(-1, viewMode === 'weekly' ? 'week' : 'day')}
                className="rounded-lg p-1.5 text-ink-500 hover:bg-cream-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[130px] text-center text-sm font-semibold text-ink-800">
                {viewMode === 'weekly'
                  ? formatRange(weekDates[0], weekDates[6])
                  : formatDayLong(selectedDate)}
              </span>
              <button
                onClick={() => shiftDate(1, viewMode === 'weekly' ? 'week' : 'day')}
                className="rounded-lg p-1.5 text-ink-500 hover:bg-cream-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          {/* Wrapped in a span: Button's own base class already hardcodes
              `inline-flex`, which can beat a bare `hidden` override at the
              same specificity depending on generated stylesheet order. */}
          <span className="hidden sm:inline-block">
            <Button onClick={() => setAiOpen(true)} variant="secondary" size="sm">
              <Sparkles className="h-4 w-4" /> Ask AI
            </Button>
          </span>
          <span className="hidden sm:inline-block">
            <Button onClick={() => setSelectedDate(todayISO())} variant="outline" size="sm">
              <CalendarDays className="h-4 w-4" /> Today
            </Button>
          </span>
        </div>
      </div>

      {viewMode === 'daily' && (
        <div className="mx-auto max-w-md">
          <DayCard
            date={selectedDate}
            mealsByType={mealsByDayAndType(selectedDate)}
            getRecipeById={getRecipeById}
            onAddMeal={(date, type) => openPicker(date, type)}
            onRemoveMeal={handleRemoveMeal}
            onSwapMeal={(date, type, meal) => openPicker(date, type, meal?.id)}
          />
        </div>
      )}

      {viewMode === 'weekly' && (
        <>
          <WeekGrid
            weekDates={weekDates}
            plannedMeals={plannedMeals}
            getRecipeById={getRecipeById}
            onAddMeal={(date, type) => openPicker(date, type)}
            onRemoveMeal={handleRemoveMeal}
            onSwapMeal={(date, type, meal) => openPicker(date, type, meal?.id)}
          />
          <div className="space-y-3 md:hidden">
            {weekDates.map((date) => (
              <DayCard
                key={date}
                date={date}
                mealsByType={mealsByDayAndType(date)}
                getRecipeById={getRecipeById}
                onAddMeal={(d, type) => openPicker(d, type)}
                onRemoveMeal={handleRemoveMeal}
                onSwapMeal={(d, type, meal) => openPicker(d, type, meal?.id)}
              />
            ))}
          </div>
        </>
      )}

      {viewMode === 'monthly' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="mb-3 font-display text-base font-semibold text-ink-900">
              {formatMonthYear(selectedDate)}
            </p>
            <MonthGrid
              referenceDate={selectedDate}
              plannedMeals={plannedMeals}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
          <DayCard
            date={selectedDate}
            mealsByType={mealsByDayAndType(selectedDate)}
            getRecipeById={getRecipeById}
            onAddMeal={(date, type) => openPicker(date, type)}
            onRemoveMeal={handleRemoveMeal}
            onSwapMeal={(date, type, meal) => openPicker(date, type, meal?.id)}
          />
        </div>
      )}

      <RecipePickerModal
        open={!!picker}
        onClose={() => setPicker(null)}
        mealType={picker?.mealType}
        date={picker?.date}
        recipes={recipes}
        onSelectRecipe={handleSelectRecipe}
        onCreateRecipe={createCustomRecipe}
      />

      <AISuggestModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        weekDates={weekDates}
        preferences={user?.preferences}
        getRecipeById={getRecipeById}
        onAccept={handleAcceptAIPlan}
      />
    </PageContainer>
  );
}
