import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, Search, UserPlus, Trash2, Power,
  ChevronLeft, ChevronRight, ArrowLeft, LogOut, X,
  GraduationCap, Shield,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../utils/errorHandler';

const ROLES = ['ALL', 'ADMIN', 'INSTRUCTOR', 'CANDIDATE'];

const inputFocusStyle = (focused) => ({
  outline: 'none',
  borderColor: focused ? '#3b82f6' : '',
  boxShadow: focused ? '0 0 0 4px rgba(59,130,246,0.12)' : '',
  backgroundColor: focused ? '#fff' : '',
});

export default function UserManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [sortBy, setSortBy] = useState('userId');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/users', { params: { page, size, sortBy } });
      const data = res.data;
      setUsers(Array.isArray(data.content) ? data.content : []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      const msg =
          err?.response?.status === 403
              ? 'Nemate dozvolu za pregled korisnika.'
              : parseApiError(err, { fallback: 'Greška pri učitavanju korisnika.' });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sortBy]);

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
        !q ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  const handleDelete = async (u) => {
    try {
      await api.delete(`/api/users/${u.userId}`);
      setDeletingUser(null);
      loadUsers();
    } catch (err) {
      alert(parseApiError(err, {
        fallback: 'Greška pri brisanju.',
        conflictMessage: 'Korisnik se ne može obrisati jer ima aktivne termine.',
      }));
      setDeletingUser(null);
    }
  };

  const handleToggleStatus = async (u) => {
    const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(
          `/api/users/${u.userId}`,
          [{ op: 'replace', path: '/status', value: newStatus }],
          { headers: { 'Content-Type': 'application/json-patch+json' } }
      );
      loadUsers();
    } catch (err) {
      alert(parseApiError(err, { fallback: 'Greška pri ažuriranju statusa.' }));
    }
  };

  const glassBtn = {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
  };

  return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header
            className="relative"
            style={{ background: 'linear-gradient(135deg, #1a3a8f 0%, #1e5adb 50%, #3b82f6 100%)' }}
        >
          <div
              className="absolute top-0 right-0 w-96 h-full rounded-full blur-3xl pointer-events-none"
              style={{ background: 'rgba(147,197,253,0.1)', transform: 'translate(30%, -20%)' }}
          />
          <div className="relative max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Brand + back */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  <GraduationCap className="text-white" size={22} />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-white leading-none">DriveSchool</h1>
                  <p className="text-xs text-blue-200 mt-0.5">Upravljanje korisnicima</p>
                </div>
              </div>
              <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-100 hover:text-white transition-all duration-200"
                  style={glassBtn}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Nazad na početnu</span>
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-semibold text-white leading-none">{user.email}</p>
                <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold mt-1"
                    style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                {user.role}
              </span>
              </div>
              <button
                  onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-100 hover:text-white transition-all duration-200"
                  style={glassBtn}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Odjava</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
            {/* Section title */}
            <div className="flex items-center gap-3 mb-1">
              <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)', boxShadow: '0 4px 15px rgba(59,130,246,0.35)' }}
              >
                <Users className="text-white" size={18} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Upravljanje korisnicima</h2>
            </div>
            <p className="text-slate-500 text-sm mb-7 ml-[52px]">
              Upravljanje profilima korisnika i instruktora
            </p>

            {/* Filters row */}
            <div className="flex flex-col md:flex-row gap-3 mb-7">
              <div className="relative flex-1">
                <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200"
                    style={{ color: searchFocused ? '#3b82f6' : '#94a3b8' }}
                />
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Pretraži po imenu ili emailu…"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm transition-all duration-200"
                    style={inputFocusStyle(searchFocused)}
                />
              </div>

              <SelectField
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={ROLES.map((r) => ({ value: r, label: r === 'ALL' ? 'Svi korisnici' : r }))}
              />

              <SelectField
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                  options={[
                    { value: 'userId', label: 'Sortiranje: ID' },
                    { value: 'firstName', label: 'Sortiranje: Ime' },
                    { value: 'lastName', label: 'Sortiranje: Prezime' },
                    { value: 'email', label: 'Sortiranje: Email' },
                  ]}
              />

              <button
                  onClick={() => setShowAdd(true)}
                  className="flex items-center justify-center gap-2 text-white px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200"
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
                <UserPlus size={17} /> Dodaj korisnika
              </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="py-16 text-center">
                  <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">Učitavam korisnike…</p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-3">
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <>
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eff6ff 100%)' }}>
                        <th className="py-3.5 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Ime</th>
                        <th className="py-3.5 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Email</th>
                        <th className="py-3.5 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Uloga</th>
                        <th className="py-3.5 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                        <th className="py-3.5 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">Akcije</th>
                      </tr>
                      </thead>
                      <tbody>
                      {filteredUsers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-16 text-center">
                              <div
                                  className="inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-3"
                                  style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
                              >
                                <Users className="text-blue-400" size={20} />
                              </div>
                              <p className="text-slate-500 font-medium">Nema korisnika za prikaz.</p>
                            </td>
                          </tr>
                      )}
                      {filteredUsers.map((u) => (
                          <tr
                              key={u.userId}
                              className="border-t border-slate-100 transition-colors duration-150"
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8faff'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
                                >
                                  {(u.firstName?.[0] || '').toUpperCase()}{(u.lastName?.[0] || '').toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">{u.firstName} {u.lastName}</div>
                                  <div className="text-xs text-slate-400">ID: {u.userId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                            <td className="py-3.5 px-4"><RoleBadge role={u.role} /></td>
                            <td className="py-3.5 px-4"><StatusBadge status={u.status} /></td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                    onClick={() => handleToggleStatus(u)}
                                    title={u.status === 'ACTIVE' ? 'Deaktiviraj' : 'Aktiviraj'}
                                    className="p-2 rounded-xl text-slate-400 transition-all duration-200 hover:scale-110"
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#fffbeb';
                                      e.currentTarget.style.color = '#d97706';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '';
                                      e.currentTarget.style.color = '';
                                    }}
                                >
                                  <Power size={16} />
                                </button>
                                <button
                                    onClick={() => setDeletingUser(u)}
                                    title="Obriši"
                                    className="p-2 rounded-xl text-slate-400 transition-all duration-200 hover:scale-110"
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#fef2f2';
                                      e.currentTarget.style.color = '#dc2626';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '';
                                      e.currentTarget.style.color = '';
                                    }}
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
                      <div className="flex items-center justify-between mt-6 text-sm">
                        <p className="text-slate-400">
                          Prikazano <span className="font-semibold text-slate-700">{filteredUsers.length}</span> od{' '}
                          <span className="font-semibold text-slate-700">{totalElements}</span> korisnika
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                              onClick={() => setPage((p) => Math.max(0, p - 1))}
                              disabled={page === 0}
                              className="p-2.5 border-2 border-slate-200 rounded-xl disabled:opacity-30 text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
                      {page + 1} / {totalPages}
                    </span>
                          <button
                              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                              disabled={page >= totalPages - 1}
                              className="p-2.5 border-2 border-slate-200 rounded-xl disabled:opacity-30 text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
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

        {showAdd && (
            <AddUserModal
                onClose={() => setShowAdd(false)}
                onCreated={() => { setShowAdd(false); loadUsers(); }}
            />
        )}

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

function SelectField({ value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
      <select
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm bg-white transition-all duration-200"
          style={inputFocusStyle(focused)}
      >
        {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
  );
}

function RoleBadge({ role }) {
  const styles = {
    ADMIN:      { background: 'rgba(139,92,246,0.12)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.2)' },
    INSTRUCTOR: { background: 'rgba(59,130,246,0.12)', color: '#1d4ed8', border: '1px solid rgba(59,130,246,0.2)' },
    CANDIDATE:  { background: 'rgba(16,185,129,0.12)', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' },
  };
  const s = styles[role] || { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
  return (
      <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full" style={s}>
      {role || '—'}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE:   { background: 'rgba(16,185,129,0.12)', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' },
    INACTIVE: { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' },
  };
  const s = styles[status] || { background: 'rgba(245,158,11,0.12)', color: '#b45309', border: '1px solid rgba(245,158,11,0.2)' };
  return (
      <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full" style={s}>
      {status || '—'}
    </span>
  );
}

function AddUserModal({ onClose, onCreated }) {
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
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-3">
                  <Shield className="w-4 h-4 flex-shrink-0" />
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

function ConfirmDeleteModal({ user, onCancel, onConfirm }) {
  return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
          <div className="flex items-center justify-between px-6 py-5" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Trash2 className="text-white" size={17} />
              </div>
              <h3 className="text-lg font-bold text-white">Obriši korisnika</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-slate-600 text-sm leading-relaxed">
              Da li ste sigurni da želite obrisati korisnika{' '}
              <span className="font-bold text-slate-900">{user.firstName} {user.lastName}</span>?
              Ova akcija se ne može poništiti.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                Odustani
              </button>
              <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', boxShadow: '0 4px 15px rgba(239,68,68,0.4)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
                    e.currentTarget.style.transform = '';
                  }}
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
