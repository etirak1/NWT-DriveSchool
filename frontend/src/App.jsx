import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import CandidateDashboard from './pages/CandidateDashboard';
import { isAdmin, getCurrentRole } from './auth/jwt';
import ResourceManagement from './pages/DashboardPage.jsx';
//import Layout from './layouts/DashboardLayout.jsx'
import Vehicles from './pages/VehiclePage';
import Repairs from './pages/RepairsPage';
import Instructors from './pages/InstructorPage';
import CandidateManagement from './pages/CandidateManagement';

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
  return (
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
        path="/users"
        element={
          <RequireAdmin>
            <UserManagement />
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
  );
}