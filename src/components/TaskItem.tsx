import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, useAppStore } from '../store/useAppStore';
import { Trash2, GripVertical, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  key?: React.Key;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const { projects } = useAppStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCompleted = task.status === 'completed' || task.completed;
  
  const hasDate = !!task.dueDate;
  
  // Theme rules
  let borderLeftColor = 'border-l-[#333]';
  let dotColor = 'bg-[#333]';
  let priorityLabel = '';
  let priorityColor = '';
  let priorityBg = 'bg-[#1a1a1a]';

  if (!isCompleted) {
      if (task.priority === 'high') {
          borderLeftColor = 'border-l-[#4ade80]';
          dotColor = 'bg-[#4ade80]';
          priorityLabel = 'ALTA';
          priorityColor = 'text-[#4ade80]';
          priorityBg = 'bg-[#4ade80]/10';
      } else if (task.priority === 'medium') {
          borderLeftColor = 'border-l-[#f59e0b]';
          dotColor = 'bg-[#f59e0b]';
          priorityLabel = 'MÉDIA';
          priorityColor = 'text-[#f59e0b]';
          priorityBg = 'bg-[#f59e0b]/10';
      } else {
          borderLeftColor = 'border-l-[#3b82f6]';
          dotColor = 'bg-[#3b82f6]';
          priorityLabel = 'BAIXA';
          priorityColor = 'text-[#3b82f6]';
          priorityBg = 'bg-[#3b82f6]/10';
      }
  }

  const project = projects.find(p => p.id === task.projectId);
  const sideTag = project ? project.name : priorityLabel;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "group bg-[#111111] border rounded-[12px] p-4 border-l-4 flex items-center gap-3 transition-all",
        isDragging ? "opacity-50 scale-[1.02] shadow-xl border-[#4ade80]/30 z-50" : "border-[#1a1a1a] hover:border-gray-800",
        isCompleted ? "border-l-[#333] opacity-60" : borderLeftColor
      )}
    >
      {/* Drag Handle */}
      <button 
        className="text-gray-600 hover:text-white cursor-grab active:cursor-grabbing touch-none -ml-2 p-1"
        {...attributes} 
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Checkbox */}
      <div 
         onClick={() => onToggle(task.id)}
         className="cursor-pointer flex-shrink-0"
      >
          <div className={cn(
              "w-5 h-5 rounded flex items-center justify-center transition-colors border",
              isCompleted 
                  ? "bg-[#4ade80] border-[#4ade80]" 
                  : "bg-transparent border-[#869486] hover:border-[#4ade80]"
          )}>
              {isCompleted && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
          </div>
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0 flex flex-col">
          <h3 className={cn(
              "font-sans text-[14px] font-medium truncate",
              isCompleted ? "line-through text-[#869486]" : "text-white"
          )}>
              {task.title}
          </h3>
          
          {(hasDate || task.dueTime) && (
              <div className="flex items-center gap-2 mt-1">
                  <span className="font-sans text-[11px] text-[#bccabb]">
                      {task.dueTime 
                          ? task.dueTime 
                          : (hasDate ? format(new Date(task.dueDate! + 'T00:00:00'), "d 'de' MMM", { locale: ptBR }) : '')}
                  </span>
                  {!isCompleted && <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)}></div>}
              </div>
          )}
      </div>

       {/* Delete / Tag */}
       <div className="flex items-center gap-2">
           <div className={cn("px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-widest", priorityBg, priorityColor)}>
               {sideTag}
           </div>
           
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity p-1 -mr-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
       </div>

    </div>
  );
}
