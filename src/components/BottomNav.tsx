import { 
    LayoutDashboard, 
    CheckSquare, 
    BookHeart,
    MoreHorizontal,
    Sparkles
  } from 'lucide-react';
  import { NavLink } from 'react-router-dom';
  import { cn } from '../lib/utils';
  
  export function BottomNav() {
    const navItems = [
      { id: 'dashboard', icon: LayoutDashboard, path: '/' },
      { id: 'tarefas', icon: CheckSquare, path: '/tarefas' },
      { id: 'revisao', icon: Sparkles, path: '/revisao', isPrimary: true },
      { id: 'diario', icon: BookHeart, path: '/diario' },
      { id: 'mais', icon: MoreHorizontal, path: '/mais' },
    ];
  
    return (
      <nav className="bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-[#1a1a1a] pb-env-safe w-full h-[88px] md:border md:rounded-2xl md:mb-2 rounded-t-[24px]">
        <div className="flex items-center justify-between h-[72px] px-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            if (item.isPrimary) {
               return (
                  <NavLink 
                    key={item.id} 
                    to={item.path}
                    className={({ isActive }) => cn(
                      "relative flex items-center justify-center -mt-6 w-14 h-14 rounded-full shadow-[0_0_20px_rgba(74,222,128,0.2)] transition-all duration-300 active:scale-95 group",
                      isActive 
                        ? "bg-[#6bfb9a] text-[#005e2d]" 
                        : "bg-[#4ade80] text-[#0a0a0a] hover:bg-[#6bfb9a]"
                    )}
                  >
                    <Icon strokeWidth={2.5} className="w-7 h-7" />
                  </NavLink>
               );
            }

            return (
              <NavLink 
                key={item.id} 
                to={item.path}
                className={({ isActive }) => cn(
                  "relative flex flex-col items-center justify-center p-2 transition-all duration-300 active:scale-95",
                  isActive 
                    ? "text-[#4ade80]" 
                    : "text-[#555555] hover:text-[#dde5da]"
                )}
              >
                {({ isActive }) => (
                  <>
                     <Icon strokeWidth={isActive ? 2.5 : 2} className={cn("w-6 h-6 mb-1 transition-all", isActive && "scale-110")} />
                     {isActive && <div className="absolute -bottom-2 w-1 h-1 bg-[#4ade80] rounded-full" />}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    );
  }
