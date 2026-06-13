import { useState } from 'react';
import { UserPlus, X, Shield } from 'lucide-react';
import { api } from '../../api/client';
import { parseApiError } from '../../utils/errorHandler';

const inputFocusStyle = (focused) => ({
    outline: 'none',
    borderColor: focused ? '#3b82f6' : '',
    boxShadow: focused ? '0 0 0 4px rgba(59,130,246,0.12)' : '',
    backgroundColor: focused ? '#fff' : '',
});

export default function AddUserModal({ onClose, onCreated }) {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '', role: 'CANDIDATE',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState(null);

    const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.firstName.trim()) { setError('Ime je obavezno.'); return; }
        if (!form.lastName.trim())  { setError('Prezime je obavezno.'); return; }
        if (!form.email.trim())     { setError('E-mail adresa je obavezna.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError('Unesite ispravnu e-mail adresu (npr. ime@domena.ba).');
            return;
        }
        if (!form.password)           { setError('Lozinka je obavezna.'); return; }
        if (form.password.length < 6) { setError('Lozinka mora imati najmanje 6 karaktera.'); return; }

        setSubmitting(true);
        try {
            await api.post('/api/users', {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                passwordHash: form.password,
                role: form.role,
                status: 'ACTIVE',
            });
            onCreated();
        } catch (err) {
            setError(parseApiError(err, { fallback: 'Greška pri kreiranju.' }));
        } finally {
            setSubmitting(false);
        }
    };

    const fi = (field) => inputFocusStyle(focused === field);

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                <div
                    className="flex items-center justify-between px-6 py-5"
                    style={{ background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            <UserPlus className="text-white" size={17} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Dodaj novog korisnika</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-100 hover:text-white transition-colors"
                        style={{ background: 'rgba(255,255,255,0.15)' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Ime</label>
                            <input
                                required
                                value={form.firstName}
                                onChange={update('firstName')}
                                onFocus={() => setFocused('firstName')}
                                onBlur={() => setFocused(null)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm transition-all duration-200"
                                style={fi('firstName')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Prezime</label>
                            <input
                                required
                                value={form.lastName}
                                onChange={update('lastName')}
                                onFocus={() => setFocused('lastName')}
                                onBlur={() => setFocused(null)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm transition-all duration-200"
                                style={fi('lastName')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={update('email')}
                            onFocus={() => setFocused('email')}
                            onBlur={() => setFocused(null)}
                            placeholder="korisnik@example.com"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm transition-all duration-200"
                            style={fi('email')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Lozinka</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={form.password}
                            onChange={update('password')}
                            onFocus={() => setFocused('password')}
                            onBlur={() => setFocused(null)}
                            placeholder="Min 6 karaktera"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm transition-all duration-200"
                            style={fi('password')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Uloga</label>
                        <select
                            value={form.role}
                            onChange={update('role')}
                            onFocus={() => setFocused('role')}
                            onBlur={() => setFocused(null)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm transition-all duration-200"
                            style={fi('role')}
                        >
                            <option value="CANDIDATE">Kandidat</option>
                            <option value="INSTRUCTOR">Instruktor</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    {error && (
                        <div className="form-alert-error">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                        >
                            Odustani
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                            style={{
                                background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)',
                                boxShadow: submitting ? 'none' : '0 4px 15px rgba(59,130,246,0.4)',
                            }}
                            onMouseEnter={(e) => {
                                if (!submitting) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #1a4fc4 0%, #2563eb 100%)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!submitting) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)';
                                    e.currentTarget.style.transform = '';
                                }
                            }}
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                                    Kreiram…
                                </span>
                            ) : 'Kreiraj korisnika'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
