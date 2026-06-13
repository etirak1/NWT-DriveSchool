import { Link, useNavigate } from 'react-router-dom';
import {
    Users,
    BookOpen,
    UserCheck,
    DollarSign,
    GraduationCap,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { label: 'Korisnici', icon: Users, to: '/users' },
    { label: 'Resursi', icon: BookOpen, to: '/resources' },
    { label: 'Kandidati', icon: UserCheck, to: '/candidates' },
    { label: 'Finansije', icon: DollarSign, to: '/finance' },
];

export default function Header({ active }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">

                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-3 shrink-0 group">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <GraduationCap size={22} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold">DriveSchool</p>
                        <p className="text-blue-200 text-xs">{active}</p>
                    </div>
                </Link>

                {/* NAV */}
                <nav className="flex items-center gap-1.5 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                active === item.label
                                    ? 'bg-white/20 text-white border border-white/25'
                                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <item.icon size={14} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* USER */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <p className="text-sm text-white font-semibold">{user?.email}</p>
                        <span className="text-xs text-white/80">{user?.role}</span>
                    </div>

                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="px-3 py-2 bg-white/10 text-white rounded-xl flex items-center gap-1"
                    >
                        <LogOut size={15} />
                    </button>
                </div>

            </div>
        </header>
    );
}