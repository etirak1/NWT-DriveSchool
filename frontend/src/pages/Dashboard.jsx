import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Megaphone,
  Plus,
  X,
  LogOut,
  User,
  Calendar as CalendarIcon,
  GraduationCap
} from 'lucide-react';
import { api } from '../api/client';
import { isAdmin, getCurrentRole, getCurrentEmail, getCurrentUserId } from '../auth/jwt';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const role = getCurrentRole();
  const email = getCurrentEmail();
  const userIsAdmin = isAdmin();

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/announcements');
      const list = Array.isArray(res.data) ? res.data : [];
      list.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      setAnnouncements(list);
      setError('');
    } catch (err) {
      setError('Greška pri učitavanju obavještenja.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">DriveSchool</h1>
                <p className="text-xs text-slate-500">Početna & obavještenja</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {userIsAdmin && (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link
                        to="/users"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-semibold"
                    >
                      Korisnici
                    </Link>

                    <Link
                        to="/resources"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold"
                    >
                      Resursi
                    </Link>

                    <Link
                        to="/candidates"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-semibold"
                    >
                      Kandidati
                    </Link>


                    <Link
                        to="/finance"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-semibold"
                    >
                      Finansije
                    </Link>
                  </div>
              )}

              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{email}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${
                    role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                }`}>
                {role || 'USER'}
              </span>
              </div>

              <button onClick={() => setIsMenuOpen(v => !v)} className="sm:hidden p-2 rounded-lg hover:bg-slate-100">
                {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
              </button>

              <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <LogOut size={16} /> Odjava
              </button>
            </div>
          </div>
        </header>

        {isMenuOpen && userIsAdmin && (
            <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-2">
              <Link to="/users">Korisnici</Link>
          <Link to="/resources">Resursi</Link>
          <Link to="/candidates">Kandidati</Link>
          <Link to="/finance">Finansije</Link>
          </div>
          )}

        {/* Main */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Megaphone className="text-blue-500" size={26} />
              <h2 className="text-2xl font-bold text-slate-900">Nedavna Obavještenja</h2>
            </div>

            {userIsAdmin && (
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm"
                >
                  <Plus size={18} /> Nova Obavještenja
                </button>
            )}
          </div>

          <p className="text-slate-500 text-sm mb-5">
            Budite u toku s najnovijim vijestima i važnim obavještenjima.
          </p>

          {loading && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                Učitavam obavještenja…
              </div>
          )}

          {!loading && error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
                {error}
              </div>
          )}

          {!loading && !error && announcements.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="inline-flex w-14 h-14 rounded-full bg-slate-100 items-center justify-center mb-3">
                  <Megaphone className="text-slate-400" size={24} />
                </div>
                <h3 className="font-semibold text-slate-800">Nema obavještenja</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Provjerite ponovo kasnije za nove informacije i važna obavještenja.
                </p>
              </div>
          )}

          {!loading && !error && announcements.length > 0 && (
              <div className="space-y-3">
                {announcements.map((a) => (
                    <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </div>
          )}
        </main>

        {showModal && userIsAdmin && (
            <CreateAnnouncementModal
                onClose={() => setShowModal(false)}
                onCreated={() => {
                  setShowModal(false);
                  loadAnnouncements();
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
      <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 transition-colors">
        <div className="flex items-start gap-3">
          <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
            <Megaphone className="text-blue-500" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900">{announcement.title}</h3>
            {announcement.content && (
                <p className="text-slate-600 mt-1 whitespace-pre-wrap">{announcement.content}</p>
            )}
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CalendarIcon size={12} /> {dt}
            </span>
              {announcement.createdBy && (
                  <span className="flex items-center gap-1">
              </span>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

function CreateAnnouncementModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const userId = getCurrentUserId();
      const payload = {
        title: title.trim(),
        content: content.trim(),
        createdBy: userId,
      };
      if (expirationDate) {
        payload.expirationDate = expirationDate;
      }
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

  return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Kreirajte novo obavještenje</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Naslov</label>
              <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Unesite naslov obavještenja"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Poruka</label>
              <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Unesite poruku obavještenja"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Datum isteka (opcionalno)
              </label>
              <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100">
                  {error}
                </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
              >
                Odustani
              </button>
              <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-semibold"
              >
                {submitting ? 'Kreiram…' : 'Kreiraj obavještenje'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}