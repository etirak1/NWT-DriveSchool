import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import TheoryLessonsModal from '../components/TheoryLessonsModal';
import TrainingTimeline from '../components/TrainingTimeline';
import { getErrorMessage } from '../utils/helpers';
import { ErrorState, Spinner } from '../components/States';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';

import {
    LogOut,
    UserCheck,
    BookOpen,
    ChevronDown,
    ChevronUp,
    GraduationCap,
    Users,
    DollarSign
} from 'lucide-react';

export default function CandidateManagement() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const email = user.email;
    const role  = user.role;
    const queryClient = useQueryClient();

    const [expandedCandidate, setExpandedCandidate] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [theoryModalCandidate, setTheoryModalCandidate] = useState(null);
    const [timelineRefreshCount, setTimelineRefreshCount] = useState(0);
    const [inlineErrors, setInlineErrors] = useState({});
    const [inlineSuccess, setInlineSuccess] = useState({});

    const { data: candidates = [], isLoading: loading, isError: loadError, refetch: refetchCandidates } = useQuery({
        queryKey: ['candidates'],
        queryFn: () => api.get('/api/candidates').then(r => r.data),
    });

    const { data: instructors = [], isError: instructorsError } = useQuery({
        queryKey: ['instructors-list'],
        queryFn: () => api.get('/api/instructors').then(r => r.data),
    });
    const instructorsUnavailable = instructorsError;

    const toggleExpand = (candidateId) => {
        setExpandedCandidate(prev => prev === candidateId ? null : candidateId);
    };

    const assignInstructor = async (candidateId, instructorUserId) => {
        if (!instructorUserId) return;
        setInlineErrors(prev => ({ ...prev, [candidateId]: null }));
        try {
            await api.patch(`/api/candidates/${candidateId}/assign-instructor/${instructorUserId}`);
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            setInlineSuccess(prev => ({ ...prev, [candidateId]: 'Instruktor uspješno dodijeljen!' }));
            setTimeout(() => setInlineSuccess(prev => ({ ...prev, [candidateId]: null })), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Greška pri dodjeljivanju instruktora.';
            setInlineErrors(prev => ({ ...prev, [candidateId]: msg }));
            setTimeout(() => setInlineErrors(prev => ({ ...prev, [candidateId]: null })), 6000);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setErrorMsg('');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const showError = (msg) => {
        setErrorMsg(msg);
        setSuccessMsg('');
        setTimeout(() => setErrorMsg(''), 3000);
    };


    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header active="Kandidati" />
            <Spinner label="Učitavanje kandidata..." />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Header active="Kandidati" />

            <div className="max-w-5xl mx-auto px-4 py-8">
                {loadError && <ErrorState message="Greška pri učitavanju kandidata." onRetry={refetchCandidates} />}

                {successMsg && (
                    <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-100 text-sm font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                        {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 text-sm font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        {errorMsg}
                    </div>
                )}

                {!loadError && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Kandidati</h2>
                                <p className="text-sm text-slate-500 mt-0.5">{candidates.length} registrovanih kandidata</p>
                            </div>
                            <Link
                                to="/theory-plans"
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
                            >
                                <BookOpen size={15} />
                                Plan nastave
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {candidates.map(candidate => (
                                <div key={candidate.candidateId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        {/* Avatar + name */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
                                                <span className="text-white font-bold text-sm tracking-wide">
                                                    {(candidate.user?.firstName?.[0] || '').toUpperCase()}
                                                    {(candidate.user?.lastName?.[0] || '').toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">
                                                    {candidate.user?.firstName} {candidate.user?.lastName}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {candidate.assignedInstructor
                                                        ? `Instruktor: ${candidate.assignedInstructor.user?.firstName} ${candidate.assignedInstructor.user?.lastName}`
                                                        : 'Bez dodijeljenog instruktora'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-start gap-3 sm:gap-3">
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck size={15} className="text-slate-400 shrink-0" />
                                                    <select
                                                        className={`text-sm border rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white min-w-0 transition-colors ${
                                                            inlineErrors[candidate.candidateId] ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                                        }`}
                                                        value={candidate.assignedInstructor?.user?.userId || ''}
                                                        onChange={e => assignInstructor(candidate.candidateId, e.target.value)}
                                                      
                                                        disabled={instructorsUnavailable || !candidate.theoryExamPassed}
                                                        title={
                                                            instructorsUnavailable
                                                                ? 'Servis instruktora trenutno nije dostupan'
                                                                : !candidate.theoryExamPassed
                                                                    ? 'Instruktor se može dodijeliti tek nakon položenog teorijskog ispita'
                                                                    : ''
                                                        }
                                                    >
                                                        <option value="">
                                                            {instructorsUnavailable
                                                                ? 'Servis nedostupan'
                                                                : !candidate.theoryExamPassed
                                                                    ? 'Teorija nije položena'
                                                                    : 'Odaberi instruktora'}
                                                        </option>
                                                            ))
                                                    </select>
                                                </div>
                                                {inlineErrors[candidate.candidateId] && (
                                                    <p className="text-xs text-red-600 leading-snug pl-1">
                                                        {inlineErrors[candidate.candidateId]}
                                                    </p>
                                                )}
                                                {inlineSuccess[candidate.candidateId] && (
                                                    <p className="text-xs text-green-600 leading-snug pl-1">
                                                        {inlineSuccess[candidate.candidateId]}
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => toggleExpand(candidate.candidateId)}
                                                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors border ${
                                                    expandedCandidate === candidate.candidateId
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                                }`}
                                            >
                                                <BookOpen size={14} />
                                                Tok obuke
                                                {expandedCandidate === candidate.candidateId
                                                    ? <ChevronUp size={14} />
                                                    : <ChevronDown size={14} />
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    {expandedCandidate === candidate.candidateId && (
                                        <div className="border-t border-slate-100 p-5 bg-slate-50/60">
                                            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Tok obuke</h4>
                                            <TrainingTimeline
                                                candidate={candidate}
                                                onOpenTheory={(c) => setTheoryModalCandidate(c)}
                                                refreshToken={timelineRefreshCount}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {candidates.length === 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="py-16 flex flex-col items-center text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                                            <GraduationCap size={24} className="text-blue-400" />
                                        </div>
                                        <p className="text-base font-semibold text-slate-700 mb-1">Nema kandidata</p>
                                        <p className="text-sm text-slate-400">Još uvijek nema registrovanih kandidata.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {theoryModalCandidate && (
                <TheoryLessonsModal
                    candidate={theoryModalCandidate}
                    onClose={() => { setTheoryModalCandidate(null); setTimelineRefreshCount(c => c + 1); }}
                    onProgressUpdate={(candidateId, newPct) => {
                        queryClient.setQueryData(['candidates'], prev =>
                            (prev || []).map(c =>
                                c.candidateId === candidateId
                                    ? { ...c, progressPercentage: newPct }
                                    : c
                            )
                        );
                    }}
                />
            )}
        </div>
    );
}
