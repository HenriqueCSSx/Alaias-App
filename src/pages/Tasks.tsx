import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore, Task, TaskPriority } from '../store/useAppStore';
import { Plus, X, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { requestNotificationPermission, sendNotification } from '../lib/notifications';
import { TaskItem } from '../components/TaskItem';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export function Tasks() {
  const { tasks, projects, addTask, toggleTask, deleteTask, reorderTasks } = useAppStore();
  
  // Filter States
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'high' | 'completed'>('all');
  
  // Add Task Form State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState('');
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Grouping and Filtering
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const isCompleted = task.status === 'completed' || task.completed;
      const isTaskToday = task.dueDate === todayStr || (!task.dueDate && !isCompleted);

      if (activeFilter === 'today' && !isTaskToday) return false;
      if (activeFilter === 'high' && task.priority !== 'high') return false;
      if (activeFilter === 'completed' && !isCompleted) return false;
      if (activeFilter === 'all' && isCompleted) return false; // hide completed by default in 'all' view

      return true;
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [tasks, activeFilter, todayStr]);

  // Calculations for progress ring
  const todaysTasksRaw = tasks.filter(t => t.dueDate === todayStr || (!t.dueDate && (t.status !== 'completed' && !t.completed)));
  const completedTodayRaw = todaysTasksRaw.filter(t => t.status === 'completed' || t.completed).length;
  const totalTodayRaw = todaysTasksRaw.length;
  const progressPercentage = totalTodayRaw > 0 ? Math.round((completedTodayRaw / totalTodayRaw) * 100) : 100;
  const strokeDashoffset = 175.9 - (175.9 * progressPercentage) / 100;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = filteredTasks.findIndex((t) => t.id === active.id);
      const newIndex = filteredTasks.findIndex((t) => t.id === (over as any)?.id);
      
      const newOrderInfo = arrayMove(filteredTasks, oldIndex, newIndex) as Task[];
      
      const updatedTasks = [...tasks];
      newOrderInfo.forEach((t, idx) => {
         const tIndex = updatedTasks.findIndex(tx => tx.id === t.id);
         if(tIndex > -1) {
             updatedTasks[tIndex] = { ...updatedTasks[tIndex], order: idx };
         }
      });
      reorderTasks(updatedTasks);
    }
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      status: 'pending',
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      projectId: projectId || undefined
    });
    
    if (dueDate && dueTime) {
      sendNotification('Lembrete Agendado', { 
        body: `Tarefa: ${title}\nPara as ${dueTime}`,
      });
    }

    setTitle('');
    setDueTime('');
    setIsAdding(false);
  };

  // Group for display
  const groupTasks = () => {
      const groups: { [key: string]: Task[] } = {
          'HOJE': [],
          'AMANHÃ': [],
          'OUTROS': []
      };
      
      filteredTasks.forEach(t => {
          if (t.dueDate === todayStr || (!t.dueDate && !(t.status === 'completed' || t.completed))) {
              groups['HOJE'].push(t);
          } else if (t.dueDate === tomorrowStr) {
              groups['AMANHÃ'].push(t);
          } else {
              groups['OUTROS'].push(t);
          }
      });
      
      return groups;
  };

  const groupedTasks = groupTasks();

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-[#dde5da] pb-32">
      {/* Header Section */}
      <header className="px-6 pt-12 flex justify-between items-start">
        <div className="flex flex-col">
          <span className="font-sans text-[12px] uppercase tracking-[0.1em] text-[#bccabb] font-medium mb-2">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
          <h1 className="font-serif text-[32px] leading-tight text-white mb-0 pb-0">
            Minhas <br/>
            <span className="italic text-[#4ade80]">tarefas</span>
          </h1>
        </div>
        
        {/* Progress Ring */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <svg className="w-full h-full transform -rotate-90">
            <circle className="text-[#1a1a1a]" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="3"></circle>
            <circle 
                className="text-[#4ade80] transition-all duration-1000 ease-out" 
                cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" 
                strokeDasharray="175.9" 
                strokeDashoffset={strokeDashoffset} 
                strokeWidth="3">
            </circle>
          </svg>
          <span className="absolute font-sans text-[10px] uppercase font-bold tracking-widest text-white">{progressPercentage}%</span>
        </div>
      </header>
      
      {/* Filter Chips */}
      <div className="mt-8 px-6 flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {(['all', 'today', 'high', 'completed'] as const).map(filter => {
            const labels = {
                all: 'Todas',
                today: 'Hoje',
                high: 'Alta',
                completed: 'Concluídas'
            };
            const isActive = activeFilter === filter;
            return (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                        "flex-shrink-0 h-9 px-5 rounded-full font-sans text-[11px] font-bold uppercase tracking-widest flex items-center justify-center transition-colors border",
                        isActive 
                            ? "bg-[#4ade80] text-[#0a0a0a] border-[#4ade80]" 
                            : "bg-[#111111] text-white border-[#1a1a1a] hover:border-gray-700"
                    )}
                >
                    {labels[filter]}
                </button>
            );
        })}
      </div>

      {/* Task List Content */}
      <main className="mt-8 px-6 flex-grow">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {Object.entries(groupedTasks).map(([groupName, gTasks]) => {
                if (gTasks.length === 0) return null;
                
                return (
                    <div key={groupName} className="mb-8">
                        <h2 className="font-sans text-[10px] text-[#bccabb] uppercase font-bold tracking-[0.2em] mb-4">
                            {groupName}
                        </h2>
                        <SortableContext 
                          items={gTasks.map(t => t.id)}
                          strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                              {gTasks.map((task) => (
                                <TaskItem 
                                  key={task.id} 
                                  task={task} 
                                  onToggle={toggleTask}
                                  onDelete={deleteTask}
                                />
                              ))}
                            </div>
                        </SortableContext>
                    </div>
                );
            })}
          </DndContext>
          
          {filteredTasks.length === 0 && (
             <div className="text-center py-12 mt-4 bg-[#111111] rounded-3xl border border-[#1a1a1a] border-dashed">
                <p className="text-[#869486] font-medium text-sm">Nenhuma tarefa encontrada.</p>
             </div>
          )}
      </main>

      {/* Add Task Button */}
      <div className="px-6 py-4 fixed bottom-24 w-full max-w-[390px] mx-auto z-40 bg-gradient-to-t from-[#0a0a0a] to-transparent pt-12">
        <button 
           onClick={() => setIsAdding(true)}
           className="w-full bg-[#4ade80] text-black font-sans font-bold uppercase tracking-widest text-[12px] h-14 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
            <Plus className="w-5 h-5 font-bold text-black stroke-[3]" />
            NOVA TAREFA
        </button>
      </div>

      {/* Add Task Backdrop & Modal */}
      <div className={cn(
          "fixed inset-0 bg-black/60 z-50 backdrop-blur-[2px] transition-opacity flex flex-col justify-end",
          isAdding ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
         <div className={cn(
             "w-full max-w-[390px] mx-auto bg-[#111111] rounded-t-[24px] border-t border-[#1a1a1a] flex flex-col max-h-[85vh] overflow-hidden transition-transform duration-300",
             isAdding ? "translate-y-0" : "translate-y-full"
         )}>
             {/* Drag Handle */}
             <div className="w-full flex justify-center py-2" onClick={() => setIsAdding(false)}>
                <div className="w-10 h-1 cursor-pointer rounded-full bg-[#1a1a1a]"></div>
             </div>

             <div className="px-6 pb-20 overflow-y-auto no-scrollbar">
                {/* Header */}
                <div className="mt-4 mb-8">
                    <h2 className="font-serif text-[32px] text-white">Nova tarefa</h2>
                </div>
            
            <form onSubmit={handleSaveTask} className="pb-safe">
                <div className="mb-8">
                    <input 
                        type="text" 
                        placeholder="O que precisa ser feito?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-[#1a1a1a] py-4 px-0 text-white font-sans text-lg focus:ring-0 focus:border-[#4ade80] placeholder:text-[#869486] outline-none"
                        autoFocus={isAdding}
                    />
                </div>
                
                <div className="flex gap-3 mb-8">
                    <button type="button" className="flex-1 relative bg-[#1a1a1a] py-3 px-4 rounded-full border border-[#1a1a1a] flex items-center justify-between text-sm text-white overflow-hidden text-left focus-within:border-[#4ade80]">
                        <input 
                            type="date" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                        <span className="flex items-center gap-2 pointer-events-none">
                            <Bell className="w-4 h-4 text-[#869486]" />
                            {dueDate ? format(new Date(dueDate + 'T00:00:00'), "d 'de' MMM", { locale: ptBR }) : 'Hoje'}
                        </span>
                    </button>
                    <button type="button" className="flex-1 relative bg-[#1a1a1a] py-3 px-4 rounded-full border border-[#1a1a1a] flex items-center justify-between text-sm text-white overflow-hidden text-left focus-within:border-[#4ade80]">
                        <input 
                            type="time" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                        />
                        <span className="flex items-center gap-2 pointer-events-none">
                            <span className="material-symbols-outlined text-[18px] text-[#869486]">schedule</span>
                            {dueTime || 'Adicionar hora'}
                        </span>
                    </button>
                </div>

                <div className="mb-8">
                    <p className="font-sans text-[12px] uppercase text-[#869486] tracking-widest font-medium mb-3 block">Prioridade</p>
                    <div className="flex gap-2">
                        {(['high', 'medium', 'low'] as const).map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p)}
                                className={cn(
                                    "px-6 py-2 rounded-full font-sans text-[12px] uppercase font-bold tracking-widest flex items-center gap-2 transition-colors border",
                                    priority === p 
                                        ? "border-[#4ade80]/20 bg-[#4ade80]/5 text-[#4ade80]"
                                        : "border-[#1a1a1a] bg-[#1a1a1a] text-[#869486] hover:text-white"
                                )}
                            >
                                {priority === p && <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></span>}
                                {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                            </button>
                        ))}
                    </div>
                </div>

                {projects.length > 0 && (
                    <div className="mb-8">
                        <p className="font-sans text-[12px] uppercase text-[#869486] tracking-widest font-medium mb-3 block">Projeto</p>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            <button
                                type="button"
                                onClick={() => setProjectId('')}
                                className={cn(
                                    "flex-shrink-0 px-5 py-2 rounded-full font-sans text-sm transition-colors border",
                                    !projectId ? "border-[#4ade80] text-[#4ade80] bg-[#4ade80]/5" : "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                                )}
                            >
                                Nenhum
                            </button>
                            {projects.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setProjectId(p.id)}
                                    className={cn(
                                        "flex-shrink-0 px-5 py-2 rounded-full font-sans text-sm transition-colors border",
                                        projectId === p.id ? "border-[#4ade80] text-[#4ade80] bg-[#4ade80]/5" : "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                                    )}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center gap-4 mt-8">
                    <button 
                        type="submit" 
                        className="w-full bg-[#4ade80] text-[#00210c] font-sans font-bold uppercase tracking-[0.1em] rounded-full py-4 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#4ade80]/10"
                        disabled={!title.trim()}
                    >
                        Salvar Tarefa
                    </button>
                    <button 
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="font-sans font-bold text-[12px] uppercase text-[#869486] hover:text-white tracking-[0.1em] transition-colors p-2"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
         </div>
      </div>
      </div>
    </div>
  );
}
