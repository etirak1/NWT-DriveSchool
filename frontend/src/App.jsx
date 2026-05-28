import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import CandidateDashboard from './pages/CandidateDashboard';
import BookLesson from './pages/BookLesson';
import { isAdmin, getCurrentRole } from './auth/jwt';
import DashboardPage from './pages/DashboardPage';
import CandidateManagement from './pages/CandidateManagement';
import InstructorDashboard from './pages/InstructorDashboard';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
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
        path="/lessons/book"
        element={
          <RequireAuth>
            <BookLesson />
          </RequireAuth>
        }
      />
      <Route
        path="/book-lesson"
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
      <Route
        path="/instructor-dashboard"
        element={
          <RequireAuth>
            <InstructorDashboard />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}