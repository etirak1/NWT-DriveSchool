import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, GraduationCap, LayoutDashboard, Car, Wrench, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const glassBtn = {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
};

const NAV = [
    { path: '/resources',             label: 'Prikaz resursa', Icon: LayoutDashboard },
    { path: '/resources/vehicles',    label: 'Vozila',         Icon: Car },
    { path: '/resources/repairs',     label: 'Popravke',       Icon: Wrench },
    { path: '/resources/instructors', label: 'Instruktori',    Icon: Users },
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

            <Header active="Resursi" />

                {/* Mobile horizontal nav */}
            <nav className="sm:hidden bg-white border-b border-slate-200 flex overflow-x-auto">
                {NAV.map(({ path, label, Icon }) => (
                    <Link
                        key={path}
                        to={path}
                        className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                            location.pathname === path
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Icon size={15} />
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Sidebar + Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`hidden sm:flex flex-col bg-white border-r border-slate-200 transition-all duration-200 shrink-0 ${sidebarOpen ? 'w-52' : 'w-16'}`}>
                    <nav className="flex-1 p-2 pt-4 space-y-1">
                        {NAV.map(({ path, label, Icon }) => {
                            const active = location.pathname === path;
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    title={!sidebarOpen ? label : undefined}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        active
                                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon size={17} className="shrink-0" />
                                    {sidebarOpen && <span className="truncate">{label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    <button
                        className="flex items-center justify-center gap-1.5 m-2 p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 text-xs font-medium"
                        onClick={() => setSidebarOpen(prev => !prev)}
                    >
                        {sidebarOpen ? <><ChevronLeft size={14} /> <span>Sakrij</span></> : <ChevronRight size={14} />}
                    </button>
                </aside>

                {/* Main */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
