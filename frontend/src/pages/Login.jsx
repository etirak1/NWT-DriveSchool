import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { LogIn, Mail, Lock, Car, Award, Users, Clock, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const stateMessage = location.state?.message;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [serviceOffline, setServiceOffline] = useState(false);

  const reason = searchParams.get('reason');

  let displayMessage = '';
  let messageType = 'amber';
  if (serviceOffline) {
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
    if (reason === 'service_offline') {
      setServiceOffline(true);
    }
    if (reason || stateMessage) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [reason, stateMessage]);

  useEffect(() => {
    if (!serviceOffline) return;
    const check = async () => {
      try {
        await api.post('/api/auth/login', {}, { timeout: 3000 });
        setServiceOffline(false);
      } catch (err) {
        if (err.response) {
          // Got HTTP response (4xx/5xx) → service is up
          setServiceOffline(false);
        }
        // No response → still offline, do nothing
      }
    };
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [serviceOffline]);

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

  const features = [
    { icon: Car, label: 'Interaktivne vožnje', desc: 'Pratite svoj napredak' },
    { icon: Award, label: 'Certificirani instruktori', desc: 'Profesionalna obuka' },
    { icon: Clock, label: 'Fleksibilni termini', desc: 'Prilagodite vrijeme' },
    { icon: Users, label: 'Grupna obuka', desc: 'Učite zajedno' },
  ];

  return (
      <div className="min-h-screen flex">
        {/* Left - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3a8f 0%, #1e5adb 40%, #3b82f6 100%)' }}>
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,58,143,0.85) 0%, rgba(30,90,219,0.75) 50%, rgba(59,130,246,0.8) 100%)' }} />
          </div>


          <div className="absolute top-16 left-16 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(96,165,250,0.25)' }} />
          <div className="absolute bottom-32 right-8 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(59,130,246,0.2)', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(147,197,253,0.15)', animationDelay: '2s' }} />


          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border border-blue-400/20" />
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full border border-blue-300/15" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full border border-blue-400/20" />


          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30 shadow-lg">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-wide">DriveSchool</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5">
                Vaš put do<br />
                <span className="text-blue-200">
                vozačke dozvole
              </span>
              </h1>
              <p className="text-blue-100 text-lg max-w-md leading-relaxed">
                Moderna auto-škola s interaktivnim sistemom za praćenje napretka i rezervaciju termina.
              </p>
            </div>


            <div className="grid grid-cols-2 gap-4 mt-6">
              {features.map((feature, idx) => (
                  <div
                      key={idx}
                      className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default"
                  >
                    <feature.icon className="w-6 h-6 text-blue-200 mb-3 group-hover:scale-110 group-hover:text-white transition-all" />
                    <h3 className="text-white font-semibold mb-1 text-sm">{feature.label}</h3>
                    <p className="text-blue-200 text-xs">{feature.desc}</p>
                  </div>
              ))}
            </div>


            <div className="mt-10 pt-8 border-t border-white/20">
              <div className="flex gap-10">
                <div>
                  <p className="text-3xl font-bold text-white">2,500+</p>
                  <p className="text-blue-200 text-sm mt-0.5">Polaznika</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">98%</p>
                  <p className="text-blue-200 text-sm mt-0.5">Prolaznost</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">15+</p>
                  <p className="text-blue-200 text-sm mt-0.5">Godina iskustva</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)' }}>
                <Car className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-800">DriveSchool</span>
            </div>


            <div className="bg-white rounded-3xl p-8 sm:p-10">
              <div className="text-center mb-8">
                <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)', boxShadow: '0 8px 25px rgba(59,130,246,0.4)' }}
                >
                  <LogIn className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Dobro došli!</h2>
                <p className="text-slate-500 mt-2">Prijavite se na svoj račun auto-škole</p>
              </div>

              {displayMessage && (
                  <div className={`mb-6 px-4 py-3 rounded-xl border text-sm flex items-center gap-3 ${
                      messageType === 'red'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    {displayMessage}
                  </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    E-mail adresa
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                    <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200"
                        style={{ color: focusedField === 'email' ? '#3b82f6' : '#94a3b8' }}
                    />
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl transition-all duration-200"
                        style={{
                          outline: 'none',
                          borderColor: focusedField === 'email' ? '#3b82f6' : '',
                          boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(59,130,246,0.12)' : '',
                          backgroundColor: focusedField === 'email' ? '#fff' : '',
                        }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Lozinka
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                    <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200"
                        style={{ color: focusedField === 'password' ? '#3b82f6' : '#94a3b8' }}
                    />
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Unesite svoju lozinku"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl transition-all duration-200"
                        style={{
                          outline: 'none',
                          borderColor: focusedField === 'password' ? '#3b82f6' : '',
                          boxShadow: focusedField === 'password' ? '0 0 0 4px rgba(59,130,246,0.12)' : '',
                          backgroundColor: focusedField === 'password' ? '#fff' : '',
                        }}
                    />
                  </div>
                </div>


                {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-start gap-3">
                      <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full text-white font-semibold py-4 rounded-xl transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)',
                      boxShadow: loading ? 'none' : '0 8px 25px rgba(59,130,246,0.45)',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1a4fc4 0%, #2563eb 100%)';
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(59,130,246,0.55)';
                        e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.45)';
                        e.currentTarget.style.transform = '';
                      }
                    }}
                >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Prijavljivanje...
                      </>
                  ) : (
                      <>
                        Prijava
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                  )}
                </span>
                  {/* Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-center text-slate-500">
                  Nemate kreiran račun?{' '}
                  <Link
                      to="/register"
                      className="font-semibold inline-flex items-center gap-1 group transition-colors"
                      style={{ color: '#3b82f6' }}
                  >
                    Registruj se
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
