import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Sparkles,
  ShoppingBasket,
  ChevronRight,
  Lightbulb,
  Plus,
  Utensils,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMealPlan } from '../contexts/MealPlanContext';
import { getSmartTip } from '../services/aiService';
import { todayISO, getWeekDates, formatDay, isToday, formatMonthYear } from '../utils/date';
import { MEAL_TYPES } from '../data/mockRecipes';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const MEAL_TYPE_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { plannedMeals, getRecipeById, loading } = useMealPlan();
  const navigate = useNavigate();
  const [tip, setTip] = useState('');

  useEffect(() => {
    getSmartTip(user?.preferences).then(setTip);
  }, [user?.preferences]);

  const today = todayISO();
  const weekDates = useMemo(() => getWeekDates(today), [today]);

  const todaysMeals = useMemo(
    () =>
      MEAL_TYPES.map((type) => ({
        type,
        meal: plannedMeals.find((m) => m.date === today && m.mealType === type),
      })),
    [plannedMeals, today]
  );

  const weekPlannedCount = useMemo(
    () => plannedMeals.filter((m) => weekDates.includes(m.date)).length,
    [plannedMeals, weekDates]
  );
  const weekTotalSlots = weekDates.length * MEAL_TYPES.length;

  const daysWithMeals = useMemo(
    () => new Set(plannedMeals.filter((m) => weekDates.includes(m.date)).map((m) => m.date)),
    [plannedMeals, weekDates]
  );

  const uniqueGroceryCount = useMemo(() => {
    const ids = new Set();
    plannedMeals
      .filter((m) => weekDates.includes(m.date))
      .forEach((m) => {
        const recipe = getRecipeById(m.recipeId);
        recipe?.ingredients.forEach((i) => ids.add(i.name.toLowerCase()));
      });
    return ids.size;
  }, [plannedMeals, weekDates, getRecipeById]);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-1">
        <p className="text-sm font-medium text-ink-500">{formatMonthYear(today)}</p>
        <h1 className="font-display text-2xl font-semibold text-ink-900 lg:text-3xl">
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink-900">Today's meals</h2>
              <Link
                to="/planner"
                className="flex items-center text-sm font-medium text-terracotta-600 hover:text-terracotta-700"
              >
                Full planner <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {todaysMeals.map(({ type, meal }) => {
                const recipe = meal ? getRecipeById(meal.recipeId) : null;
                return (
                  <div
                    key={type}
                    className="flex flex-col gap-2 rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-3 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-400 sm:w-20 sm:shrink-0">
                      {MEAL_TYPE_LABEL[type]}
                    </span>
                    {recipe ? (
                      <div className="flex flex-1 items-center gap-3">
                        <span className="text-xl">{recipe.emoji}</span>
                        <span className="flex-1 text-sm font-medium text-ink-800">{recipe.name}</span>
                        {!!recipe.calories && <Badge tone={recipe.color}>{recipe.calories} kcal</Badge>}
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/planner?date=${today}&meal=${type}`)}
                        className="flex flex-1 items-center gap-1.5 text-sm font-medium text-ink-400 hover:text-terracotta-600"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add {type}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink-900">This week</h2>
              <span className="text-sm text-ink-500">
                {weekPlannedCount}/{weekTotalSlots} slots filled
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDates.map((d) => (
                <Link
                  key={d}
                  to={`/planner?date=${d}`}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2.5 transition-colors ${
                    isToday(d) ? 'bg-terracotta-500 text-white' : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase opacity-80">
                    {formatDay(d)}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      daysWithMeals.has(d)
                        ? isToday(d)
                          ? 'bg-white'
                          : 'bg-terracotta-500'
                        : 'bg-transparent'
                    }`}
                  />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-terracotta-500 p-5 text-white">
            <Sparkles className="h-6 w-6" />
            <p className="mt-3 font-display text-lg font-semibold">Let AI plan your week</p>
            <p className="mt-1 text-sm text-terracotta-50">
              Answer nothing — we already know your preferences.
            </p>
            <Button
              as={Link}
              to="/planner?ai=1"
              variant="subtle"
              className="mt-4 w-full justify-center bg-white text-terracotta-600 hover:bg-cream-100"
            >
              Generate my week
            </Button>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-honey-300/40 p-2 text-ink-800">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">Smart tip</p>
                <p className="mt-1 text-sm text-ink-500">{tip || 'Loading a tip for you…'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-ink-900">Quick links</p>
            <div className="mt-3 space-y-1.5">
              <Link
                to="/planner"
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-ink-700 hover:bg-cream-100"
              >
                <CalendarDays className="h-4 w-4 text-terracotta-500" /> Plan my week
              </Link>
              <Link
                to="/recipes"
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-ink-700 hover:bg-cream-100"
              >
                <Utensils className="h-4 w-4 text-sage-500" /> Browse recipes
              </Link>
              <Link
                to="/groceries"
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-ink-700 hover:bg-cream-100"
              >
                <ShoppingBasket className="h-4 w-4 text-honey-500" /> Grocery list
                {uniqueGroceryCount > 0 && (
                  <span className="ml-auto rounded-full bg-cream-200 px-2 py-0.5 text-xs font-semibold text-ink-600">
                    {uniqueGroceryCount}
                  </span>
                )}
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {!loading && plannedMeals.length === 0 && (
        <Card className="mt-4 flex flex-col items-center gap-3 p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink-900">Your week is a blank canvas</p>
          <p className="max-w-sm text-sm text-ink-500">
            Start by adding your own meals, or let AI suggest a full week based on your preferences.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button as={Link} to="/planner">
              Plan my week
            </Button>
            <Button as={Link} to="/planner?ai=1" variant="secondary">
              <Sparkles className="h-4 w-4" /> Ask AI
            </Button>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
