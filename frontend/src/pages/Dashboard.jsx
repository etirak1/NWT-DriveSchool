import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
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

  const role = getCurrentRole();
  const email = getCurrentEmail();
  const userIsAdmin = isAdmin();

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/announcements');
      const list = Array.isArray(res.data) ? res.data : [];
      // Najnoviji prvi
      list.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      setAnnouncements(list);
      setError('');
    } catch (err) {
      const msg =
        err?.response?.status === 401
          ? 'Sesija je istekla. Prijavite se ponovo.'
          : err?.response?.data?.message || 'Greška pri učitavanju obavještenja.';
      setError(msg);
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
              <p className="text-xs text-slate-500">Dashboard & Announcements</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
	     {userIsAdmin && (
    	       <Link
                to="/users"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-semibold"
               >
                Manage Users
               </Link>
            )}
	    {userIsAdmin && (
  <Link
    to="/admin"
    className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold"
  >
    Admin Panel
  </Link>
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Megaphone className="text-blue-500" size={26} />
            <h2 className="text-2xl font-bold text-slate-900">Recent Announcements</h2>
          </div>

          {/* Admin može kreirati nove */}
          {userIsAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm"
            >
              <Plus size={18} /> New Announcement
            </button>
          )}
        </div>

        <p className="text-slate-500 text-sm mb-5">
          Stay updated with the latest news and important notices
        </p>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            Učitavam obavještenja…
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && announcements.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="inline-flex w-14 h-14 rounded-full bg-slate-100 items-center justify-center mb-3">
              <Megaphone className="text-slate-400" size={24} />
            </div>
            <h3 className="font-semibold text-slate-800">No announcements yet</h3>
            <p className="text-slate-500 text-sm mt-1">
              Check back later for updates and important notices
            </p>
          </div>
        )}

        {/* List */}
        {!loading && !error && announcements.length > 0 && (
          <div className="space-y-3">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        )}
      </main>

      {/* Modal za novi oglas — samo admin */}
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

// Kartica jednog obavještenja
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
                <User size={12} /> by user #{announcement.createdBy}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal forma za kreiranje novog obavještenja
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
      // Expiration date je opcionalan
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
          <h3 className="text-lg font-bold text-slate-900">Create New Announcement</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Message
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter announcement message"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Expiration Date (optional)
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-semibold"
            >
              {submitting ? 'Kreiram…' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}