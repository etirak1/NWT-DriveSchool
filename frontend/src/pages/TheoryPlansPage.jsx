import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { getErrorMessage } from '../utils/helpers';
import { BookOpen, Plus, Calendar, Clock, ChevronRight, Trash2, Users } from 'lucide-react';
import Header from '../components/Header';
import TheoryPlanCreateModal from '../components/TheoryPlanCreateModal';
import TheoryPlanViewModal from '../components/TheoryPlanViewModal';
import { financeApi } from '../services/financeApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

export default function TheoryPlansPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [error, setError] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [deletingPlanId, setDeletingPlanId] = useState(null);

    const { data: plans = [], isLoading: plansLoading } = useQuery({
        queryKey: ['theoryPlans'],
        queryFn: () => api.get('/api/theory-plans').then(r => r.data),
    });

    const { data: candidates = [] } = useQuery({
        queryKey: ['candidates'],
        queryFn: () => api.get('/api/candidates').then(r => r.data),
    });

    const { data: enrollmentEligibleIds = null } = useQuery({
        queryKey: ['enrollmentEligible'],
        queryFn: () => financeApi.getAll().then(r => {
            const accounts = r.data || [];
            return accounts.filter(a => a.enrollmentEligible).map(a => a.candidateId);
        }),
        staleTime: 0,
        refetchOnMount: 'always',
    });

    const loading = plansLoading;

    const deletePlan = async (planId) => {
        try {
            await api.delete(`/api/theory-plans/${planId}`);
            setDeletingPlanId(null);
            queryClient.invalidateQueries({ queryKey: ['theoryPlans'] });
        } catch (e) {
            setError(e.response?.data?.message || 'Greška pri brisanju grupe.');
            setDeletingPlanId(null);
        }
    };

    const DAY_LABELS = {
        MONDAY: 'Ponedjeljak', TUESDAY: 'Utorak', WEDNESDAY: 'Srijeda',
        THURSDAY: 'Cetvrtak', FRIDAY: 'Petak', SATURDAY: 'Subota', SUNDAY: 'Nedjelja',
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Header active="Plan nastave" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link
                    to="/candidates"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
                >
                    <ArrowLeft size={16} />
                    Nazad na kandidate
                </Link>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-200">
                            <BookOpen className="text-white" size={22} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Plan teorijske nastave</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Pregled svih grupa i rasporeda</p>
                        </div>
                    </div>


                    <button
                        onClick={() => setCreateOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-200 transition-colors"
                    >

                        <Plus size={16} /> Nova grupa
                    </button>
                </div>



                {error && (
                    <div className="mb-5 bg-red-50 text-red-700 px-5 py-3.5 rounded-2xl border border-red-200 text-sm shadow-sm">{error}</div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Učitavanje...</span>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
                        <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center mb-4">
                            <BookOpen className="text-blue-400" size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Nema planova nastave</h3>
                        <p className="text-slate-500 text-sm mt-1">Kliknite "Nova grupa" da kreirate prvi plan.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {plans.map(plan => {
                            const planCandidates = plan.candidates || [];
                            const day1 = DAY_LABELS[plan.day1OfWeek] || plan.day1OfWeek;
                            const day2 = DAY_LABELS[plan.day2OfWeek] || plan.day2OfWeek;
                            const time = plan.startTime ? String(plan.startTime).slice(0, 5) : '';

                            return (
                                <div
                                    key={plan.id}
                                    className="bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                        {planCandidates.length}
                                                    </span>
                                                    <h3 className="font-bold text-slate-900 text-base truncate">{plan.groupName}</h3>
                                                </div>

                                                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                        <Calendar size={11} className="text-slate-400" />
                                                        Početak: {plan.startDate}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                        <Clock size={11} className="text-slate-400" />
                                                        {day1} i {day2} u {time}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                        <BookOpen size={11} className="text-slate-400" />
                                                        {plan.totalLessons} časova, {plan.lessonsPerSession} po terminu
                                                    </span>
                                                </div>

                                                {planCandidates.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                            <Users size={11} /> Kandidati ({planCandidates.length})
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {planCandidates.map(c => {
                                                                const name = c.user
                                                                    ? `${c.user.firstName} ${c.user.lastName}`
                                                                    : `#${c.candidateId}`;
                                                                return (
                                                                    <span
                                                                        key={c.candidateId}
                                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 font-medium border border-blue-100"
                                                                    >
                                                                        {name}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => setSelectedPlan(plan)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold transition-colors border border-blue-100"
                                                >
                                                    Pregled
                                                    <ChevronRight size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingPlanId(plan.id)}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-colors border border-red-100"
                                                    title="Obriši grupu"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {createOpen && (
                <TheoryPlanCreateModal
                    candidates={candidates}
                    assignedCandidateIds={plans.flatMap(p => (p.candidates || []).map(c => c.candidateId))}
                    enrollmentEligibleIds={enrollmentEligibleIds}
                    onClose={() => setCreateOpen(false)}
                    onCreated={() => { setCreateOpen(false); queryClient.invalidateQueries({ queryKey: ['theoryPlans'] }); }}
                />
            )}

            {selectedPlan && (
                <TheoryPlanViewModal
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                />
            )}

            {deletingPlanId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5">
                            <h3 className="font-bold text-white text-base">Obriši grupu?</h3>
                            <p className="text-red-100 text-sm mt-1">
                                Ova akcija će obrisati grupu i sve njene termine. Ne može se poništiti.
                            </p>
                        </div>
                        <div className="p-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeletingPlanId(null)}
                                className="px-4 py-2.5 text-sm text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                            >
                                Odustani
                            </button>
                            <button
                                onClick={() => deletePlan(deletingPlanId)}
                                className="px-4 py-2.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors shadow-sm"
                            >
                                Obriši
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
