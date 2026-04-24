import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, ChevronRight, Circle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getMotivationalQuote } from '../services/ai';
import { cn } from '../lib/utils';
import 'react-circular-progressbar/dist/styles.css';

export function Dashboard() {
  const [quote, setQuote] = useState("Carregando inspiração...");
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const navigate = useNavigate();

  const { tasks, transactions, getLog, updateLog, goals, budgets, userName, setUserName, level, xp } = useAppStore();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName || 'Chefe');

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const log = getLog(todayStr);
  
  // Gamification
  const xpNeeded = level * 100;
  const xpProgress = (xp / xpNeeded) * 100;
  
  // Greetings
  const hour = today.getHours();
  let greetTime = 'Boa noite';
  if (hour >= 5 && hour < 12) greetTime = 'Bom dia';
  else if (hour >= 12 && hour < 18) greetTime = 'Boa tarde';

  useEffect(() => {
    getMotivationalQuote()
      .then(setQuote)
      .finally(() => setIsLoadingQuote(false));
  }, []);

  // Filter Tasks
  const todaysTasks = tasks
    .filter(t => t.dueDate === todayStr || (!t.dueDate && t.status !== 'completed' && !t.completed))
    .sort((a, b) => {
       const wA = a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1;
       const wB = b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1;
       return wB - wA;
    });

  const completedToday = todaysTasks.filter(t => t.completed || t.status === 'completed').length;
  
  // Finances this month
  const currentMonthStr = format(today, 'yyyy-MM');
  const thisMonthTrans = transactions.filter(t => t.date.startsWith(currentMonthStr));
  const income = thisMonthTrans.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = thisMonthTrans.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  // Common classes
  const cardClass = "bg-[#111111] border border-[#1a1a1a] rounded-[14px]";

  return (
    <div className="p-6 pb-32 bg-[#0a0a0a] min-h-[max(884px,100dvh)] text-[#dde5da] font-sans">
      
      {/* Top Bar with Level Display */}
      <header className="flex justify-between items-center pb-4 -mx-6 px-6 mb-8 mt-2 sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1a1a1a]">
        <h1 className="font-serif italic text-xl tracking-widest text-white uppercase flex items-center">
             Alai<span className="text-[#4ade80]">as</span>
        </h1>
        <div className="relative group cursor-pointer active:scale-95 transition-transform" onClick={() => navigate('/config')}>
            <div className={`w-10 h-10 rounded-full border-2 border-[#4ade80] flex items-center justify-center bg-[#242c25]`}>
                <span className="font-sans font-bold text-white text-sm">L{level}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#4ade80] rounded-full border-2 border-[#0a0a0a]"></div>
        </div>
      </header>

      {/* Greeting Block */}
      <section className="mb-8">
        <p className="font-sans text-[12px] uppercase text-[#bccabb] tracking-widest mb-2 font-medium">
          {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
        <h2 className="font-serif text-[42px] leading-[1.1] text-white">
          {greetTime},{' '}
          {isEditingName ? (
              <input 
                 type="text" 
                 value={nameInput}
                 onChange={e => setNameInput(e.target.value)}
                 onBlur={() => {
                     setUserName(nameInput || 'Chefe');
                     setIsEditingName(false);
                 }}
                 onKeyDown={e => {
                     if (e.key === 'Enter') {
                         setUserName(nameInput || 'Chefe');
                         setIsEditingName(false);
                     }
                 }}
                 autoFocus
                 className="bg-transparent text-[#4ade80] outline-none w-32 italic border-b border-[#4ade80] border-dashed"
              />
          ) : (
             <span 
                onClick={() => {
                    setNameInput(userName || 'Chefe');
                    setIsEditingName(false);
                    setTimeout(() => setIsEditingName(true), 10);
                }}
                className="italic text-[#4ade80] cursor-pointer"
             >
                 {userName || 'Chefe'}
             </span>
          )}
        </h2>
      </section>

      {/* AI Insight Card */}
      <section className={`${cardClass} p-5 relative overflow-hidden mb-8`}>
        <div className="flex gap-4">
          <div className="w-1 h-full absolute left-0 top-0 bg-[#4ade80]"></div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></div>
              <span className="font-sans text-[10px] text-[#bccabb] tracking-widest uppercase font-bold">Insight do Dia</span>
            </div>
            <p className="font-serif italic text-[20px] text-white leading-relaxed">
                "{isLoadingQuote ? 'Consultando inteligência...' : quote}"
            </p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        <Link to="/tarefas" className={`${cardClass} p-4 flex flex-col justify-between h-28 active:scale-95 transition-transform`}>
          <span className="font-sans text-[10px] text-[#bccabb] uppercase font-bold tracking-widest">Tarefas</span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-[32px] text-[#4ade80]">{todaysTasks.length}</span>
            <span className="font-sans text-[14px] text-[#bccabb]">PND</span>
          </div>
        </Link>
        <Link to="/financas" className={`${cardClass} p-4 flex flex-col justify-between h-28 active:scale-95 transition-transform`}>
          <span className="font-sans text-[10px] text-[#bccabb] uppercase font-bold tracking-widest">Gastos</span>
          <span className="font-serif text-[24px] text-white mt-auto">R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        </Link>
        <Link to="/saude" className={`${cardClass} p-4 flex flex-col justify-between h-28 active:scale-95 transition-transform`}>
          <span className="font-sans text-[10px] text-[#bccabb] uppercase font-bold tracking-widest">Sintonia</span>
          <div className="flex items-baseline gap-1 mt-auto">
             <span className="text-3xl relative top-1">
                 {log.mood === 5 ? '🚀' : log.mood === 4 ? '😊' : log.mood === 2 ? '😔' : '😐'}
             </span>
             <span className="font-sans text-[10px] text-[#bccabb] ml-1">HUMOR</span>
          </div>
        </Link>
        <Link to="/metas" className={`${cardClass} p-4 flex flex-col justify-between h-28 active:scale-95 transition-transform`}>
          <span className="font-sans text-[10px] text-[#bccabb] uppercase font-bold tracking-widest">Metas</span>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="font-serif text-[32px] text-white">{goals.filter(g => g.milestones.length > 0 && g.milestones.every(m => m.completed)).length}</span>
            <span className="font-sans text-[10px] text-[#bccabb]">OK</span>
          </div>
        </Link>
      </section>

      {/* Tasks Preview */}
      <section className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-serif text-[28px] text-white">Próximas Tarefas</h3>
          <Link to="/tarefas" className="font-sans text-[10px] text-[#4ade80] uppercase font-bold tracking-widest">VER TUDO</Link>
        </div>
        <div className="space-y-1">
          {todaysTasks.slice(0, 3).map((task, idx) => {
              const isCompleted = task.status === 'completed' || task.completed;
              return (
                <div key={task.id} className={`flex items-center gap-4 py-4 ${idx !== 2 ? 'border-b border-[#1a1a1a]' : ''}`}>
                    <div className="relative">
                        {isCompleted ? (
                           <CheckCircle2 className="text-[#4ade80] w-5 h-5 relative z-10" />
                        ) : (
                           <div className="w-5 h-5 rounded border border-[#1a1a1a]"></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`font-sans text-[16px] text-white truncate ${isCompleted ? 'line-through text-[#869486]' : ''}`}>
                            {task.title}
                        </p>
                        {task.dueTime ? (
                           <p className="font-sans text-[11px] text-[#bccabb]">{task.dueTime}</p>
                        ) : (
                           <p className="font-sans text-[11px] text-[#bccabb]">A qualquer hora</p>
                        )}
                    </div>
                    <span className={cn(
                        "font-sans text-[9px] px-2 py-1 rounded-full uppercase font-bold tracking-widest border",
                        task.priority === 'high' ? "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20" : 
                        task.priority === 'medium' ? "bg-neutral-800 text-[#bccabb] border-[#1a1a1a]" : 
                        "bg-[#111111] text-[#869486] border-[#1a1a1a]"
                    )}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                </div>
              );
          })}
          {todaysTasks.length === 0 && (
              <div className="py-8 text-center text-[#869486] font-sans text-sm">
                  Sem tarefas agendadas para hoje.
              </div>
          )}
        </div>
      </section>

      {/* Finance Mini Section */}
      <section className="mb-8">
        <h3 className="font-sans text-[10px] text-[#bccabb] mb-4 uppercase font-bold tracking-widest">Resumo Financeiro</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className={`${cardClass} p-4`}>
             <span className="font-sans text-[10px] text-[#bccabb] uppercase font-bold tracking-widest">Receita</span>
             <p className="font-serif text-[24px] text-[#4ade80] my-2">
                R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
             </p>
             <div className="w-full h-px bg-[#1a1a1a]">
                 <div className="h-px bg-[#4ade80] w-[80%]"></div>
             </div>
          </div>
          <div className={`${cardClass} p-4`}>
             <span className="font-sans text-[10px] text-[#bccabb] uppercase font-bold tracking-widest">Gasto</span>
             <p className="font-serif text-[24px] text-white my-2">
                R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
             </p>
             <div className="w-full h-px bg-[#1a1a1a]">
                 <div className="h-px bg-white w-[50%]"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Mood Check-in */}
      <section className="mb-0">
        <h3 className="font-serif text-[28px] text-white mb-6">Como você está se sentindo?</h3>
        <div className="flex justify-between gap-2">
            {[
              { emoji: '😔', value: 2, color: 'border-rose-500/50', label: 'Ruim' },
              { emoji: '😐', value: 3, color: 'border-amber-500/50', label: 'Normal' },
              { emoji: '😊', value: 4, color: 'border-emerald-500/50', label: 'Bem' },
              { emoji: '🚀', value: 5, color: 'border-[#4ade80] text-[#4ade80]', bg: 'bg-[#4ade80]/10', label: 'Focado' }
            ].map(m => (
               <div 
                  key={m.value}
                  onClick={() => updateLog(todayStr, { mood: m.value })}
                  className={cn(
                      `${cardClass} flex-1 flex flex-col items-center justify-center aspect-square transition-all cursor-pointer active:scale-95 text-xl relative`,
                      log.mood === m.value ? `${m.color} ${m.bg || 'bg-[#1a1a1b]'}` : 'hover:border-[#4ade80]/50'
                  )}
               >
                   <span className="text-2xl mb-1">{m.emoji}</span>
                   {log.mood === m.value && (
                       <span className="font-sans text-[8px] uppercase tracking-widest font-bold mt-1 text-center leading-none px-1 text-[#4ade80] absolute bottom-2">
                           {m.label}
                       </span>
                   )}
               </div>
            ))}
        </div>
      </section>

    </div>
  );
}
