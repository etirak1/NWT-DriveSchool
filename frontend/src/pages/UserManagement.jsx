import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Users, Search, UserPlus, Trash2, Power,
  ChevronLeft, ChevronRight,
  GraduationCap, Shield,
} from 'lucide-react';
import RoleBadge from '../components/RoleBadge';
import StatusBadge from '../components/StatusBadge';
import AddUserModal from '../components/modals/AddUserModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import Header from '../components/Header';
import { useUserManagement } from '../hooks/useUserManagement';

const ROLES = ['ALL', 'ADMIN', 'INSTRUCTOR', 'CANDIDATE'];

const inputFocusStyle = (focused) => ({
  outline: 'none',
  borderColor: focused ? '#3b82f6' : '',
  boxShadow: focused ? '0 0 0 4px rgba(59,130,246,0.12)' : '',
  backgroundColor: focused ? '#fff' : '',
});

export default function UserManagement() {
  const queryClient = useQueryClient();
  const {
    users, totalPages, totalElements,
    page, setPage, sortBy, setSortBy,
    search, roleFilter, setRoleFilter,
    loading, error,
    showAdd, setShowAdd,
    deletingUser, setDeletingUser,
    searchFocused, setSearchFocused,
    handleSearchChange, handleDelete, handleToggleStatus, loadUsers,
  } = useUserManagement();

  const filteredUsers = users;

  const glassBtn = {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
  };

  return (
      <div className="min-h-screen bg-slate-50">
        <Header active="Korisnici" />
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
              <div
                  className="flex items-center gap-2 flex-1 min-w-0 bg-white border-2 rounded-xl px-4 py-2.5 transition-all duration-200"
                  style={{
                      borderColor: searchFocused ? '#3b82f6' : '#cbd5e1',
                      boxShadow: searchFocused ? '0 0 0 4px rgba(59,130,246,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
              >
                <Search className="w-5 h-5 flex-shrink-0 transition-colors duration-200"
                    style={{ color: searchFocused ? '#3b82f6' : '#94a3b8' }} />
                <input
                    type="search"
                    value={search}
                    onChange={handleSearchChange}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Pretraži po imenu ili emailu…"
                    className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400 min-w-0"
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
                onCreated={(role) => {
                    setShowAdd(false);
                    loadUsers();
                    if (role === 'INSTRUCTOR') {
                        queryClient.invalidateQueries({ queryKey: ['instructors-combined'] });
                    }
                    if (role === 'CANDIDATE') {
                        queryClient.invalidateQueries({ queryKey: ['candidates'] });
                    }
                }}
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
          className="flex-1 min-w-0 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm transition-all duration-200"
          style={inputFocusStyle(focused)}
      >
        {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
  );
}


