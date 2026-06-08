import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import StarRating from './StarRating';
import { api } from '../api/client';

const FeedbackModal = ({ candidate, onClose, onSubmitted }) => {
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
        setError('');
        setLoading(true);

        try {
            await api.post('/api/feedbacks', {
                candidate: { candidateId: candidate.candidateId },
                instructor: { instructorId: candidate?.assignedInstructor?.instructorId },
                rating,
                comment,
                dateCreated: new Date().toISOString().split('T')[0]
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-500" size={36} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Hvala na ocjeni!</h3>
                    <p className="text-sm text-gray-500 text-center">Vaša recenzija je uspješno poslana.</p>
                </div>
            </div>
        );
    }

    return (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Ocijeni instruktora</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Info o instruktoru */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {instructor?.user?.firstName?.[0]}{instructor?.user?.lastName?.[0]}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">
                            {instructor?.user?.firstName} {instructor?.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">Vaš instruktor</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ocjena</label>
                        <StarRating value={rating} onChange={setRating} />
                        {rating > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                {['', 'Loše', 'Zadovoljava', 'Dobro', 'Vrlo dobro', 'Odlično'][rating]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Komentar <span className="text-gray-400 font-normal">(opciono)</span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            rows={4}
                            placeholder="Podijelite vaše iskustvo sa instruktorom..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose}
                                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                            Otkaži
                        </button>
                        <button onClick={handleSubmit} disabled={loading || rating === 0}
                                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {loading ? 'Šaljem...' : 'Pošalji ocjenu'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;