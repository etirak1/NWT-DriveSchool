import { Link } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';

const STATUS_MAP = {
    ODRAĐENO: { label: 'Završeno', cls: 'bg-green-100 text-green-700' },
    ZAKAZANO: { label: 'Zakazano', cls: 'bg-blue-100 text-blue-700' },
    OTKAZANO: { label: 'Otkazano', cls: 'bg-red-100 text-red-700' },
    PENDING: { label: 'Na čekanju', cls: 'bg-yellow-100 text-yellow-700' },
};

export default function LessonTable({
                                        pageData,
                                        onPageChange,
                                        onReschedule,
                                        theoryPassed,
                                        drivingDone
                                    }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <BookOpen size={14} className="text-blue-600" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-800">
                        Historija časova
                    </h2>
                </div>

                {!drivingDone && theoryPassed ? (
                    <Link
                        to="/book-lesson"
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors shadow-sm"
                    >
                        <Plus size={13} /> Zakaži čas
                    </Link>
                ) : !drivingDone ? (
                    <span className="text-xs text-slate-400 italic">
                        Teorijski ispit potreban
                    </span>
                ) : null}
            </div>

            {/* Empty state */}
            {pageData.content.length === 0 ? (
                <div className="px-6 py-14 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <Calendar size={20} className="text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">
                        Nema pronađenih časova.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">

                        <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Datum & vrijeme
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Instruktor
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Napomena
                            </th>
                            <th className="px-6 py-3" />
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50">
                        {pageData.content.map((lesson) => {
                            const s =
                                STATUS_MAP[lesson.status] || {
                                    label: lesson.status,
                                    cls: 'bg-slate-100 text-slate-600'
                                };

                            return (
                                <tr
                                    key={lesson.lessonId}
                                    className="hover:bg-slate-50/60 transition-colors"
                                >
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                                        {new Date(lesson.dateTime).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {lesson.instructor?.firstName}{' '}
                                        {lesson.instructor?.lastName}
                                    </td>

                                    <td className="px-6 py-4">
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.cls}`}
                                            >
                                                {s.label}
                                            </span>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-400 italic">
                                        {lesson.notes || '—'}
                                    </td>

                                    <td className="px-6 py-4">
                                        {lesson.status === 'ZAKAZANO' &&
                                            onReschedule && (
                                                <button
                                                    onClick={() =>
                                                        onReschedule(lesson)
                                                    }
                                                    className="text-xs px-2.5 py-1 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                                                >
                                                    Promijeni termin
                                                </button>
                                            )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pageData.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">
                        Stranica {pageData.number + 1} od{' '}
                        {pageData.totalPages}
                    </p>

                    <div className="flex gap-2">
                        <button
                            disabled={pageData.number === 0}
                            onClick={() =>
                                onPageChange(pageData.number - 1)
                            }
                            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={15} />
                        </button>

                        <button
                            disabled={
                                pageData.number + 1 ===
                                pageData.totalPages
                            }
                            onClick={() =>
                                onPageChange(pageData.number + 1)
                            }
                            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}