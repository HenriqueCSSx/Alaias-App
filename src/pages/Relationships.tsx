import React, { useState } from 'react';
import { useAppStore, Person } from '../store/useAppStore';
import { format, differenceInDays } from 'date-fns';
import { HeartHandshake, Phone, Cake, Plus, X, PhoneCall } from 'lucide-react';
import { cn } from '../lib/utils';
import { differenceInYears } from 'date-fns';

export function Relationships() {
  const { persons, addPerson, updatePerson, deletePerson } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '', birthday: '', lastContact: '', reminderFrequencyDays: 7, notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addPerson(formData as any);
    setIsAdding(false);
    setFormData({ name: '', birthday: '', lastContact: '', reminderFrequencyDays: 7, notes: '' });
  };

  const handleContact = (id: string) => {
    updatePerson(id, { lastContact: new Date().toISOString().split('T')[0] });
  };

  const getUrgency = (p: Person) => {
    if (!p.lastContact || !p.reminderFrequencyDays) return 1;
    const daysSince = differenceInDays(new Date(), new Date(p.lastContact));
    if (daysSince >= p.reminderFrequencyDays) return 2; // Urgent
    if (daysSince >= p.reminderFrequencyDays - 2) return 1; // Soon
    return 0; // OK
  };

  const sortedPersons = [...persons].sort((a, b) => {
    return getUrgency(b) - getUrgency(a);
  });

  return (
    <div className="p-6 space-y-6 pb-24 bg-background min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light leading-none mb-2 text-rose-400">Relacionamentos</h1>
          <p className="text-foreground/60 text-sm">Cuide de quem importa para você</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500/20 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#1C1C24] p-5 rounded-3xl border border-rose-500/30 animate-in slide-in-from-top-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider text-rose-400">Nova Pessoa</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          
          <input 
            type="text" required placeholder="Nome (ex: Mãe)"
            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:border-rose-400 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Aniversário</label>
                <input 
                    type="date" 
                    value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:border-rose-400 text-sm"
                />
             </div>
             <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Ligar a cada (dias)</label>
                <input 
                    type="number" min="1"
                    value={formData.reminderFrequencyDays} onChange={e => setFormData({ ...formData, reminderFrequencyDays: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:border-rose-400 text-sm"
                />
             </div>
          </div>
          <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Notas / Assuntos</label>
              <textarea 
                 placeholder="Cachorro chama Rex, adora vinho..."
                 value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                 className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:border-rose-400 text-sm h-20 resize-none"
              />
          </div>
          <button type="submit" className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-600 transition-colors">
            Adicionar
          </button>
        </form>
      )}

      {persons.length === 0 && !isAdding && (
         <div className="text-center py-10 bg-[#1C1C24] border border-gray-800 border-dashed rounded-3xl">
             <HeartHandshake className="w-8 h-8 text-rose-500/50 mx-auto mb-3" />
             <p className="text-gray-500 text-sm font-medium">Você ainda não adicionou ninguém.<br/>Mantenha contato com as pessoas importantes!</p>
         </div>
      )}

      <div className="space-y-4">
        {sortedPersons.map(person => {
          const urgency = getUrgency(person);
          return (
            <div key={person.id} className={cn(
              "bg-[#1C1C24] p-5 rounded-3xl border transition-all flex flex-col gap-3 group relative overflow-hidden",
              urgency === 2 ? "border-rose-500/50" : "border-gray-800 hover:border-gray-700"
            )}>
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                          {person.name}
                          {urgency === 2 && <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Ligar</span>}
                      </h3>
                      {person.birthday && (
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Cake className="w-3 h-3 text-rose-400" />
                              Aniversário: {format(new Date(person.birthday), 'dd/MM')} (Faz {differenceInYears(new Date(), new Date(person.birthday))} anos)
                          </div>
                      )}
                  </div>
                  <button onClick={() => deletePerson(person.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4" />
                  </button>
              </div>

              {person.notes && (
                  <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 italic font-serif">"{person.notes}"</p>
                  </div>
              )}

              <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-800/50">
                  <div className="text-xs text-gray-500 font-medium">
                      {person.lastContact ? (
                          <>Último contato: <strong className="text-gray-300">{differenceInDays(new Date(), new Date(person.lastContact))} dias atrás</strong></>
                      ) : (
                          "Nunca contatou pelo app"
                      )}
                  </div>
                  <button 
                      onClick={() => handleContact(person.id)}
                      className="flex items-center gap-1.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-rose-500/20 transition-colors"
                  >
                      <PhoneCall className="w-3 h-3" /> Falei Hoje
                  </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
