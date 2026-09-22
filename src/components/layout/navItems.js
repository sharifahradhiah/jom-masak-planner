import { LayoutGrid, CalendarDays, BookOpen, ShoppingBasket, User } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/planner', label: 'Planner', icon: CalendarDays },
  { to: '/recipes', label: 'Recipes', icon: BookOpen },
  { to: '/groceries', label: 'Groceries', icon: ShoppingBasket },
  { to: '/profile', label: 'Profile', icon: User },
];
