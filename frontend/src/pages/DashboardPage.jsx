import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { vehicleApi, repairApi, instructorApi } from '../services/api';
import Dashboard from '../components/Dashboard';
import { Spinner, ErrorState } from '../components/States';

export default function DashboardPage() {
    const { data: vehicles = [], isLoading: lv, isError: ev, refetch: refetchV } = useQuery({
        queryKey: ['vehicles'],
        queryFn: () => vehicleApi.getAll().then(r => r.data || []),
    });

    const { data: repairs = [], isLoading: lr } = useQuery({
        queryKey: ['repairs'],
        queryFn: () => repairApi.getAll().then(r => r.data || []),
    });

    const { data: instructors = [], isLoading: li } = useQuery({
        queryKey: ['instructors'],
        queryFn: () => instructorApi.getAll().then(r => r.data?.content || r.data || []),
    });

    const loading = lv || lr || li;

    if (loading) return <Spinner label="Učitavanje resursa..." />;
    if (ev) return <ErrorState message="Greška pri učitavanju" onRetry={refetchV} />;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-1">
                <LayoutDashboard className="text-blue-500" size={24} />
                <h2 className="text-xl font-bold text-slate-900">Upravljanje resursima</h2>
            </div>
            <p className="text-slate-500 text-sm mb-5">
                Pregled instruktora i vozila auto-škole
            </p>
            <Dashboard
                vehicles={vehicles}
                repairs={repairs}
                instructors={instructors}
            />
        </div>
    );
}
