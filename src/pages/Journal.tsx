import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { format, isSameMonth, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lock, Search, Download, Plus, Save, Calendar as CalendarIcon, CheckCircle2, ShieldAlert, FileText, Heart, ShieldCheck, PenLine, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { encryptData, decryptData, hashPin } from '../lib/crypto';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const MOODS = [
    { value: 1, emoji: '😔', color: 'text-red-500', hex: '#ef4444' },
    { value: 2, emoji: '😐', color: 'text-orange-500', hex: '#f97316' },
    { value: 3, emoji: '😊', color: 'text-primary-400', hex: '#4ade80' },
    { value: 4, emoji: '😌', color: 'text-emerald-500', hex: '#10b981' },
    { value: 5, emoji: '✨', color: 'text-yellow-500', hex: '#eab308' },
];

export function Journal() {
  const { getLog, updateLog, logs, journalPinHash, setJournalPinHash } = useAppStore();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Security/Session
  const [sessionPin, setSessionPin] = useState<string>('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  const isLocked = Boolean(journalPinHash && sessionPin === '');

  // Setup PIN state
  const [setupPin1, setSetupPin1] = useState('');
  const [setupPin2, setSetupPin2] = useState('');
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const [search, setSearch] = useState('');

  // Form State for Today
  const rawTodayLog = getLog(todayStr);
  const [intention, setIntention] = useState('');
  const [gratitudes, setGratitudes] = useState<string[]>(['', '', '']);
  const [journalEntry, setJournalEntry] = useState('');
  const [hasLoadedToday, setHasLoadedToday] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load today's data when unlocked
  useEffect(() => {
     if (!isLocked && !hasLoadedToday) {
         let loadedIntention = rawTodayLog.intention || '';
         let loadedGratitudes = rawTodayLog.gratitudes || ['', '', ''];
         let loadedJournal = rawTodayLog.journalEntry || '';

         if (rawTodayLog.isEncrypted && sessionPin) {
             loadedIntention = decryptData(loadedIntention, sessionPin);
             loadedJournal = decryptData(loadedJournal, sessionPin);
             loadedGratitudes = loadedGratitudes.map(g => decryptData(g, sessionPin));
         }

         setIntention(loadedIntention);
         setGratitudes(loadedGratitudes);
         setJournalEntry(loadedJournal);
         setHasLoadedToday(true);
     }
  }, [isLocked, hasLoadedToday, rawTodayLog, sessionPin]);

  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (hashPin(pinInput) === journalPinHash) {
          setSessionPin(pinInput);
          setPinError('');
      } else {
          setPinError('PIN Incorreto');
      }
      setPinInput('');
  };

  const handleSetupPin = (e: React.FormEvent) => {
      e.preventDefault();
      if (setupPin1 !== setupPin2) {
          setPinError('Os PINs não conferem');
          return;
      }
      if (setupPin1.length < 4) {
          setPinError('PIN deve ter pelo menos 4 dígitos');
          return;
      }
      
      const pin = setupPin1;
      setJournalPinHash(hashPin(pin));
      setSessionPin(pin);
      setIsSetupOpen(false);
      setPinError('');
      
      handleSave(pin);
  };

  const handleRemovePin = () => {
     if (window.confirm("Deseja remover a proteção por PIN? Seus próximos dados serão salvos sem criptografia.")) {
         setJournalPinHash(undefined);
         handleSave('');
     }
  };

  const handleSave = (pinToUse = sessionPin) => {
      setSaveStatus('Salvando...');
      
      const doEncrypt = Boolean(journalPinHash || pinToUse);

      updateLog(todayStr, {
          isEncrypted: doEncrypt,
          intention: doEncrypt ? encryptData(intention, pinToUse) : intention,
          journalEntry: doEncrypt ? encryptData(journalEntry, pinToUse) : journalEntry,
          gratitudes: doEncrypt ? gratitudes.map(g => encryptData(g, pinToUse)) : gratitudes,
      });

      setTimeout(() => setSaveStatus('Salvo!'), 500);
      setTimeout(() => setSaveStatus(''), 2000);
  };

  const historyLogs = useMemo(() => {
      if (isLocked) return [];
      
      return Object.values(logs)
        .filter(log => log.date !== todayStr && (log.journalEntry || log.intention || log.gratitudes?.some(g => g) || log.mood))
        .map(log => {
            let logJournalEntry = log.journalEntry || '';
            let logIntention = log.intention || '';
            let logGratitudes = log.gratitudes || [];
            
            if (log.isEncrypted && sessionPin) {
                logJournalEntry = decryptData(logJournalEntry, sessionPin);
                logIntention = decryptData(logIntention, sessionPin);
                logGratitudes = logGratitudes.map(g => decryptData(g, sessionPin));
            }
            
            return {
                ...log,
                journalEntry: logJournalEntry,
                intention: logIntention,
                gratitudes: logGratitudes
            };
        })
        .filter(log => {
            if (!search) return true;
            const s = search.toLowerCase();
            return (
                log.journalEntry.toLowerCase().includes(s) || 
                log.intention.toLowerCase().includes(s) || 
                log.gratitudes.some(g => g.toLowerCase().includes(s))
            );
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, search, isLocked, sessionPin, todayStr]);

  const weeklyMoods = useMemo(() => {
      const data = [];
      for (let i = 6; i >= 0; i--) {
          const dStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
          const entry = getLog(dStr);
          data.push({
              date: dStr,
              name: format(new Date(dStr), 'ee', { locale: ptBR }),
              mood: entry.mood || 0,
          });
      }
      return data;
  }, [getLog]);

  if (isLocked) {
      return (
          <div className="flex flex-col min-h-screen bg-[#0a0a0a] items-center justify-center p-6 relative overflow-hidden">
             
             <div className="bg-[#111111] p-8 rounded-[18px] border border-[#1a1a1a] text-center shadow-2xl max-w-sm w-full mx-auto relative z-10">
                 <div className="w-16 h-16 rounded-full bg-[#4ade80]/10 flex items-center justify-center text-[#4ade80] mx-auto mb-6">
                     <Lock className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-serif italic text-white mb-2">Diário Protegido</h2>
                 <p className="text-sm text-[#869486] mb-8 px-4">Digite seu PIN para acessar suas memórias e reflexões.</p>
                 
                 <form onSubmit={handleUnlock} className="space-y-4">
                     <input 
                        type="password" 
                        maxLength={4}
                        pattern="\d*"
                        inputMode="numeric"
                        placeholder="••••"
                        value={pinInput}
                        onChange={e => setPinInput(e.target.value)}
                        className="w-full text-center text-3xl tracking-[1em] bg-transparent border-b border-[#1a1a1a] text-white py-4 outline-none focus:border-[#4ade80] font-mono transition-colors placeholder:text-[#1a1a1a]"
                        required
                        autoFocus
                     />
                     {pinError && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{pinError}</p>}
                     <button type="submit" className="w-full py-4 bg-[#4ade80] text-[#003919] rounded-full font-bold uppercase tracking-widest text-sm hover:bg-[#4ade80]/90 transition-colors active:scale-95">
                         Desbloquear
                     </button>
                 </form>
             </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] relative flex-1 text-[#dde5da]">
      
      <main className="px-6 pt-5 pb-32 space-y-8 flex-1">
        {/* Header Section */}
        <section className="flex flex-col gap-1 items-start">
            <div className="flex w-full justify-between items-start mb-2">
                <div className="flex flex-col">
                    <h2 className="font-serif text-[32px] text-white leading-tight">
                        Meu <span className="italic text-[#4ade80]">diário</span>
                    </h2>
                    <p className="font-sans text-[14px] text-[#bccabb] font-bold uppercase tracking-widest mt-1">
                        {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </p>
                </div>
                <button 
                    onClick={() => isSetupOpen ? setIsSetupOpen(false) : setIsSetupOpen(true)}
                    className="w-10 h-10 rounded-full bg-[#111111] border border-[#1a1a1a] flex items-center justify-center text-[#869486] hover:text-[#4ade80] transition-colors"
                >
                    {journalPinHash ? <ShieldCheck className="w-5 h-5 text-[#4ade80]" /> : <ShieldAlert className="w-5 h-5" />}
                </button>
            </div>
            {isSetupOpen && !journalPinHash && (
                <form onSubmit={handleSetupPin} className="bg-[#111111] p-5 rounded-[18px] border border-[#1a1a1a] w-full mt-4">
                    <h3 className="font-sans font-bold text-white text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#4ade80]"/> Configurar PIN (Opcional)
                    </h3>
                    <p className="text-xs text-[#869486] mb-4">Adicione uma senha para criptografar o diário.</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <input 
                            type="password" 
                            maxLength={4}
                            placeholder="PIN"
                            value={setupPin1}
                            onChange={e => setSetupPin1(e.target.value)}
                            className="bg-transparent border-b border-[#1a1a1a] text-white px-2 py-3 outline-none focus:border-[#4ade80] text-center font-mono placeholder:text-[#1a1a1a]"
                            required
                        />
                        <input 
                            type="password" 
                            maxLength={4}
                            placeholder="Confirme"
                            value={setupPin2}
                            onChange={e => setSetupPin2(e.target.value)}
                            className="bg-transparent border-b border-[#1a1a1a] text-white px-2 py-3 outline-none focus:border-[#4ade80] text-center font-mono placeholder:text-[#1a1a1a]"
                            required
                        />
                    </div>
                    {pinError && <p className="text-red-400 text-[10px] font-bold uppercase mb-3">{pinError}</p>}
                    
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setIsSetupOpen(false)} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-[#869486] rounded-full border border-[#1a1a1a] hover:bg-[#1a1a1a]">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-[#4ade80] text-[#003919] rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#4ade80]/90 transition-colors">Configurar</button>
                    </div>
                </form>
            )}

            {isSetupOpen && journalPinHash && (
                <div className="bg-[#111111] p-5 rounded-[18px] border border-[#1a1a1a] w-full mt-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-sans font-bold text-white text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#4ade80]"/> Protegido
                        </h3>
                    </div>
                    <button onClick={handleRemovePin} className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors">
                        Remover PIN
                    </button>
                </div>
            )}
        </section>

        {/* Today's Entry Card */}
        <article className="bg-[#111111] border border-[#1a1a1a] rounded-[24px] p-6 flex flex-col gap-8 shadow-xl">
            {/* Mood Selector */}
            <div className="flex flex-col gap-2">
                <span className="font-sans text-[12px] font-bold text-[#bccabb] uppercase tracking-wider">COMO VOCÊ SE SENTE HOJE?</span>
                <div className="flex justify-between items-center py-2">
                    {MOODS.map(m => {
                        const isSelected = rawTodayLog.mood === m.value;
                        return (
                            <button
                                key={m.value}
                                onClick={() => updateLog(todayStr, { mood: m.value })}
                                className={cn(
                                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all text-xl sm:text-2xl shadow-lg border",
                                    isSelected 
                                      ? "border-[#4ade80] grayscale-0 scale-110" 
                                      : "border-[#1a1a1a] bg-transparent grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                                )}
                            >
                                {m.emoji}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Intention */}
            <div className="flex flex-col gap-2">
                <span className="font-sans text-[12px] font-bold text-[#bccabb] uppercase tracking-wider">INTENÇÃO DO DIA</span>
                <input 
                    type="text" 
                    value={intention}
                    onChange={e => setIntention(e.target.value)}
                    onBlur={() => handleSave()}
                    className="bg-transparent border-b border-[#1a1a1a] focus:border-[#4ade80] py-3 font-serif italic text-white placeholder:text-[#869486] focus:ring-0 transition-colors outline-none text-lg" 
                    placeholder="o que você quer criar hoje?" 
                />
            </div>

            {/* 3 Gratitudes */}
            <div className="flex flex-col gap-3">
                <span className="font-sans text-[12px] font-bold text-[#bccabb] uppercase tracking-wider">3 GRATIDÕES</span>
                <div className="flex flex-col">
                    {[0, 1, 2].map(idx => (
                        <div key={`gratitude-${idx}`} className="flex items-center gap-3 border-b border-[#1a1a1a] py-3 focus-within:border-[#4ade80] transition-colors">
                            <span className="font-serif text-[#4ade80] opacity-50 text-xl">{idx + 1}.</span>
                            <input 
                                type="text"
                                value={gratitudes[idx] || ''}
                                onChange={e => {
                                    const newG = [...gratitudes];
                                    newG[idx] = e.target.value;
                                    setGratitudes(newG);
                                }}
                                onBlur={() => handleSave()}
                                className="bg-transparent border-none p-0 flex-1 font-sans text-white focus:ring-0 outline-none" 
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Free Reflection */}
            <div className="flex flex-col gap-2">
                <span className="font-sans text-[12px] font-bold text-[#bccabb] uppercase tracking-wider">REFLEXÃO LIVRE</span>
                <textarea 
                    value={journalEntry}
                    onChange={e => setJournalEntry(e.target.value)}
                    onBlur={() => handleSave()}
                    className="bg-transparent border-b border-[#1a1a1a] focus:border-[#4ade80] py-3 font-serif italic text-white placeholder:text-[#869486] focus:ring-0 outline-none resize-none leading-relaxed transition-colors mt-2" 
                    placeholder="deixe seus pensamentos fluírem..." 
                    rows={4}
                />
            </div>

            <div className="flex justify-between items-center pt-2">
                <span className="text-[12px] text-[#4ade80] font-sans font-bold">{saveStatus}</span>
                <button 
                    onClick={() => handleSave()}
                    className="bg-[#4ade80] text-[#003919] px-6 py-3 rounded-full font-sans text-[12px] font-bold tracking-widest uppercase hover:bg-[#6bfb9a] transition-colors active:scale-95 shadow-lg flex items-center gap-2"
                >
                    {saveStatus ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    SALVAR ENTRADA
                </button>
            </div>
        </article>

        {/* Mood Calendar Strip */}
        <section className="flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-center px-1">
                <span className="font-sans text-[12px] font-bold text-[#bccabb] uppercase tracking-wider">SEMANA</span>
                <span className="font-sans text-sm text-[#4ade80] font-medium">{format(new Date(), "MMMM", { locale: ptBR })}</span>
            </div>
            <div className="flex justify-between items-end py-2 px-1">
                {weeklyMoods.map((day, idx) => {
                    const isToday = day.date === todayStr;
                    const moodObj = MOODS.find(m => m.value === day.mood);
                    return (
                        <div key={day.date} className="flex flex-col items-center gap-3">
                            <span className={cn("font-sans text-[10px] font-bold uppercase", isToday ? "text-[#4ade80]" : "text-[#869486]")}>
                                {day.name}
                            </span>
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border",
                                moodObj ? "bg-transparent" : "bg-[#111111] border-[#1a1a1a]",
                                isToday && !moodObj ? "border-[#4ade80]/50" : ""
                            )}>
                                {moodObj ? (
                                    <span className="text-[20px]">{moodObj.emoji}</span>
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-[#1a1a1a]"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>

        {/* Past Entries */}
        {historyLogs.length > 0 && (
            <section className="flex flex-col gap-6 pt-4">
                <div className="flex justify-between items-center">
                    <span className="font-sans text-[12px] font-bold text-[#bccabb] uppercase tracking-wider">ENTRADAS ANTERIORES</span>
                </div>
                
                <div className="flex flex-col gap-2">
                    {historyLogs.slice(0, 7).map(log => {
                        const moodObj = MOODS.find(m => m.value === log.mood);
                        let firstGratitude = log.gratitudes?.find(g => g?.trim().length > 0);
                        let snippet = log.journalEntry || log.intention || firstGratitude || "Sem notas.";
                        
                        return (
                            <div key={log.date} className="flex items-center gap-4 border border-[#1a1a1a] bg-[#111111]/50 p-4 rounded-[18px] hover:bg-[#151515] transition-colors cursor-pointer group">
                                <div className="flex flex-col items-center justify-center min-w-[48px] h-[48px] rounded-full border border-[#1a1a1a] bg-[#0a0a0a]">
                                    <span className="text-xl">{moodObj?.emoji || '📝'}</span>
                                </div>
                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-serif text-[18px] text-white truncate break-words">
                                            {format(new Date(log.date), "d 'de' MMMM", { locale: ptBR })}
                                        </h4>
                                        <div className="flex gap-1.5 items-center">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", log.isEncrypted ? "bg-[#4ade80]" : "bg-neutral-600")}></div>
                                            <span className="font-sans text-[10px] uppercase font-bold text-[#869486] tracking-wider">
                                                {log.isEncrypted ? 'SEGURO' : 'ABERTO'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="font-sans text-[14px] text-[#869486] truncate">
                                        {snippet}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>
        )}
      </main>
    </div>
  );
}

