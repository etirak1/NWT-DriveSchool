import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Megaphone,
  Plus,
  X,
  LogOut,
  Calendar as CalendarIcon,
  GraduationCap,
  Users,
  BookOpen,
  UserCheck,
  DollarSign,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useQueryClient } from '@tanstack/react-query';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user } = useAuth();
  const userId = user.userId;
  const email = user.email;
  const role = user.role;
  const userIsAdmin = role === 'ADMIN';

  const queryClient = useQueryClient();
  const { announcements: raw, isLoading: loading, isError } = useAnnouncements();
  const announcements = [...raw].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
  const error = isError ? 'Greška pri učitavanju obavještenja.' : '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { to: '/users', label: 'Korisnici', icon: Users },
    { to: '/resources', label: 'Resursi', icon: BookOpen },
    { to: '/candidates', label: 'Kandidati', icon: UserCheck },
    { to: '/finance', label: 'Finansije', icon: DollarSign },
  ];

  const roleBadgeStyle =
      role === 'ADMIN'
          ? { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }
          : role === 'INSTRUCTOR'
              ? { background: 'rgba(255,255,255,0.15)', color: '#bfdbfe', border: '1px solid rgba(255,255,255,0.25)' }
              : { background: 'rgba(255,255,255,0.15)', color: '#a7f3d0', border: '1px solid rgba(255,255,255,0.25)' };

  return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header
            className="relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1a3a8f 0%, #1e5adb 50%, #3b82f6 100%)' }}
        >
          {/* Subtle decorative orb */}
          <div
              className="absolute top-0 right-0 w-96 h-full rounded-full blur-3xl pointer-events-none"
              style={{ background: 'rgba(147,197,253,0.1)', transform: 'translate(30%, -20%)' }}
          />

          <div className="relative max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <GraduationCap className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">DriveSchool</h1>
                <p className="text-xs text-blue-200 mt-0.5">Početna & obavještenja</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden sm:flex items-center gap-2">
              {userIsAdmin &&
                  navLinks.map(({ to, label, icon: Icon }) => (
                      <Link
                          key={to}
                          to={to}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-100 transition-all duration-200 hover:text-white"
                          style={{ background: 'rgba(255,255,255,0.1)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.transform = '';
                          }}
                      >
                        <Icon size={14} />
                        {label}
                      </Link>
                  ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* User info */}
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-semibold text-white leading-none">{email}</p>
                <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold mt-1"
                    style={roleBadgeStyle}
                >
                {role || 'USER'}
              </span>
              </div>

              {/* Mobile menu toggle */}
              <button
                  onClick={() => setIsMenuOpen((v) => !v)}
                  className="sm:hidden p-2 rounded-xl text-blue-100 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Logout */}
              <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-100 hover:text-white transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Odjava</span>
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {isMenuOpen && userIsAdmin && (
              <div
                  className="sm:hidden border-t px-4 py-3 flex flex-col gap-1"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)' }}
              >
                {navLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-100 hover:text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      <Icon size={15} />
                      {label}
                    </Link>
                ))}
              </div>
          )}
        </header>

        {/* Main */}
        <main className="max-w-6xl mx-auto px-4 py-10">
          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)', boxShadow: '0 4px 15px rgba(59,130,246,0.35)' }}
              >
                <Megaphone className="text-white" size={18} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Nedavna Obavještenja</h2>
            </div>

            {userIsAdmin && (
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)',
                      boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #1a4fc4 0%, #2563eb 100%)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.5)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(59,130,246,0.4)';
                      e.currentTarget.style.transform = '';
                    }}
                >
                  <Plus size={17} />
                  Nova Obavještenja
                </button>
            )}
          </div>

          <p className="text-slate-500 text-sm mb-8">
            Budite u toku s najnovijim vijestima i važnim obavještenjima.
          </p>

          {loading && (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <div
                    className="inline-flex w-12 h-12 rounded-xl items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
                >
                  <Clock className="text-blue-400" size={22} />
                </div>
                <p className="text-slate-500 font-medium">Učitavam obavještenja…</p>
              </div>
          )}

          {!loading && error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-3">
                <Shield className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
          )}

          {!loading && !error && announcements.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <div
                    className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
                >
                  <Megaphone className="text-blue-400" size={24} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Nema obavještenja</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                  Provjerite ponovo kasnije za nove informacije i važna obavještenja.
                </p>
              </div>
          )}

          {!loading && !error && announcements.length > 0 && (
              <div className="space-y-4">
                {announcements.map((a) => (
                    <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </div>
          )}
        </main>

        {showModal && userIsAdmin && (
            <CreateAnnouncementModal
                userId={user.userId}
                onClose={() => setShowModal(false)}
                onCreated={() => {
                  setShowModal(false);
                  queryClient.invalidateQueries({ queryKey: ['announcements'] });
                }}
            />
        )}
      </div>
  );
}

function AnnouncementCard({ announcement }) {
  const dt = announcement.dateCreated
      ? new Date(announcement.dateCreated).toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      : '';

  return (
      <div
          className="group bg-white rounded-2xl border-2 border-slate-100 p-6 transition-all duration-300 cursor-default"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.12)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#f1f5f9';
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.transform = '';
          }}
      >
        <div className="flex items-start gap-4">
          <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
          >
            <Megaphone className="text-blue-500" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-base">{announcement.title}</h3>
            {announcement.content && (
                <p className="text-slate-600 mt-2 whitespace-pre-wrap text-sm leading-relaxed">{announcement.content}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CalendarIcon size={12} className="text-blue-400" />
              {dt}
            </span>
              {announcement.createdBy && (
                  <span className="flex items-center gap-1.5">
                <ArrowRight size={12} className="text-blue-300" />
              </span>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

function CreateAnnouncementModal({ onClose, onCreated, userId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        createdBy: userId,
      };
      if (expirationDate) payload.expirationDate = expirationDate;
      await api.post('/api/announcements', payload);
      onCreated();
    } catch (err) {
      const msg =
          (typeof err?.response?.data === 'string' ? err.response.data : null) ||
          err?.response?.data?.message ||
          err?.response?.data?.title ||
          'Greška pri kreiranju obavještenja.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldStyle = (field) => ({
    outline: 'none',
    borderColor: focusedField === field ? '#3b82f6' : '',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(59,130,246,0.12)' : '',
    backgroundColor: focusedField === field ? '#fff' : '',
  });

  return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
          {/* Modal header with gradient */}
          <div
              className="flex items-center justify-between px-6 py-5"
              style={{ background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Megaphone className="text-white" size={17} />
              </div>
              <h3 className="text-lg font-bold text-white">Kreirajte novo obavještenje</h3>
            </div>
            <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-100 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Naslov</label>
              <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Unesite naslov obavještenja"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm transition-all duration-200"
                  style={fieldStyle('title')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Poruka</label>
              <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => setFocusedField('content')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Unesite poruku obavještenja"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm resize-none transition-all duration-200"
                  style={fieldStyle('content')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Datum isteka{' '}
                <span className="font-normal text-slate-400">(opcionalno)</span>
              </label>
              <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  onFocus={() => setFocusedField('date')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm transition-all duration-200"
                  style={fieldStyle('date')}
              />
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-3">
                  <Shield className="w-5 h-5 flex-shrink-0" />
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
                ) : (
                    'Kreiraj obavještenje'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
