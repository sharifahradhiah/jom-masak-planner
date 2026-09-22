import { ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

export default function MobileHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-cream-300 bg-cream-100/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta-500 text-white">
          <ChefHat className="h-4.5 w-4.5" />
        </div>
        <span className="font-display text-base font-semibold text-ink-900">JomMasak</span>
      </div>
      <Link to="/profile">
        <Avatar name={user?.name} size="sm" />
      </Link>
    </header>
  );
}
