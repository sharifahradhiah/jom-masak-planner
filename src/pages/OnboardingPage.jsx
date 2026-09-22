import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Minus, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DIET_TAGS, CUISINES, GOALS } from '../data/mockRecipes';
import Button from '../components/ui/Button';
import ChipToggle from '../components/ui/ChipToggle';

const STEPS = ['Household', 'Diet', 'Cuisines'];

function toggleInList(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function OnboardingPage() {
  const { finishOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    householdSize: 2,
    goals: [],
    dietaryTags: [],
    cuisines: [],
  });

  const isLast = step === STEPS.length - 1;

  async function handleNext() {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    try {
      await finishOnboarding(form);
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-cream-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta-500 text-white shadow-soft">
            <ChefHat className="h-5 w-5" />
          </div>
          <h1 className="mt-3 font-display text-xl font-semibold text-ink-900 sm:text-2xl">
            Let's personalize your plan
          </h1>
          <p className="mt-1 text-sm text-ink-500">Takes less than a minute.</p>
        </div>

        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  i <= step ? 'bg-terracotta-500' : 'bg-cream-300'
                }`}
              />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card sm:p-6">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink-900">
                  How many are you cooking for?
                </h2>
                <div className="mt-4 flex items-center justify-center gap-5">
                  <button
                    onClick={() =>
                      setForm((f) => ({ ...f, householdSize: Math.max(1, f.householdSize - 1) }))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 text-ink-700 hover:bg-cream-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-display text-3xl font-semibold text-ink-900 w-12 text-center">
                    {form.householdSize}
                  </span>
                  <button
                    onClick={() =>
                      setForm((f) => ({ ...f, householdSize: Math.min(8, f.householdSize + 1) }))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 text-ink-700 hover:bg-cream-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink-900">
                  What are your goals?
                </h2>
                <p className="mt-0.5 text-xs text-ink-400">Select all that apply.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <ChipToggle
                      key={g.id}
                      label={g.label}
                      selected={form.goals.includes(g.id)}
                      onClick={() => setForm((f) => ({ ...f, goals: toggleInList(f.goals, g.id) }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-ink-900">
                Any dietary preferences?
              </h2>
              <p className="mt-0.5 text-xs text-ink-400">
                We'll prioritize recipes that match these — optional.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {DIET_TAGS.map((tag) => (
                  <ChipToggle
                    key={tag.id}
                    label={tag.label}
                    selected={form.dietaryTags.includes(tag.id)}
                    onClick={() =>
                      setForm((f) => ({ ...f, dietaryTags: toggleInList(f.dietaryTags, tag.id) }))
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-ink-900">
                Which cuisines do you love?
              </h2>
              <p className="mt-0.5 text-xs text-ink-400">Optional — helps AI suggestions feel like you.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {CUISINES.map((c) => (
                  <ChipToggle
                    key={c}
                    label={c}
                    selected={form.cuisines.includes(c)}
                    onClick={() => setForm((f) => ({ ...f, cuisines: toggleInList(f.cuisines, c) }))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={step === 0 ? 'invisible' : ''}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleNext} loading={submitting}>
            {isLast ? 'Start planning' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
