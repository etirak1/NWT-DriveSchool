import { Link, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, History, Award, LogOut } from 'lucide-react';

const Layout = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar - Prema dizajnu iz PDF-a */}
            <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
                <h1 className="text-xl font-bold text-blue-600 mb-10">DriveSchool</h1>
                <nav className="flex-1 space-y-2">
                    <Link to="/dashboard" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                        <LayoutDashboard className="mr-3" size={20} /> Dashboard
                    </Link>
                    <Link to="/book" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                        <CalendarPlus className="mr-3" size={20} /> Zakaži čas
                    </Link>
                    <Link to="/phases" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                        <Award className="mr-3" size={20} /> Faze obuke
                    </Link>
                </nav>
                <button onClick={handleLogout} className="flex items-center p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-auto">
                    <LogOut className="mr-3" size={20} /> Odjavi se
                </button>
            </div>
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;