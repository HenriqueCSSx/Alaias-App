import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, LogOut, Heart, Zap, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

export function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { journalPinHash, logs, setAuthenticated, userName } = useAppStore();

  const handleExport = () => {
    // Alaias saves data in localStorage under 'alaias-storage'
    const data = localStorage.getItem('alaias-storage');
    if (!data) {
        setMsg("Nenhum dado encontrado para backup.");
        return;
    }
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alaias-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMsg("Backup exportado com sucesso.");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        // Basic validation
        const parsed = JSON.parse(json);
        if (parsed && parsed.state) {
            localStorage.setItem('alaias-storage', json);
            setMsg("Dados importados com sucesso! Recarregando...");
            setTimeout(() => {
                window.location.href = '/'; // hard reload to hydrate Zustand
            }, 1000);
        } else {
            setMsg("O arquivo de backup é inválido.");
        }
      } catch (err) {
        setMsg("Erro ao ler o arquivo.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = ''; // reset
  };

  const clearData = () => {
    if (window.confirm("Você tem certeza ABSOLUTA? Todo seu progresso será apagado permanentemente. Recomenda-se exportar antes.")) {
        localStorage.removeItem('alaias-storage');
        window.location.href = '/';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] relative pb-32 w-full text-white">
      {/* TopAppBar */}
      <header className="bg-[#0a0a0a] border-b border-[#1a1a1a] flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 max-w-lg mx-auto">
        <span 
            onClick={() => navigate(-1)} 
            className="material-symbols-outlined text-[#4ade80] hover:opacity-80 transition-opacity active:scale-95 duration-150 cursor-pointer"
        >
            arrow_back
        </span>
        <h1 className="font-serif italic text-xl tracking-tight text-[#4ade80]">PERFIL</h1>
        <div className="w-6"></div>
      </header>

      {/* Profile Canvas */}
      <div className="px-6 pt-24 max-w-lg mx-auto w-full flex-1">
        
        {msg && (
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl text-sm border border-emerald-500/30 mb-4 font-sans text-center">
                {msg}
            </div>
        )}

        {/* Profile Header */}
        <section className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full border-2 border-[#4ade80] flex items-center justify-center mb-4 bg-[#111111]">
                <span className="font-serif text-[40px] text-[#4ade80]">
                    {userName ? userName.substring(0, 2).toUpperCase() : 'UI'}
                </span>
            </div>
            <h2 className="font-serif text-[28px] leading-tight text-white mb-1">
                {userName || 'Usuário ALAIAS'}
            </h2>
            <p className="font-sans text-sm text-[#bccabb] opacity-60">membro desde abr 2025</p>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-[#111111] p-4 rounded-xl border border-[#1a1a1a] flex flex-col items-center">
                <span className="font-serif text-[#4ade80] text-[32px] leading-none">42</span>
                <span className="text-[9px] uppercase tracking-[0.1em] text-center mt-2 opacity-50 font-sans font-medium text-[#bccabb]">tarefas concluídas</span>
            </div>
            <div className="bg-[#111111] p-4 rounded-xl border border-[#1a1a1a] flex flex-col items-center">
                <span className="font-serif text-[#4ade80] text-[32px] leading-none">12</span>
                <span className="text-[9px] uppercase tracking-[0.1em] text-center mt-2 opacity-50 font-sans font-medium text-[#bccabb]">dias de streak</span>
            </div>
            <div className="bg-[#111111] p-4 rounded-xl border border-[#1a1a1a] flex flex-col items-center">
                <span className="font-serif text-[#4ade80] text-[32px] leading-none">{String(logs.length).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase tracking-[0.1em] text-center mt-2 opacity-50 font-sans font-medium text-[#bccabb]">entradas no diário</span>
            </div>
        </section>

        {/* Settings Sections */}
        <div className="space-y-8">
            {/* Preferências */}
            <section>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#bccabb] mb-2 opacity-50 font-sans font-medium">PREFERÊNCIAS</h3>
                
                <div className="h-12 border-b border-[#1a1a1a] flex items-center justify-between">
                    <span className="font-sans text-base">Tema</span>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase tracking-widest text-[#4ade80] font-sans font-medium">Dark</span>
                        <div className="w-8 h-4 rounded-full bg-[#111111] border border-[#1a1a1a] relative">
                            <div className="absolute right-0 w-4 h-4 bg-[#4ade80] rounded-full top-[-1px]"></div>
                        </div>
                    </div>
                </div>
                
                <div className="h-12 border-b border-[#1a1a1a] flex items-center justify-between">
                    <span className="font-sans text-base">Notificações</span>
                    <div className="w-10 h-5 rounded-full bg-[#4ade80] p-0.5 flex justify-end items-center">
                        <div className="w-4 h-4 bg-[#0a0a0a] rounded-full"></div>
                    </div>
                </div>
                
                <div className="h-12 border-b border-[#1a1a1a] flex items-center justify-between">
                    <span className="font-sans text-base">Idioma</span>
                    <span className="font-sans text-sm text-[#bccabb]">Português</span>
                </div>
            </section>

            {/* Privacidade */}
            <section>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#bccabb] mb-2 opacity-50 font-sans font-medium">PRIVACIDADE</h3>
                
                <div className="h-12 border-b border-[#1a1a1a] flex items-center justify-between">
                    <span className="font-sans text-base">PIN de acesso</span>
                    <div className={cn("w-10 h-5 rounded-full p-0.5 flex items-center", journalPinHash ? "bg-[#4ade80] justify-end" : "bg-[#1a1a1a]")}>
                        <div className={cn("w-4 h-4 rounded-full", journalPinHash ? "bg-[#0a0a0a]" : "bg-white")}></div>
                    </div>
                </div>
                
                <div className="h-12 border-b border-[#1a1a1a] flex items-center justify-between">
                    <span className="font-sans text-base">Biometria</span>
                    <div className="w-10 h-5 rounded-full bg-[#4ade80] p-0.5 flex justify-end items-center">
                        <div className="w-4 h-4 bg-[#0a0a0a] rounded-full"></div>
                    </div>
                </div>
                
                <div onClick={handleExport} className="h-12 border-b border-[#1a1a1a] flex items-center justify-between cursor-pointer hover:bg-[#111111] transition-colors">
                    <span className="font-sans text-base">Exportar dados</span>
                    <span className="material-symbols-outlined text-[#bccabb] opacity-40">chevron_right</span>
                </div>
                
                <div onClick={() => fileInputRef.current?.click()} className="h-12 border-b border-[#1a1a1a] flex items-center justify-between cursor-pointer hover:bg-[#111111] transition-colors">
                    <span className="font-sans text-base">Importar dados</span>
                    <span className="material-symbols-outlined text-[#bccabb] opacity-40">chevron_right</span>
                </div>
                 <input 
                    type="file" 
                    accept=".json" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleImport}
                />
            </section>

            {/* Assinatura */}
            <section>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#bccabb] mb-2 opacity-50 font-sans font-medium">ASSINATURA</h3>
                
                <div className="h-12 border-b border-[#1a1a1a] flex items-center justify-between">
                    <span className="font-sans text-base">Plano atual</span>
                    <span className="bg-[#4ade80]/10 text-[#4ade80] px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest border border-[#4ade80]/30">Gratuito</span>
                </div>
                
                <div className="mt-4 p-5 bg-[#111111] rounded-[18px] border border-[#4ade80]/30 relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="font-serif text-2xl mb-4 leading-tight italic flex flex-col">
                            <span>desbloqueie o</span>
                            <span className="text-[#4ade80]">Alaias completo</span>
                        </h4>
                        <button className="bg-[#4ade80] text-[#0a0a0a] px-6 py-2.5 rounded-full font-sans text-[10px] uppercase font-bold tracking-widest hover:bg-[#6bfb9a] transition-all active:scale-95 shadow-lg">
                            Upgrade agora
                        </button>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    </div>
                </div>
            </section>
        </div>

        {/* Footer Actions */}
        <section className="flex flex-col items-center pt-8 pb-12">
            <button 
                onClick={() => setAuthenticated(false)}
                className="text-[#bccabb] font-sans text-[12px] uppercase font-bold tracking-widest mb-6 hover:text-white transition-colors"
            >
                Sair da conta
            </button>
            <button 
                onClick={clearData}
                className="text-[#ef4444] font-sans text-[12px] uppercase font-bold tracking-widest mb-6 hover:opacity-70 transition-opacity"
            >
                Apagar todos os dados
            </button>
      <p className="text-[10px] text-[#bccabb] opacity-30 font-sans tracking-wide">
          Alaias v1.0 · feito com <Heart className="w-2.5 h-2.5 inline mx-0.5 fill-current" />
      </p>
  </section>

</div>
</div>
);
}

