import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as recipeService from '../services/api/recipeService';
import * as mealPlanService from '../services/api/mealPlanService';
import { useAuth } from './AuthContext';

const MealPlanContext = createContext(null);

export function MealPlanProvider({ children }) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshRecipes = useCallback(async () => {
    const list = await recipeService.getRecipes();
    setRecipes(list);
    return list;
  }, []);

  const refreshMeals = useCallback(async () => {
    if (!user) return [];
    const list = await mealPlanService.getPlannedMeals(user.id);
    setPlannedMeals(list);
    return list;
  }, [user]);

  useEffect(() => {
    if (!user) {
      setRecipes([]);
      setPlannedMeals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([refreshRecipes(), refreshMeals()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const getRecipeById = useCallback(
    (id) => recipes.find((r) => r.id === id) || null,
    [recipes]
  );

  const addMeal = useCallback(
    async (entry) => {
      const created = await mealPlanService.addPlannedMeal(user.id, entry);
      setPlannedMeals((prev) => [...prev, created]);
      return created;
    },
    [user]
  );

  const addMeals = useCallback(
    async (entries) => {
      const created = await mealPlanService.addPlannedMeals(user.id, entries);
      setPlannedMeals((prev) => [...prev, ...created]);
      return created;
    },
    [user]
  );

  const updateMeal = useCallback(
    async (mealId, updates) => {
      const updated = await mealPlanService.updatePlannedMeal(user.id, mealId, updates);
      setPlannedMeals((prev) => prev.map((m) => (m.id === mealId ? updated : m)));
      return updated;
    },
    [user]
  );

  const removeMeal = useCallback(
    async (mealId) => {
      await mealPlanService.removePlannedMeal(user.id, mealId);
      setPlannedMeals((prev) => prev.filter((m) => m.id !== mealId));
    },
    [user]
  );

  const clearRange = useCallback(
    async (startDate, endDate) => {
      await mealPlanService.clearRange(user.id, startDate, endDate);
      setPlannedMeals((prev) => prev.filter((m) => !(m.date >= startDate && m.date <= endDate)));
    },
    [user]
  );

  const createCustomRecipe = useCallback(
    async (recipe) => {
      const created = await recipeService.createRecipe(recipe);
      setRecipes((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const deleteCustomRecipe = useCallback(async (recipeId) => {
    await recipeService.deleteRecipe(recipeId);
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  }, []);

  const value = useMemo(
    () => ({
      recipes,
      plannedMeals,
      loading,
      getRecipeById,
      addMeal,
      addMeals,
      updateMeal,
      removeMeal,
      clearRange,
      createCustomRecipe,
      deleteCustomRecipe,
      refreshMeals,
      refreshRecipes,
    }),
    [
      recipes,
      plannedMeals,
      loading,
      getRecipeById,
      addMeal,
      addMeals,
      updateMeal,
      removeMeal,
      clearRange,
      createCustomRecipe,
      deleteCustomRecipe,
      refreshMeals,
      refreshRecipes,
    ]
  );

  return <MealPlanContext.Provider value={value}>{children}</MealPlanContext.Provider>;
}

export function useMealPlan() {
  const ctx = useContext(MealPlanContext);
  if (!ctx) throw new Error('useMealPlan must be used within MealPlanProvider');
  return ctx;
}
