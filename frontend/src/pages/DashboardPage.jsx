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
        queryFn: async () => {
            const r = await instructorApi.getAll();
            if (Array.isArray(r.data?.content)) return r.data.content;
            if (Array.isArray(r.data)) return r.data;
            return [];
        },
    });

    const loading = lv || lr || li;

    if (loading) return <Spinner label="Učitavanje resursa..." />;
    if (ev) return <ErrorState message="Greška pri učitavanju" onRetry={refetchV} />;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-6">
            <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <LayoutDashboard size={20} className="text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Upravljanje resursima</h2>
                    <p className="text-slate-500 text-sm">Pregled instruktora i vozila auto-škole</p>
                </div>
            </div>
            <div className="mt-5">
                <Dashboard
                    vehicles={vehicles}
                    repairs={repairs}
                    instructors={instructors}
                />
            </div>
        </div>
    );
}
