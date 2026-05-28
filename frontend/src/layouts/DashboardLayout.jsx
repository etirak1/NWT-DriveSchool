import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

import '../App.css';

const NAV = [
    {
        path: '/resources',
        label: 'Dashboard',
        icon: '📊'
    },
    {
        path: '/resources/vehicles',
        label: 'Vozila',
        icon: '🚗'
    },
    {
        path: '/resources/repairs',
        label: 'Popravke',
        icon: '🔧'
    },
    {
        path: '/resources/instructors',
        label: 'Instruktori',
        icon: '👨‍🏫'
    },
];

export default function DashboardLayout() {

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const location = useLocation();

    return (
        <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

            <aside className="sidebar">

                <div className="sidebar-brand">
                    <span className="brand-icon">🎓</span>

                    {sidebarOpen && (
                        <span className="brand-name">
                            AutoŠkola
                        </span>
                    )}
                </div>

                <nav className="sidebar-nav">

                    {NAV.map(item => (

                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${
                                location.pathname === item.path ? 'nav-active' : ''
                            }`}
                        >

                            <span className="nav-icon">
                                {item.icon}
                            </span>

                            {sidebarOpen && (
                                <span className="nav-label">
                                    {item.label}
                                </span>
                            )}

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
    );
}