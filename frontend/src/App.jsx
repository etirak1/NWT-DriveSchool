import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { api } from './api/client';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import CandidateDashboard from './pages/CandidateDashboard';
import BookLesson from './pages/BookLesson';
import {isAdmin, getCurrentRole, isTokenValid} from './auth/jwt';
import DashboardPage from './pages/DashboardPage';
import CandidateManagement from './pages/CandidateManagement';
import TheoryPlansPage from './pages/TheoryPlansPage';
import InstructorDashboard from './pages/InstructorDashboard';
import FinanceDashboard from './pages/FinanceDashboard'; // ← NOVO
import Layout from './layouts/DashboardLayout.jsx'
import ResourceManagement from './pages/DashboardPage.jsx';
import Vehicles from './pages/VehiclePage';
import Repairs from './pages/RepairsPage';
import Instructors from './pages/InstructorPage';


function RequireAuth({ children }) {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid()) {
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
    return children;
}

function SmartDashboard() {
    const role = getCurrentRole();
    if (role === 'CANDIDATE') return <CandidateDashboard />;
    if (role === 'INSTRUCTOR') return <InstructorDashboard />;
    return <Dashboard />;
}

function RequireAdmin({ children }) {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid()) {
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
    if (!isAdmin()) return <Navigate to="/dashboard" replace />;
    return children;
}

function UserServiceHealthCheck() {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoginPage = location.pathname === '/login' ||
        location.pathname === '/register';

    useEffect(() => {
        if (isLoginPage) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const check = async () => {
            try {
                await api.get('/api/announcements');
            } catch (err) {
                if (!err.response || err.response.status === 500 ||
                    err.response.status === 502 || err.response.status === 503 ||
                    err.code === 'ECONNABORTED') {
                    localStorage.removeItem('token');
                    navigate('/login', {
                        state: { message: 'Servis trenutno nije dostupan. Pokušajte kasnije.' }
                    });
                }
            }
        };
        check();
        const interval = setInterval(check, 30000);
        return () => clearInterval(interval);
    }, [location.pathname]);

    return null;
}

export default function App() {
    return (
        <>
        <UserServiceHealthCheck />
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/dashboard"
                element={
                    <RequireAuth>
                        <SmartDashboard />
                    </RequireAuth>
                }
            />
            <Route
                path="/lessons/book"
                element={<RequireAuth><BookLesson /></RequireAuth>}
            />
            <Route
                path="/book-lesson"
                element={<RequireAuth><BookLesson /></RequireAuth>}
            />
            <Route
                path="/users"
                element={<RequireAdmin><UserManagement /></RequireAdmin>}
            />
            <Route
                path="/resources"
                element={
                    <RequireAuth>
                        <Layout />
                    </RequireAuth>
                }
            >
                <Route index element={<ResourceManagement />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="repairs" element={<Repairs />} />
                <Route path="instructors" element={<Instructors />} />
            </Route>
            <Route
                path="/candidates"
                element={<RequireAdmin><CandidateManagement /></RequireAdmin>}
            />
            <Route
                path="/theory-plans"
                element={<RequireAdmin><TheoryPlansPage /></RequireAdmin>}
            />
            <Route
                path="/instructor-dashboard"
                element={<RequireAuth><InstructorDashboard /></RequireAuth>}
            />

            {/* ── Finansijski servis ─────────────────────────────────────────── */}
            <Route
                path="/finance"
                element={
                    <RequireAdmin>
                        <FinanceDashboard />
                    </RequireAdmin>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
            </>
    );
}


