import { Link } from 'react-router-dom';
import {
    GraduationCap, LogOut, CheckCircle, Clock, BookOpen,
    MessageSquare, TrendingUp, DollarSign, AlertCircle,
    Car, XCircle, AlertTriangle, Info, Calendar
} from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';
import RescheduleModal from '../components/RescheduleModal';
import LessonTable from '../components/LessonTable';
import { useCandidateDashboard } from '../hooks/useCandidateDashboard';

export default function CandidateDashboard() {
    const {
        email, role,
        candidate, payments, financeStatus, announcements,
        pageData, loading, alreadyRated, showFeedback, setShowFeedback,
        activeSection, setActiveSection,
        rescheduleLesson, setRescheduleLesson,
        theoryCompleted, drivingCompleted,
        timeline, pendingLessons, theoryEligibility,
        fetchLessons, handleLogout, respondToLesson, setAlreadyRated,
        theoryTotal, drivingTotal, theoryPct, drivingPct,
        theoryPassed, drivingExamPassed, effectiveDrivingCompleted,
        allDone,
        totalAmount, amountPaid, remainingDebt, paymentPct,
        enrollmentPaid, examEligible, obligations,
    } = useCandidateDashboard();

    const navItems = [
        { id: 'overview',      label: 'Pregled'       },
        { id: 'progress',      label: 'Napredak'      },
        { id: 'finances',      label: 'Finansije'     },
        { id: 'announcements', label: 'Obavještenja'  },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                    <p className="text-slate-500 text-sm font-medium">Učitavanje...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <header className="bg-gradient-to-r from-blue-700 to-blue-800 shadow-lg">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm w-9 h-9 rounded-lg flex items-center justify-center ring-1 ring-white/30">
                                <GraduationCap className="text-white" size={18} />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white leading-tight">DriveSchool</h1>
                                <p className="text-xs text-blue-200 leading-tight">Nadzorna ploča kandidata</p>
                            </div>
                        </div>

                        {/* Nav — desktop */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        activeSection === item.id
                                            ? 'bg-white/20 text-white shadow-sm'
                                            : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* Right */}
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex flex-col items-end mr-1">
                                <p className="text-sm font-semibold text-white leading-tight">{email}</p>
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/20 text-white ring-1 ring-white/30 leading-tight">
                                    {role || 'CANDIDATE'}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-100 hover:bg-white/15 hover:text-white rounded-lg transition-colors"
                            >
                                <LogOut size={15} />
                                <span className="hidden sm:inline">Odjava</span>
                            </button>
                        </div>
                    </div>

                    {/* Nav — mobile */}
                    <div className="flex md:hidden gap-1 pb-2 overflow-x-auto">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    activeSection === item.id
                                        ? 'bg-white/20 text-white'
                                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* ── Content ─────────────────────────────────────────────────── */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-5">

                {/* ══ OVERVIEW ══════════════════════════════════════════════ */}
                {activeSection === 'overview' && (
                    <>
                        {/* Upisnina nije plaćena */}
                        {financeStatus && !enrollmentPaid && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-amber-800 text-sm">Upisnina nije plaćena</p>
                                    <p className="text-amber-700 text-sm mt-0.5">
                                        Niste platili upisninu od <span className="font-bold">300 KM</span>. Bez plaćene upisnine ne možete biti dodani u grupu za teorijsku nastavu. Kontaktirajte administraciju škole.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Prisustvo ispod 60% — koristimo timeline da znamo je li teorija završena */}
                        {(() => {
                            if (theoryPassed || theoryEligibility?.eligible !== false) return null;
                            const attended = theoryEligibility.attendedLessons ?? theoryEligibility.attendedCount ?? null;
                            const total    = theoryEligibility.totalLessons    ?? theoryEligibility.requiredCount ?? null;
                            const pct      = theoryEligibility.attendancePct   ?? (attended != null && total ? Math.round(attended / total * 100) : null);
                            const teorijaDone = timeline.find(p => p.key === 'TEORIJA')?.status === 'ZAVRŠENO';
                            const groupDone   = theoryEligibility.groupFinished ?? teorijaDone;

                            if (groupDone) {
                                // Theory classes ended — candidate permanently blocked from exam
                                return (
                                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                                        <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-red-800 text-sm">Teorijska nastava je završena — niste ispunili uslov za ispit</p>
                                            <p className="text-red-700 text-sm mt-0.5">
                                                {attended != null && total != null
                                                    ? <>Prisustvovali ste <span className="font-bold">{attended} od {total}</span> časova{pct != null ? ` (${pct}%)` : ''}, što je ispod minimalnog praga od 60%. </>
                                                    : <>Vaše prisustvo je ispod minimalnog praga od 60%. </>
                                                }
                                                Kontaktirajte administratora za više informacija.
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            // Theory still in progress — warn to come more often
                            if (attended > 0 || total > 0) {
                                return (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                                        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-amber-800 text-sm">Nedovoljno prisustvo na teorijskim časovima</p>
                                            <p className="text-amber-700 text-sm mt-0.5">
                                                {attended != null && total != null
                                                    ? <>Do sada ste prisustvovali <span className="font-bold">{attended} od {total}</span> časova{pct != null ? ` (${pct}%)` : ''}. </>
                                                    : null
                                                }
                                                Za polaganje teorijskog ispita potrebno je minimum 60% prisustva. Potrudite se da redovnije dolazite na nastavu.
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })()}

                        {/* Dugovanje */}
                        {financeStatus && remainingDebt > 0 && (
                            <div className={`rounded-2xl border p-4 flex items-start gap-3 ${
                                enrollmentPaid ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <Info size={18} className={`shrink-0 mt-0.5 ${enrollmentPaid ? 'text-blue-500' : 'text-slate-400'}`} />
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">Finansijski status</p>
                                    <p className="text-slate-600 text-sm mt-0.5">
                                        Ukupno uplaćeno: <span className="font-bold text-green-600">{amountPaid.toFixed(2)} KM</span>
                                        {' · '}
                                        Preostalo dugovanje: <span className="font-bold text-red-600">{remainingDebt.toFixed(2)} KM</span>
                                        {!examEligible && drivingPct >= 100 && (
                                            <span className="ml-1 text-slate-500">— za polaganje završnog praktičnog ispita potrebno je izmiriti sve obaveze.</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Sve završeno */}
                        {financeStatus && remainingDebt === 0 && totalAmount > 0 && drivingExamPassed && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                                <CheckCircle size={18} className="text-green-500 shrink-0" />
                                <p className="text-green-800 text-sm font-medium">
                                    Sve finansijske obaveze su izmirene i obuka je završena. Možete pristupiti finalnom ispitu.
                                </p>
                            </div>
                        )}

                        {/* Plaćeno ali obuka traje */}
                        {financeStatus && remainingDebt === 0 && totalAmount > 0 && !drivingExamPassed && theoryPct < 100 && drivingPct < 100 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                                <CheckCircle size={18} className="text-blue-500 shrink-0" />
                                <p className="text-blue-800 text-sm font-medium">
                                    Sve finansijske obaveze su izmirene. Nastavite sa obukom — finalni ispit je dostupan nakon završetka svih faza.
                                </p>
                            </div>
                        )}

                        {/* Teorija položena — može zakazati vožnju */}
                        {theoryPassed && effectiveDrivingCompleted < drivingTotal && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                                <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold text-green-800 text-sm">Položili ste teorijski ispit!</p>
                                    <p className="text-green-700 text-sm mt-0.5">
                                        Imate pravo zakazati časove praktične vožnje. Kontaktirajte instruktora ili zakažite čas direktno.
                                    </p>
                                </div>
                                <Link
                                    to="/book-lesson"
                                    className="shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
                                >
                                    <Car size={13} /> Zakaži čas
                                </Link>
                            </div>
                        )}

                        {/* Prijedlozi termina od instruktora */}
                        {pendingLessons.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-blue-200/80 overflow-hidden">
                                <div className="px-5 py-3.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Calendar size={13} className="text-blue-600" />
                                    </div>
                                    <span className="font-semibold text-blue-800 text-sm">
                                        Prijedlozi termina od instruktora ({pendingLessons.length})
                                    </span>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {pendingLessons.map((lesson) => (
                                        <div key={lesson.lessonId} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {(() => {
                                                        const DANI = ['Nedjelja','Ponedjeljak','Utorak','Srijeda','Četvrtak','Petak','Subota'];
                                                        const MJES = ['januar','februar','mart','april','maj','juni','juli','august','septembar','oktobar','novembar','decembar'];
                                                        const d = new Date(lesson.dateTime);
                                                        const h = String(d.getHours()).padStart(2,'0');
                                                        const m = String(d.getMinutes()).padStart(2,'0');
                                                        return `${DANI[d.getDay()]}, ${d.getDate()}. ${MJES[d.getMonth()]} ${d.getFullYear()} u ${h}:${m}`;
                                                    })()}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Instruktor: {lesson.instructor?.firstName} {lesson.instructor?.lastName}
                                                    {lesson.notes && ` · ${lesson.notes}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => respondToLesson(lesson.lessonId, 'confirm')}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-xl font-semibold transition-colors"
                                                >
                                                    <CheckCircle size={12} /> Prihvati
                                                </button>
                                                <button
                                                    onClick={() => respondToLesson(lesson.lessonId, 'reject')}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-xl font-semibold transition-colors"
                                                >
                                                    <XCircle size={12} /> Odbij
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completion banner */}
                        {allDone && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <p className="font-bold text-slate-800">Obuka je završena!</p>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {alreadyRated
                                            ? 'Već ste ocijenili vašeg instruktora.'
                                            : 'Ocijenite vašeg instruktora i podijelite vaše iskustvo.'}
                                    </p>
                                </div>
                                {!alreadyRated && (
                                    <button
                                        onClick={() => setShowFeedback(true)}
                                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                                    >
                                        <MessageSquare size={15} /> Ocijeni instruktora
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Theory progress */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <BookOpen size={14} className="text-blue-600" />
                                </div>
                                <h2 className="text-sm font-bold text-slate-800">Časovi teorije</h2>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {[
                                    { label: 'Završeno',        value: theoryCompleted,                          color: 'text-green-600' },
                                    { label: 'Ukupno potrebno', value: theoryTotal,                              color: 'text-slate-800' },
                                    { label: 'Preostalo',       value: Math.max(0, theoryTotal - theoryCompleted), color: 'text-blue-600' },
                                ].map(s => (
                                    <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Napredak u teoriji</span>
                                    <span className={`font-semibold ${theoryPct >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                        {theoryPct}% završeno
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${theoryPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(100, theoryPct)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Driving progress */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Car size={14} className="text-blue-600" />
                                </div>
                                <h2 className="text-sm font-bold text-slate-800">Časovi vožnje</h2>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {[
                                    { label: 'Završeno',        value: effectiveDrivingCompleted,                           color: 'text-green-600' },
                                    { label: 'Ukupno potrebno', value: drivingTotal,                                        color: 'text-slate-800' },
                                    { label: 'Preostalo',       value: Math.max(0, drivingTotal - effectiveDrivingCompleted), color: 'text-blue-600'  },
                                ].map(s => (
                                    <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Napredak u vožnji</span>
                                    <span className={`font-semibold ${drivingPct >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                        {drivingPct}% završeno
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${drivingPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(100, drivingPct)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Instructor card */}
                        {candidate?.assignedInstructor && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Vaš instruktor</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                        {candidate.assignedInstructor?.user?.firstName?.[0]}
                                        {candidate.assignedInstructor?.user?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            {candidate.assignedInstructor?.user?.firstName}{' '}
                                            {candidate.assignedInstructor?.user?.lastName}
                                        </p>
                                        <p className="text-xs text-slate-400">Instruktor vožnje</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <LessonTable
                            pageData={pageData}
                            onPageChange={fetchLessons}
                            onReschedule={setRescheduleLesson}
                            theoryPassed={theoryPassed}
                            drivingDone={drivingPct >= 100}
                        />
                    </>
                )}

                {/* ══ PROGRESS ══════════════════════════════════════════════ */}
                {activeSection === 'progress' && (() => {
                    const completedCount = timeline.filter((p) => p.status === 'ZAVRŠENO').length;
                    const totalCount = timeline.length || 6;
                    const overallPct = Math.round((completedCount / totalCount) * 100);

                    const statusStyle = {
                        'ZAVRŠENO':      { badge: 'bg-green-100 text-green-700',  label: 'Završeno'      },
                        'U TOKU':        { badge: 'bg-blue-100 text-blue-700',    label: 'U toku'        },
                        'NIJE ZAPOČETO': { badge: 'bg-slate-100 text-slate-500',  label: 'Nije započeto' },
                        'ZAKLJUČANO':    { badge: 'bg-slate-100 text-slate-400',  label: 'Zaključano'    },
                    };

                    return (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <TrendingUp size={14} className="text-blue-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">Tok obuke</h2>
                            </div>
                            <p className="text-sm text-slate-400 mb-6 ml-9">Pratite napredak kroz sve faze obuke</p>

                            <div className="mb-7 space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 font-medium">Ukupni napredak</span>
                                    <span className="font-bold text-blue-600">{overallPct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
                                </div>
                                <p className="text-xs text-slate-400">{completedCount} od {totalCount} faza završeno</p>
                            </div>

                            {timeline.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">Nema podataka o toku obuke.</p>
                            ) : (
                                <div className="space-y-3">
                                    {timeline.map((phase, idx) => {
                                        const s = statusStyle[phase.status] ?? statusStyle['NIJE ZAPOČETO'];
                                        const locked = phase.status === 'ZAKLJUČANO';
                                        return (
                                            <div key={phase.key} className={`rounded-xl border p-4 transition-all ${
                                                phase.status === 'ZAVRŠENO' ? 'border-green-200 bg-green-50' :
                                                    phase.status === 'U TOKU'   ? 'border-blue-200 bg-blue-50'  :
                                                        locked                       ? 'border-slate-100 bg-slate-50 opacity-60' :
                                                            'border-slate-200 bg-white'
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                                            phase.status === 'ZAVRŠENO' ? 'border-green-500 bg-green-500 text-white' :
                                                                phase.status === 'U TOKU'   ? 'border-blue-500 bg-blue-500 text-white'   :
                                                                    'border-slate-300 bg-white text-slate-400'
                                                        }`}>
                                                            {phase.status === 'ZAVRŠENO' ? '✓' : idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className={`font-semibold text-sm ${locked ? 'text-slate-400' : 'text-slate-800'}`}>
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

                {/* ══ FINANCES ══════════════════════════════════════════════ */}
                {activeSection === 'finances' && (
                    <div className="space-y-5">
                        {/* Status badges */}
                        {financeStatus && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
                                    enrollmentPaid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                                }`}>
                                    {enrollmentPaid
                                        ? <CheckCircle size={20} className="text-green-500 shrink-0" />
                                        : <XCircle    size={20} className="text-amber-500 shrink-0" />
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
                                {(() => {
                                    const fullyReady = examEligible && drivingExamPassed;
                                    const financeOkButNotDone = examEligible && !drivingExamPassed;
                                    return (
                                        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
                                            fullyReady ? 'bg-green-50 border-green-200' :
                                                financeOkButNotDone ? 'bg-blue-50 border-blue-200' :
                                                    'bg-slate-50 border-slate-200'
                                        }`}>
                                            {fullyReady
                                                ? <CheckCircle size={20} className="text-green-500 shrink-0" />
                                                : financeOkButNotDone
                                                    ? <CheckCircle size={20} className="text-blue-400 shrink-0" />
                                                    : <XCircle size={20} className="text-slate-400 shrink-0" />
                                            }
                                            <div>
                                                <p className={`text-sm font-semibold ${fullyReady ? 'text-green-800' : financeOkButNotDone ? 'text-blue-800' : 'text-slate-700'}`}>
                                                    Završni ispit
                                                </p>
                                                <p className={`text-xs mt-0.5 ${fullyReady ? 'text-green-600' : financeOkButNotDone ? 'text-blue-600' : 'text-slate-500'}`}>
                                                    {fullyReady ? 'Finansije i obuka završene — pristup dozvoljen'
                                                        : financeOkButNotDone ? 'Finansije OK — završite sve faze obuke'
                                                            : `Preostaje ${remainingDebt.toFixed(2)} KM`}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Pregled finansija */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <DollarSign size={14} className="text-blue-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">Pregled finansija</h2>
                            </div>
                            {financeStatus ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                                        {[
                                            { label: 'Ukupna cijena obuke', value: `${totalAmount.toFixed(2)} KM`,   color: 'text-slate-800' },
                                            { label: 'Uplaćeno',            value: `${amountPaid.toFixed(2)} KM`,    color: 'text-green-600' },
                                            { label: 'Preostalo dugovanje', value: `${remainingDebt.toFixed(2)} KM`, color: remainingDebt > 0 ? 'text-red-500' : 'text-green-600' },
                                        ].map(s => (
                                            <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Ukupno plaćeno</span>
                                            <span className={`font-semibold ${paymentPct >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                                {paymentPct}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${paymentPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(100, paymentPct)}%` }}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-slate-400 italic">Finansijski podaci nisu dostupni. Kontaktirajte administraciju.</p>
                            )}
                        </div>

                        {/* Obligations */}
                        {obligations.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                                <h2 className="font-bold text-slate-800 mb-1">Raspored uplata</h2>
                                <p className="text-xs text-slate-400 mb-5">Uplate se raspoređuju automatski po redoslijedu: upisnina → 1. rata → 2. rata → ...</p>
                                <div className="space-y-3">
                                    {obligations.map((ob) => {
                                        const pct = Number(ob.totalAmount) > 0
                                            ? Math.round((Number(ob.paidAmount) / Number(ob.totalAmount)) * 100)
                                            : 0;
                                        return (
                                            <div key={ob.id} className={`rounded-xl border p-4 ${ob.fullyPaid ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'}`}>
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <div className="flex items-center gap-2">
                                                        {ob.fullyPaid
                                                            ? <CheckCircle size={15} className="text-green-500" />
                                                            : <Clock size={15} className={ob.paidAmount > 0 ? 'text-blue-400' : 'text-slate-300'} />
                                                        }
                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {ob.label}
                                                            {ob.type === 'ENROLLMENT' && (
                                                                <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-lg">
                                                                    obavezna za teorijsku grupu
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                        ob.fullyPaid ? 'bg-green-100 text-green-700'
                                                            : ob.paidAmount > 0 ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {ob.fullyPaid ? 'Plaćeno' : ob.paidAmount > 0 ? 'Djelimično' : 'Nije plaćeno'}
                                                    </span>
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
                                                    <p className="text-xs text-slate-400 mt-1.5">
                                                        Preostaje: <span className="text-red-500 font-semibold">{Number(ob.remainingAmount).toFixed(2)} KM</span>
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Payment history */}
                        {payments.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                                <h2 className="font-bold text-slate-800 mb-5">Historija uplata</h2>
                                <div className="space-y-0">
                                    {payments.map((p, i) => (
                                        <div key={p.paymentId ?? i} className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    Uplata #{i + 1} — <span className="text-green-600">{Number(p.amount).toFixed(2)} KM</span>
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

                {/* ══ ANNOUNCEMENTS ══════════════════════════════════════════ */}
                {activeSection === 'announcements' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                        <h2 className="font-bold text-slate-800 mb-1">Obavještenja</h2>
                        <p className="text-sm text-slate-400 italic mb-6">Budite u toku s najnovijim vijestima i važnim obavještenjima.</p>
                        {announcements.length === 0 ? (
                            <div className="flex flex-col items-center py-14 gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                    <AlertCircle size={24} className="text-slate-300" />
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-400 text-sm font-medium">Nema obavještenja</p>
                                    <p className="text-slate-300 text-xs mt-1">Provjerite kasnije za nove informacije</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {announcements.map((a) => {
                                    const isWelcome = !!a.targetUserId;
                                    const badgeCls = isWelcome
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200';
                                    const badgeLabel = isWelcome ? 'Dobrodošlica' : 'Obavještenje';
                                    return (
                                        <div key={a.id} className="py-4 first:pt-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-semibold text-slate-800 text-sm">{a.title}</p>
                                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeCls}`}>
                                                        {badgeLabel}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                                                    {a.dateCreated ? new Date(a.dateCreated).toLocaleDateString('en-GB') : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">{a.content}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

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
