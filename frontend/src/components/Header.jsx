import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users, BookOpen, UserCheck, DollarSign,
    GraduationCap, LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { label: 'Korisnici', icon: Users, to: '/users' },
    { label: 'Resursi',   icon: BookOpen, to: '/resources' },
    { label: 'Kandidati', icon: UserCheck, to: '/candidates' },
    { label: 'Finansije', icon: DollarSign, to: '/finance' },
];

export default function Header({ active }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 shadow-lg">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-2 sm:gap-4">

                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2 shrink-0 group">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                        <GraduationCap size={20} className="text-white" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-white font-bold leading-tight">DriveSchool</p>
                        <p className="text-blue-200 text-xs truncate max-w-[160px]">{active}</p>
                    </div>
                </Link>

                {/* Desktop NAV */}
                <nav className="hidden sm:flex items-center gap-1 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                active === item.label
                                    ? 'bg-white/20 text-white border border-white/25'
                                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <item.icon size={14} />
                            <span className="hidden lg:inline">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Right */}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <div className="hidden xl:flex flex-col items-end">
                        <p className="text-sm text-white font-semibold">{user?.email}</p>
                        <span className="text-xs text-white/80">{user?.role}</span>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMenuOpen(v => !v)}
                        className="sm:hidden p-2 rounded-xl bg-white/10 text-white"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="p-2 sm:px-3 sm:py-2 bg-white/10 text-white rounded-xl flex items-center gap-1 shrink-0 hover:bg-white/20 transition-colors"
                    >
                        <LogOut size={15} />
                        <span className="hidden sm:inline text-sm font-medium">Odjava</span>
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="sm:hidden border-t px-4 py-3 flex flex-col gap-1"
                     style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)' }}>
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                active === label ? 'text-white bg-white/20' : 'text-blue-100 hover:text-white'
                            }`}
                            style={{ background: active === label ? undefined : 'rgba(255,255,255,0.08)' }}
                        >
                            <Icon size={15} />
                            {label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
