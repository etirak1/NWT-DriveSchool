import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { vehicleApi, repairApi, instructorApi } from '../services/api';
import Dashboard from '../components/Dashboard';
import { Spinner, ErrorState } from '../components/States';

export default function DashboardPage() {
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
    );
}