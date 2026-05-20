import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Car, User, Mail, Phone, ChevronLeft } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const BookLesson = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        lessonDate: '',
        timeSlot: '',
        lessonType: 'Beginner',
        transmission: 'Manual',
        additionalNotes: ''
    });

    useEffect(() => {
        api.get('/instructors')
            .then(res => setInstructors(res.data))
            .catch(err => console.error("Greška pri dohvatanju instruktora", err));


        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setFormData(prev => ({
                ...prev,
                fullName: `${decoded.sub}`,
                email: decoded.sub
            }));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);

        const fullDateTime = `${formData.lessonDate}T${formData.timeSlot.split('-')[0]}:00`;

        const payload = {
            candidate: { candidateId: decoded.userId },
            instructor: { instructorId: formData.instructorId },
            dateTime: fullDateTime,
            duration: 45,
            vehicleId: 1,
            status: 'ZAKAZANO',
            notes: `Tip: ${formData.lessonType}, Mjenjač: ${formData.transmission}. ${formData.additionalNotes}`
        };

        try {
            await api.post('/lessons', payload);
            alert("Čas uspješno rezervisan!");
            navigate('/dashboard');
        } catch (err) {
            alert("Greška: " + (err.response?.data?.message || "Provjerite dostupnost termina"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
            >
                <ChevronLeft size={20} /> Nazad na odabir
            </button>

            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-white">
                    <h1 className="text-2xl font-bold text-gray-800">Rezervišite termin časa</h1>
                    <p className="text-gray-500 mt-1">Unesite potrebne podatke za zakazivanje obuke</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <User size={16} /> Ime i prezime
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Jane Smith"
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Mail size={16} /> Email adresa
                            </label>
                            <input
                                type="email"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="jane.smith@example.com"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Phone size={16} /> Broj telefona
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="(555) 123-4567"
                                value={formData.phoneNumber}
                                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar size={16} /> Datum časa
                            </label>
                            <input
                                type="date"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.lessonDate}
                                onChange={e => setFormData({...formData, lessonDate: e.target.value})}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Clock size={16} /> Termin (Vrijeme)
                            </label>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.timeSlot}
                                onChange={e => setFormData({...formData, timeSlot: e.target.value})}
                                required
                            >
                                <option value="">Odaberi vrijeme</option>
                                <option value="08:00-08:45">08:00 - 08:45</option>
                                <option value="09:00-09:45">09:00 - 09:45</option>
                                <option value="10:30-11:15">10:30 - 11:15</option>
                                <option value="14:00-14:45">14:00 - 14:45</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Award size={16} /> Vrsta časa
                            </label>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.lessonType}
                                onChange={e => setFormData({...formData, lessonType: e.target.value})}
                            >
                                <option value="Beginner">Početna obuka</option>
                                <option value="Intermediate">Gradska vožnja</option>
                                <option value="Advanced">Poligon / Priprema za ispit</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <User size={16} className="text-blue-500" /> Odaberite instruktora
                            </label>
                            <select
                                className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.instructorId}
                                onChange={e => setFormData({...formData, instructorId: e.target.value})}
                                required
                            >
                                <option value="">Svi dostupni instruktori</option>
                                {instructors.map(i => (
                                    <option key={i.instructorId} value={i.instructorId}>
                                        {i.user.firstName} {i.user.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Car size={16} /> Mjenjač
                            </label>
                            <div className="flex gap-4">
                                {['Manual', 'Automatic'].map(type => (
                                    <label key={type} className="flex-1 flex items-center justify-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 transition-all">
                                        <input
                                            type="radio"
                                            name="transmission"
                                            className="hidden"
                                            checked={formData.transmission === type}
                                            onChange={() => setFormData({...formData, transmission: type})}
                                        />
                                        <span className="text-sm font-medium">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Dodatne napomene (opcionalno)
                            </label>
                            <textarea
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32"
                                placeholder="Npr. Treba mi vježba paralelnog parkiranja..."
                                value={formData.additionalNotes}
                                onChange={e => setFormData({...formData, additionalNotes: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 p-4 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 p-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                        >
                            {loading ? "Rezervacija..." : "Confirm Booking"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookLesson;


