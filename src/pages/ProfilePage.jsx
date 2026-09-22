import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Minus, Plus, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { DIET_TAGS, CUISINES, GOALS } from '../data/mockRecipes';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ChipToggle from '../components/ui/ChipToggle';
import Avatar from '../components/ui/Avatar';

function toggleInList(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function ProfilePage() {
  const { user, savePreferences, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    householdSize: user?.preferences?.householdSize || 2,
    goals: user?.preferences?.goals || [],
    dietaryTags: user?.preferences?.dietaryTags || [],
    cuisines: user?.preferences?.cuisines || [],
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await savePreferences(form);
      showToast('Preferences saved');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Profile & preferences" subtitle="Update these anytime — they shape your AI suggestions." />

      <Card className="mb-4 flex items-center gap-4 p-5">
        <Avatar name={user?.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold text-ink-900">{user?.name}</p>
          <p className="truncate text-sm text-ink-500">{user?.email}</p>
        </div>
        <Button variant="danger" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Log out
        </Button>
      </Card>

      <Card className="mb-4 p-5">
        <h2 className="mb-3 font-display text-base font-semibold text-ink-900">Household size</h2>
        <div className="flex items-center gap-5">
          <button
            onClick={() => setForm((f) => ({ ...f, householdSize: Math.max(1, f.householdSize - 1) }))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 text-ink-700 hover:bg-cream-200"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="font-display text-2xl font-semibold text-ink-900 w-10 text-center">
            {form.householdSize}
          </span>
          <button
            onClick={() => setForm((f) => ({ ...f, householdSize: Math.min(8, f.householdSize + 1) }))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 text-ink-700 hover:bg-cream-200"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </Card>

      <Card className="mb-4 p-5">
        <h2 className="mb-3 font-display text-base font-semibold text-ink-900">Goals</h2>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => (
            <ChipToggle
              key={g.id}
              label={g.label}
              selected={form.goals.includes(g.id)}
              onClick={() => setForm((f) => ({ ...f, goals: toggleInList(f.goals, g.id) }))}
            />
          ))}
        </div>
      </Card>

      <Card className="mb-4 p-5">
        <h2 className="mb-3 font-display text-base font-semibold text-ink-900">Dietary preferences</h2>
        <div className="flex flex-wrap gap-2">
          {DIET_TAGS.map((tag) => (
            <ChipToggle
              key={tag.id}
              label={tag.label}
              selected={form.dietaryTags.includes(tag.id)}
              onClick={() => setForm((f) => ({ ...f, dietaryTags: toggleInList(f.dietaryTags, tag.id) }))}
            />
          ))}
        </div>
      </Card>

      <Card className="mb-4 p-5">
        <h2 className="mb-3 font-display text-base font-semibold text-ink-900">Favorite cuisines</h2>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map((c) => (
            <ChipToggle
              key={c}
              label={c}
              selected={form.cuisines.includes(c)}
              onClick={() => setForm((f) => ({ ...f, cuisines: toggleInList(f.cuisines, c) }))}
            />
          ))}
        </div>
      </Card>

      <Button onClick={handleSave} loading={saving} className="w-full justify-center sm:w-auto">
        <Save className="h-4 w-4" /> Save preferences
      </Button>
    </PageContainer>
  );
}
