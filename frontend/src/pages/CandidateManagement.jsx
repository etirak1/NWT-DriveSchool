import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { LogOut, UserCheck, BookOpen, ChevronDown, ChevronUp, ArrowLeft, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TheoryLessonsModal from '../components/TheoryLessonsModal';
import TrainingTimeline from '../components/TrainingTimeline';
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

    if (loading) return <Spinner label="Učitavanje kandidata..." />;

    return (
        <div className="min-h-screen bg-slate-50">

            <header
                className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1a3a8f 0%, #1e5adb 50%, #3b82f6 100%)' }}
            >

                <div
                    className="absolute top-0 right-0 w-96 h-full rounded-full blur-3xl pointer-events-none"
                    style={{ background: 'rgba(147,197,253,0.1)', transform: 'translate(30%, -20%)' }}
                />

                <div className="relative max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">

                        <div className="flex items-center gap-3">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
                            >
                                <GraduationCap className="text-white" size={22} />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-white leading-none">DriveSchool</h1>
                                <p className="text-xs text-blue-200 mt-0.5">Kandidati</p>
                            </div>
                        </div>

                        <Link
                            to="/dashboard"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-100 hover:text-white transition-all duration-200"
                            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        >
                            <ArrowLeft size={15} />
                            <span className="hidden sm:inline">Nazad na početnu</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <p className="text-sm font-semibold text-white leading-none">{email}</p>
                            <span
                                className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold mt-1"
                                style={{ background: 'rgba(255,255,255,0.15)', color: '#bfdbfe', border: '1px solid rgba(255,255,255,0.25)' }}
                            >
                                {role}
                            </span>
                        </div>
                        <button
                            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-100 hover:text-white transition-all duration-200"
                            style={{ background: 'rgba(255,255,255,0.1)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Odjava</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-10">
                {loadError && <ErrorState message="Greška pri učitavanju kandidata." onRetry={refetchCandidates} />}

                {successMsg && (
                    <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-100 text-sm">{successMsg}</div>
                )}
                {errorMsg && (
                    <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 text-sm">{errorMsg}</div>
                )}

                {!loadError && (
                    <>

                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)', boxShadow: '0 4px 15px rgba(59,130,246,0.35)' }}
                                >
                                    <UserCheck className="text-white" size={18} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">Kandidati</h2>
                            </div>

                            <Link
                                to="/theory-plans"
                                className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                                style={{
                                    background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)',
                                    boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #1a4fc4 0%, #2563eb 100%)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.5)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(59,130,246,0.4)';
                                    e.currentTarget.style.transform = '';
                                }}
                            >
                                <BookOpen size={15} />
                                Plan nastave
                            </Link>
                        </div>

                        <p className="text-slate-500 text-sm mb-8">
                            Pregledajte kandidate, dodijelite instruktore i pratite tok obuke.
                        </p>

                        <div className="space-y-4">
                            {candidates.map(candidate => (
                                <div
                                    key={candidate.candidateId}
                                    className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden transition-all duration-300"
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.12)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = '#f1f5f9';
                                        e.currentTarget.style.boxShadow = '';
                                        e.currentTarget.style.transform = '';
                                    }}
                                >
                                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">

                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
                                            >
                                                <span className="text-blue-500 font-bold text-sm">
                                                    {(candidate.user?.firstName?.[0] || '').toUpperCase()}{(candidate.user?.lastName?.[0] || '').toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="font-bold text-slate-900 uppercase tracking-wide">
                                                {candidate.user?.firstName} {candidate.user?.lastName}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck size={16} className="text-slate-400 shrink-0" />
                                                    <select
                                                        className={`text-sm border rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 transition-colors ${inlineErrors[candidate.candidateId] ? 'border-red-400' : 'border-slate-200'}`}
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
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
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
                    </>
                )}
            </main>

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