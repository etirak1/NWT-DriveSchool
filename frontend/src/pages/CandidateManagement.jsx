import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { GraduationCap, LogOut, UserCheck, BookOpen, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { getCurrentEmail, getCurrentRole } from '../auth/jwt';
import TheoryLessonsModal from '../components/TheoryLessonsModal';

const PHASE_TYPES = ['TEORIJSKI DIO', 'PRAKTIČNA VOŽNJA', 'POLIGON', 'GRADSKA VOŽNJA', 'ISPIT'];
const PHASE_STATUSES = ['U TOKU', 'POLOŽENO', 'NEPOLOŽENO', 'ZAKAZANO'];

export default function CandidateManagement() {
    const navigate = useNavigate();
    const email = getCurrentEmail();
    const role = getCurrentRole();

    const [candidates, setCandidates] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCandidate, setExpandedCandidate] = useState(null);
    const [phases, setPhases] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [theoryModalCandidate, setTheoryModalCandidate] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [candRes, instRes] = await Promise.all([
                    api.get('/api/candidates'),
                    api.get('/api/instructors')
                ]);
                setCandidates(candRes.data);
                setInstructors(instRes.data);
            } catch (err) {
                setErrorMsg('Greška pri učitavanju podataka.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const loadPhases = async (candidateId) => {
        if (phases[candidateId]) return;
        try {
            const res = await api.get(`/api/phases/candidate/${candidateId}`);
            setPhases(prev => ({ ...prev, [candidateId]: res.data }));
        } catch (err) {
            setPhases(prev => ({ ...prev, [candidateId]: [] }));
        }
    };

    const toggleExpand = async (candidateId) => {
        if (expandedCandidate === candidateId) {
            setExpandedCandidate(null);
        } else {
            setExpandedCandidate(candidateId);
            await loadPhases(candidateId);
        }
    };
    const assignInstructor = async (candidateId, instructorUserId) => {
        if (!instructorUserId) return;
        try {
            await api.patch(`/api/candidates/${candidateId}/assign-instructor/${instructorUserId}`);
            const res = await api.get('/api/candidates');
            setCandidates(res.data);
            showSuccess('Instruktor uspješno dodijeljen!');
        } catch (err) {
            showError('Greška pri dodjeljivanju instruktora.');
        }
    };

    const addPhase = async (candidateId, phaseType, status) => {
        const existing = phases[candidateId] || [];
        if (existing.some(p => p.phaseType === phaseType)) {
            throw new Error(`Faza "${phaseType}" već postoji za ovog kandidata.`);
        }
        await api.post('/api/phases', {
            candidate: { candidateId },
            phaseType,
            status,
            dateCompleted: status === 'POLOŽENO' ? new Date().toISOString().split('T')[0] : null
        });
        const res = await api.get(`/api/phases/candidate/${candidateId}`);
        setPhases(prev => ({ ...prev, [candidateId]: res.data }));
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

    if (loading) return <div className="p-10 text-center">Učitavanje...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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

            <div className="max-w-5xl mx-auto px-4 py-8">
                {successMsg && (
                    <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-100 text-sm">{successMsg}</div>
                )}
                {errorMsg && (
                    <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-100 text-sm">{errorMsg}</div>
                )}

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
                            <div className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-800">
                                        {candidate.user?.firstName} {candidate.user?.lastName}
                                    </p>
                                    <p className="text-sm text-slate-500">{candidate.user?.email || '-'}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Napredak: <span className="font-medium text-blue-600">{candidate.progressPercentage}%</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <UserCheck size={16} className="text-slate-400" />
                                        <select
                                            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={candidate.assignedInstructor?.user?.userId || ''}
                                            onChange={e => assignInstructor(candidate.candidateId, e.target.value)}
                                        >
                                            <option value="">Odaberi instruktora</option>
                                            {instructors.map(inst => (
                                                <option key={inst.instructorId} value={inst.user?.userId}>
                                                    {inst.user?.firstName} {inst.user?.lastName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setTheoryModalCandidate(candidate)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium"
                                    >
                                        <GraduationCap size={14} />
                                        Teorija
                                    </button>
                                    <button
                                        onClick={() => toggleExpand(candidate.candidateId)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg"
                                    >
                                        <BookOpen size={14} />
                                        Faze
                                        {expandedCandidate === candidate.candidateId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>
                                </div>
                            </div>

                            {expandedCandidate === candidate.candidateId && (
                                <div className="border-t border-slate-100 p-5 bg-slate-50">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Faze obuke</h4>
                                    {phases[candidate.candidateId]?.length > 0 ? (
                                        <div className="space-y-2 mb-4">
                                            {phases[candidate.candidateId].map(phase => (
                                                <div key={phase.phaseId} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-slate-200">
                                                    <span className="text-sm font-medium text-slate-700">{phase.phaseType}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                                        phase.status === 'POLOŽENO' ? 'bg-green-100 text-green-700' :
                                                        phase.status === 'NEPOLOŽENO' ? 'bg-red-100 text-red-700' :
                                                        phase.status === 'U TOKU' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {phase.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic mb-4">Nema dodanih faza.</p>
                                    )}
                                    <AddPhaseForm candidateId={candidate.candidateId} onAdd={addPhase} existingPhases={phases[candidate.candidateId] || []} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {theoryModalCandidate && (
                <TheoryLessonsModal
                    candidate={theoryModalCandidate}
                    onClose={() => setTheoryModalCandidate(null)}
                />
            )}

        </div>
    );
}

function AddPhaseForm({ candidateId, onAdd }) {
    const [phaseType, setPhaseType] = useState(PHASE_TYPES[0]);
    const [status, setStatus] = useState(PHASE_STATUSES[0]);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    const handleAdd = async () => {
        setSaving(true);
        setMsg(null);
        try {
            await onAdd(candidateId, phaseType, status);
            setMsg({ text: 'Faza uspješno dodana!', type: 'success' });
        } catch (err) {
            const text = err.response?.data?.message || err.message || 'Greška pri dodavanju faze.';
            setMsg({ text, type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(null), 3000);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
                <select
                    value={phaseType}
                    onChange={e => setPhaseType(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {PHASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {PHASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                    onClick={handleAdd}
                    disabled={saving}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? 'Dodavanje...' : '+ Dodaj fazu'}
                </button>
            </div>
            {msg && (
                <p className={`text-xs px-2 py-1 rounded ${msg.type === 'success' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                    {msg.text}
                </p>
            )}
        </div>
    );
}