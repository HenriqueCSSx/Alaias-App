import React, { useState } from 'react';
import { useAppStore, Project } from '../store/useAppStore';
import { FolderKanban, Plus, X, ChevronRight, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export function Projects() {
  const { projects, addProject, updateProject, deleteProject, tasks } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '', type: 'personal', status: 'backlog', description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addProject(formData as any);
    setIsAdding(false);
    setFormData({ name: '', type: 'personal', status: 'backlog', description: '' });
  };

  const getProjectTasks = (projectId: string) => {
      const all = tasks.filter(t => t.projectId === projectId);
      const done = all.filter(t => t.status === 'completed' || t.completed).length;
      return { total: all.length, done };
  };

  const handleMove = (project: Project) => {
      if (project.status === 'backlog') updateProject(project.id, { status: 'in-progress' });
      else if (project.status === 'in-progress') updateProject(project.id, { status: 'completed' });
  };

  return (
    <div className="p-6 space-y-6 pb-24 bg-background min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light leading-none mb-2 text-indigo-400">Projetos</h1>
          <p className="text-foreground/60 text-sm">Organize suas grandes ideias</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/20 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#1C1C24] p-5 rounded-3xl border border-indigo-500/30 animate-in slide-in-from-top-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider text-indigo-400">Novo Projeto</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex bg-gray-900 rounded-xl p-1">
              <button type="button" onClick={() => setFormData({...formData, type: 'personal'})} className={cn("flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors", formData.type === 'personal' ? "bg-indigo-500 text-white" : "text-gray-500")}>Pessoal</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'professional'})} className={cn("flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors", formData.type === 'professional' ? "bg-indigo-500 text-white" : "text-gray-500")}>Trabalho</button>
          </div>

          <input 
            type="text" required placeholder="Nome do Projeto"
            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-400 text-sm"
          />
          <textarea 
            placeholder="Qual o objetivo e resultado esperado?"
            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-400 text-sm h-20 resize-none"
          />
          <button type="submit" className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-600 transition-colors">
            Adicionar
          </button>
        </form>
      )}

      {projects.length === 0 && !isAdding && (
         <div className="text-center py-10 bg-[#1C1C24] border border-gray-800 border-dashed rounded-3xl">
             <FolderKanban className="w-8 h-8 text-indigo-500/50 mx-auto mb-3" />
             <p className="text-gray-500 text-sm font-medium">Nenhum projeto ativo.<br/>Em que você está trabalhando?</p>
         </div>
      )}

      {/* Kanban View */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 hide-scrollbar relative">
         {['backlog', 'in-progress', 'completed'].map(status => {
             const items = projects.filter(p => p.status === status);
             const labels = { 'backlog': 'A Fazer', 'in-progress': 'Fazendo', 'completed': 'Feito' };
             const colors = { 'backlog': 'text-gray-400', 'in-progress': 'text-amber-400', 'completed': 'text-emerald-400' };
             
             return (
                 <div key={status} className="snap-center shrink-0 w-[85vw] max-w-xs flex flex-col gap-3">
                     <div className="flex items-center justify-between px-1">
                         <h2 className={`text-[11px] font-bold uppercase tracking-widest ${colors[status as keyof typeof colors]}`}>
                             {labels[status as keyof typeof labels]} ({items.length})
                         </h2>
                     </div>
                     
                     <div className="space-y-3 min-h-[200px] bg-gray-900/30 rounded-3xl p-2 border border-gray-900">
                         {items.length === 0 && (
                             <div className="h-24 border border-dashed border-gray-800 rounded-2xl flex items-center justify-center text-gray-600 text-xs font-bold uppercase tracking-widest">
                                 Vazio
                             </div>
                         )}
                         {items.map(project => {
                             const stats = getProjectTasks(project.id);
                             return (
                                 <div key={project.id} className="bg-[#1C1C24] p-4 rounded-2xl border border-gray-800 group relative">
                                     <div className="flex justify-between items-start mb-2">
                                         <div>
                                            <span className={cn(
                                                "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                project.type === 'personal' ? "bg-indigo-500/20 text-indigo-400" : "bg-blue-500/20 text-blue-400"
                                            )}>{project.type === 'personal' ? 'Pessoal' : 'Trabalho'}</span>
                                            <h3 className="text-white font-bold mt-2 leading-tight">{project.name}</h3>
                                         </div>
                                         <button onClick={() => deleteProject(project.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 -mr-2">
                                              <X className="w-4 h-4" />
                                         </button>
                                     </div>
                                     {project.description && <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3">{project.description}</p>}
                                     
                                     <div className="flex items-center justify-between border-t border-gray-800 pt-3 mt-3">
                                         <Link to="/tarefas" className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-400 transition-colors text-xs font-medium bg-gray-900 px-2 py-1 rounded-lg">
                                             <CheckSquare className="w-3 h-3" /> {stats.done}/{stats.total}
                                         </Link>

                                         {status !== 'completed' && (
                                            <button onClick={() => handleMove(project)} className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1 hover:text-indigo-300">
                                                Avançar <ChevronRight className="w-3 h-3" />
                                            </button>
                                         )}
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                 </div>
             )
         })}
      </div>
    </div>
  );
}
