import { StateStorage } from 'zustand/middleware';
import { supabase } from './supabase';

// Multi-storage: saves to both localStorage and Supabase (if logged in)
// Reads from localStorage by default, but we will trigger a Supabase fetch on login
export const hybridStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return localStorage.getItem(name);
  },
  
  setItem: async (name: string, value: string): Promise<void> => {
    localStorage.setItem(name, value);
    
    if (!supabase) return;
    
    // Non-blocking save to Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      
      supabase
        .from('user_profiles')
        .upsert({ 
          user_id: session.user.id, 
          app_state: JSON.parse(value),
          updated_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) console.error('Error saving state to Supabase:', error);
        });
    });
  },
  
  removeItem: async (name: string): Promise<void> => {
    localStorage.removeItem(name);
    
    if (!supabase) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    
    await supabase
      .from('user_profiles')
      .update({ app_state: null })
      .eq('user_id', session.user.id);
  },
};

// Explicit sync function to pull from Supabase after login
export const syncFromSupabase = async (userId: string, storeName: string) => {
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('app_state')
            .eq('user_id', userId)
            .single();
            
        if (error || !data?.app_state) return null;
        
        const stringified = JSON.stringify(data.app_state);
        localStorage.setItem(storeName, stringified);
        return stringified;
    } catch (e) {
        console.error('Failed to sync from Supabase', e);
        return null;
    }
}
