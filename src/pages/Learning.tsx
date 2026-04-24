import React, { useState } from 'react';
import { useAppStore, LearningItem } from '../store/useAppStore';
import { GraduationCap, BookOpen, MonitorPlay, Plus, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Learning() {
  const { learningItems, addLearningItem, updateLearningItem, deleteLearningItem } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<LearningItem>>({
    title: '', author: '', type: 'book', status: 'to-read', progress: 0, notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    addLearningItem(formData as any);
    setIsAdding(false);
    setFormData({ title: '', author: '', type: 'book', status: 'to-read', progress: 0, notes: '' });
  };

  const statusMap = {
      'to-read': { label: 'Quero Aprender', color: 'bg-gray-800 text-gray-300' },
      'in-progress': { label: 'Em Andamento', color: 'bg-amber-500/20 text-amber-400' },
      'completed': { label: 'Concluído', color: 'bg-emerald-500/20 text-emerald-400' }
  };

  // Keep compatibility with old states if any
  const normalizedStatus = (s: string) => {
      if (s === 'reading' || s === 'todo') return 'in-progress';
      if (s === 'read') return 'completed';
      return s as keyof typeof statusMap;
  };

  return (
    <div className="p-6 space-y-6 pb-24 bg-background min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light leading-none mb-2 text-amber-400">Aprendizado</h1>
          <p className="text-foreground/60 text-sm">Biblioteca e Cursos</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center hover:bg-amber-500/20 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#1C1C24] p-5 rounded-3xl border border-amber-500/30 animate-in slide-in-from-top-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider text-amber-400">Novo Aprendizado</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex bg-gray-900 rounded-xl p-1 mb-4">
              <button type="button" onClick={() => setFormData({...formData, type: 'book'})} className={cn("flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors", formData.type === 'book' ? "bg-amber-500 text-white" : "text-gray-500")}>Livro</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'course'})} className={cn("flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors", formData.type === 'course' ? "bg-amber-500 text-white" : "text-gray-500")}>Curso</button>
          </div>

          <input 
            type="text" required placeholder={formData.type === 'book' ? "Título do Livro" : "Nome do Curso"}
            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-400 text-sm"
          />
          <input 
            type="text" placeholder={formData.type === 'book' ? "Autor" : "Plataforma / Professor"}
            value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-400 text-sm"
          />
          <button type="submit" className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-amber-600 transition-colors">
            Adicionar
          </button>
        </form>
      )}

      {learningItems.length === 0 && !isAdding && (
         <div className="text-center py-10 bg-[#1C1C24] border border-gray-800 border-dashed rounded-3xl">
             <GraduationCap className="w-8 h-8 text-amber-500/50 mx-auto mb-3" />
             <p className="text-gray-500 text-sm font-medium">Sua biblioteca está vazia.<br/>O que você quer aprender hoje?</p>
         </div>
      )}

      <div className="space-y-4">
        {['in-progress', 'to-read', 'completed'].map(statusGroup => {
            const items = learningItems.filter(l => normalizedStatus(l.status) === statusGroup);
            if (items.length === 0) return null;
            
            return (
                <div key={statusGroup} className="space-y-3">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-800 pb-2 mt-6">
                        {statusMap[statusGroup as keyof typeof statusMap].label}
                    </h2>
                    {items.map(item => (
                        <div key={item.id} className="bg-[#1C1C24] p-5 rounded-3xl border border-gray-800 group relative">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-16 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center text-gray-600">
                                        {item.type === 'book' ? <BookOpen className="w-5 h-5" /> : <MonitorPlay className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-1 max-w-[200px] leading-tight">{item.title}</h3>
                                        <p className="text-xs text-amber-500/70">{item.author}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {statusGroup !== 'completed' && (
                                        <button 
                                            onClick={() => updateLearningItem(item.id, { status: statusGroup === 'to-read' ? 'in-progress' : 'completed' })}
                                            className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => deleteLearningItem(item.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 -mr-2">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            {statusGroup === 'in-progress' && (
                                <div className="mt-4 pt-4 border-t border-gray-800">
                                    <div className="flex justify-between text-[9px] uppercase font-bold text-gray-500 mb-2">
                                        <span>Progresso</span>
                                        <span>{item.progress || 0}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="100" 
                                        value={item.progress || 0} 
                                        onChange={e => updateLearningItem(item.id, { progress: Number(e.target.value) })}
                                        className="w-full accent-amber-500 h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            )}

                            <textarea 
                                placeholder="Anotações, insights e resumos..."
                                value={item.notes || ''}
                                onChange={e => updateLearningItem(item.id, { notes: e.target.value })}
                                className="w-full bg-transparent border border-gray-800/50 hover:border-gray-700 text-gray-300 rounded-xl px-3 py-2 mt-4 text-xs h-16 resize-none outline-none focus:border-amber-500/50 transition-colors"
                            />
                        </div>
                    ))}
                </div>
            )
        })}
      </div>
    </div>
  );
}
