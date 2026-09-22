import { useEffect, useMemo, useState } from 'react';
import { Sparkles, RotateCcw, Wand2, CheckCircle2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ChipToggle from '../ui/ChipToggle';
import { generateWeekPlan, suggestSwap } from '../../services/aiService';
import { DIET_TAGS, CUISINES, MEAL_TYPES } from '../../data/mockRecipes';
import { formatDay, formatRange, getDayNumber, todayISO } from '../../utils/date';

const MEAL_TYPE_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

const THINKING_MESSAGES = [
  'Reviewing your preferences…',
  'Balancing nutrition across the week…',
  'Avoiding repeat ingredients…',
  'Plating your suggestions…',
];

export default function AISuggestModal({
  open,
  onClose,
  weekDates,
  preferences,
  recipes,
  getRecipeById,
  onAccept,
}) {
  const [step, setStep] = useState('configure');
  const [dietaryTags, setDietaryTags] = useState(preferences?.dietaryTags || []);
  const [cuisines, setCuisines] = useState(preferences?.cuisines || []);
  const [mealTypes, setMealTypes] = useState(MEAL_TYPES);
  const [suggestions, setSuggestions] = useState([]);
  const [rationale, setRationale] = useState('');
  const [thinkingMsg, setThinkingMsg] = useState(THINKING_MESSAGES[0]);
  const [swapping, setSwapping] = useState(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep('configure');
    setDietaryTags(preferences?.dietaryTags || []);
    setCuisines(preferences?.cuisines || []);
    setMealTypes(MEAL_TYPES);
    setSuggestions([]);
  }, [open, preferences]);

  useEffect(() => {
    if (step !== 'loading') return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % THINKING_MESSAGES.length;
      setThinkingMsg(THINKING_MESSAGES[i]);
    }, 700);
    return () => clearInterval(interval);
  }, [step]);

  const customRecipes = useMemo(() => recipes.filter((r) => r.isCustom), [recipes]);

  const groupedByDay = useMemo(() => {
    const map = new Map();
    suggestions.forEach((s) => {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date).push(s);
    });
    return Array.from(map.entries());
  }, [suggestions]);

  const futureDates = useMemo(() => weekDates.filter((d) => d >= todayISO()), [weekDates]);

  async function handleGenerate() {
    setStep('loading');
    setThinkingMsg(THINKING_MESSAGES[0]);
    const result = await generateWeekPlan({
      dates: futureDates,
      mealTypes,
      preferences: { dietaryTags, cuisines, householdSize: preferences?.householdSize },
      customRecipes,
    });
    setSuggestions(result.suggestions);
    setRationale(result.rationale);
    setStep('review');
  }

  async function handleSwap(index, item) {
    setSwapping(index);
    try {
      const alternatives = await suggestSwap({
        mealType: item.mealType,
        preferences: { dietaryTags, cuisines },
        currentRecipeId: item.recipeId,
        customRecipes,
      });
      if (alternatives[0]) {
        setSuggestions((prev) =>
          prev.map((s, i) => (i === index ? { ...s, recipeId: alternatives[0].id } : s))
        );
      }
    } finally {
      setSwapping(null);
    }
  }

  async function handleAccept() {
    setAccepting(true);
    try {
      await onAccept(suggestions);
      onClose();
    } finally {
      setAccepting(false);
    }
  }

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Ask AI to plan your week">
      {step === 'configure' && (
        <div className="space-y-5">
          <p className="text-sm text-ink-500">
            {futureDates.length > 0 ? (
              <>
                Generating for{' '}
                <strong className="text-ink-800">
                  {formatRange(futureDates[0], futureDates[futureDates.length - 1])}
                </strong>
                . Tune preferences below — we've prefilled them from your profile.
              </>
            ) : (
              "This week is already in the past — switch to the current or an upcoming week to generate a plan."
            )}
          </p>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink-800">Meals to include</p>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((type) => (
                <ChipToggle
                  key={type}
                  label={MEAL_TYPE_LABEL[type]}
                  selected={mealTypes.includes(type)}
                  onClick={() => toggle(mealTypes, setMealTypes, type)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink-800">Dietary preferences</p>
            <div className="flex flex-wrap gap-2">
              {DIET_TAGS.map((tag) => (
                <ChipToggle
                  key={tag.id}
                  label={tag.label}
                  selected={dietaryTags.includes(tag.id)}
                  onClick={() => toggle(dietaryTags, setDietaryTags, tag.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink-800">Cuisines</p>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((c) => (
                <ChipToggle
                  key={c}
                  label={c}
                  selected={cuisines.includes(c)}
                  onClick={() => toggle(cuisines, setCuisines, c)}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={mealTypes.length === 0 || futureDates.length === 0}
            className="w-full justify-center"
          >
            <Sparkles className="h-4 w-4" /> Generate my week
          </Button>
        </div>
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta-50 text-terracotta-500">
            <Wand2 className="h-7 w-7 animate-pulse" />
          </div>
          <p className="font-display text-base font-semibold text-ink-900">Cooking up your plan…</p>
          <p className="text-sm text-ink-500">{thinkingMsg}</p>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl bg-honey-300/30 px-3.5 py-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-500" />
            <p className="text-sm text-ink-700">{rationale}</p>
          </div>

          <div className="max-h-[48vh] space-y-3 overflow-y-auto pr-1">
            {groupedByDay.map(([date, items]) => (
              <div key={date} className="rounded-xl border border-cream-200 bg-cream-50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {formatDay(date, { weekday: 'long' })} · {getDayNumber(date)}
                </p>
                <div className="space-y-1.5">
                  {items.map((item) => {
                    const recipe = getRecipeById(item.recipeId);
                    const index = suggestions.indexOf(item);
                    return (
                      <div
                        key={`${item.date}-${item.mealType}`}
                        className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2"
                      >
                        <span className="w-16 shrink-0 text-xs font-semibold text-ink-400">
                          {MEAL_TYPE_LABEL[item.mealType]}
                        </span>
                        <span className="text-lg">{recipe?.emoji}</span>
                        <span className="flex-1 truncate text-sm font-medium text-ink-800">
                          {recipe?.name}
                        </span>
                        <button
                          onClick={() => handleSwap(index, item)}
                          disabled={swapping === index}
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-cream-200 hover:text-terracotta-600 disabled:opacity-50"
                          title="Swap suggestion"
                        >
                          <RotateCcw className={`h-3.5 w-3.5 ${swapping === index ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleGenerate} className="flex-1 justify-center">
              <RotateCcw className="h-4 w-4" /> Regenerate all
            </Button>
            <Button onClick={handleAccept} loading={accepting} className="flex-1 justify-center">
              <CheckCircle2 className="h-4 w-4" /> Add entire plan to planner
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
