import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    GraduationCap, LogOut, CheckCircle, Clock, BookOpen,
    ChevronLeft, ChevronRight, MessageSquare, TrendingUp,
    DollarSign, AlertCircle, Plus, Car
} from 'lucide-react';
import { api } from '../api/client';
import { getCurrentUserId, getCurrentEmail, getCurrentRole } from '../auth/jwt';
import FeedbackModal from '../components/FeedbackModal';
import RescheduleModal from '../components/RescheduleModal';

const PHASE_COLORS = {
    'POLOŽENO':   'bg-green-100 text-green-700',
    'U TOKU':     'bg-blue-100 text-blue-700',
    'NEPOLOŽENO': 'bg-red-100 text-red-700',
    'ZAKAZANO':   'bg-yellow-100 text-yellow-700',
};

export default function CandidateDashboard() {
    const navigate = useNavigate();
    const userId = getCurrentUserId();
    const email  = getCurrentEmail();
    const role   = getCurrentRole();

    const [candidate,        setCandidate]        = useState(null);
    const [phases,           setPhases]           = useState([]);
    const [payments,         setPayments]         = useState([]);
    const [account,          setAccount]          = useState(null);
    const [announcements,    setAnnouncements]    = useState([]);
    const [pageData,         setPageData]         = useState({ content: [], totalPages: 0, number: 0 });
    const [loading,          setLoading]          = useState(true);
    const [alreadyRated,     setAlreadyRated]     = useState(false);
    const [showFeedback,     setShowFeedback]     = useState(false);
    const [activeSection,    setActiveSection]    = useState('overview');
    const [drivingCompleted,  setDrivingCompleted]  = useState(0);
    const [theoryCompleted,   setTheoryCompleted]   = useState(0);
    const [rescheduleLesson,  setRescheduleLesson]  = useState(null);

    const fetchLessons = async (page = 0) => {
        try {
            const res = await api.get(
                `/api/lessons/my-lessons?userId=${userId}&page=${page}&size=5&sortBy=dateTime&sortDir=desc`
            );
            setPageData(res.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const candRes = await api.get(`/api/candidates/${userId}`);
                const cand = candRes.data;
                setCandidate(cand);

                const candId = cand.candidate?.candidateId || cand.candidateId;

                await fetchLessons(0);

                // Driving progress
                try {
                    const allLessons = await api.get(
                        `/api/lessons/my-lessons?userId=${userId}&page=0&size=100&sortBy=dateTime&sortDir=desc`
                    );
                    const count = (allLessons.data.content || []).filter(l => l.status === 'ODRAĐENO').length;
                    setDrivingCompleted(count);
                } catch (e) { /* ignore */ }

                // Theory progress
                try {
                    const theoryRes = await api.get(`/api/theory-lessons/candidate/${candId}`);
                    const tCount = (theoryRes.data || []).filter(l => l.completed).length;
                    setTheoryCompleted(tCount);
                } catch (e) { /* ignore */ }

                // Phases
                try {
                    const phaseRes = await api.get(`/api/phases/candidate/${candId}`);
                    setPhases(phaseRes.data);
                } catch (e) { /* phases optional */ }

                // Finance
                try {
                    const accRes = await api.get(`/api/accounts/${userId}`);
                    setAccount(accRes.data);
                    setPayments(accRes.data.payments || []);
                } catch (e) { /* finance optional */ }

                // Announcements
                try {
                    const annRes = await api.get('/api/announcements');
                    setAnnouncements(annRes.data);
                } catch (e) { /* announcements optional */ }

                // Feedback eligibility
                try {
                    const ratedRes = await api.get(`/api/feedbacks/candidate/${candId}/exists`);
                    setAlreadyRated(ratedRes.data);
                } catch (e) { /* ignore */ }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const rule               = candidate?.rule;
    const theoryTotal        = rule?.minTheoryLessons    ?? 40;
    const drivingTotal       = rule?.minPracticalLessons ?? 40;
    const theoryPct          = theoryTotal  > 0 ? Math.round((theoryCompleted  / theoryTotal)  * 100) : 0;
    const drivingPct         = drivingTotal > 0 ? Math.round((drivingCompleted / drivingTotal) * 100) : 0;
    const allDone            = theoryPct >= 100 && drivingPct >= 100;

    const totalAmount   = account?.totalAmount   ?? 0;
    const remainingDebt = account?.remainingDebt ?? 0;
    const amountPaid    = totalAmount - remainingDebt;
    const paymentPct    = totalAmount > 0 ? Math.round((amountPaid / totalAmount) * 100) : 0;

    const navItems = [
        { id: 'overview',      label: 'Overview'      },
        { id: 'progress',      label: 'Progress'      },
        { id: 'finances',      label: 'Finances'      },
        { id: 'announcements', label: 'Announcements' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500 text-sm">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">

            <header className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
                            <GraduationCap className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">DriveSchool</h1>
                            <p className="text-xs text-slate-500">Candidate Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800">{email}</p>
                            <span className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                                {role || 'CANDIDATE'}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4">
                    <nav className="flex gap-1 border-t border-slate-100">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeSection === item.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

                {/* ── OVERVIEW ── */}
                {activeSection === 'overview' && (
                    <>
                        {/* Completion banner */}
                        {allDone && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-800">Training complete!</p>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {alreadyRated
                                            ? 'You have already rated your instructor.'
                                            : 'Rate your instructor and share your experience.'}
                                    </p>
                                </div>
                                {!alreadyRated && (
                                    <button
                                        onClick={() => setShowFeedback(true)}
                                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                    >
                                        <MessageSquare size={16} /> Rate instructor
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Theory progress card */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <BookOpen size={16} className="text-purple-500" />
                                Theory lessons
                            </h2>
                            <div className="grid grid-cols-3 gap-4 mb-5">
                                {[
                                    { label: 'Completed',      value: theoryCompleted,               color: 'text-green-600'  },
                                    { label: 'Total required', value: theoryTotal,                    color: 'text-slate-800'  },
                                    { label: 'Remaining',      value: Math.max(0, theoryTotal - theoryCompleted), color: 'text-purple-600' },
                                ].map(s => (
                                    <div key={s.label} className="bg-slate-50 rounded-lg p-4 text-center">
                                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Theory progress</span>
                                    <span className={`font-medium ${theoryPct >= 100 ? 'text-green-600' : 'text-purple-600'}`}>
                                        {theoryPct}% completed
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full transition-all ${theoryPct >= 100 ? 'bg-green-500' : 'bg-purple-500'}`}
                                        style={{ width: `${Math.min(100, theoryPct)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Driving progress card */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <Car size={16} className="text-blue-500" />
                                Driving lessons
                            </h2>
                            <div className="grid grid-cols-3 gap-4 mb-5">
                                {[
                                    { label: 'Completed',      value: drivingCompleted,               color: 'text-green-600' },
                                    { label: 'Total required', value: drivingTotal,                    color: 'text-slate-800' },
                                    { label: 'Remaining',      value: Math.max(0, drivingTotal - drivingCompleted), color: 'text-blue-600'  },
                                ].map(s => (
                                    <div key={s.label} className="bg-slate-50 rounded-lg p-4 text-center">
                                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Driving progress</span>
                                    <span className={`font-medium ${drivingPct >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                        {drivingPct}% completed
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full transition-all ${drivingPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(100, drivingPct)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Instructor card */}
                        {candidate?.assignedInstructor && (
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-sm font-semibold text-slate-700 mb-3">Your instructor</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                        {candidate.assignedInstructor?.user?.firstName?.[0]}
                                        {candidate.assignedInstructor?.user?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            {candidate.assignedInstructor?.user?.firstName}{' '}
                                            {candidate.assignedInstructor?.user?.lastName}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {candidate.assignedInstructor?.availabilityNote || 'Instructor'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lesson history */}
                        <LessonTable
                            pageData={pageData}
                            onPageChange={fetchLessons}
                            onReschedule={setRescheduleLesson}
                        />
                    </>
                )}

                {/* ── PROGRESS ── */}
                {activeSection === 'progress' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={18} className="text-blue-500" />
                            <h2 className="text-base font-semibold text-slate-800">Training progress</h2>
                        </div>
                        <p className="text-sm text-slate-500 mb-5">Track your journey to becoming a certified driver</p>

                        {/* Overall bar */}
                        {(() => {
                            const completedPhases = phases.filter(p => p.status === 'POLOŽENO').length;
                            const phaseProgress = phases.length > 0 ? Math.round((completedPhases / phases.length) * 100) : 0;
                            return (
                                <div className="mb-6 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Overall progress</span>
                                        <span className="font-semibold text-blue-600">{phaseProgress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-500 h-2.5 rounded-full"
                                            style={{ width: `${phaseProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        {completedPhases} of {phases.length} phases completed
                                    </p>
                                </div>
                            );
                        })()}

                        {/* Phase cards */}
                        {phases.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No training phases found.</p>
                        ) : (
                            <div className="space-y-3">
                                {phases.map(phase => {
                                    const done = phase.status === 'POLOŽENO';
                                    return (
                                        <div
                                            key={phase.phaseId}
                                            className={`rounded-lg border p-4 ${done ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'}`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${done ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}>
                                                        {done && <CheckCircle size={12} className="text-white" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 text-sm">{phase.phaseType}</p>
                                                        {phase.dateCompleted && (
                                                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                                <Clock size={10} />
                                                                Completed on {new Date(phase.dateCompleted).toLocaleDateString('en-GB')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${PHASE_COLORS[phase.status] || 'bg-slate-100 text-slate-600'}`}>
                                                    {phase.status === 'POLOŽENO'   ? 'Completed'   :
                                                     phase.status === 'U TOKU'     ? 'In progress' :
                                                     phase.status === 'NEPOLOŽENO' ? 'Failed'      :
                                                     phase.status === 'ZAKAZANO'   ? 'Scheduled'   : phase.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── FINANCES ── */}
                {activeSection === 'finances' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign size={18} className="text-blue-500" />
                                <h2 className="text-base font-semibold text-slate-800">Financial overview</h2>
                            </div>
                            {account ? (
                                <>
                                    <div className="grid grid-cols-3 gap-4 mb-5">
                                        {[
                                            { label: 'Total course price', value: `€${totalAmount.toLocaleString()}`,   color: 'text-slate-800' },
                                            { label: 'Amount paid',        value: `€${amountPaid.toLocaleString()}`,    color: 'text-green-600' },
                                            { label: 'Remaining balance',  value: `€${remainingDebt.toLocaleString()}`, color: 'text-red-500'   },
                                        ].map(s => (
                                            <div key={s.label} className="bg-slate-50 rounded-lg p-4 text-center">
                                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Payment progress</span>
                                            <span className="font-medium text-green-600">{paymentPct}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${paymentPct}%` }} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-slate-400 italic">Financial data not available.</p>
                            )}
                        </div>

                        {payments.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-sm font-semibold text-slate-700 mb-4">Payment installments</h2>
                                <div className="space-y-2">
                                    {payments.map((p, i) => (
                                        <div key={p.paymentId ?? i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">#{i + 1} — €{p.amount?.toLocaleString()}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Due {p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-GB') : '—'}
                                                    {p.datePaid && ` · Paid ${new Date(p.datePaid).toLocaleDateString('en-GB')}`}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                                p.status === 'PAID'      ? 'bg-green-100 text-green-700'   :
                                                p.status === 'PENDING'   ? 'bg-yellow-100 text-yellow-700' :
                                                p.status === 'CANCELLED' ? 'bg-red-100 text-red-700'       :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {p.status === 'PAID'      ? 'Paid'      :
                                                 p.status === 'PENDING'   ? 'Pending'   :
                                                 p.status === 'CANCELLED' ? 'Cancelled' : p.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ANNOUNCEMENTS ── */}
                {activeSection === 'announcements' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-base font-semibold text-slate-800 mb-1">Announcements</h2>
                        <p className="text-sm text-slate-500 mb-5">Stay updated with the latest news and important notices</p>
                        {announcements.length === 0 ? (
                            <div className="flex flex-col items-center py-12 gap-3">
                                <AlertCircle size={36} className="text-slate-300" />
                                <p className="text-slate-400 text-sm">No announcements yet</p>
                                <p className="text-slate-400 text-xs">Check back later for updates and important notices</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {announcements.map(a => (
                                    <div key={a.id} className="py-4 first:pt-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-semibold text-slate-800 text-sm">{a.title}</p>
                                            <span className="text-xs text-slate-400 whitespace-nowrap">
                                                {a.dateCreated ? new Date(a.dateCreated).toLocaleDateString('en-GB') : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">{a.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reschedule modal */}
            {rescheduleLesson && (
                <RescheduleModal
                    lesson={rescheduleLesson}
                    onClose={() => setRescheduleLesson(null)}
                    onRescheduled={() => {
                        setRescheduleLesson(null);
                        fetchLessons(pageData.number);
                        // Refresh driving count
                        api.get(`/api/lessons/my-lessons?userId=${getCurrentUserId()}&page=0&size=100&sortBy=dateTime&sortDir=desc`)
                            .then(res => {
                                const count = (res.data.content || []).filter(l => l.status === 'ODRAĐENO').length;
                                setDrivingCompleted(count);
                            }).catch(() => {});
                    }}
                />
            )}

            {/* Feedback modal */}
            {showFeedback && (
                <FeedbackModal
                    candidate={candidate}
                    onClose={() => setShowFeedback(false)}
                    onSubmitted={() => {
                        setShowFeedback(false);
                        setAlreadyRated(true);
                    }}
                />
            )}
        </div>
    );
}

/* ── Lesson table sub-component ── */
function LessonTable({ pageData, onPageChange, onReschedule }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-500" />
                    Lesson history
                </h2>
                <Link
                    to="/book-lesson"
                    className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition"
                >
                    <Plus size={14} /> Book a lesson
                </Link>
            </div>

            {pageData.content.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-400 italic">No lessons found.</div>
            ) : (
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs">
                        <tr>
                            <th className="px-6 py-3 font-medium">Date & time</th>
                            <th className="px-6 py-3 font-medium">Instructor</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">Notes</th>
                            <th className="px-6 py-3 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pageData.content.map(lesson => (
                            <tr key={lesson.lessonId} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                    {new Date(lesson.dateTime).toLocaleString('en-GB', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {lesson.instructor?.firstName} {lesson.instructor?.lastName}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                        lesson.status === 'ODRAĐENO' ? 'bg-green-100 text-green-700' :
                                        lesson.status === 'ZAKAZANO' ? 'bg-blue-100 text-blue-700'   :
                                        lesson.status === 'OTKAZANO' ? 'bg-red-100 text-red-700'     :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {lesson.status === 'ODRAĐENO' ? 'Completed' :
                                         lesson.status === 'ZAKAZANO' ? 'Scheduled' :
                                         lesson.status === 'OTKAZANO' ? 'Cancelled' : lesson.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400 italic">
                                    {lesson.notes || '—'}
                                </td>
                                <td className="px-6 py-4">
                                    {lesson.status === 'ZAKAZANO' && onReschedule && (
                                        <button
                                            onClick={() => onReschedule(lesson)}
                                            className="text-xs px-2.5 py-1 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium transition"
                                        >
                                            Reschedule
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {pageData.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                        Page {pageData.number + 1} of {pageData.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={pageData.number === 0}
                            onClick={() => onPageChange(pageData.number - 1)}
                            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={pageData.number + 1 === pageData.totalPages}
                            onClick={() => onPageChange(pageData.number + 1)}
                            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
