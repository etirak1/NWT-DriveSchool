import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import CandidateDashboard from './pages/CandidateDashboard';
import BookLesson from './pages/BookLesson';
import { isAdmin, getCurrentRole } from './auth/jwt';
import DashboardPage from './pages/DashboardPage';
import CandidateManagement from './pages/CandidateManagement';
import FinanceManagement from './pages/FinanceManagement';

function RequireAuth({ children }) {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

function SmartDashboard() {
    const role = getCurrentRole();
    if (role === 'CANDIDATE') return <CandidateDashboard />;
    return <Dashboard />;
}

function RequireAdmin({ children }) {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    if (!isAdmin()) return <Navigate to="/dashboard" replace />;
    return children;
}

export default function App() {
    const location = useLocation();
    const token = localStorage.getItem('token');

    // Logika: Pokaži nav samo ako postoji token i nismo na login/register stranici
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';
    const showNavbar = token && !isAuthPage;

    return (
        <>
            {/* GLOBALNI NAVBAR - Prikazuje se kondicionalno */}
            {showNavbar && (
                <nav style={{
                    background: '#1e293b',
                    padding: '12px 20px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    color: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>🏠 DriveSchool</Link>

                    {/* Link za finansije dostupan samo Adminu (dodatni security check na frontendu) */}
                    {isAdmin() && (
                        <Link to="/finance" style={{
                            background: '#3b82f6',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>💰 FINANSIJE I UPLATE</Link>
                    )}

                    <Link to="/resources" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>Resursi</Link>

                    <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' }}>
                        Uloga: {getCurrentRole()}
                    </div>
                </nav>
            )}

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
                    path="/finance"
                    element={
                        <RequireAdmin>
                            <FinanceManagement />
                        </RequireAdmin>
                    }
                />

                <Route
                    path="/lessons/book"
                    element={
                        <RequireAuth>
                            <BookLesson />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <RequireAdmin>
                            <UserManagement />
                        </RequireAdmin>
                    }
                />
                <Route
                    path="/resources"
                    element={
                        <RequireAdmin>
                            <DashboardPage />
                        </RequireAdmin>
                    }
                />
                <Route
                    path="/candidates"
                    element={
                        <RequireAdmin>
                            <CandidateManagement />
                        </RequireAdmin>
                    }
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
}