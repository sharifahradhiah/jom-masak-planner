import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Mail, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ name, email });
      navigate(user.onboarded ? '/dashboard' : '/onboarding');
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream-100 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta-500 text-white shadow-soft">
            <ChefHat className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">
            Welcome to JomMasak
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Enter your details to plan your first week of meals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Your name</label>
            <div className="flex items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 focus-within:border-terracotta-400">
              <UserIcon className="h-4 w-4 text-ink-400" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sharifah"
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 focus-within:border-terracotta-400">
              <Mail className="h-4 w-4 text-ink-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
              />
            </div>
          </div>

          {error && <p className="text-sm font-medium text-terracotta-600">{error}</p>}

          <Button type="submit" className="w-full justify-center" loading={loading}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-center text-xs text-ink-400">
            No password needed for this demo — we'll remember you on this device.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          <Link to="/" className="font-medium text-ink-700 hover:text-terracotta-600">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
