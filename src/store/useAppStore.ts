import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { hybridStorage } from '../lib/supabase-storage';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type GoalCategory = 'pessoal' | 'profissional' | 'saude' | 'financeiro';
export type TransactionCategory = 'alimentacao' | 'transporte' | 'lazer' | 'saude' | 'contas' | 'outros' | 'renda';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean; // Keeping for backward compatibility temporarily
  createdAt: string;
  order: number;
  projectId?: string;
}

export interface FinanceTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category?: TransactionCategory;
  date: string;
}

export interface Budget {
  category: TransactionCategory;
  limit: number;
}

export interface ShoppingItem {
  id: string;
  title: string;
  purchased: boolean;
  price?: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  waterGlasses: number;
  mood: number | null; // 1-5
  energy: number | null; // 1-5
  sleepStart?: string;
  sleepEnd?: string;
  sleepQuality?: number; // 1-5
  journalEntry: string;
  gratitudes?: string[];
  intention?: string;
  nightReflection?: string;
  isEncrypted?: boolean;
}

export interface Meal {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  name: string;
  calories: number;
}

export interface Exercise {
  id: string;
  date: string; // YYYY-MM-DD
  type: string;
  duration: number; // minutes
  intensity: 'baixa' | 'media' | 'alta';
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  deadline?: string;
  milestones: Milestone[];
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  createdAt: string;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface Person {
  id: string;
  name: string;
  birthday?: string; // YYYY-MM-DD
  lastContact?: string; // YYYY-MM-DD
  reminderFrequencyDays?: number;
  notes?: string;
  createdAt: string;
}

export interface LearningItem {
  id: string;
  title: string;
  author?: string;
  type: 'book' | 'course';
  status: 'to-read' | 'reading' | 'read' | 'todo' | 'in-progress' | 'completed';
  progress?: number; // 0-100
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'backlog' | 'in-progress' | 'completed';
  type: 'personal' | 'professional';
  createdAt: string;
}

interface AppState {
  tasks: Task[];
  transactions: FinanceTransaction[];
  logs: Record<string, DailyLog>; // key by YYYY-MM-DD
  goals: Goal[];
  habits: Habit[];
  habitLogs: HabitLog[];
  budgets: Budget[];
  shoppingList: ShoppingItem[];
  meals: Meal[];
  exercises: Exercise[];
  persons: Person[];
  learningItems: LearningItem[];
  projects: Project[];
  userName?: string;
  setUserName: (name: string) => void;
  isAuthenticated: boolean;
  setAuthenticated: (val: boolean) => void;
  journalPinHash?: string;
  xp: number;
  level: number;
  
  addXp: (amount: number) => void;
  setJournalPinHash: (hash: string | undefined) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (reorderedTasks: Task[]) => void;
  toggleTask: (id: string) => void; 
  
