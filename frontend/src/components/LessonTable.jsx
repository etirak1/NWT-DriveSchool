import { Link } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function LessonTable({ pageData, onPageChange, onReschedule, theoryPassed, drivingDone }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-500" />
                    Historija časova
                </h2>
                {!drivingDone && theoryPassed ? (
                    <Link
                        to="/book-lesson"
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition"
                    >
                        <Plus size={14} /> Zakaži čas
                    </Link>
                ) : !drivingDone ? (
                    <span className="text-xs text-slate-400 italic">Teorijski ispit potreban</span>
                ) : null}
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
                                        lesson.status === 'ODRAĐENO' ? 'bg-green-100 text-green-700'   :
                                        lesson.status === 'ZAKAZANO' ? 'bg-blue-100 text-blue-700'     :
                                        lesson.status === 'OTKAZANO' ? 'bg-red-100 text-red-700'       :
                                        lesson.status === 'PENDING'  ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {lesson.status === 'ODRAĐENO' ? 'Završeno'   :
                                         lesson.status === 'ZAKAZANO' ? 'Zakazano'   :
                                         lesson.status === 'OTKAZANO' ? 'Otkazano'   :
                                         lesson.status === 'PENDING'  ? 'Na čekanju' : lesson.status}
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
