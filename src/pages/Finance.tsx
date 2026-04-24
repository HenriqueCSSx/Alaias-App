import React, { useState, useMemo } from 'react';
import { useAppStore, TransactionCategory } from '../store/useAppStore';
import { Plus, ArrowDownCircle, ArrowUpCircle, Trash2, ShoppingCart, Target, Wallet, AlertCircle, X, ShoppingBag, CheckCircle2, Circle, Menu, Check } from 'lucide-react';
import { format, isSameMonth, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart } from 'lucide-react';

export function Finance() {
  const { 
    transactions, addTransaction, deleteTransaction, 
    budgets, setBudget,
    shoppingList, addShoppingItem, toggleShoppingItem, deleteShoppingItem 
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'transactions' | 'budget' | 'shopping'>('transactions');

  // Transactions form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<TransactionCategory>('outros');
  const [isAdding, setIsAdding] = useState(false);

  // Shopping list form
  const [shoppingTitle, setShoppingTitle] = useState('');
  const [shoppingPrice, setShoppingPrice] = useState('');
  const [shoppingFilter, setShoppingFilter] = useState<'all' | 'pending' | 'purchased'>('all');

  const today = new Date();

  // Balance calculations
  const balance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);
  
  const currentMonthTransactions = transactions.filter(t => isSameMonth(new Date(t.date), today));
  
  const incomeThisMonth = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenseThisMonth = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const prevMonth = subMonths(today, 1);
  const prevMonthTransactions = transactions.filter(t => isWithinInterval(new Date(t.date), {
    start: startOfMonth(prevMonth),
    end: endOfMonth(prevMonth)
  }));
  const expensePrevMonth = prevMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const expenseChange = expensePrevMonth === 0 ? 0 : ((expenseThisMonth - expensePrevMonth) / expensePrevMonth) * 100;

  const frequentPurchases = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const counts: Record<string, number> = {};
    expenses.forEach(t => {
      const name = t.title.toLowerCase().trim();
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([_, count]) => count > 1) // Only items bought more than once
      .sort((a, b) => b[1] - a[1]) // Sort by count desc
      .slice(0, 5) // Top 5
      .map(([name]) => name);
  }, [transactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    
    addTransaction({
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category: type === 'income' ? 'renda' : category
    });
    
    setTitle('');
    setAmount('');
    setIsAdding(false);
  };

  const handleAddShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shoppingTitle.trim()) return;
    
    addShoppingItem({
      title: shoppingTitle.trim(),
      purchased: false,
      price: shoppingPrice ? parseFloat(shoppingPrice) : undefined
    });
    
    setShoppingTitle('');
    setShoppingPrice('');
  };

  const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const CATEGORY_COLORS: Record<TransactionCategory, string> = {
      alimentacao: '#f59e0b',
      transporte: '#3b82f6',
      lazer: '#ec4899',
      saude: '#10b981',
      contas: '#ef4444',
      outros: '#6b7280',
      renda: '#10b981'
  };

  const expensesByCategory = useMemo(() => {
    const expenses = currentMonthTransactions.filter(t => t.type === 'expense');
    const acc: Partial<Record<TransactionCategory, number>> = {};
    expenses.forEach(t => {
      const cat = t.category || 'outros';
      acc[cat] = (acc[cat] || 0) + t.amount;
    });
    
    return Object.entries(acc).map(([cat, amount]) => ({
      name: cat as TransactionCategory,
      value: amount as number
    })).sort((a,b) => b.value - a.value);
  }, [currentMonthTransactions]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] relative text-[#dde5da]">
      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-6 py-4 bg-black border-b border-[#1a1a1a] sticky top-0 z-50">
          <div className="flex items-center gap-4">
              <button className="text-[#4ade80] hover:opacity-80 transition-opacity">
                  <Menu className="w-6 h-6" />
              </button>
              <h1 className="font-serif italic text-white text-xl font-bold tracking-widest uppercase">ALAIAS</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#111111] border border-[#1a1a1a] overflow-hidden flex items-center justify-center font-bold text-[10px] text-gray-500">
              ?
          </div>
      </header>

      <div className="px-6 pb-6 pt-5 bg-[#0a0a0a] z-20 sticky top-[65px]">
        <section className="mb-0">
            <p className="font-sans text-[12px] text-[#869486] font-bold uppercase tracking-[0.1em] mb-1">
                {format(today, 'MMMM', { locale: ptBR })}
            </p>
            <h2 className="font-serif text-[32px] text-white leading-tight">
                Meu <span className="italic text-[#4ade80]">financeiro</span>
            </h2>
        </section>
        
        {/* Navigation Tabs */}
        <div className="flex justify-between items-center mt-6 bg-[#111111] p-1.5 rounded-full border border-[#1a1a1a]">
            <button 
                onClick={() => setActiveTab('transactions')}
                className={cn(
                    "flex-1 py-1.5 font-sans text-[11px] uppercase font-bold tracking-widest rounded-full transition-all flex items-center justify-center gap-1",
                    activeTab === 'transactions' ? "bg-[#4ade80] text-black" : "text-[#869486] hover:text-white"
                )}
            >
                Fluxo
            </button>
            <button 
                onClick={() => setActiveTab('budget')}
                className={cn(
                    "flex-1 py-1.5 font-sans text-[11px] uppercase font-bold tracking-widest rounded-full transition-all flex items-center justify-center gap-1",
                    activeTab === 'budget' ? "bg-[#4ade80] text-black" : "text-[#869486] hover:text-white"
                )}
            >
                Orçamento
            </button>
            <button 
                onClick={() => setActiveTab('shopping')}
                className={cn(
                    "flex-1 py-1.5 font-sans text-[11px] uppercase font-bold tracking-widest rounded-full transition-all flex items-center justify-center gap-1",
                    activeTab === 'shopping' ? "bg-[#4ade80] text-black" : "text-[#869486] hover:text-white"
                )}
            >
                Compras
            </button>
        </div>
      </div>
      
      <div className={cn("px-6 space-y-6 flex-1 overflow-visible", activeTab === 'transactions' && !isAdding ? "pb-40" : "pb-24")}>
        
        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
            {/* Main Balance Card */}
            <section className="bg-[#111111] rounded-3xl p-6 border border-[#1a1a1a] shadow-xl">
               <p className="font-sans text-[12px] text-[#bccabb] font-bold uppercase tracking-widest mb-2">Saldo Total</p>
               <h2 className="font-serif text-[48px] text-[#4ade80] tracking-tight mb-4 leading-none">
                   {formatCurrency(balance)}
               </h2>
               <div className="pt-4 border-t border-[#1a1a1a] flex justify-between items-center">
                   <span className="font-sans text-[14px] text-[#869486]">Receita total</span>
                   <span className="font-sans text-[14px] text-[#dde5da] font-medium">{formatCurrency(incomeThisMonth)}</span>
               </div>
            </section>

            {/* Income & Expenses Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111111] rounded-3xl p-4 border border-[#1a1a1a]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></div>
                        <span className="font-sans text-[11px] font-bold text-[#869486] uppercase tracking-widest">Receita</span>
                    </div>
                    <p className="text-[16px] font-bold text-white mb-3">{formatCurrency(incomeThisMonth)}</p>
                    <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className="h-full bg-[#4ade80] w-full"></div>
                    </div>
                </div>
                <div className="bg-[#111111] rounded-3xl p-4 border border-[#1a1a1a]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <span className="font-sans text-[11px] font-bold text-[#869486] uppercase tracking-widest">Gastos</span>
                    </div>
                    <p className="text-[16px] font-bold text-white mb-3">{formatCurrency(expenseThisMonth)}</p>
                    <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-amber-500 transition-all" 
                            style={{ width: `${incomeThisMonth > 0 ? Math.min((expenseThisMonth / incomeThisMonth) * 100, 100) : 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {isAdding && (
                <form onSubmit={handleAddTransaction} className="bg-[#111111] p-5 rounded-3xl border border-[#1a1a1a] space-y-4 shadow-xl">
                    <div className="flex justify-between items-center mb-2">
                         <h3 className="text-white font-bold text-sm tracking-wide uppercase">Adicionar Transação</h3>
                         <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white p-1">
                             <X className="w-4 h-4" />
                         </button>
                    </div>

                    <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-[#1a1a1a]">
                        <button 
                            type="button" 
                            onClick={() => setType('expense')}
                            className={cn(
                                "flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex justify-center gap-2 items-center",
                                type === 'expense' ? "bg-[#333] text-white" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <ArrowDownCircle className="w-4 h-4"/> Saída
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setType('income')}
                            className={cn(
                                "flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex justify-center gap-2 items-center",
                                type === 'income' ? "bg-[#4ade80]/20 text-[#4ade80]" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <ArrowUpCircle className="w-4 h-4"/> Entrada
                        </button>
                    </div>
                    
                    <input 
                        type="text" 
                        placeholder="Ex: Almoço restaurante"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-transparent border-b border-[#1a1a1a] text-white rounded-none px-0 py-3 outline-none focus:border-[#4ade80]"
                        required
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <span className="absolute left-0 top-3.5 text-gray-500 text-sm font-bold">R$</span>
                            <input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-transparent border-b border-[#1a1a1a] text-white rounded-none pl-8 pr-0 py-3 outline-none focus:border-[#4ade80]"
                                required
                            />
                        </div>
                        {type === 'expense' && (
                            <select 
                                value={category}
                                onChange={e => setCategory(e.target.value as TransactionCategory)}
                                className="w-full bg-transparent border-b border-[#1a1a1a] text-white rounded-none px-0 py-3 outline-none focus:border-[#4ade80] appearance-none text-sm"
                            >
                                <option value="alimentacao">Alimentação</option>
                                <option value="transporte">Transporte</option>
                                <option value="lazer">Lazer</option>
                                <option value="saude">Saúde</option>
                                <option value="contas">Contas</option>
                                <option value="outros">Outros</option>
                            </select>
                        )}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full py-4 text-[12px] font-bold tracking-widest uppercase bg-[#4ade80] text-black rounded-full active:scale-95 transition-transform"
                    >
                        Registrar
                    </button>
                </form>
            )}

            {/* History List */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#869486]">Últimas movimentações</h3>
                </div>
                <div className="space-y-0 px-2">
                  {transactions.slice().reverse().map((tx, i, arr) => (
                    <div key={tx.id} className={cn(
                        "flex items-center justify-between py-4 group overflow-hidden",
                        i !== arr.length - 1 && "border-b border-[#1a1a1a]"
                    )}>
                        <div className="flex items-center gap-4 transition-transform group-hover:-translate-x-12 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#1a1a1a] flex items-center justify-center shrink-0">
                                {tx.type === 'income' ? <ArrowUpCircle className="w-5 h-5 text-[#869486]"/> : <ArrowDownCircle className="w-5 h-5 text-[#869486]"/>}
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium text-white truncate leading-tight">{tx.title}</p>
                                <p className="text-[14px] text-[#869486] font-medium mt-0.5">
                                    {format(new Date(tx.date), "dd MMM", { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 transition-transform group-hover:-translate-x-8 shrink-0 relative">
                            <p className={cn(
                                "font-medium text-[16px] leading-none text-right shrink-0 transition-transform",
                                tx.type === 'income' ? "text-[#4ade80]" : "text-red-400"
                            )}>
                                {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                            </p>
                            <button 
                                onClick={() => deleteTransaction(tx.id)}
                                className="absolute -right-14 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 p-2 flex items-center justify-center transition-opacity"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                      <div className="text-center py-10">
                          <p className="text-[#869486] text-sm font-medium">Nenhuma movimentação registrada.</p>
                      </div>
                  )}
                </div>
            </section>
            
            {/* Add Transaction Fixed Footer */}
            {!isAdding && (
                <div className="fixed bottom-24 md:bottom-[92px] inset-x-0 mx-auto max-w-[390px] px-6 z-30 flex justify-center pointer-events-none">
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full bg-[#4ade80] text-black font-sans font-bold uppercase tracking-widest text-[12px] h-14 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-2xl pointer-events-auto"
                    >
                        <Plus className="w-5 h-5 font-bold text-black stroke-[3]" />
                        Registrar movimentação
                    </button>
                </div>
            )}
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
            {/* Chart */}
            <div className="bg-[#111111] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl">
               <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center justify-center gap-2">
                  <PieChart className="w-4 h-4 text-[#4ade80]" /> Categorias (Mês)
               </h3>
               {expensesByCategory.length > 0 ? (
                 <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                                <RechartsPie>
                            <Pie
                                data={expensesByCategory}
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                            >
                                {expensesByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: '#111111', borderColor: '#1a1a1a', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </RechartsPie>
                    </ResponsiveContainer>
                 </div>
               ) : (
                   <p className="text-center text-[#869486] text-sm py-10">Nenhuma despesa no mês</p>
               )}
            </div>

            {/* Budgets List */}
            <h3 className="font-sans text-[12px] font-bold uppercase tracking-widest text-[#869486] ml-1 mt-6">Limites Mensais</h3>
            <div className="space-y-4">
                {(['alimentacao', 'transporte', 'lazer', 'saude', 'contas', 'outros'] as TransactionCategory[]).map(cat => {
                    const limit = budgets.find(b => b.category === cat)?.limit || 0;
                    const spent = currentMonthTransactions.filter(t => t.type === 'expense' && t.category === cat).reduce((acc, t) => acc + t.amount, 0);
                    
                    const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                    const isOverBudget = limit > 0 && spent > limit;
                    const isNearLimit = limit > 0 && spent > limit * 0.8 && !isOverBudget;

                    return (
                        <div key={cat} className="bg-[#111111] p-5 rounded-3xl border border-[#1a1a1a] shadow-lg">
                             <div className="flex justify-between items-center mb-3">
                                 <h4 className="font-sans text-[12px] font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                     <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                                     {cat}
                                 </h4>
                                 <div className="flex items-center gap-2">
                                    <input 
                                        type="number"
                                        placeholder="Limite R$"
                                        value={limit || ''}
                                        onChange={e => setBudget(cat, parseFloat(e.target.value) || 0)}
                                        className="w-24 bg-transparent border-b border-[#1a1a1a] text-white rounded-none px-2 py-1 text-right text-[12px] outline-none focus:border-[#4ade80] focus:ring-0 font-medium"
                                    />
                                 </div>
                             </div>
                             <div className="flex justify-between text-xs mb-3">
                                 <span className="text-[#869486] font-medium tracking-wide">Gasto: <span className="text-white font-medium">{formatCurrency(spent)}</span></span>
                                 {limit > 0 && (
                                     <span className={cn("font-medium tracking-wide", isOverBudget ? "text-red-400" : "text-[#869486]")}>
                                         De {formatCurrency(limit)}
                                     </span>
                                 )}
                             </div>
                             {limit > 0 && (
                                 <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                                    <div 
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            isOverBudget ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-[#4ade80]"
                                        )} 
                                        style={{ width: `${progress}%` }}
                                    />
                                 </div>
                             )}
                             {isOverBudget && (
                                 <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1 font-bold uppercase tracking-wider">
                                    <AlertCircle className="w-3 h-3" /> Limite ultrapassado
                                 </p>
                             )}
                        </div>
                    );
                })}
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
             <div className="mb-4">
                 <h2 className="font-serif text-[32px] text-white leading-tight">
                     Compras do <span className="italic text-[#4ade80]">mês</span>
                 </h2>
                 <div className="flex justify-between items-center mt-4">
                     <span className="font-sans text-[12px] font-bold text-[#869486] uppercase tracking-widest">{shoppingList.length} ITENS TOTAIS</span>
                     <span className="text-[18px] font-bold text-[#4ade80]">
                         {formatCurrency(shoppingList.reduce((acc, curr) => acc + (curr.price || 0), 0))}
                     </span>
                 </div>
             </div>

             {/* Filter Chips - Mockup implementation based on design */}
             <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                 <button onClick={() => setShoppingFilter('all')} className={cn("px-5 py-2 rounded-full font-sans text-[12px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors", shoppingFilter === 'all' ? "bg-[#4ade80] text-black" : "bg-[#111111] border border-[#1a1a1a] text-[#dde5da]")}>TODOS</button>
                 <button onClick={() => setShoppingFilter('pending')} className={cn("px-5 py-2 rounded-full font-sans text-[12px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors", shoppingFilter === 'pending' ? "bg-[#4ade80] text-black" : "bg-[#111111] border border-[#1a1a1a] text-[#dde5da]")}>PENDENTES</button>
                 <button onClick={() => setShoppingFilter('purchased')} className={cn("px-5 py-2 rounded-full font-sans text-[12px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors", shoppingFilter === 'purchased' ? "bg-[#4ade80] text-black" : "bg-[#111111] border border-[#1a1a1a] text-[#dde5da]")}>COMPRADOS</button>
             </div>

             {frequentPurchases.length > 0 && (
                <section className="p-6 bg-[#111111] rounded-2xl border border-[#1a1a1a]">
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag className="w-5 h-5 text-[#4ade80]" />
                        <h3 className="font-sans text-[12px] font-bold text-[#dde5da] uppercase tracking-widest">MAIS COMPRADOS</h3>
                    </div>
                    <div className="space-y-3">
                        {frequentPurchases.slice(0,3).map(item => (
                            <div key={item} className="flex justify-between items-center group cursor-pointer" onClick={() => setShoppingTitle(item.charAt(0).toUpperCase() + item.slice(1))}>
                                <span className="font-sans text-[14px] italic text-[#dde5da] group-hover:text-[#4ade80] transition-colors">{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                                <span className="font-sans text-[10px] bg-[#1a1a1a] px-2 py-1 rounded text-[#4ade80] font-bold uppercase">+ Add</span>
                            </div>
                        ))}
                    </div>
                </section>
             )}

             <form onSubmit={handleAddShoppingItem} className="flex gap-2">
                 <input 
                    type="text" 
                    placeholder="O que comprar?"
                    className="flex-1 bg-transparent border-b border-[#1a1a1a] text-white rounded-none px-0 py-3 outline-none focus:border-[#4ade80]"
                    value={shoppingTitle}
                    onChange={e => setShoppingTitle(e.target.value)}
                 />
                 <input 
                    type="number" 
                    step="0.01"
                    placeholder="R$ (Opcional)"
                    className="w-24 sm:w-32 bg-transparent border-b border-[#1a1a1a] text-white rounded-none px-0 py-3 outline-none focus:border-[#4ade80] text-sm"
                    value={shoppingPrice}
                    onChange={e => setShoppingPrice(e.target.value)}
                 />
                 <button type="submit" disabled={!shoppingTitle.trim()} className="w-12 bg-[#4ade80] hover:scale-95 flex items-center justify-center text-black rounded-xl transition-all disabled:opacity-50 shrink-0 h-11 self-end mb-1">
                    <Plus className="w-5 h-5 stroke-[3]" />
                 </button>
             </form>

             <div className="rounded-2xl overflow-hidden bg-[#111111] border border-[#1a1a1a]">
                  {shoppingList.filter((item) => {
                      if (shoppingFilter === 'all') return true;
                      if (shoppingFilter === 'pending') return !item.purchased;
                      if (shoppingFilter === 'purchased') return item.purchased;
                      return true;
                  }).map((item, i, arr) => (
                      <div key={item.id} className={cn("flex items-center justify-between px-4 py-4 group hover:bg-[#151515] transition-colors cursor-pointer", i !== arr.length - 1 && "border-b border-[#1a1a1a]", item.purchased && "opacity-40")}>
                           <div className="flex items-center gap-4 flex-1" onClick={() => toggleShoppingItem(item.id)}>
                               <button 
                                    className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-colors", item.purchased ? "bg-[#4ade80] border-[#4ade80]" : "border-[#869486] bg-transparent")}
                               >
                                    {item.purchased && <Check className="w-3.5 h-3.5 text-[#003919] stroke-[4]" />}
                               </button>
                               <div className="flex flex-col flex-1">
                                   <span className={cn("font-sans text-[16px] text-[#dde5da]", item.purchased && "line-through")}>
                                       {item.title}
                                   </span>
                               </div>
                           </div>
                           <div className="flex items-center gap-3">
                               <span className={cn("font-sans text-[14px] text-[#dde5da]", item.purchased && "line-through")}>
                                   {item.price ? formatCurrency(item.price) : '--'}
                               </span>
                               <button onClick={(e) => { e.stopPropagation(); deleteShoppingItem(item.id); }} className="p-1 text-[#869486] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                                  <X className="w-4 h-4" />
                               </button>
                           </div>
                      </div>
                  ))}
                  {shoppingList.filter((item) => {
                      if (shoppingFilter === 'all') return true;
                      if (shoppingFilter === 'pending') return !item.purchased;
                      if (shoppingFilter === 'purchased') return item.purchased;
                      return true;
                  }).length === 0 && (
                      <div className="text-center py-10">
                         <p className="text-[#869486] text-sm font-medium">Sua lista está vazia.</p>
                     </div>
                  )}
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
