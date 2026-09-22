import { Link } from 'react-router-dom';
import {
  ChefHat,
  Sparkles,
  CalendarDays,
  ShoppingBasket,
  Share2,
  ArrowRight,
} from 'lucide-react';
import Button from '../components/ui/Button';

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Plan on the go or at your desk',
    description: 'Your weekly calendar works just as well from your phone as it does on a bigger screen.',
    tone: 'terracotta',
  },
  {
    icon: Sparkles,
    title: 'AI-suggested meal plans',
    description: 'Tell us your goals and preferences — get a full week of balanced meals in seconds.',
    tone: 'honey',
  },
  {
    icon: ShoppingBasket,
    title: 'One shopping list, done',
    description: 'Every planned meal rolls up into a single organized list — no more juggling five recipes worth of ingredients in your head.',
    tone: 'sage',
  },
  {
    icon: Share2,
    title: 'Share to WhatsApp instantly',
    description: 'Send your grocery list to family or a partner with a single tap — no app-switching hassle.',
    tone: 'terracotta',
  },
];

const STEPS = [
  { step: '01', title: 'Tell us about your household', description: 'Diet, goals, cuisines you love — a 60 second setup.' },
  { step: '02', title: 'Plan or let AI plan for you', description: 'Build your own week or ask AI to generate a full plan instantly.' },
  { step: '03', title: 'Cook & shop with ease', description: 'Groceries generate automatically and share straight to WhatsApp.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-cream-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta-500 text-white shadow-soft">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold text-ink-900">Jom Masak</span>
        </div>
        <Link to="/login" className="text-sm font-semibold text-ink-700 hover:text-terracotta-600">
          Log in
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-ink-900 sm:text-5xl lg:text-[3.4rem]">
              Plan your week's meals — skip the "what's for dinner" panic.
            </h1>
            <p className="mt-4 max-w-md text-base text-ink-500 lg:text-lg">
              JomMasak plans, organizes, and
              preps your grocery list for the whole week.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/login" size="lg" className="justify-center">
                Start planning free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as="a" href="#how-it-works" variant="outline" size="lg" className="justify-center">
                See how it works
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -right-4 hidden rotate-3 rounded-2xl bg-honey-300/60 px-4 py-2 text-xs font-semibold text-ink-800 shadow-soft sm:block">
              ✨ AI suggested your Tuesday dinner
            </div>
            <div className="rounded-3xl border border-cream-300 bg-white p-4 shadow-soft sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-ink-900">This week</p>
                <span className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-600">
                  Sep 22 – 28
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  { day: 'Mon', emoji: '🥑', name: 'Avocado & Egg Toast', tone: 'sage' },
                  { day: 'Tue', emoji: '🍣', name: 'Teriyaki Salmon Bowl', tone: 'terracotta' },
                  { day: 'Wed', emoji: '🍛', name: 'Coconut Veggie Curry', tone: 'honey' },
                  { day: 'Thu', emoji: '🌮', name: 'Black Bean Burrito Bowl', tone: 'sage' },
                ].map((m) => (
                  <div
                    key={m.day}
                    className="flex items-center gap-3 rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5"
                  >
                    <span className="w-8 text-xs font-semibold text-ink-400">{m.day}</span>
                    <span className="text-xl">{m.emoji}</span>
                    <span className="flex-1 text-sm font-medium text-ink-800">{m.name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-terracotta-50 px-3 py-2.5">
                <span className="text-sm font-semibold text-terracotta-700">
                  Grocery list ready — 24 items
                </span>
                <Share2 className="h-4 w-4 text-terracotta-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-semibold text-ink-900 lg:text-3xl">
              Everything you need to eat well, weekly
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-cream-300 bg-cream-50 p-5">
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                    f.tone === 'terracotta'
                      ? 'bg-terracotta-50 text-terracotta-600'
                      : f.tone === 'sage'
                      ? 'bg-sage-50 text-sage-600'
                      : 'bg-honey-300/40 text-ink-800'
                  }`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <p className="font-display text-base font-semibold text-ink-900">{f.title}</p>
                <p className="mt-1.5 text-sm text-ink-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-14 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-2xl font-semibold text-ink-900 lg:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center sm:text-left">
                <span className="font-display text-3xl font-semibold text-terracotta-300">
                  {s.step}
                </span>
                <p className="mt-2 font-display text-base font-semibold text-ink-900">{s.title}</p>
                <p className="mt-1 text-sm text-ink-500">{s.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button as={Link} to="/login" size="lg">
              Get started — it's free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-cream-300 py-6 text-center text-xs text-ink-400">
        meal planning, minus the chaos.
      </footer>
    </div>
  );
}
