import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const stateMessage = location.state?.message;

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const reason = searchParams.get('reason');

  let displayMessage = '';
  let messageType = 'amber';
  if (reason === 'service_offline') {
    displayMessage = 'Servis trenutno nije dostupan. Pokušajte kasnije.';
    messageType = 'red';
  } else if (reason === 'session_expired') {
    displayMessage = 'Sesija je istekla. Prijavite se ponovo.';
    messageType = 'amber';
  } else if (stateMessage) {
    displayMessage = stateMessage;
    messageType = 'amber';
  }

  useEffect(() => {
    if (reason || stateMessage) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Mora biti nakon svih hook-ova (React Rules of Hooks)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('E-mail adresa je obavezna.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Unesite ispravnu e-mail adresu (npr. ime@domena.ba).');
      return;
    }
    if (!password) {
      setError('Lozinka je obavezna.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Servis za prijavu trenutno nije dostupan. Molimo pokušajte kasnije.');
      } else if (err.response.status === 401 || err.response.status === 400) {
        setError('Pogrešan email ili lozinka.');
      } else if (err.response.status === 503 || err.response.status === 502) {
        setError('Servis za prijavu trenutno nije dostupan. Molimo pokušajte kasnije.');
      } else {
        const msg =
            (typeof err?.response?.data === 'string' ? err.response.data : null) ||
            err?.response?.data?.message ||
            'Došlo je do greške. Molimo pokušajte kasnije.';
        setError(msg);
      }
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
                <LogIn className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-slate-900">Dobro došli!</h1>
            <p className="text-center text-slate-500 mt-2">
              Prijavite se na svoj račun auto-škole
            </p>

            {displayMessage && (
                <div className={`mt-4 px-3 py-2 rounded-lg border text-sm text-center ${
                    messageType === 'red'
                        ? 'bg-red-50 text-red-700 border-red-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {displayMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  E-mail adresa
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Lozinka
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Unesite svoju lozinku"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>

              {error && (
                  <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100">
                    {error}
                  </div>
              )}

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? 'Prijavljivanje...' : 'Prijava'}
              </button>
            </form>

            <p className="text-center text-slate-600 mt-6">
              Nemate kreiran račun?{' '}
              <Link to="/register" className="text-blue-500 font-semibold hover:underline">
                Registruj se
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}