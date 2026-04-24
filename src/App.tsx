import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Finance } from './pages/Finance';
import { Health } from './pages/Health';
import { Journal } from './pages/Journal';
import { GoalsHabits } from './pages/GoalsHabits';
import { Mais } from './pages/Mais';
import { Relationships } from './pages/Relationships';
import { Learning } from './pages/Learning';
import { Projects } from './pages/Projects';
import { Focus } from './pages/Focus';
import { Settings } from './pages/Settings';
import { Review } from './pages/Review';
import { Auth } from './pages/Auth';
import { useAppStore } from './store/useAppStore';
import { supabase } from './lib/supabase';
import { syncFromSupabase } from './lib/supabase-storage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore();
  if (!isAuthenticated) return <Navigate to="/auth" />;
  return <>{children}</>;
}

export default function App() {
  const { setAuthenticated, setUserName } = useAppStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsInitializing(false);
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      try {
        if (session?.user) {
          setAuthenticated(true);
          if (!useAppStore.getState().userName) {
             setUserName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.user_metadata?.nickname || session.user.email?.split('@')[0] || 'Usuário');
          }
          await syncFromSupabase(session.user.id, 'alaias-storage');
          await useAppStore.persist.rehydrate();
          useAppStore.getState().setAuthenticated(true);
        }
      } catch (err) {
        console.error("Error during initialization:", err);
      } finally {
        setIsInitializing(false);
      }
    }).catch((err) => {
      console.error("Error getting session:", err);
      setIsInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthenticated(true);
        if (!useAppStore.getState().userName) {
           setUserName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.user_metadata?.nickname || session.user.email?.split('@')[0] || 'Usuário');
        }
        if (event === 'SIGNED_IN') {
           try {
             await syncFromSupabase(session.user.id, 'alaias-storage');
             await useAppStore.persist.rehydrate();
             useAppStore.getState().setAuthenticated(true);
           } catch (err) {
             console.error("Error syncing during SIGNED_IN:", err);
           }
        }
      } else {
        setAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuthenticated, setUserName]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="tarefas" element={<Tasks />} />
          <Route path="financas" element={<Finance />} />
          <Route path="saude" element={<Health />} />
          <Route path="diario" element={<Journal />} />
          <Route path="metas" element={<GoalsHabits />} />
          <Route path="mais" element={<Mais />} />
          <Route path="relacionamentos" element={<Relationships />} />
          <Route path="aprendizado" element={<Learning />} />
          <Route path="projetos" element={<Projects />} />
          <Route path="foco" element={<Focus />} />
          <Route path="config" element={<Settings />} />
          <Route path="revisao" element={<Review />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
