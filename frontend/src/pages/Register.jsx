import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { api } from '../api/client';
import { parseApiError } from '../utils/errorHandler';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.firstName.trim()) { setError('Ime je obavezno.'); return; }
    if (!form.lastName.trim())  { setError('Prezime je obavezno.'); return; }
    if (!form.email.trim())     { setError('E-mail adresa je obavezna.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Unesite ispravnu e-mail adresu (npr. ime@domena.ba).');
      return;
    }
    if (!form.password)         { setError('Lozinka je obavezna.'); return; }
    if (form.password.length < 6) { setError('Lozinka mora imati najmanje 6 karaktera.'); return; }

    setLoading(true);
    try {
      await api.post('/api/users/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        passwordHash: form.password,
      });
      setSuccess('Nalog kreiran. Preusmjeravam na prijavu...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(parseApiError(err, { fallback: 'Registracija nije uspjela.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-500 w-14 h-14 rounded-xl flex items-center justify-center">
                <UserPlus className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-slate-900">Kreirajte račun</h1>
            <p className="text-center text-slate-500 mt-2">Pridruži se auto-školi</p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Ime
                  </label>
                  <input
                      required
                      value={form.firstName}
                      onChange={update('firstName')}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Prezime
                  </label>
                  <input
                      required
                      value={form.lastName}
                      onChange={update('lastName')}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  E-mail adresa
                </label>
                <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Lozinka
                </label>
                <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Min 6 karaktera"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg border border-blue-100">
                Registrovani ste kao <strong>kandidat</strong>. Računi instruktora i admina se isključivo kreiraju od strane administracije auto-škole.
              </div>

              {error && (
                  <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100">
                    {error}
                  </div>
              )}
              {success && (
                  <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg border border-green-100">
                    {success}
                  </div>
              )}

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? 'Kreiram nalog...' : 'Registruj se'}
              </button>
            </form>

            <p className="text-center text-slate-600 mt-6">
              Već imate račun?{' '}
              <Link to="/login" className="text-blue-500 font-semibold hover:underline">
                Prijavi se
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}