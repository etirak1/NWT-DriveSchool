import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';

import DashboardLayout from './layouts/DashboardLayout';

import DashboardPage from './pages/DashboardPage';
import VehiclePage from './pages/VehiclePage';
import RepairsPage from './pages/RepairsPage';
import InstructorPage from './pages/InstructorPage';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
      <Routes>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
        >

          <Route index element={<DashboardPage />} />

          <Route path="vehicles" element={<VehiclePage />} />

          <Route path="repairs" element={<RepairsPage />} />

          <Route path="instructors" element={<InstructorPage />} />

        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
  );
}