  addTransaction: (tx: Omit<FinanceTransaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  
  updateLog: (date: string, data: Partial<DailyLog>) => void;
  getLog: (date: string) => DailyLog;

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;

  addHabit: (title: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabitLog: (habitId: string, date: string) => void;

  setBudget: (category: TransactionCategory, limit: number) => void;
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void;
  toggleShoppingItem: (id: string) => void;
  deleteShoppingItem: (id: string) => void;

  addMeal: (meal: Omit<Meal, 'id'>) => void;
  deleteMeal: (id: string) => void;
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  deleteExercise: (id: string) => void;

  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;

  addLearningItem: (item: Omit<LearningItem, 'id' | 'createdAt'>) => void;
  updateLearningItem: (id: string, updates: Partial<LearningItem>) => void;
  deleteLearningItem: (id: string) => void;

  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      transactions: [],
      logs: {},
      goals: [],
      habits: [],
      habitLogs: [],
      budgets: [],
      shoppingList: [],
      meals: [],
      exercises: [],
      persons: [],
      learningItems: [],
      projects: [],
      userName: undefined,
      isAuthenticated: false,
      journalPinHash: undefined,
      xp: 0,
      level: 1,

      setAuthenticated: (val) => set({ isAuthenticated: val }),
      addXp: (amount) => set((state) => {
          let newXp = state.xp + amount;
          let newLevel = state.level;
          
          if (newXp < 0 && newLevel > 1) {
             newLevel -= 1;
             newXp = (newLevel * 100) + newXp; 
          }
          if (newXp < 0) {
             newXp = 0;
          }
          while (newXp >= newLevel * 100) {
             newXp -= newLevel * 100;
             newLevel += 1;
          }
          return { xp: newXp, level: newLevel };
      }),
      
      setUserName: (name) => set({ userName: name }),
      setJournalPinHash: (hash) => set({ journalPinHash: hash }),
      addTask: (task) => set((state) => {
        const newTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          completed: task.status === 'completed',
          createdAt: new Date().toISOString(),
          order: state.tasks.length,
        };
        return { tasks: [...state.tasks, newTask] };
      }),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => {
            if (t.id === id) {
                const updated = { ...t, ...updates };
                if (updates.status) {
                    updated.completed = updates.status === 'completed';
                }
                return updated;
            }
            return t;
        })
      })),
      toggleTask: (id) => set((state) => {
        let xpGained = 0;
        const tasks = state.tasks.map(t => {
            if (t.id === id) {
                const isCompleted = t.status === 'completed' || t.completed;
                if (!isCompleted) xpGained = 10;
                else xpGained = -10;
                
                const newStatus: "pending" | "in-progress" | "completed" = isCompleted ? 'pending' : 'completed';
                
                return { 
                    ...t, 
                    completed: !isCompleted,
                    status: newStatus
                };
            }
            return t;
        });
        
        let newXp = state.xp + xpGained;
        let newLevel = state.level;
        if (newXp < 0 && newLevel > 1) { newLevel--; newXp = (newLevel * 100) + newXp; }
        if (newXp < 0) newXp = 0;
        while (newXp >= newLevel * 100) { newXp -= newLevel * 100; newLevel++; }

        return { tasks, xp: newXp, level: newLevel };
      }),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
      reorderTasks: (reorderedTasks) => set({
        tasks: reorderedTasks.map((t, idx) => ({ ...t, order: idx }))
      }),
      addTransaction: (tx) => set((state) => {
        let newXp = state.xp + 5;
        let newLevel = state.level;
        if (newXp >= newLevel * 100) { newXp -= newLevel * 100; newLevel++; }
        
        return {
          transactions: [
            ...state.transactions,
            {
              ...tx,
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
            }
          ],
          xp: newXp,
          level: newLevel
        };
      }),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),
      updateLog: (date, data) => set((state) => {
        const existing = state.logs[date] || { date, waterGlasses: 0, mood: null, energy: null, journalEntry: '', gratitudes: ['', '', ''], intention: '', nightReflection: '' };
        
        let xpGained = 0;
        if (data.waterGlasses && data.waterGlasses > existing.waterGlasses) xpGained += 2;
        if (data.journalEntry && data.journalEntry.length > 10 && existing.journalEntry.length <= 10) xpGained += 15;
        
        let newXp = state.xp + xpGained;
        let newLevel = state.level;
        if (newXp >= newLevel * 100) { newXp -= newLevel * 100; newLevel++; }
        
        return {
           logs: {
             ...state.logs,
             [date]: { ...existing, ...data }
           },
           xp: newXp,
           level: newLevel
        };
      }),
      getLog: (date) => {
        const current = get().logs[date];
        return current || { date, waterGlasses: 0, mood: null, energy: null, journalEntry: '', gratitudes: ['', '', ''], intention: '', nightReflection: '' };
      },

      addGoal: (goal) => set((state) => ({
        goals: [
          ...state.goals,
          {
            ...goal,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          }
        ]
      })),
      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
      })),
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),
      toggleMilestone: (goalId, milestoneId) => set((state) => ({
        goals: state.goals.map(g => {
          if (g.id === goalId) {
            return {
              ...g,
              milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m)
            };
          }
          return g;
        })
      })),

      addHabit: (title) => set((state) => ({
        habits: [
          ...state.habits,
          {
            id: crypto.randomUUID(),
            title,
            createdAt: new Date().toISOString(),
          }
        ]
      })),
      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter(h => h.id !== id),
        // also cascade delete logs
        habitLogs: state.habitLogs.filter(l => l.habitId !== id)
      })),
      toggleHabitLog: (habitId, date) => set((state) => {
        const exists = state.habitLogs.find(l => l.habitId === habitId && l.date === date);
        if (exists) {
          return { habitLogs: state.habitLogs.filter(l => l !== exists) };
        } else {
          return { habitLogs: [...state.habitLogs, { habitId, date }] };
        }
      }),

      setBudget: (category, limit) => set((state) => {
        const existing = state.budgets.find(b => b.category === category);
        if (existing) {
          return { budgets: state.budgets.map(b => b.category === category ? { ...b, limit } : b) };
        }
        return { budgets: [...state.budgets, { category, limit }] };
      }),
      addShoppingItem: (item) => set((state) => ({
        shoppingList: [...state.shoppingList, { ...item, id: crypto.randomUUID() }]
      })),
      toggleShoppingItem: (id) => set((state) => ({
        shoppingList: state.shoppingList.map(item => item.id === id ? { ...item, purchased: !item.purchased } : item)
      })),
      deleteShoppingItem: (id) => set((state) => ({
        shoppingList: state.shoppingList.filter(item => item.id !== id)
      })),
      addMeal: (meal) => set((state) => ({
        meals: [...state.meals, { ...meal, id: crypto.randomUUID() }]
      })),
      deleteMeal: (id) => set((state) => ({
        meals: state.meals.filter(m => m.id !== id)
      })),
      addExercise: (exercise) => set((state) => ({
        exercises: [...state.exercises, { ...exercise, id: crypto.randomUUID() }]
      })),
      deleteExercise: (id) => set((state) => ({
        exercises: state.exercises.filter(e => e.id !== id)
      })),
      addPerson: (person) => set((state) => ({
        persons: [...state.persons, { ...person, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updatePerson: (id, updates) => set((state) => ({
        persons: state.persons.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deletePerson: (id) => set((state) => ({
        persons: state.persons.filter(p => p.id !== id)
      })),
      addLearningItem: (item) => set((state) => ({
        learningItems: [...state.learningItems, { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateLearningItem: (id, updates) => set((state) => ({
        learningItems: state.learningItems.map(l => l.id === id ? { ...l, ...updates } : l)
      })),
      deleteLearningItem: (id) => set((state) => ({
        learningItems: state.learningItems.filter(l => l.id !== id)
      })),
      addProject: (project) => set((state) => ({
        projects: [...state.projects, { ...project, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      }))
    }),
    {
      name: 'alaias-storage',
      storage: createJSONStorage(() => hybridStorage),
      partialize: (state) => {
        const { isAuthenticated, ...rest } = state;
        return rest as any;
      },
    }
  )
);
