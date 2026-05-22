import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { getCurrentUserId } from '../auth/jwt';
import { CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const CandidateDashboard = () => {
    const [candidate, setCandidate] = useState(null);
    const [pageData, setPageData] = useState({ content: [], totalPages: 0, number: 0 });
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);

    const userId = getCurrentUserId();

    const fetchLessons = async (page = 0) => {
        const res = await api.get(`/api/lessons/paged?page=${page}&size=5&sortBy=dateTime&sortDir=desc`);
        setPageData(res.data);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const candRes = await api.get(`/api/candidates/${userId}`);
                setCandidate(candRes.data);
                await fetchLessons(0);
                setLoading(false);
            } catch (err) { console.error(err); }
        };
        loadData();
    }, []);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await api.get('/api/announcements');
                setAnnouncements(res.data);
            } catch (err) {
                console.error('Greška pri učitavanju obavještenja:', err);
            }
        };
        fetchAnnouncements();
    }, []);

    if (loading) return <div className="p-10 text-center">Učitavanje...</div>;

    return (
        <div className="p-8">
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <CheckCircle className="text-green-500 mb-2" />
                    <p className="text-gray-500 text-sm font-medium">Napredak</p>
                    <p className="text-2xl font-bold text-blue-600">{candidate?.progressPercentage}%</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <Clock className="text-purple-500 mb-2" />
                    <p className="text-gray-500 text-sm font-medium">Datum upisa</p>
                    <p className="text-lg font-bold text-gray-800">
                        {candidate?.enrollmentDate
                            ? new Date(candidate.enrollmentDate).toLocaleDateString('bs-BA')
                            : '/'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold mb-4">Moji časovi</h2>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs">
                    <tr>
                        <th className="p-4">Vrijeme</th>
                        <th className="p-4">Instruktor</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Napomena</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {pageData.content.map(lesson => (
                        <tr key={lesson.lessonId}>
                            <td className="p-4 text-sm font-medium">{new Date(lesson.dateTime).toLocaleString('bs-BA')}</td>
                            <td className="p-4 text-sm">{lesson.instructor?.user?.firstName} {lesson.instructor?.user?.lastName}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${lesson.status === 'ODRAĐENO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {lesson.status}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-400 italic">{lesson.notes || "/"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="flex justify-center mt-6 space-x-2">
                    <button disabled={pageData.number === 0} onClick={() => fetchLessons(pageData.number - 1)} className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={20}/></button>
                    <span className="p-2">Stranica {pageData.number + 1} od {pageData.totalPages}</span>
                    <button disabled={pageData.number + 1 === pageData.totalPages} onClick={() => fetchLessons(pageData.number + 1)} className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={20}/></button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                <h2 className="text-lg font-bold mb-4">Oglasna ploča</h2>
                {announcements.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">Nema trenutnih obavještenja.</p>
                ) : (
                    <div className="divide-y">
                        {announcements.map(a => (
                            <div key={a.id} className="py-4">
                                <p className="font-semibold text-gray-800">{a.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(a.dateCreated).toLocaleDateString('bs-BA')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default CandidateDashboard;