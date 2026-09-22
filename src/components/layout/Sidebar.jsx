import { NavLink } from 'react-router-dom';
import { ChefHat, LogOut, Sparkles } from 'lucide-react';
import { NAV_ITEMS } from './navItems';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[76px] flex-col border-r border-cream-300 bg-cream-50 py-6 md:flex lg:w-64">
      <div className="flex items-center gap-2.5 px-4 lg:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-terracotta-500 text-white shadow-soft">
          <ChefHat className="h-5 w-5" />
        </div>
        <span className="hidden font-display text-lg font-semibold text-ink-900 lg:inline">
          JomMasak
        </span>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1 px-2.5 lg:px-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:justify-start ${
                isActive
                  ? 'bg-terracotta-50 text-terracotta-600'
                  : 'text-ink-500 hover:bg-cream-200 hover:text-ink-900'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="hidden lg:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 px-2.5 lg:px-4">
        <NavLink
          to="/planner?ai=1"
          className="hidden items-center gap-2 rounded-xl bg-honey-300/40 px-3 py-2.5 text-sm font-semibold text-ink-800 hover:bg-honey-300/70 lg:flex"
        >
          <Sparkles className="h-4 w-4 text-terracotta-500" />
          Ask AI to plan
        </NavLink>
        <div className="flex items-center gap-2.5 rounded-xl px-1 py-1 lg:px-2">
          <Avatar name={user?.name} size="sm" />
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
            <p className="truncate text-xs text-ink-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="hidden rounded-lg p-1.5 text-ink-400 hover:bg-cream-200 hover:text-terracotta-600 lg:block"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
