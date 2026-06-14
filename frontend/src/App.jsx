
import { useEffect, useState, useCallback } from 'react';
import { api } from './api/client';
import { useAuth } from './context/AuthContext';

import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import CandidateDashboard from './pages/CandidateDashboard';
import BookLesson from './pages/BookLesson';
import DashboardPage from './pages/DashboardPage';
import CandidateManagement from './pages/CandidateManagement';
import TheoryPlansPage from './pages/TheoryPlansPage';
import InstructorDashboard from './pages/InstructorDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import Layout from './layouts/DashboardLayout.jsx';
import ResourceManagement from './pages/DashboardPage.jsx';
import Vehicles from './pages/VehiclePage';
import Repairs from './pages/RepairsPage';
import Instructors from './pages/InstructorPage';


function RequireAuth({ children }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
}

function RequireAdmin({ children }) {
    const { isAuthenticated, isAdmin } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
    return children;
}

function SmartDashboard() {
    const { user } = useAuth();
    if (user?.role === 'CANDIDATE') return <CandidateDashboard />;
    if (user?.role === 'INSTRUCTOR') return <InstructorDashboard />;
    return <Dashboard />;
}



function UserServiceHealthCheck() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const isLoginPage = location.pathname === '/login' ||
        location.pathname === '/register';

    useEffect(() => {
        if (isLoginPage) return;

        if (!isAuthenticated) return;

        const check = async () => {
            try {
                await api.get('/api/announcements');
            } catch (err) {
                if (!err.response || err.response.status === 500 ||
                    err.response.status === 502 || err.response.status === 503 ||
                    err.code === 'ECONNABORTED') {
                    window.dispatchEvent(new Event('auth:logout'));
                    navigate('/login', {
                        state: { message: 'Servis trenutno nije dostupan. Pokušajte kasnije.' }
                    });
                }
            }
        };
        check();
        const interval = setInterval(check, 30000);
        return () => clearInterval(interval);
    }, [location.pathname, isAuthenticated]);

    return null;
}

function ServerErrorToast() {
    const [msg, setMsg] = useState('');

    const show = useCallback((e) => {
        setMsg(e.detail?.message || 'Serverska greška, pokušajte ponovo.');
        setTimeout(() => setMsg(''), 4000);
    }, []);

    useEffect(() => {
        window.addEventListener('api:server-error', show);
        return () => window.removeEventListener('api:server-error', show);
    }, [show]);

    if (!msg) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-sm px-5 py-3 rounded-2xl shadow-lg">
            {msg}
        </div>
    );
}

export default function App() {
    return (
        <>
        <UserServiceHealthCheck />
        <ServerErrorToast />
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<RequireAuth><SmartDashboard /></RequireAuth>} />
            <Route path="/lessons/book" element={<RequireAuth><BookLesson /></RequireAuth>} />
            <Route path="/book-lesson" element={<RequireAuth><BookLesson /></RequireAuth>} />

            <Route path="/resources" element={<RequireAuth><Layout /></RequireAuth>}>
                <Route index element={<ResourceManagement />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="repairs" element={<Repairs />} />
                <Route path="instructors" element={<Instructors />} />
            </Route>

            <Route path="/users"              element={<RequireAdmin><UserManagement /></RequireAdmin>} />
            <Route path="/candidates"         element={<RequireAdmin><CandidateManagement /></RequireAdmin>} />
            <Route path="/theory-plans"       element={<RequireAdmin><TheoryPlansPage /></RequireAdmin>} />
            <Route path="/finance"            element={<RequireAdmin><FinanceDashboard /></RequireAdmin>} />
            <Route path="/instructor-dashboard" element={<RequireAuth><InstructorDashboard /></RequireAuth>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
            </>
    );
}