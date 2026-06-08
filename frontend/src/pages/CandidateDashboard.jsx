import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    GraduationCap, LogOut, CheckCircle, Clock, BookOpen,
    ChevronLeft, ChevronRight, MessageSquare, TrendingUp,
    DollarSign, AlertCircle, Plus, Car, XCircle, AlertTriangle,
    Info, Calendar
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
    const [financeStatus,    setFinanceStatus]    = useState(null);
    const [announcements,    setAnnouncements]    = useState([]);
    const [pageData,         setPageData]         = useState({ content: [], totalPages: 0, number: 0 });
    const [loading,          setLoading]          = useState(true);
    const [alreadyRated,     setAlreadyRated]     = useState(false);
    const [showFeedback,     setShowFeedback]     = useState(false);
    const [activeSection,    setActiveSection]    = useState('overview');
    const [drivingCompleted,  setDrivingCompleted]  = useState(0);
    const [theoryCompleted,   setTheoryCompleted]   = useState(0);
    const [rescheduleLesson,  setRescheduleLesson]  = useState(null);
    const [timeline,          setTimeline]          = useState([]);
    const [pendingLessons,    setPendingLessons]    = useState([]);

    const fetchLessons = async (page = 0) => {
        try {
            const res = await api.get(
                `/api/lessons/my-lessons?userId=${userId}&page=${page}&size=5&sortBy=dateTime&sortDir=desc`
            );
            setPageData(res.data);
        } catch (e) { console.error(e); }
    };

    const loadProgress = async (candId) => {
        // Theory progress
        try {
            const theoryRes = await api.get(`/api/theory-lessons/candidate/${candId}`);
            const tCount = (theoryRes.data || []).filter(l => l.completed).length;
            setTheoryCompleted(tCount);
        } catch (e) { /* ignore */ }

        // Phases (stari zapisi — za theoryPassed provjeru)
        try {
            const phaseRes = await api.get(`/api/phases/candidate/${candId}`);
            setPhases(phaseRes.data);
        } catch (e) { /* phases optional */ }

        // Timeline (novi computed prikaz — za Progress tab)
        try {
            const tlRes = await api.get(`/api/phases/candidate/${candId}/timeline`);
            setTimeline(tlRes.data);
        } catch (e) { /* timeline optional */ }

        // Feedback eligibility
        try {
            const ratedRes = await api.get(`/api/feedbacks/candidate/${candId}/exists`);
            setAlreadyRated(ratedRes.data);
        } catch (e) { /* ignore */ }
    };

    useEffect(() => {
        let candIdRef = null;

        const load = async () => {
            try {
                const candRes = await api.get(`/api/candidates/by-user/${userId}`);
                const cand = candRes.data;
                setCandidate(cand);

                const candId = cand.candidateId;
                candIdRef = candId;

                await fetchLessons(0);

                // Driving progress — koristi driving_lessons tabelu (ista kao timeline)
                try {
                    const drivingRes = await api.get(`/api/driving-lessons/candidate/${cand.candidateId}/count`);
                    setDrivingCompleted(drivingRes.data.completed || 0);
                } catch (e) { /* ignore */ }

                await loadProgress(candId);

                // Finance — koristimo candidateId (ne userId!)
                try {
                    const statusRes = await api.get(`/accounts/${candId}/status`);
                    setFinanceStatus(statusRes.data);
                } catch (e) { /* finance optional — korisnik mozda nema racun */ }
                // Historija pojedinacnih uplata
                try {
                    const pmtRes = await api.get(`/accounts/${candId}/payments`);
                    setPayments(pmtRes.data || []);
                } catch (e) { /* ignore */ }

                // Announcements
                try {
                    const annRes = await api.get('/api/announcements');
                    setAnnouncements(annRes.data);
                } catch (e) { /* announcements optional */ }

                // Pending prijedlozi od instruktora
                try {
                    const pendRes = await api.get(`/api/lessons/pending?userId=${userId}`);
                    setPendingLessons(pendRes.data || []);
                } catch (e) { /* ignore */ }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();

        // Osvježi napredak kad se korisnik vrati na tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && candIdRef) {
                loadProgress(candIdRef);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Polling svakih 30 sekundi
        const interval = setInterval(() => {
            if (candIdRef) loadProgress(candIdRef);
        }, 30000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const respondToLesson = async (lessonId, action) => {
        try {
            await api.patch(`/api/lessons/${lessonId}/${action}?userId=${userId}`);
            const pendRes = await api.get(`/api/lessons/pending?userId=${userId}`);
            setPendingLessons(pendRes.data || []);
            await fetchLessons(0);
        } catch (e) {
            console.error(e);
        }
    };

    const rule               = candidate?.rule;
    const theoryTotal        = rule?.minTheoryLessons    ?? 40;
    const drivingTotal       = rule?.minPracticalLessons ?? 40;
    const theoryPct          = theoryTotal  > 0 ? Math.round((theoryCompleted  / theoryTotal)  * 100) : 0;
    // Koristimo timeline kao autoritativan izvor — isti podaci kao u "Tok obuke" prikazu
    const theoryExamPhase   = timeline.find(p => p.key === 'TEORIJSKI_ISPIT');
    const practicalExamPhase = timeline.find(p => p.key === 'PRAKTICNI_ISPIT');
    const theoryPassed    = theoryExamPhase?.examStatus?.toUpperCase()   === 'POLOŽENO';
    const drivingExamPassed = practicalExamPhase?.examStatus?.toUpperCase() === 'POLOŽENO';
    const effectiveDrivingCompleted = drivingExamPassed ? drivingTotal : drivingCompleted;
    const drivingPct         = drivingTotal > 0 ? Math.round((effectiveDrivingCompleted / drivingTotal) * 100) : 0;
    const allDone            = theoryPct >= 100 && drivingPct >= 100;

    // Finance helpers — oslanjamo se na financeStatus (CandidateStatusDTO)
    const totalAmount       = Number(financeStatus?.totalAmount   ?? 0);
    const amountPaid        = Number(financeStatus?.paidAmount    ?? 0);
    const remainingDebt     = Number(financeStatus?.remainingDebt ?? 0);
    const paymentPct        = totalAmount > 0 ? Math.round((amountPaid / totalAmount) * 100) : 0;
    const enrollmentPaid    = financeStatus?.enrollmentEligible ?? false;
    const examEligible      = financeStatus?.examEligible ?? false;
    const obligations       = financeStatus?.obligations ?? [];

    const navItems = [
        { id: 'overview',      label: 'Pregled'      },
        { id: 'progress',      label: 'Napredak'      },
        { id: 'finances',      label: 'Finansije'      },
        { id: 'announcements', label: 'Obavještenja' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500 text-sm">Učitavanje...</p>
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
                            <p className="text-xs text-slate-500">Nadzorna ploča kandidata</p>
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
                            <LogOut size={16} /> Odjava
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
                        {/* Finance upozorenje — upisnina nije plaćena */}
                        {financeStatus && !enrollmentPaid && (
                            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
                                <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-amber-800 text-sm">Upisnina nije plaćena</p>
                                    <p className="text-amber-700 text-sm mt-0.5">
                                        Niste platili upisninu od <span className="font-bold">300 KM</span>. Bez plaćene upisnine ne možete biti dodani u grupu za teorijsku nastavu. Kontaktirajte administraciju škole.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Finance info — dugovanje */}
                        {financeStatus && remainingDebt > 0 && (
                            <div className={`rounded-xl border p-4 flex items-start gap-3 ${
                                enrollmentPaid
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-slate-50 border-slate-200'
                            }`}>
                                <Info size={20} className={`flex-shrink-0 mt-0.5 ${enrollmentPaid ? 'text-blue-500' : 'text-slate-400'}`} />
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">Finansijski status</p>
                                    <p className="text-slate-600 text-sm mt-0.5">
                                        Ukupno uplaćeno: <span className="font-bold text-green-600">{amountPaid.toFixed(2)} KM</span>
                                        {' · '}
                                        Preostalo dugovanje: <span className="font-bold text-red-600">{remainingDebt.toFixed(2)} KM</span>
                                        {!examEligible && (
                                            <span className="ml-1 text-slate-500">— za polaganje ispita potrebno je izmiriti sve obaveze.</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Sve plaćeno + sve faze završene — može finalni ispit */}
                        {financeStatus && remainingDebt === 0 && totalAmount > 0 && drivingExamPassed && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                <p className="text-green-800 text-sm font-medium">
                                    Sve finansijske obaveze su izmirene i obuka je završena. Možete pristupiti finalnom ispitu.
                                </p>
                            </div>
                        )}

                        {/* Sve plaćeno ALI obuka nije završena */}
                        {financeStatus && remainingDebt === 0 && totalAmount > 0 && !drivingExamPassed && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-500 flex-shrink-0" />
                                <p className="text-blue-800 text-sm font-medium">
                                    Sve finansijske obaveze su izmirene. Nastavite sa obukom — finalni ispit je dostupan nakon završetka svih faza.
                                </p>
                            </div>
                        )}

                        {/* Obavještenje: teorijski ispit položen — može zakazati čas vožnje */}
                        {theoryPassed && effectiveDrivingCompleted < drivingTotal && (
                            <div className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-start gap-3">
                                <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold text-green-800 text-sm">Položili ste teorijski ispit! 🎉</p>
                                    <p className="text-green-700 text-sm mt-0.5">
                                        Imate pravo zakazati časove praktične vožnje. Kontaktirajte instruktora ili zakažite čas direktno.
                                    </p>
                                </div>
                                <Link
                                    to="/book-lesson"
                                    className="shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                                >
                                    <Car size={14} /> Zakaži čas
                                </Link>
                            </div>
                        )}

                        {/* Prijedlozi termina od instruktora */}
                        {pendingLessons.length > 0 && (
                            <div className="bg-white rounded-xl border border-indigo-200 overflow-hidden">
                                <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                                    <Calendar size={16} className="text-indigo-600" />
                                    <span className="font-semibold text-indigo-800 text-sm">
                                        Prijedlozi termina od instruktora ({pendingLessons.length})
                                    </span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {pendingLessons.map(lesson => (
                                        <div key={lesson.lessonId} className="px-5 py-4 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {new Date(lesson.dateTime).toLocaleString('bs-BA', {
                                                        weekday: 'long', day: '2-digit', month: 'long',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Instruktor: {lesson.instructor?.firstName} {lesson.instructor?.lastName}
                                                    {lesson.notes && ` · ${lesson.notes}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => respondToLesson(lesson.lessonId, 'confirm')}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-medium"
                                                >
                                                    <CheckCircle size={13} /> Prihvati
                                                </button>
                                                <button
                                                    onClick={() => respondToLesson(lesson.lessonId, 'reject')}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-lg font-medium"
                                                >
                                                    <XCircle size={13} /> Odbij
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completion banner */}
                        {allDone && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-800">Obuka je završena!</p>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {alreadyRated
                                            ? 'Već ste ocijenili vašeg instruktora.'
                                            : 'Ocijenite vašeg instruktora i podijelite vaše iskustvo.'}
                                    </p>
                                </div>
                                {!alreadyRated && (
                                    <button
                                        onClick={() => setShowFeedback(true)}
                                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                    >
                                        <MessageSquare size={16} /> Ocijeni instruktora
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Theory progress card */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <BookOpen size={16} className="text-purple-500" />
                                Časovi teorije
                            </h2>
                            <div className="grid grid-cols-3 gap-4 mb-5">
                                {[
                                    { label: 'Završeno',      value: theoryCompleted,               color: 'text-green-600'  },
                                    { label: 'Ukupno potrebno', value: theoryTotal,                    color: 'text-slate-800'  },
                                    { label: 'Preostalo',      value: Math.max(0, theoryTotal - theoryCompleted), color: 'text-purple-600' },
                                ].map(s => (
                                    <div key={s.label} className="bg-slate-50 rounded-lg p-4 text-center">
                                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Napredak u teoriji</span>
                                    <span className={`font-medium ${theoryPct >= 100 ? 'text-green-600' : 'text-purple-600'}`}>
                                        {theoryPct}% završeno
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
                                Časovi vožnje
                            </h2>
                            <div className="grid grid-cols-3 gap-4 mb-5">
                                {[
                                    { label: 'Završeno',      value: effectiveDrivingCompleted,               color: 'text-green-600' },
                                    { label: 'Ukupno potrebno', value: drivingTotal,                                  color: 'text-slate-800' },
                                    { label: 'Preostalo',      value: Math.max(0, drivingTotal - effectiveDrivingCompleted), color: 'text-blue-600'  },
                                ].map(s => (
                                    <div key={s.label} className="bg-slate-50 rounded-lg p-4 text-center">
                                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Napredak u vožnji</span>
                                    <span className={`font-medium ${drivingPct >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                        {drivingPct}% završeno
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
                                <h2 className="text-sm font-semibold text-slate-700 mb-3">Vaš instruktor</h2>
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
                            theoryPassed={theoryPassed}
                        />
                    </>
                )}

                {/* ── PROGRESS ── */}
                {activeSection === 'progress' && (() => {
                    const completedCount = timeline.filter(p => p.status === 'ZAVRŠENO').length;
                    const totalCount = timeline.length || 6;
                    const overallPct = Math.round((completedCount / totalCount) * 100);

                    const statusStyle = {
                        'ZAVRŠENO':      { bar: 'bg-green-500',  badge: 'bg-green-100 text-green-700',   label: 'Završeno'       },
                        'U TOKU':        { bar: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700',     label: 'U toku'         },
                        'NIJE ZAPOČETO': { bar: 'bg-slate-200',  badge: 'bg-slate-100 text-slate-500',   label: 'Nije započeto'  },
                        'ZAKLJUČANO':    { bar: 'bg-slate-100',  badge: 'bg-slate-100 text-slate-400',   label: 'Zaključano'     },
                    };

                    return (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={18} className="text-blue-500" />
                                <h2 className="text-base font-semibold text-slate-800">Tok obuke</h2>
                            </div>
                            <p className="text-sm text-slate-500 mb-5">Pratite napredak kroz sve faze obuke</p>

                            {/* Overall bar */}
                            <div className="mb-6 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Ukupni napredak</span>
                                    <span className="font-semibold text-blue-600">{overallPct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
                                </div>
                                <p className="text-xs text-slate-400">{completedCount} od {totalCount} faza završeno</p>
                            </div>

                            {/* Phase cards */}
                            {timeline.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">Nema podataka o toku obuke.</p>
                            ) : (
                                <div className="space-y-3">
                                    {timeline.map((phase, idx) => {
                                        const s = statusStyle[phase.status] || statusStyle['NIJE ZAPOČETO'];
                                        const locked = phase.status === 'ZAKLJUČANO';
                                        return (
                                            <div key={phase.key}
                                                className={`rounded-lg border p-4 ${
                                                    phase.status === 'ZAVRŠENO' ? 'border-green-200 bg-green-50' :
                                                    phase.status === 'U TOKU'   ? 'border-blue-200 bg-blue-50'  :
                                                    locked                       ? 'border-slate-100 bg-slate-50 opacity-60' :
                                                    'border-slate-200 bg-white'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold
                                                            ${phase.status === 'ZAVRŠENO' ? 'border-green-500 bg-green-500 text-white' :
                                                              phase.status === 'U TOKU'   ? 'border-blue-500 bg-blue-500 text-white'   :
                                                              'border-slate-300 text-slate-400'}`}>
                                                            {phase.status === 'ZAVRŠENO' ? '✓' : idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className={`font-medium text-sm ${locked ? 'text-slate-400' : 'text-slate-800'}`}>
                                                                {phase.label}
                                                            </p>
                                                            {phase.progress && (
                                                                <p className="text-xs text-slate-500 mt-0.5">{phase.progress}</p>
                                                            )}
                                                            {phase.examDate && (
                                                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                                    <Clock size={10} /> {phase.examDate}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.badge}`}>
                                                            {s.label}
                                                        </span>
                                                        {phase.examStatus && (
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                                phase.examStatus === 'POLOŽENO'   ? 'bg-green-100 text-green-700'  :
                                                                phase.examStatus === 'NEPOLOŽENO' ? 'bg-red-100 text-red-700'     :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {phase.examStatus === 'POLOŽENO'   ? 'Položeno'   :
                                                                 phase.examStatus === 'NEPOLOŽENO' ? 'Nepoloženo' : 'Zakazano'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* ── FINANCES ── */}
                {activeSection === 'finances' && (
                    <div className="space-y-6">

                        {/* Status badges */}
                        {financeStatus && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`rounded-xl border p-4 flex items-center gap-3 ${
                                    enrollmentPaid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                                }`}>
                                    {enrollmentPaid
                                        ? <CheckCircle size={22} className="text-green-500 flex-shrink-0" />
                                        : <XCircle    size={22} className="text-amber-500 flex-shrink-0" />
                                    }
                                    <div>
                                        <p className={`text-sm font-semibold ${enrollmentPaid ? 'text-green-800' : 'text-amber-800'}`}>
                                            Upisnina (300 KM)
                                        </p>
                                        <p className={`text-xs mt-0.5 ${enrollmentPaid ? 'text-green-600' : 'text-amber-600'}`}>
                                            {enrollmentPaid ? 'Plaćena — možete biti u grupi za teoriju' : 'Nije plaćena — ne možete ući u teorijsku grupu'}
                                        </p>
                                    </div>
                                </div>
                                {/* Finalni ispit — uslovljeno I finansijama I završenim fazama */}
                                {(() => {
                                    const fullyReady = examEligible && drivingExamPassed;
                                    const financeOkButNotDone = examEligible && !drivingExamPassed;
                                    return (
                                        <div className={`rounded-xl border p-4 flex items-center gap-3 ${
                                            fullyReady ? 'bg-green-50 border-green-200' :
                                            financeOkButNotDone ? 'bg-blue-50 border-blue-200' :
                                            'bg-slate-50 border-slate-200'
                                        }`}>
                                            {fullyReady
                                                ? <CheckCircle size={22} className="text-green-500 flex-shrink-0" />
                                                : financeOkButNotDone
                                                    ? <CheckCircle size={22} className="text-blue-400 flex-shrink-0" />
                                                    : <XCircle size={22} className="text-slate-400 flex-shrink-0" />
                                            }
                                            <div>
                                                <p className={`text-sm font-semibold ${fullyReady ? 'text-green-800' : financeOkButNotDone ? 'text-blue-800' : 'text-slate-700'}`}>
                                                    Završni ispit
                                                </p>
                                                <p className={`text-xs mt-0.5 ${fullyReady ? 'text-green-600' : financeOkButNotDone ? 'text-blue-600' : 'text-slate-500'}`}>
                                                    {fullyReady
                                                        ? 'Finansije i obuka završene — pristup dozvoljen'
                                                        : financeOkButNotDone
                                                            ? 'Finansije OK — završite sve faze obuke'
                                                            : `Preostaje ${remainingDebt.toFixed(2)} KM`}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Summary kartice */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign size={18} className="text-blue-500" />
                                <h2 className="text-base font-semibold text-slate-800">Pregled finansija</h2>
                            </div>
                            {financeStatus ? (
                                <>
                                    <div className="grid grid-cols-3 gap-4 mb-5">
                                        {[
                                            { label: 'Ukupna cijena obuke', value: `${totalAmount.toFixed(2)} KM`,   color: 'text-slate-800' },
                                            { label: 'Uplaćeno',            value: `${amountPaid.toFixed(2)} KM`,    color: 'text-green-600' },
                                            { label: 'Preostalo dugovanje', value: `${remainingDebt.toFixed(2)} KM`, color: remainingDebt > 0 ? 'text-red-500' : 'text-green-600' },
                                        ].map(s => (
                                            <div key={s.label} className="bg-slate-50 rounded-lg p-4 text-center">
                                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Ukupno plaćeno</span>
                                            <span className={`font-medium ${paymentPct >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                                {paymentPct}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full transition-all ${paymentPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(100, paymentPct)}%` }}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-slate-400 italic">Finansijski podaci nisu dostupni. Kontaktirajte administraciju.</p>
                            )}
                        </div>

                        {/* Obligations — upisnina + 4 rate */}
                        {obligations.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-sm font-semibold text-slate-700 mb-1">Raspored uplata</h2>
                                <p className="text-xs text-slate-400 mb-5">Uplate se raspoređuju automatski po redoslijedu: upisnina → 1. rata → 2. rata → ...</p>
                                <div className="space-y-4">
                                    {obligations.map(ob => {
                                        const pct = Number(ob.totalAmount) > 0
                                            ? Math.round((Number(ob.paidAmount) / Number(ob.totalAmount)) * 100)
                                            : 0;
                                        return (
                                            <div key={ob.id} className={`rounded-lg border p-4 ${ob.fullyPaid ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {ob.fullyPaid
                                                            ? <CheckCircle size={16} className="text-green-500" />
                                                            : <Clock size={16} className={ob.paidAmount > 0 ? 'text-blue-400' : 'text-slate-300'} />
                                                        }
                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {ob.label}
                                                            {ob.type === 'ENROLLMENT' && (
                                                                <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                                                    obavezna za teorijsku grupu
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                            ob.fullyPaid
                                                                ? 'bg-green-100 text-green-700'
                                                                : ob.paidAmount > 0
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            {ob.fullyPaid ? 'Plaćeno' : ob.paidAmount > 0 ? 'Djelimično' : 'Nije plaćeno'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                                    <span>Uplaćeno: <strong className="text-slate-700">{Number(ob.paidAmount).toFixed(2)} KM</strong></span>
                                                    <span>Ukupno: <strong className="text-slate-700">{Number(ob.totalAmount).toFixed(2)} KM</strong></span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all ${ob.fullyPaid ? 'bg-green-500' : 'bg-blue-400'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                {!ob.fullyPaid && Number(ob.remainingAmount) > 0 && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Preostaje: <span className="text-red-500 font-medium">{Number(ob.remainingAmount).toFixed(2)} KM</span>
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* History uplata */}
                        {payments.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-sm font-semibold text-slate-700 mb-4">Historija uplata</h2>
                                <div className="space-y-0">
                                    {payments.map((p, i) => (
                                        <div key={p.paymentId ?? i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">
                                                    Uplata #{i + 1} — <span className="text-green-600 font-bold">{Number(p.amount).toFixed(2)} KM</span>
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {p.datePaid ? `Plaćeno: ${new Date(p.datePaid).toLocaleDateString('bs-BA')}` : '—'}
                                                </p>
                                            </div>
                                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-700">
                                                Evidentirano
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
                        <h2 className="text-base font-semibold text-slate-800 mb-1">Obavještenja</h2>
                        <p className="text-sm text-slate-500 mb-5">Budite u toku s najnovijim vijestima i važnim obavještenjima.</p>
                        {announcements.length === 0 ? (
                            <div className="flex flex-col items-center py-12 gap-3">
                                <AlertCircle size={36} className="text-slate-300" />
                                <p className="text-slate-400 text-sm">Nema obavještenja</p>
                                <p className="text-slate-400 text-xs">Provjerite kasnije za nove informacije i važna obavještenja</p>
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
function LessonTable({ pageData, onPageChange, onReschedule, theoryPassed }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-500" />
                    Historija časova
                </h2>
                {theoryPassed ? (
                    <Link
                        to="/book-lesson"
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition"
                    >
                        <Plus size={14} /> Zakaži čas
                    </Link>
                ) : (
                    <span className="text-xs text-slate-400 italic">Teorijski ispit potreban</span>
                )}
            </div>

            {pageData.content.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-400 italic">Nema pronađenih časova.</div>
            ) : (
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs">
                        <tr>
                            <th className="px-6 py-3 font-medium">Datum & vrijeme</th>
                            <th className="px-6 py-3 font-medium">Instruktor</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">Napomena</th>
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
                                            Promijeni termin
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
