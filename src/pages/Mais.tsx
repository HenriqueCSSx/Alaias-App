import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  GraduationCap, 
  FolderKanban, 
  Target, 
  Timer, 
  Settings,
  HeartPulse,
  Wallet,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Mais() {
  const categories = [
    {
      title: "Produtividade",
      items: [
        { id: 'metas', path: '/metas', label: 'Metas & Hábitos', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { id: 'projetos', path: '/projetos', label: 'Projetos', icon: FolderKanban, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { id: 'foco', path: '/foco', label: 'Modo Foco', icon: Timer, color: 'text-amber-400', bg: 'bg-amber-400/10' }
      ]
    },
    {
      title: "Vida Pessoal",
      items: [
        { id: 'saude', path: '/saude', label: 'Saúde & Bem-estar', icon: HeartPulse, color: 'text-rose-400', bg: 'bg-rose-400/10' },
        { id: 'financas', path: '/financas', label: 'Finanças', icon: Wallet, color: 'text-[#4ade80]', bg: 'bg-[#4ade80]/10' },
        { id: 'relacionamentos', path: '/relacionamentos', label: 'Relacionamentos', icon: HeartHandshake, color: 'text-pink-400', bg: 'bg-pink-400/10' },
        { id: 'aprendizado', path: '/aprendizado', label: 'Aprendizado', icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-400/10' }
      ]
    },
    {
      title: "Sistema",
      items: [
        { id: 'config', path: '/config', label: 'Configurações', icon: Settings, color: 'text-gray-400', bg: 'bg-gray-400/10' }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] pb-32">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-10 border-b border-[#1a1a1a]">
        <h1 className="font-serif text-[32px] text-white leading-tight">explorar</h1>
        <p className="font-sans text-[14px] text-[#555] mt-1">todos os módulos do Alaias</p>
      </header>

      <div className="px-6 pt-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {categories.map((category) => (
          <section key={category.title}>
            <h2 className="font-sans text-[11px] font-bold tracking-[0.15em] text-[#555] uppercase mb-4 pl-2">
              {category.title}
            </h2>
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-[24px] overflow-hidden">
              {category.items.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === category.items.length - 1;
                
                return (
                  <Link 
                    key={item.id} 
                    to={item.path} 
                    className={cn(
                      "flex items-center p-4 transition-colors hover:bg-[#1a1a1a] active:bg-[#222]",
                      !isLast && "border-b border-[#1a1a1a]"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mr-4", item.bg)}>
                      <Icon className={cn("w-6 h-6", item.color)} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-sans text-[15px] font-medium text-[#dde5da]">{item.label}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#555]" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
