import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const NAV = [
    { path: '/resources',              label: 'Prikaz resursa', icon: '📊' },
    { path: '/resources/vehicles',     label: 'Vozila',         icon: '🚗' },
    { path: '/resources/repairs',      label: 'Popravke',       icon: '🔧' },
    { path: '/resources/instructors',  label: 'Instruktori',    icon: '👨‍🏫' },
];

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const email = user?.email;
    const role = user?.role;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            {/* Header */}
            <header className="bg-white border-b border-slate-200 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm"
                    >
                        <ArrowLeft size={16} /> <span className="hidden sm:inline">Nazad na početnu</span><span className="sm:hidden">Nazad</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800">{email}</p>
                            <span className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700">
                                {role}
                            </span>
                        </div>
                        <button
                            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            <LogOut size={16} /> <span className="hidden sm:inline">Odjava</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile horizontal nav (visible only on small screens) */}
            <nav className="sm:hidden bg-white border-b border-slate-200 flex overflow-x-auto">
                {NAV.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                            location.pathname === item.path
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Sidebar + Content */}
            <div className={`app-layout flex-1 ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

                <aside className="sidebar">
                    <nav className="sidebar-nav">
                        {NAV.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${location.pathname === item.path ? 'nav-active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {sidebarOpen && <span className="nav-label">{item.label}</span>}
                            </Link>
                        ))}
                    </nav>

                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(prev => !prev)}
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </aside>

                <main className="main-content">
                    <Outlet />
                </main>

            </div>
        </div>
    );
}