import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, LogOut, GraduationCap } from 'lucide-react';
import { isAdmin, getCurrentEmail, getCurrentRole } from '../auth/jwt';
import { Link } from 'react-router-dom';
import '../App.css';
import { useAsync } from '../hooks/useAsync';
import { vehicleApi, repairApi, instructorApi } from '../services/api';
import Dashboard from '../components/Dashboard';
import { Spinner, ErrorState } from '../components/States';

export default function DashboardPage() {
    const navigate = useNavigate();
    const email = getCurrentEmail();
    const role = getCurrentRole();

    const { data: vRes, loading: lv, error: ev, refetch: refetchV } = useAsync(() => vehicleApi.getAll());
    const { data: rRes, loading: lr } = useAsync(() => repairApi.getAll());
    const { data: iRes, loading: li } = useAsync(() => instructorApi.getAll());

    const vehicles = vRes?.data || [];
    const repairs = rRes?.data || [];
    const instructors = iRes?.data || [];

    const loading = lv || lr || li;

    if (loading) return <Spinner label="Loading resources..." />;
    if (ev) return <ErrorState message={ev} onRetry={refetchV} />;

    return (
        <div className="min-h-screen bg-slate-50">

            <header className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800">{email}</p>
                            <span className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700">{role}</span>
                        </div>
                        <button
                            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutDashboard className="text-blue-500" size={24} />
                        <h2 className="text-xl font-bold text-slate-900">Resource Management</h2>
                    </div>
                    <p className="text-slate-500 text-sm mb-5">
                        Overview of driving school vehicles and instructors
                    </p>
                    <Dashboard
                        vehicles={vehicles}
                        repairs={repairs}
                        instructors={instructors}
                    />
                </div>
            </main>
        </div>
    );
}