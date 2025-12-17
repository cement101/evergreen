import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  BarChart2, 
  Download, 
  Users as UsersIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Sprout 
} from 'lucide-react';

import { INITIAL_BASINS, INITIAL_USERS } from './constants';
import { User, Basin, ViewState, UserRole } from './types';
import BasinOverview from './components/BasinOverview';
import BasinDetail from './components/BasinDetail';
import ExportComponent from './components/ExportComponent';
import CustomChartComponent from './components/CustomChartComponent';
import UsersPage from './components/UsersPage';
import Button from './components/Button';

const App: React.FC = () => {
  // --- State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [basins, setBasins] = useState<Basin[]>(INITIAL_BASINS);
  
  const [currentView, setCurrentView] = useState<ViewState>('OVERVIEW');
  const [selectedBasinId, setSelectedBasinId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Login State (Simple Mock)
  const [loginUsername, setLoginUsername] = useState('');

  // --- Effects ---
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Computed ---
  const visibleBasins = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN) return basins;
    return basins.filter(b => currentUser.allowedBasins.includes(b.id));
  }, [currentUser, basins]);

  const selectedBasin = useMemo(() => 
    basins.find(b => b.id === selectedBasinId), 
  [basins, selectedBasinId]);

  // --- Handlers ---
  const handleLogin = () => {
    const user = users.find(u => u.username === loginUsername) || null;
    if (user) {
      setCurrentUser(user);
      setLoginUsername('');
      setCurrentView('OVERVIEW');
    } else {
      alert('User not found. Try "superadmin" or "grower_john"');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('OVERVIEW');
    setSelectedBasinId(null);
  };

  const handleBasinClick = (id: string) => {
    setSelectedBasinId(id);
    setCurrentView('DETAILS');
  };

  const handleTogglePump = (basinId: string, pumpKey: keyof Basin['pumps']) => {
    setBasins(prev => prev.map(b => {
      if (b.id !== basinId) return b;
      return {
        ...b,
        pumps: {
          ...b.pumps,
          [pumpKey]: !b.pumps[pumpKey]
        }
      };
    }));
  };

  // --- Render ---

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-evergreen-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <Sprout size={32} />
            </div>
            <h1 className="text-4xl font-light text-gray-900 dark:text-white tracking-tight lowercase">evergreen</h1>
            <p className="text-gray-500 mt-2">Plant Monitoring System</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input 
                type="text" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="superadmin"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-evergreen-500 transition-shadow"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full py-3 text-lg">
              Sign In
            </Button>
            <div className="text-center text-xs text-gray-400 mt-4">
              Try <span className="font-mono">superadmin</span> or <span className="font-mono">grower_john</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('OVERVIEW')}>
            <div className="w-8 h-8 bg-evergreen-500 rounded-lg flex items-center justify-center text-white">
                <Sprout size={20} />
            </div>
            <span className="text-2xl font-light text-gray-900 dark:text-white tracking-tight lowercase">evergreen</span>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <nav className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button 
                onClick={() => setCurrentView('OVERVIEW')}
                className={`p-2 rounded-md transition-colors ${currentView === 'OVERVIEW' || currentView === 'DETAILS' ? 'bg-white dark:bg-gray-600 shadow-sm text-evergreen-600 dark:text-evergreen-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                title="Basins"
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setCurrentView('CHART')}
                className={`p-2 rounded-md transition-colors ${currentView === 'CHART' ? 'bg-white dark:bg-gray-600 shadow-sm text-evergreen-600 dark:text-evergreen-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                title="Charts"
              >
                <BarChart2 size={20} />
              </button>
              <button 
                onClick={() => setCurrentView('EXPORT')}
                className={`p-2 rounded-md transition-colors ${currentView === 'EXPORT' ? 'bg-white dark:bg-gray-600 shadow-sm text-evergreen-600 dark:text-evergreen-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                title="Export"
              >
                <Download size={20} />
              </button>
              {currentUser.role === UserRole.ADMIN && (
                <button 
                  onClick={() => setCurrentView('USERS')}
                  className={`p-2 rounded-md transition-colors ${currentView === 'USERS' ? 'bg-white dark:bg-gray-600 shadow-sm text-evergreen-600 dark:text-evergreen-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                  title="Users"
                >
                  <UsersIcon size={20} />
                </button>
              )}
            </nav>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block" />

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.username}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">{currentUser.role}</div>
              </div>
              <Button size="sm" variant="secondary" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentView === 'OVERVIEW' && (
          <BasinOverview basins={visibleBasins} onSelectBasin={handleBasinClick} />
        )}

        {currentView === 'DETAILS' && selectedBasin && (
          <BasinDetail 
            basin={selectedBasin} 
            onBack={() => {
                setSelectedBasinId(null);
                setCurrentView('OVERVIEW');
            }}
            onTogglePump={handleTogglePump}
          />
        )}

        {currentView === 'EXPORT' && (
          <ExportComponent basins={visibleBasins} />
        )}

        {currentView === 'CHART' && (
          <CustomChartComponent basins={visibleBasins} />
        )}

        {currentView === 'USERS' && currentUser.role === UserRole.ADMIN && (
          <UsersPage 
            users={users} 
            allBasins={basins} 
            onAddUser={(u) => setUsers([...users, u])} 
            onRemoveUser={(id) => setUsers(users.filter(u => u.id !== id))}
            onUpdateUser={(updated) => setUsers(users.map(u => u.id === updated.id ? updated : u))}
          />
        )}

        {/* Fallback for Users view if not admin */}
        {currentView === 'USERS' && currentUser.role !== UserRole.ADMIN && (
           <div className="text-center py-20">
             <h2 className="text-xl text-red-500">Access Denied</h2>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;
