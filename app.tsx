
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage.tsx';
import AuthPage from './pages/AuthPage.tsx';
import CustomerAuth from './pages/CustomerAuth.tsx';
import CustomerWallet from './pages/CustomerWallet.tsx';
import VendorDashboard from './pages/VendorDashboard.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import { User, UserRole } from './types.ts';
import { getCurrentUser, setCurrentUser } from './services/store.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [route, setRoute] = useState<string>(window.location.hash || '#/');

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    navigate('#/');
  };

  // Basic Router Logic
  const renderPage = () => {
    const parts = route.replace('#/', '').split('/');
    const path = parts[0] || '';
    const subPath = parts[1] || '';
    
    // Auth Guard - Redirect to correct role verification
    if (['wallet', 'vendor', 'admin'].includes(path) && !user) {
      if (path === 'vendor') return <AuthPage onLogin={setUser} initialRole={UserRole.VENDOR} />;
      if (path === 'admin') return <AuthPage onLogin={setUser} initialRole={UserRole.ADMIN} />;
      return <CustomerAuth onLogin={setUser} />;
    }

    switch (path) {
      case '':
        return <LandingPage onNavigate={navigate} user={user} />;
      case 'auth':
        if (subPath === 'vendor') return <AuthPage onLogin={setUser} initialRole={UserRole.VENDOR} />;
        if (subPath === 'admin') return <AuthPage onLogin={setUser} initialRole={UserRole.ADMIN} />;
        return <CustomerAuth onLogin={setUser} />;
      case 'login':
        return <CustomerAuth onLogin={setUser} />;
      case 'wallet':
        return <CustomerWallet user={user!} onLogout={handleLogout} />;
      case 'vendor':
        return <VendorDashboard user={user!} onLogout={handleLogout} />;
      case 'admin':
        return <AdminDashboard user={user!} onLogout={handleLogout} />;
      default:
        return <LandingPage onNavigate={navigate} user={user} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
    </div>
  );
};

export default App;
