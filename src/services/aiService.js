import { MEAL_TYPES } from '../data/mockRecipes';
import { getRecipes } from './api/recipeService';

/**
 * AI service abstraction.
 *
 * Every function here is the seam between the UI and "intelligence" — right
 * now that's a deterministic-but-varied local heuristic standing in for a
 * real model call. To wire up a real provider later, replace the body of
 * `generateWeekPlan` / `suggestSwap` with a fetch to your LLM endpoint and
 * keep the same input/output shape — no call site changes needed.
 */
const THINKING_LATENCY_MS = [900, 1600];

function think() {
  const [min, max] = THINKING_LATENCY_MS;
  const ms = Math.round(min + Math.random() * (max - min));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scoreRecipe(recipe, preferences) {
  let score = 0;
  const { dietaryTags = [], cuisines = [] } = preferences;
  if (dietaryTags.some((t) => recipe.tags.includes(t))) score += 3;
  if (cuisines.includes(recipe.cuisine)) score += 2;
  if (dietaryTags.includes('quick') && recipe.prepTime <= 20) score += 1;
  return score;
}

function pickRecipesFor(mealType, preferences, pool, recentlyUsed) {
  const candidates = pool.filter((r) => r.mealTypes.includes(mealType));
  const ranked = shuffle(candidates).sort((a, b) => {
    const scoreDiff = scoreRecipe(b, preferences) - scoreRecipe(a, preferences);
    if (scoreDiff !== 0) return scoreDiff;
    const aUsed = recentlyUsed.has(a.id) ? 1 : 0;
    const bUsed = recentlyUsed.has(b.id) ? 1 : 0;
    return aUsed - bUsed;
  });
  return ranked[0] || candidates[0] || pool[0];
}

function buildRationale(preferences, mealTypesIncluded) {
  const bits = [];
  if (preferences.dietaryTags?.length) {
    bits.push(`prioritized ${preferences.dietaryTags.join(', ')} recipes`);
  }
  if (preferences.cuisines?.length) {
    bits.push(`leaned into ${preferences.cuisines.join(', ')} flavors`);
  }
  bits.push(`kept ${mealTypesIncluded.join('/')} varied with minimal ingredient overlap`);
  return `I ${bits.join(', ')}.`;
}

/**
 * @param {object} input
 * @param {string[]} input.dates - ISO dates to fill
 * @param {string[]} input.mealTypes - which meal slots to generate per day
 * @param {object} input.preferences - { dietaryTags, cuisines, goals, householdSize }
 */
export async function generateWeekPlan({ dates, mealTypes = MEAL_TYPES, preferences = {} }) {
  const [pool] = await Promise.all([getRecipes(), think()]);
  const recentlyUsed = new Set();
  const suggestions = [];

  dates.forEach((date) => {
    mealTypes.forEach((mealType) => {
      const recipe = pickRecipesFor(mealType, preferences, pool, recentlyUsed);
      if (!recipe) return;
      recentlyUsed.add(recipe.id);
      suggestions.push({
        date,
        mealType,
        recipeId: recipe.id,
        servings: preferences.householdSize || 2,
      });
    });
  });

  return {
    suggestions,
    rationale: buildRationale(preferences, mealTypes),
    generatedAt: new Date().toISOString(),
  };
}

/** Suggest 3 alternative recipes for a single slot (used by the "swap" action). */
export async function suggestSwap({ mealType, preferences = {}, currentRecipeId }) {
  const [allRecipes] = await Promise.all([getRecipes(), think()]);
  const pool = allRecipes.filter((r) => r.mealTypes.includes(mealType) && r.id !== currentRecipeId);
  const ranked = shuffle(pool).sort((a, b) => scoreRecipe(b, preferences) - scoreRecipe(a, preferences));
  return ranked.slice(0, 3);
}

/** Short contextual tip shown while a plan is generating, or on the dashboard. */
export async function getSmartTip(preferences = {}) {
  await think();
  const tips = [
    'Batch-cook grains like rice or quinoa once and reuse them across 3 meals this week.',
    'Prep vegetables right after grocery shopping so weekday cooking takes half the time.',
    preferences.goals?.includes('reduce-waste')
      ? 'Plan your soup or stir-fry night for whatever produce is closest to expiring.'
      : 'Try one new cuisine this week — small variety keeps the plan from feeling repetitive.',
    preferences.goals?.includes('budget')
      ? 'Lean on beans, lentils, and eggs this week — they stretch furthest per dollar.'
      : 'Double a dinner recipe and freeze half for a zero-effort meal later.',
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}
