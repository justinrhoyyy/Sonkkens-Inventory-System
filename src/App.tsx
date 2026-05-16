import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InOutPage from './pages/InOutPage';
import ActivityLogPage from './pages/ActivityLogPage';
import ProfilePage from './pages/ProfilePage';
import { toast } from './components/Toast';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoadingSession(false);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, state) => {
      setSession(state ?? null);
      if (event === 'SIGNED_OUT') {
        toast('Logged out successfully');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loadingSession) {
    return <div className="page-shell">Loading...</div>;
  }

  return (
    <div className="app-shell">
      {session && <Sidebar onLogout={handleLogout} open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />}
      <main className={session ? 'page-shell with-sidebar' : 'page-shell'}>
        <Routes>
          <Route path="/login" element={<LoginPage session={session} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute session={session}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/in-out"
            element={
              <ProtectedRoute session={session}>
                <InOutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute session={session}>
                <ActivityLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute session={session}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
