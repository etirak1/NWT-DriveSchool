import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { BookOpen, Plus, Users, Calendar, Clock, ArrowLeft, LogOut, ChevronRight, Trash2 } from 'lucide-react';
import { getCurrentEmail, getCurrentRole } from '../auth/jwt';
import TheoryPlanCreateModal from '../components/TheoryPlanCreateModal';
import TheoryPlanViewModal from '../components/TheoryPlanViewModal';
import { financeApi } from '../services/financeApi';

export default function TheoryPlansPage() {
    const navigate = useNavigate();
    const email = getCurrentEmail();
    const role = getCurrentRole();

    const [plans, setPlans] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [enrollmentEligibleIds, setEnrollmentEligibleIds] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [deletingPlanId, setDeletingPlanId] = useState(null);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [plansRes, candRes] = await Promise.all([
                api.get('/api/theory-plans'),
                api.get('/api/candidates'),
            ]);
            setPlans(plansRes.data);
            setCandidates(candRes.data);

            // Učitaj finance status da znamo ko je platio upisninu
            try {
                const accounts = await financeApi.getAll();
                const eligible = accounts
                    .filter(a => a.enrollmentEligible)
                    .map(a => a.candidateId);
                setEnrollmentEligibleIds(eligible);
            } catch {
                setEnrollmentEligibleIds(null); // finance nije dostupan, ne blokiramo
            }
        } catch (e) {
            setError('Greška pri učitavanju planova nastave.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const deletePlan = async (planId) => {
        try {
            await api.delete(`/api/theory-plans/${planId}`);
            setDeletingPlanId(null);
            loadData();
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
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm"
                    >
                        <ArrowLeft size={16} /> Nazad na početnu
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
                            <LogOut size={16} /> Odjava
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500 w-10 h-10 rounded-lg flex items-center justify-center">
                            <BookOpen className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Plan teorijske nastave</h2>
                            <p className="text-sm text-slate-500">Pregled svih grupa i rasporeda</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm"
                    >
                        <Plus size={16} /> Nova grupa
                    </button>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-100 text-sm">{error}</div>
                )}

                {loading ? (
                    <div className="text-center py-16 text-slate-400">Učitavanje...</div>
                ) : plans.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                        <div className="inline-flex w-14 h-14 rounded-full bg-indigo-50 items-center justify-center mb-3">
                            <BookOpen className="text-indigo-400" size={24} />
                        </div>
                        <h3 className="font-semibold text-slate-800">Nema planova nastave</h3>
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
                                    className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors overflow-hidden"
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                        {planCandidates.length}
                                                    </span>
                                                    <h3 className="font-bold text-slate-900 truncate">{plan.groupName}</h3>
                                                </div>

                                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        Početak: {plan.startDate}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {day1} i {day2} u {time}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen size={12} />
                                                        {plan.totalLessons} časova, {plan.lessonsPerSession} po terminu
                                                    </span>
                                                </div>

                                                {planCandidates.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                                                            <Users size={11} /> Kandidati ({planCandidates.length}):
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {planCandidates.map(c => {
                                                                const name = c.user
                                                                    ? `${c.user.firstName} ${c.user.lastName}`
                                                                    : `#${c.candidateId}`;
                                                                return (
                                                                    <span
                                                                        key={c.candidateId}
                                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-medium"
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
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold"
                                                >
                                                    Pregled
                                                    <ChevronRight size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingPlanId(plan.id)}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold"
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
                    onCreated={() => { setCreateOpen(false); loadData(); }}
                />
            )}

            {selectedPlan && (
                <TheoryPlanViewModal
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                />
            )}

            {deletingPlanId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-2">Obriši grupu?</h3>
                        <p className="text-sm text-slate-500 mb-5">
                            Ova akcija će obrisati grupu i sve njene termine. Ne može se poništiti.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeletingPlanId(null)}
                                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                            >
                                Odustani
                            </button>
                            <button
                                onClick={() => deletePlan(deletingPlanId)}
                                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
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
