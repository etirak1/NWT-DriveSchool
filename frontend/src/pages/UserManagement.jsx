import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import { isAdmin } from '../auth/jwt';

const ROLES = ['ALL', 'ADMIN', 'INSTRUCTOR', 'CANDIDATE'];

export default function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('userId');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  // Provjera da je admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/users', {
        params: { page, size, sortBy },
      });
      // Spring Page response: { content, totalPages, totalElements, ... }
      const data = res.data;
      setUsers(Array.isArray(data.content) ? data.content : []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      const msg =
        err?.response?.status === 403
          ? 'Nemate dozvolu za pregled korisnika.'
          : err?.response?.data?.message || 'Greška pri učitavanju korisnika.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sortBy]);

  // Lokalno filtriranje po search + roli (backend ne podržava ova dva filtera nativno)
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  const handleDelete = async (user) => {
    try {
      await api.delete(`/api/users/${user.userId}`);
      setDeletingUser(null);
      loadUsers();
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      let msg = 'Greška pri brisanju.';
      if (status === 409) {
        msg = typeof body === 'string' ? body : 'Korisnik se ne može obrisati jer ima aktivne termine.';
      } else if (typeof body === 'string') {
        msg = body;
      } else if (body?.message) {
        msg = body.message;
      }
      alert(msg);
      setDeletingUser(null);
    }
  };

  const handleToggleStatus = async (user) => {
    // PATCH koristi JSON Patch standard
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(
        `/api/users/${user.userId}`,
        [{ op: 'replace', path: '/status', value: newStatus }],
        { headers: { 'Content-Type': 'application/json-patch+json' } }
      );
      loadUsers();
    } catch (err) {
      const msg =
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.response?.data?.message ||
        'Greška pri ažuriranju statusa.';
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="font-bold text-slate-900">Driving School Management</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {/* Title */}
          <div className="flex items-center gap-2 mb-1">
            <Users className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          </div>
          <p className="text-slate-500 text-sm mb-5">
            Manage candidate and instructor accounts
          </p>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name or email…"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r === 'ALL' ? 'All Users' : r}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="userId">Sort: ID</option>
              <option value="firstName">Sort: First Name</option>
              <option value="lastName">Sort: Last Name</option>
              <option value="email">Sort: Email</option>
            </select>

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap"
            >
              <UserPlus size={18} /> Add User
            </button>
          </div>

          {/* Loading / error */}
          {loading && <div className="text-slate-500 py-8 text-center">Učitavam…</div>}

          {!loading && error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                      <th className="py-3 px-2">Name</th>
                      <th className="py-3 px-2">Email</th>
                      <th className="py-3 px-2">Role</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          Nema korisnika za prikaz.
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.userId}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-2">
                          <div className="font-semibold text-slate-900">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-xs text-slate-500">ID: {u.userId}</div>
                        </td>
                        <td className="py-3 px-2 text-slate-700">{u.email}</td>
                        <td className="py-3 px-2">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="py-3 px-2">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              className="p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-700 rounded-lg"
                            >
                              <Power size={16} />
                            </button>
                            <button
                              onClick={() => setDeletingUser(u)}
                              title="Delete"
                              className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="flex items-center justify-between mt-5 text-sm">
                  <p className="text-slate-500">
                    Prikazano {filteredUsers.length} od {totalElements} korisnika
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-2 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-slate-700 font-semibold">
                      Strana {page + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-2 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Add user modal */}
      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            loadUsers();
          }}
        />
      )}

      {/* Delete confirm */}
      {deletingUser && (
        <ConfirmDeleteModal
          user={deletingUser}
          onCancel={() => setDeletingUser(null)}
          onConfirm={() => handleDelete(deletingUser)}
        />
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  const cls =
    role === 'ADMIN'
      ? 'bg-purple-100 text-purple-700'
      : role === 'INSTRUCTOR'
      ? 'bg-blue-100 text-blue-700'
      : role === 'CANDIDATE'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {role || '—'}
    </span>
  );
}

function StatusBadge({ status }) {
  const cls =
    status === 'ACTIVE'
      ? 'bg-green-100 text-green-700'
      : status === 'INACTIVE'
      ? 'bg-slate-200 text-slate-700'
      : 'bg-amber-100 text-amber-700';
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {status || '—'}
    </span>
  );
}

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CANDIDATE',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      const body = err?.response?.data;
      let msg = 'Greška pri kreiranju.';
      if (typeof body === 'string') msg = body;
      else if (body?.email) msg = body.email;
      else if (body?.message) msg = body.message;
      else if (body && typeof body === 'object') {
        // Spring validation errors vraćaju mapu polje→poruka
        msg = Object.values(body).join(' ');
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Add New User</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                First Name
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
                Last Name
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
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={update('email')}
              placeholder="user@example.com"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Password
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

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={update('role')}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="CANDIDATE">Candidate</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="ADMIN">Admin</option>
            </select>
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
              {submitting ? 'Kreiram…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ user, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-3">
          <div className="bg-red-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
            <Trash2 className="text-red-600" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Delete User</h3>
            <p className="text-sm text-slate-600 mt-1">
              Da li ste sigurni da želite obrisati korisnika{' '}
              <span className="font-semibold">
                {user.firstName} {user.lastName}
              </span>
              ? Ova akcija se ne može poništiti.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}