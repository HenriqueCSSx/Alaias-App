import React, { useState } from 'react';
import { Goal, useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { ChevronDown, CheckCircle2, Circle, MoreVertical, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function GoalCard({ goal }: { goal: Goal; key?: React.Key }) {
  const { toggleMilestone, deleteGoal } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const completed = goal.milestones.filter(m => m.completed).length;
  const total = goal.milestones.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-[14px] flex flex-col overflow-hidden transition-all duration-300">
      
      <div 
        className="p-5 flex flex-col cursor-pointer hover:bg-[#151515] transition-colors relative"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start mb-4">
            <div>
                <span className="font-sans text-[10px] tracking-widest uppercase text-[#869486] block mb-1">
                    {goal.category}
                </span>
                <h3 className="font-serif text-[24px] text-white leading-tight">{goal.title}</h3>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-4">
                <span className="px-2 py-1 bg-[#00210c] text-[#4ade80] text-[10px] font-bold rounded-full mb-1 sm:mb-2 uppercase tracking-tighter">
                    {progress === 100 ? 'Concluído' : 'Em andamento'}
                </span>
                {goal.deadline && (
                    <span className="text-[10px] text-[#869486] uppercase font-sans tracking-wider">
                        {format(new Date(goal.deadline), "MMM yyyy", { locale: ptBR })}
                    </span>
                )}
            </div>
        </div>

        <div className="w-full bg-[#1a1a1a] h-1 rounded-full overflow-hidden mb-2">
            <div className="bg-[#4ade80] h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="flex justify-between items-center">
            <span className="text-[10px] text-neutral-500 font-sans tracking-wide uppercase">{progress}% concluído</span>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-white font-sans font-bold tracking-wide">
                    {completed} / {total} {total === 1 ? 'passo' : 'passos'}
                </span>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
                    className="p-1 -mr-1 text-neutral-500 hover:text-white transition-colors relative"
                >
                    <MoreVertical className="w-4 h-4" />
                    {showOptions && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-[#1a1a1a] border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-20">
                            <div 
                                onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
                                className="p-3 text-red-400 flex items-center gap-2 hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider"
                            >
                                <Trash2 className="w-4 h-4" /> Excluir
                            </div>
                        </div>
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* Expanded Content: Milestones */}
      <div className={cn(
          "bg-[#0a0a0a] overflow-hidden transition-all duration-500",
          expanded ? "max-h-96 border-t border-[#1a1a1a]" : "max-h-0"
      )}>
         <div className="p-5 space-y-3">
             <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#869486] mb-2 font-sans">Passos</h4>
             {goal.milestones.map(m => (
                 <button
                    key={m.id}
                    onClick={() => toggleMilestone(goal.id, m.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#111111] border border-[#1a1a1a] hover:border-[#4ade80]/50 transition-colors text-left group"
                 >
                     <div className={cn(
                         "shrink-0 w-5 h-5 flex items-center justify-center transition-colors rounded-full border",
                         m.completed ? "bg-[#4ade80] border-[#4ade80] text-[#003919]" : "border-[#869486] text-transparent group-hover:border-[#4ade80]"
                     )}>
                         <CheckCircle2 className={cn("w-3.5 h-3.5", m.completed ? "opacity-100" : "opacity-0")} />
                     </div>
                     <span className={cn(
                         "text-sm transition-all flex-1 font-sans",
                         m.completed ? "text-neutral-500 line-through" : "text-[#dde5da]"
                     )}>{m.title}</span>
                 </button>
             ))}
             {goal.milestones.length === 0 && (
                 <p className="text-neutral-600 text-xs italic font-sans">Nenhum passo definido.</p>
             )}
         </div>
      </div>

    </div>
  );
}
