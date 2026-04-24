import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore, GoalCategory, Milestone } from '../store/useAppStore';
import { GoalCard } from '../components/GoalCard';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Target, Zap, Plus, X, Award, Flame } from 'lucide-react';
import { cn } from '../lib/utils';
import { getHabitSuggestion } from '../services/ai';
import confetti from 'canvas-confetti';

export function GoalsHabits() {
  const { goals, addGoal, habits, habitLogs, addHabit, toggleHabitLog, deleteHabit } = useAppStore();
  
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isAddingHabit, setIsAddingHabit] = useState(false);

  // New Goal State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('pessoal');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [milestones, setMilestones] = useState<{id: string, title: string}[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  // New Habit State
  const [habitTitle, setHabitTitle] = useState('');

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Weekly dates for habit tracker (last 7 days for list)
  const weekDates = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));

  // Calendar 28-day Consistency Graph
  const consistencyDates = Array.from({ length: 28 }).map((_, i) => addDays(startOfWeek(today, { weekStartsOn: 0 }), i - 21));

  const handleAddGoal = (e: React.FormEvent) => {
      e.preventDefault();
      if (!goalTitle.trim()) return;
      addGoal({
          title: goalTitle.trim(),
          category: goalCategory,
          deadline: goalDeadline || undefined,
          milestones: milestones.map(m => ({ ...m, completed: false }))
      });
      setGoalTitle('');
      setMilestones([]);
      setGoalDeadline('');
      setIsAddingGoal(false);
  };

  const handleAddMilestone = () => {
      if (!newMilestoneTitle.trim()) return;
      setMilestones([...milestones, { id: crypto.randomUUID(), title: newMilestoneTitle.trim() }]);
      setNewMilestoneTitle('');
  };

  const handleAddHabit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!habitTitle.trim()) return;
      addHabit(habitTitle.trim());
      setHabitTitle('');
      setIsAddingHabit(false);
  };

  const handleToggleHabit = (habitId: string, dateStr: string) => {
      toggleHabitLog(habitId, dateStr);

      const logWasAdded = !habitLogs.some(l => l.habitId === habitId && l.date === dateStr);
      if (logWasAdded) {
          let streak = 0;
          for (let i=0; i<365; i++) {
              const d = format(subDays(today, i), 'yyyy-MM-dd');
              const hasLog = (d === dateStr) || habitLogs.some(l => l.habitId === habitId && l.date === d);
              if (hasLog) streak++;
              else break;
          }
          if (streak > 0 && streak % 7 === 0) {
              triggerConfetti();
          }
      }
  };

  const triggerConfetti = () => {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#4ade80', '#ffffff', '#1a1a1a']
        });
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#6bfb9a', '#dde5da', '#0a0a0a']
        });
      }, 250);
  };

  const activeGoalsCount = goals.filter(g => {
     const completed = g.milestones.filter(m => m.completed).length;
     const total = g.milestones.length;
     return total === 0 || completed < total;
  }).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] relative flex-1 text-[#dde5da]">
      
      <main className="px-6 pt-5 pb-32 space-y-10 flex-1">
        {/* Header Section */}
        <header className="mb-8 pl-2">
            <h1 className="font-serif text-[32px] text-white leading-tight">
                Metas & <span className="italic text-[#4ade80]">hábitos</span>
            </h1>
            <p className="font-serif italic text-lg text-[#bccabb] mt-2 leading-relaxed">
                "O progresso é a soma de pequenos esforços."
            </p>
        </header>

        {/* Active Goals Section */}
        <section>
            <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="font-sans text-[12px] font-bold text-[#869486] uppercase tracking-widest">Metas Ativas</h2>
                <span className="text-[10px] text-[#4ade80] font-bold tracking-widest uppercase">{activeGoalsCount} EM FOCO</span>
            </div>
            
            {isAddingGoal ? (
                <div className="bg-[#111111] p-6 rounded-[14px] border border-[#1a1a1a] shadow-xl animate-in slide-in-from-top-4 fade-in mb-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-xl text-white">Criar Meta</h3>
                        <button onClick={() => setIsAddingGoal(false)} className="text-[#869486] hover:text-[#4ade80] transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleAddGoal} className="space-y-4">
                        <input 
                            type="text"
                            placeholder="Qual seu grande objetivo?"
                            value={goalTitle}
                            onChange={e => setGoalTitle(e.target.value)}
                            className="w-full bg-transparent border-b border-[#1a1a1a] pb-2 font-serif text-xl outline-none focus:border-[#4ade80] text-white placeholder:text-[#869486] transition-colors"
                            required
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-[#869486] tracking-widest mb-2 block font-sans">Categoria</label>
                                <select 
                                    value={goalCategory}
                                    onChange={e => setGoalCategory(e.target.value as GoalCategory)}
                                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 font-sans text-sm outline-none text-white focus:border-[#4ade80] transition-colors appearance-none"
                                >
                                    <option value="pessoal">Pessoal</option>
                                    <option value="profissional">Profissional</option>
                                    <option value="saude">Saúde</option>
                                    <option value="financeiro">Financeiro</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-[#869486] tracking-widest mb-2 block font-sans">Prazo</label>
                                <input 
                                    type="date"
                                    value={goalDeadline}
                                    onChange={e => setGoalDeadline(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 font-sans text-sm outline-none text-white focus:border-[#4ade80] transition-colors"
                                />
                            </div>
                        </div>

                        <div className="pt-4 mt-2 border-t border-[#1a1a1a]">
                            <label className="text-[10px] uppercase font-bold text-[#869486] tracking-widest mb-2 block font-sans">Passos</label>
                            <div className="space-y-2 mb-3">
                                {milestones.map((m, i) => (
                                    <div key={m.id} className="flex items-center gap-2 bg-[#0a0a0a] p-2 rounded-lg font-sans text-sm border border-[#1a1a1a]">
                                        <span className="w-5 h-5 rounded-full bg-[#1a1a1a] text-[#bccabb] flex items-center justify-center text-[10px]">{i+1}</span>
                                        <span className="flex-1 truncate text-white">{m.title}</span>
                                        <button type="button" onClick={() => setMilestones(ms => ms.filter(x => x.id !== m.id))} className="text-red-400 p-1 hover:text-red-300 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    placeholder="Adicionar um passo..."
                                    value={newMilestoneTitle}
                                    onChange={e => setNewMilestoneTitle(e.target.value)}
                                    onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddMilestone(); } }}
                                    className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 font-sans text-sm outline-none text-white focus:border-[#4ade80] placeholder:text-[#869486] transition-colors"
                                />
                                <button type="button" onClick={handleAddMilestone} className="px-4 w-12 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#4ade80] hover:text-[#003919] text-[#bccabb] font-bold rounded-lg transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!goalTitle.trim()} 
                            className="w-full bg-[#4ade80] hover:bg-[#6bfb9a] text-[#003919] font-bold font-sans py-4 rounded-[14px] mt-4 disabled:opacity-50 transition-colors uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                        >
                            Salvar Meta
                        </button>
                    </form>
                </div>
            ) : null}

            <div className="space-y-3">
                {goals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} />
                ))}
                {goals.length === 0 && !isAddingGoal && (
                    <div className="text-center py-12 border border-dashed border-[#1a1a1a] rounded-[14px]">
                        <p className="text-sm font-sans text-[#869486]">Nenhuma meta definida.</p>
                    </div>
                )}
            </div>
        </section>

        {/* Habits Tracker Section */}
        <section>
            <h2 className="font-sans text-[12px] font-bold text-[#869486] uppercase tracking-widest mb-4 px-2">Rastreador de Hábitos</h2>
            
            {isAddingHabit && (
                <form onSubmit={handleAddHabit} className="bg-[#111111] p-5 rounded-[14px] border border-[#1a1a1a] flex flex-col gap-3 mb-4 animate-in slide-in-from-top-4">
                    <input 
                        type="text"
                        placeholder="Novo hábito (ex: Meditar 10min)"
                        value={habitTitle}
                        onChange={e => setHabitTitle(e.target.value)}
                        className="bg-transparent border-b border-[#1a1a1a] pb-2 outline-none focus:border-[#4ade80] font-sans text-white placeholder:text-[#869486] transition-colors"
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setIsAddingHabit(false)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#869486] hover:text-white transition-colors">Cancelar</button>
                        <button type="submit" disabled={!habitTitle.trim()} className="px-6 py-2 bg-[#4ade80] text-[#003919] rounded-full text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#6bfb9a] transition-colors">Adicionar</button>
                    </div>
                </form>
            )}

            <div className="space-y-0 px-2">
                {habits.map(habit => {
                    // Calculate streak ending today
                    let streak = 0;
                    const datesArray = Array.from({length: 30}).map((_,i) => format(subDays(today, i), 'yyyy-MM-dd'));
                    for (const dt of datesArray) {
                        if (habitLogs.some(l => l.habitId === habit.id && l.date === dt)) {
                            streak++;
                        } else {
                            if (dt === todayStr) continue;
                            break;
                        }
                    }

                    return (
                        <div key={habit.id} className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#111111] border border-[#1a1a1a] shrink-0">
                                    <span className={cn("material-symbols-outlined", streak > 0 ? "text-[#4ade80]" : "text-zinc-400")}>self_improvement</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <h4 className="font-sans font-medium text-white text-base truncate">{habit.title}</h4>
                                    <div className="flex items-center gap-1">
                                        <span className={cn("material-symbols-outlined text-[12px] w-auto h-auto", streak >= 3 ? "text-[#4ade80] filled-icon" : "text-[#869486]")}>local_fire_department</span>
                                        <span className={cn("font-sans text-[10px] uppercase font-bold tracking-widest", streak >= 3 ? "text-[#4ade80]" : "text-[#869486]")}>
                                            {streak} DIAS
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="flex gap-1 items-center mr-2">
                                    {weekDates.map(date => {
                                        const dStr = format(date, 'yyyy-MM-dd');
                                        const completed = habitLogs.some(l => l.habitId === habit.id && l.date === dStr);
                                        const isToday = dStr === todayStr;
                                        return (
                                            <div 
                                                key={dStr} 
                                                className={cn(
                                                    "w-3 h-3 rounded-full transition-colors",
                                                    completed ? "bg-[#4ade80]" : "bg-[#1a1a1a]",
                                                    isToday && !completed && "border border-[#4ade80]/50 bg-transparent"
                                                )}
                                                title={format(date, "dd MMM")}
                                            ></div>
                                        );
                                    })}
                                </div>
                                <button 
                                    onClick={() => handleToggleHabit(habit.id, todayStr)}
                                    className={cn(
                                        "w-8 h-8 rounded-full border flex items-center justify-center transition-all",
                                        habitLogs.some(l => l.habitId === habit.id && l.date === todayStr)
                                            ? "bg-[#4ade80] border-[#4ade80] text-[#003919]"
                                            : "border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10"
                                    )}
                                >
                                    <span className="material-symbols-outlined text-[16px]">
                                        {habitLogs.some(l => l.habitId === habit.id && l.date === todayStr) ? 'check' : 'add'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    );
                })}
                {habits.length === 0 && !isAddingHabit && (
                    <div className="text-center py-8">
                        <p className="text-sm font-sans text-[#869486]">Nenhum hábito cadastrado.</p>
                    </div>
                )}
            </div>
        </section>

        {/* Monthly Consistency Chart */}
        <section>
            <h2 className="font-sans text-[12px] font-bold text-[#869486] uppercase tracking-widest mb-4 px-2">Consistência Mensal</h2>
            <div className="bg-[#111111] border border-[#1a1a1a] p-6 rounded-[14px]">
                {habits.length > 0 ? (
                    <>
                        <div className="flex justify-between mb-4 px-1">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                                <span key={idx} className="w-6 sm:w-8 text-center text-[10px] text-[#555] uppercase font-sans font-bold tracking-widest">
                                    {day}
                                </span>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-3 justify-items-center">
                            {consistencyDates.map((date) => {
                                const dStr = format(date, 'yyyy-MM-dd');
                                const isFuture = date > today;
                                const completedCount = habits.filter(h => habitLogs.some(l => l.habitId === h.id && l.date === dStr)).length;
                                const totalHabits = habits.length;
                                const ratio = isFuture || totalHabits === 0 ? 0 : completedCount / totalHabits;

                                let bgColor = "bg-[#1a1a1a]";
                                let borderColor = "border-[#1a1a1a]";

                                if (!isFuture && totalHabits > 0) {
                                    if (ratio > 0 && ratio <= 0.33) {
                                        bgColor = "bg-[#064e3b]";
                                        borderColor = "border-[#064e3b]";
                                    } else if (ratio > 0.33 && ratio <= 0.66) {
                                        bgColor = "bg-[#15803d]";
                                        borderColor = "border-[#15803d]";
                                    } else if (ratio > 0.66 && ratio < 1) {
                                        bgColor = "bg-[#22c55e]";
                                        borderColor = "border-[#22c55e]";
                                    } else if (ratio === 1) {
                                        bgColor = "bg-[#4ade80]";
                                        borderColor = "border-[#4ade80]";
                                    }
                                }

                                const isToday = dStr === todayStr;

                                return (
                                    <div 
                                        key={dStr} 
                                        className={cn(
                                            "w-6 h-6 sm:w-8 sm:h-8 rounded-[4px] transition-colors border",
                                            bgColor,
                                            borderColor,
                                            isToday && ratio === 0 ? "border-[#4ade80] bg-transparent" : "",
                                            isFuture ? "opacity-30" : ""
                                        )}
                                        title={`${format(date, "dd MMM")}: ${completedCount}/${totalHabits}`}
                                    ></div>
                                )
                            })}
                        </div>
                        <div className="flex justify-end items-center gap-2 mt-6">
                            <span className="text-[10px] text-[#555] uppercase font-sans font-bold tracking-widest">Menos</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-[3px] bg-[#1a1a1a]"></div>
                                <div className="w-3 h-3 rounded-[3px] bg-[#064e3b]"></div>
                                <div className="w-3 h-3 rounded-[3px] bg-[#15803d]"></div>
                                <div className="w-3 h-3 rounded-[3px] bg-[#22c55e]"></div>
                                <div className="w-3 h-3 rounded-[3px] bg-[#4ade80]"></div>
                            </div>
                            <span className="text-[10px] text-[#555] uppercase font-sans font-bold tracking-widest">Mais</span>
                        </div>
                    </>
                ) : (
                    <p className="text-[12px] text-[#869486] text-center font-sans">Sem hábitos na semana ainda.</p>
                )}
            </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
            <button 
                onClick={() => { setIsAddingGoal(true); window.scrollTo(0, 0); }}
                className="flex-1 py-3 border border-[#4ade80] text-[#4ade80] font-sans text-[12px] font-bold tracking-widest uppercase rounded-full hover:bg-[#00210c] transition-colors"
            >
                + Nova meta
            </button>
            <button 
                onClick={() => { setIsAddingHabit(true); window.scrollTo({ top: 300, behavior: 'smooth'}); }}
                className="flex-1 py-3 border border-[#4ade80] text-[#4ade80] font-sans text-[12px] font-bold tracking-widest uppercase rounded-full hover:bg-[#00210c] transition-colors"
            >
                + Novo hábito
            </button>
        </div>

      </main>
    </div>
  );
}
