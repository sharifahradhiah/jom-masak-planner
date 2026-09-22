import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-cream-100">
      <Sidebar />
      <div className="flex min-h-dvh flex-col md:pl-[76px] lg:pl-64">
        <MobileHeader />
        <main className="flex-1 pb-24 md:pb-10">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
