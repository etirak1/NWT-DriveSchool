import { useState } from 'react';
import { X, CheckCircle, MessageSquare } from 'lucide-react';
import StarRating from './StarRating';
import { api } from '../api/client';

export default function FeedbackModal({ candidate, onClose, onSubmitted }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const instructor = candidate?.assignedInstructor;

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Molimo odaberite ocjenu.');
            return;
        }

        if (!candidate?.candidateId || !candidate?.assignedInstructor?.instructorId) {
            setError('Greška: podaci o kandidatu ili instruktoru nisu dostupni. Osvježite stranicu.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await api.post('/api/feedbacks', {
                candidate: { candidateId: candidate.candidateId },
                instructor: { instructorId: candidate?.assignedInstructor?.instructorId },
                rating,
                comment,
                dateCreated: new Date().toISOString().split('T')[0],
            });

            setSubmitted(true);

            setTimeout(() => {
                onSubmitted();
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Greška pri slanju ocjene.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                        <CheckCircle className="text-green-500" size={32} />
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-800">
                            Hvala na ocjeni!
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Vaša recenzija je uspješno poslana.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                            <MessageSquare size={18} className="text-yellow-600" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">
                            Ocijeni instruktora
                        </h3>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">

                    {/* Instructor info */}
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                            {instructor?.user?.firstName?.[0]}
                            {instructor?.user?.lastName?.[0]}
                        </div>

                        <div>
                            <p className="font-semibold text-slate-800 text-sm">
                                {instructor?.user?.firstName} {instructor?.user?.lastName}
                            </p>
                            <p className="text-xs text-slate-400">Vaš instruktor</p>
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
                            Ocjena
                        </label>
                        <StarRating value={rating} onChange={setRating} />
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                            Komentar <span className="text-slate-400 font-normal normal-case">(opciono)</span>
                        </label>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            placeholder="Podijelite vaše iskustvo sa instruktorom..."
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none text-slate-800 placeholder-slate-300"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                        >
                            Otkaži
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || rating === 0}
                            className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            {loading ? 'Šaljem...' : 'Pošalji ocjenu'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}