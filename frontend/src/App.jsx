import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
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

// ─── Guard komponente ─────────────────────────────────────────────────────────

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



export default function App() {
    return (
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
    );
}