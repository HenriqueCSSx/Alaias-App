import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Target } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export function Focus() {
  const { addXp } = useAppStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      // Play sound? (can be simulated or true if we had an asset)
      if (sessionType === 'focus') {
          addXp(30); // Rewarding for focus session
          setSessionType('break');
          setTimeLeft(5 * 60);
      } else {
          setSessionType('focus');
          setTimeLeft(25 * 60);
      }
    }
    
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, sessionType, addXp]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const totalSeconds = sessionType === 'focus' ? 25 * 60 : 5 * 60;
  const percentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="p-6 space-y-6 pb-24 bg-background min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto space-y-12 flex flex-col items-center">
          
          <div className="text-center space-y-2">
              <h1 className="text-4xl font-light text-primary-400">Modo Foco</h1>
              <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">
                  {sessionType === 'focus' ? 'Sessão de Concentração' : 'Tempo de Descanso'}
              </p>
          </div>

          {/* Timer Display */}
          <div className="w-64 h-64 relative">
             <CircularProgressbar 
                 value={percentage} 
                 text={`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                 styles={buildStyles({
                     textColor: '#fff',
                     pathColor: sessionType === 'focus' ? '#8b5cf6' : '#10b981', // primary-500 : emerald-500
                     trailColor: '#1C1C24',
                     pathTransitionDuration: 0.5,
                     textSize: '24px'
                 })}
             />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
              <button 
                onClick={resetTimer}
                className="w-14 h-14 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                disabled={timeLeft === totalSeconds && !isActive}
              >
                  <RotateCcw className="w-6 h-6" />
              </button>
              
              <button 
                onClick={toggleTimer}
                className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-105",
                    sessionType === 'focus' ? "bg-primary-500 shadow-primary-500/20" : "bg-emerald-500 shadow-emerald-500/20"
                )}
              >
                  {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-2" />}
              </button>
          </div>
          
          {/* Mode Switch manually */}
          <div className="flex bg-gray-900 rounded-2xl p-1 gap-1">
             <button 
                 onClick={() => { setSessionType('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
                 className={cn("px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors", sessionType === 'focus' ? "bg-primary-500 text-white" : "text-gray-500 hover:text-white")}
             >
                 Focar (25m)
             </button>
             <button 
                 onClick={() => { setSessionType('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                 className={cn("px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors", sessionType === 'break' ? "bg-emerald-500 text-white" : "text-gray-500 hover:text-white")}
             >
                 Pausa (5m)
             </button>
          </div>
          
          {sessionType === 'focus' && (
             <p className="text-xs text-gray-500 text-center flex items-center gap-2">
                <Target className="w-4 h-4 text-primary-400" />
                Complete a sessão e ganhe 30 XP
             </p>
          )}

      </div>
    </div>
  );
}
