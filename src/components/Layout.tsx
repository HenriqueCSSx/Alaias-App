import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { PWABanner } from './PWABanner';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col font-sans pt-[env(safe-area-inset-top)] md:pt-0">
      <PWABanner />
      <main className="flex-1 overflow-y-auto pb-[100px] md:pb-[88px] relative z-0 flex justify-center bg-[#0a0a0a]">
        <div className="max-w-[420px] mx-auto w-full h-full md:border-x md:border-[#1a1a1a] min-h-screen bg-[#0a0a0a]">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile-first bottom nav */}
      <div className="fixed bottom-0 md:bottom-2 left-0 right-0 z-50 pointer-events-none px-0 md:px-4 flex justify-center">
        <div className="w-full max-w-[420px] pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
