import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { LogOut, UserCheck, BookOpen, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TheoryLessonsModal from '../components/TheoryLessonsModal';
import TrainingTimeline from '../components/TrainingTimeline';
import { getErrorMessage } from '../utils/helpers';
import { ErrorState, Spinner } from '../components/States';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

    if (loading) return <Spinner label="Učitavanje kandidata..." />;

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
                {loadError && <ErrorState message="Greška pri učitavanju kandidata." onRetry={refetchCandidates} />}
                {successMsg && (
                    <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-100 text-sm">{successMsg}</div>
                )}
                {errorMsg && (
                    <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-100 text-sm">{errorMsg}</div>
                )}

                {!loadError && <>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Kandidati</h2>
                    <Link
                        to="/theory-plans"
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                    >
                        <BookOpen size={15} />
                        Plan nastave
                    </Link>
                </div>

                <div className="space-y-4">
                    {candidates.map(candidate => (
                        <div key={candidate.candidateId} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-blue-600 font-bold text-sm">
                                            {(candidate.user?.firstName?.[0] || '').toUpperCase()}{(candidate.user?.lastName?.[0] || '').toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="font-semibold text-slate-800 uppercase tracking-wide">
                                        {candidate.user?.firstName} {candidate.user?.lastName}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <UserCheck size={16} className="text-slate-400 shrink-0" />
                                            <select
                                                className={`text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 ${inlineErrors[candidate.candidateId] ? 'border-red-400' : 'border-slate-200'}`}
                                                value={candidate.assignedInstructor?.user?.userId || ''}
                                                onChange={e => assignInstructor(candidate.candidateId, e.target.value)}
                                                disabled={instructorsUnavailable}
                                                title={instructorsUnavailable ? 'Servis instruktora trenutno nije dostupan' : ''}
                                            >
                                                <option value="">{instructorsUnavailable ? 'Servis nedostupan' : 'Odaberi instruktora'}</option>
                                                {instructors
                                                    .filter(inst => inst.availabilityNote !== 'UNAVAILABLE')
                                                    .map(inst => (
                                                        <option key={inst.instructorId} value={inst.user?.userId}>
                                                            {inst.user?.firstName} {inst.user?.lastName}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        {inlineErrors[candidate.candidateId] && (
                                            <p className="text-xs text-red-600 max-w-xs leading-snug">
                                                ⚠️ {inlineErrors[candidate.candidateId]}
                                            </p>
                                        )}
                                        {inlineSuccess[candidate.candidateId] && (
                                            <p className="text-xs text-green-600 max-w-xs leading-snug">
                                                ✓ {inlineSuccess[candidate.candidateId]}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => toggleExpand(candidate.candidateId)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg"
                                    >
                                        <BookOpen size={14} />
                                        Tok obuke
                                        {expandedCandidate === candidate.candidateId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>
                                </div>
                            </div>

                            {expandedCandidate === candidate.candidateId && (
                                <div className="border-t border-slate-100 p-5 bg-slate-50">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Tok obuke</h4>
                                    <TrainingTimeline
                                        candidate={candidate}
                                        onOpenTheory={(c) => setTheoryModalCandidate(c)}
                                        refreshToken={timelineRefreshCount}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                </>}
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
