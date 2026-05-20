import React, { useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import VehiclePage from './pages/VehiclePage';
import RepairsPage from './pages/RepairsPage';
import InstructorPage from './pages/InstructorPage';
import { ToastContainer } from './components/Notifications';
import { useToast } from './hooks/useToast';
import './App.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'vehicles',  label: 'Vozila',    icon: '🚗' },
  { id: 'repairs',   label: 'Popravke',  icon: '🔧' },
  { id: 'instructors', label: 'Instruktori', icon: '👨‍🏫' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  const renderPage = () => {
    switch (page) {
      case 'dashboard':   return <DashboardPage />;
      case 'vehicles':    return <VehiclePage addToast={addToast} />;
      case 'repairs':     return <RepairsPage addToast={addToast} />;
      case 'instructors': return <InstructorPage addToast={addToast} />;
      default:            return <DashboardPage />;
    }
  };

  return (
      <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon">🎓</span>
            {sidebarOpen && <span className="brand-name">AutoŠkola</span>}
          </div>

          <nav className="sidebar-nav">
            {NAV.map(item => (
                <button
                    key={item.id}
                    className={`nav-item ${page === item.id ? 'nav-active' : ''}`}
                    onClick={() => setPage(item.id)}
                    title={!sidebarOpen ? item.label : ''}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && <span className="nav-label">{item.label}</span>}
                </button>
            ))}
          </nav>

          <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(o => !o)}
              title={sidebarOpen ? 'Skupi' : 'Proširi'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </aside>

        {/* Main */}
        <main className="main-content">
          {renderPage()}
        </main>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
  );
}