import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { ChevronDown } from 'lucide-react';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  // Optional task markers
  tasksByDate?: Record<string, number>; 
}

export function WeeklyCalendar({ selectedDate, onSelectDate, tasksByDate = {} }: WeeklyCalendarProps) {
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Domingo
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  return (
    <div className="bg-[#1C1C24] border-b border-gray-800 pb-4 pt-2">
      <div className="px-6 flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          {format(selectedDate, "MMM yyyy", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </h2>
        <button 
          onClick={() => onSelectDate(new Date())}
          className="text-[10px] uppercase tracking-widest font-bold text-primary-400 bg-primary-400/10 px-2 py-1 rounded"
        >
          Hoje
        </button>
      </div>
      
      <div className="flex justify-between px-4">
        {weekDays.map(date => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const dateStr = format(date, 'yyyy-MM-dd');
          const taskCount = tasksByDate[dateStr] || 0;

          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex flex-col items-center p-2 rounded-xl min-w-[3rem] transition-all relative",
                isSelected ? "bg-primary-400 text-white shadow-lg shadow-primary-500/25" : "hover:bg-gray-800 text-gray-400"
              )}
            >
              <span className="text-[10px] font-bold uppercase mb-1">
                {format(date, 'eee', { locale: ptBR }).slice(0, 3)}
              </span>
              <span className={cn(
                "text-lg font-light leading-none",
                isToday && !isSelected && "text-white font-bold"
              )}>
                {format(date, 'd')}
              </span>
              
              {/* Dot indicator for tasks */}
              {taskCount > 0 && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white/60"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
