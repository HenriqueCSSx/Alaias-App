import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { format, subDays, isSameDay, differenceInMinutes, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Flame, Activity, Droplet, Moon, Sun, ChevronRight, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function Health() {
  const { getLog, updateLog, meals, addMeal, deleteMeal, exercises, addExercise, deleteExercise } = useAppStore();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayLog = getLog(todayStr);

  const todayMeals = meals.filter(m => isSameDay(new Date(m.date), new Date()));
  const todayExercises = exercises.filter(e => isSameDay(new Date(e.date), new Date()));

  const totalCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalExerMinutes = todayExercises.reduce((acc, e) => acc + e.duration, 0);
  
  const waterLiters = (todayLog.waterGlasses * 0.25).toFixed(1);

  // Calculate sleep duration
  let sleepDurationStr = '--H --M';
  let sleepPercentage = 0;
  if (todayLog.sleepStart && todayLog.sleepEnd) {
      try {
          const start = parse(todayLog.sleepStart, 'HH:mm', new Date());
          let end = parse(todayLog.sleepEnd, 'HH:mm', new Date());
          if (end < start) {
              end = new Date(end.getTime() + 24 * 60 * 60 * 1000); // add 1 day
          }
          const diffMins = differenceInMinutes(end, start);
          const hours = Math.floor(diffMins / 60);
          const mins = diffMins % 60;
          sleepDurationStr = `${hours}H ${mins}M`;
          sleepPercentage = Math.min((diffMins / (8 * 60)) * 100, 100); // 8h = 100%
      } catch (e) {
          // ignore parsing error
      }
  }

  // Calculate generic day score
  const dayScore = useMemo(() => {
     let score = 30; // base score
     if (todayLog.waterGlasses >= 8) score += 20;
     else score += (todayLog.waterGlasses / 8) * 20;
     
     if (todayLog.sleepQuality) score += (todayLog.sleepQuality / 5) * 25;
     if (totalExerMinutes >= 30) score += 25;
     else score += (totalExerMinutes / 30) * 25;
     
     return Math.min(Math.round(score), 100);
  }, [todayLog.waterGlasses, todayLog.sleepQuality, totalExerMinutes]);

  const scoreCircumference = 2 * Math.PI * 36;
  const scoreDashoffset = scoreCircumference - (dayScore / 100) * scoreCircumference;

  const setWater = (amount: number) => {
    updateLog(todayStr, { waterGlasses: Math.max(0, amount) });
  };

  const addGlass = () => setWater(todayLog.waterGlasses + 1);

  // Trends Data
  const weeklyTrends = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const dStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const entry = getLog(dStr);
        data.push({
            name: format(new Date(dStr), 'eee', { locale: ptBR }).toUpperCase().replace('.', ''),
            mood: entry.mood || 0,
            energy: entry.energy || 0,
        });
    }
    return data;
  }, [getLog]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-[#dde5da]">
      
      {/* TopAppBar is from Layout usually, but prototype shows a custom header. 
          Assuming Layout provides a global header, but we'll add the page title here. */}
      
      <main className="px-6 pt-5 pb-8 space-y-8 flex-1">
        {/* Header Section */}
        <header className="space-y-2">
            <h1 className="font-serif text-[32px] text-white leading-tight">
                Minha <span className="text-[#4ade80] italic">saúde</span>
            </h1>
        </header>

        {/* Today Score Card */}
        <section className="bg-[#111111] border border-[#1a1a1a] rounded-3xl p-6 flex items-center justify-between shadow-xl">
            <div className="space-y-1">
                <p className="font-sans text-[12px] text-[#bccabb] font-bold uppercase tracking-[0.1em]">Score do dia</p>
                <p className="font-sans text-sm text-[#869486]">Excelente consistência</p> {/* Dynamic text later */}
            </div>
            <div className="relative flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90">
                    <circle className="text-[#1a1a1a]" cx="40" cy="40" fill="transparent" r="36" stroke="currentColor" strokeWidth="4"></circle>
                    <circle 
                        className="text-[#4ade80] transition-all duration-1000 ease-in-out" 
                        cx="40" cy="40" fill="transparent" r="36" stroke="currentColor" 
                        strokeWidth="4"
                        strokeDasharray={scoreCircumference} 
                        strokeDashoffset={scoreDashoffset} 
                        strokeLinecap="round"
                    ></circle>
                </svg>
                <span className="absolute font-serif text-white text-2xl">{dayScore}</span>
            </div>
        </section>

        {/* Quick Log 2x2 Grid */}
        <section className="grid grid-cols-2 gap-4">
            {/* Sleep */}
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-[24px] p-4 space-y-3 shadow-lg">
                <div className="flex justify-between items-start">
                    <Moon className="w-5 h-5 text-[#4ade80]" />
                    <span className="font-sans text-[12px] font-bold text-[#4ade80] uppercase tracking-wider">{sleepDurationStr}</span>
                </div>
                <p className="font-sans text-[12px] font-bold text-[#bccabb] uppercase tracking-wider">SONO</p>
            </div>
            {/* Water */}
            <div 
                className="bg-[#111111] border border-[#1a1a1a] rounded-[24px] p-4 space-y-3 shadow-lg cursor-pointer active:scale-95 transition-transform"
                onClick={addGlass}
            >
                <div className="flex justify-between items-start">
                    <Droplet className="w-5 h-5 text-[#4ade80]" />
                    <span className="font-sans text-[12px] font-bold text-[#4ade80] uppercase tracking-wider">{waterLiters}L</span>
                </div>
                <p className="font-sans text-[12px] font-bold text-[#bccabb] uppercase tracking-wider">ÁGUA</p>
            </div>
            {/* Exercise */}
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-[24px] p-4 space-y-3 shadow-lg">
                <div className="flex justify-between items-start">
                    <Activity className="w-5 h-5 text-[#4ade80]" />
                    <span className="font-sans text-[12px] font-bold text-[#4ade80] uppercase tracking-wider">{totalExerMinutes} MIN</span>
                </div>
                <p className="font-sans text-[12px] font-bold text-[#bccabb] uppercase tracking-wider">EXERCÍCIO</p>
            </div>
            {/* Food */}
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-[24px] p-4 space-y-3 shadow-lg">
                <div className="flex justify-between items-start">
                    <Flame className="w-5 h-5 text-[#4ade80]" />
                    <span className="font-sans text-[12px] font-bold text-[#4ade80] uppercase tracking-wider">{totalCalories} KCAL</span>
                </div>
                <p className="font-sans text-[12px] font-bold text-[#bccabb] uppercase tracking-wider">ALIMENTAÇÃO</p>
            </div>
        </section>

        {/* Sleep Section */}
        <section className="space-y-4">
            <div className="flex justify-between items-end">
                <h3 className="font-sans text-[12px] font-bold text-white uppercase tracking-wider">SONO ONTEM</h3>
                <div className="flex gap-1" onClick={() => updateLog(todayStr, { sleepQuality: Math.min((todayLog.sleepQuality || 0) + 1, 5) }) }>
                    {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} onClick={(e) => { e.stopPropagation(); updateLog(todayStr, { sleepQuality: star }); }} className={cn("w-4 h-4 cursor-pointer", (todayLog.sleepQuality || 0) >= star ? "text-[#4ade80] fill-[#4ade80]" : "text-[#1a1a1a] fill-[#1a1a1a]")} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                    ))}
                </div>
            </div>
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-3xl p-5 space-y-4 shadow-lg">
                <div className="flex justify-between font-sans text-sm text-[#bccabb] items-center">
                    <input 
                        type="time" 
                        value={todayLog.sleepStart || '23:00'}
                        onChange={(e) => updateLog(todayStr, { sleepStart: e.target.value })}
                        className="bg-transparent text-[#bccabb] font-bold outline-none border-b border-transparent focus:border-[#4ade80] w-14 text-center cursor-pointer"
                    />
                    <span className="text-white font-bold">{sleepDurationStr}</span>
                    <input 
                        type="time" 
                        value={todayLog.sleepEnd || '07:00'}
                        onChange={(e) => updateLog(todayStr, { sleepEnd: e.target.value })}
                        className="bg-transparent text-[#bccabb] font-bold outline-none border-b border-transparent focus:border-[#4ade80] w-14 text-center cursor-pointer"
                    />
                </div>
                <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#4ade80]/20" style={{ width: '16.66%' }}></div>
                    <div className="h-full bg-[#4ade80] transition-all" style={{ width: `${sleepPercentage * 0.66}%` }}></div>
                    <div className="h-full bg-[#4ade80]/20 flex-1"></div>
                </div>
            </div>
        </section>

        {/* Hydration Tracker */}
        <section className="space-y-4">
            <div className="flex justify-between items-center bg-[#111111] border border-[#1a1a1a] rounded-3xl p-5 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="font-sans text-[12px] font-bold text-white uppercase tracking-wider">HIDRATAÇÃO</span>
                        <div className="flex gap-2 mt-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Droplet 
                                    key={i} 
                                    className={cn("w-5 h-5 transition-colors", i < todayLog.waterGlasses ? "text-[#4ade80] fill-[#4ade80]" : "text-[#1a1a1a] fill-[#1a1a1a]")} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={addGlass} className="w-10 h-10 rounded-full bg-[#4ade80] flex items-center justify-center text-black shrink-0 shadow-lg active:scale-95 transition-transform">
                    <Plus className="w-6 h-6 stroke-[3]" />
                </button>
            </div>
        </section>

        {/* Mood & Energy Chart */}
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-sans text-[12px] font-bold text-white uppercase tracking-wider">HUMOR & ENERGIA</h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80" onClick={() => updateLog(todayStr, { mood: ((todayLog.mood || 0) % 5) + 1 })}>
                        <div className="w-2 h-2 rounded-full bg-[#4ade80]"></div>
                        <span className="font-sans text-[10px] font-bold uppercase tracking-wider">HUMOR                             {todayLog.mood ? `(${todayLog.mood})` : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80" onClick={() => updateLog(todayStr, { energy: ((todayLog.energy || 0) % 5) + 1 })}>
                        <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
                        <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-neutral-400">ENERGIA {todayLog.energy ? `(${todayLog.energy})` : ''}</span>
                    </div>
                </div>
            </div>
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-3xl p-6 h-[180px] flex items-end justify-between relative overflow-hidden shadow-lg">
                 <ResponsiveContainer width="100%" height="100%" className="-mx-6 pt-2 pb-6 absolute inset-0">
                    <AreaChart data={weeklyTrends} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#525252" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#525252" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" hide={true} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111111', borderColor: '#1a1a1a', borderRadius: '12px' }} 
                            itemStyle={{ color: '#fff' }} 
                        />
                        <Area type="monotone" dataKey="mood" stroke="#4ade80" strokeWidth={2} fillOpacity={1} fill="url(#colorMood)" />
                        <Area type="monotone" dataKey="energy" stroke="#525252" strokeWidth={2} fillOpacity={1} fill="url(#colorEnergy)" />
                    </AreaChart>
                 </ResponsiveContainer>
                 {/* X Axis Custom Labels overlayed perfectly */}
                 <div className="relative w-full flex justify-between font-sans font-bold uppercase tracking-widest text-[9px] text-[#869486] pointer-events-none z-10 translate-y-1">
                     {weeklyTrends.map(d => <span key={d.name}>{d.name}</span>)}
                 </div>
            </div>
        </section>

        {/* Today's Meals */}
        <section className="space-y-4">
            <h3 className="font-sans text-[12px] font-bold text-white uppercase tracking-wider">REFEIÇÕES HOJE</h3>
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-3xl overflow-hidden divide-y divide-[#1a1a1a] shadow-lg">
                
                {todayMeals.map(m => (
                    <div key={m.id} className="p-4 flex justify-between items-center hover:bg-[#151515] transition-colors cursor-pointer group">
                        <div className="space-y-0.5">
                            <p className="font-sans text-[10px] font-bold text-[#869486] uppercase tracking-wider">{m.time}</p>
                            <p className="font-sans text-base text-white">{m.name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-sans text-[12px] text-[#4ade80] font-bold uppercase">{m.calories} kcal</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-5 h-5 text-[#869486]" />
                            </div>
                        </div>
                    </div>
                ))}
                
                <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-[#1a1a1a]/50 transition-colors">
                    <div className="space-y-0.5">
                        <p className="font-sans text-base text-[#4ade80]/60 font-medium">+ Registrar Refeição</p>
                    </div>
                    <PlusCircle className="w-6 h-6 text-[#4ade80]/60" />
                </div>
            </div>
        </section>

        {/* Insight Card */}
        <section className="bg-[#111111] border border-[#1a1a1a] rounded-3xl p-6 relative overflow-hidden shadow-lg mb-20">
            <div className="flex items-center gap-2 mb-3">
                <Sun className="w-4 h-4 text-[#4ade80]" />
                <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#4ade80]">ALAIAS INSIGHT</span>
            </div>
            <p className="font-serif italic text-white text-lg">
                Sua energia costuma cair às 15h. Experimente uma caminhada leve hoje para manter o foco.
            </p>
        </section>
      </main>
    </div>
  );
}

