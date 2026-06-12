import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ArrowLeft, AlertTriangle, CheckCircle, XCircle, DollarSign, GraduationCap } from 'lucide-react';
import { financeApi } from '../services/financeApi';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import { ErrorState } from '../components/States';

const fmt = (n) =>
    new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'BAM' }).format(n ?? 0);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('bs-BA') : '—');

function ObligationsBar({ obligations }) {
    if (!obligations || obligations.length === 0) return null;
    const colors = ['bg-indigo-500', 'bg-blue-400', 'bg-cyan-400', 'bg-teal-400', 'bg-green-400'];
    return (
        <div className="space-y-1.5">
            {obligations.map((o, i) => {
                const pct = o.totalAmount > 0
                    ? Math.min((o.paidAmount / o.totalAmount) * 100, 100)
                    : 0;
                return (
                    <div key={o.id || i}>
                        <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                            <span className="font-medium">{o.label}</span>
                            <span>
                                {fmt(o.paidAmount)} / {fmt(o.totalAmount)}
                                {o.fullyPaid && <span className="ml-1 text-green-600">✓</span>}
                            </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full">
                            <div className={`h-full rounded-full transition-all ${colors[i] || 'bg-slate-400'}`}
                                 style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function PaymentModal({ row, onClose, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!val || val <= 0) { setError('Unesite pozitivan iznos.'); return; }
        setLoading(true);
        setError('');
        try {
            await financeApi.recordPayment(row.candidateId, val);
            onSuccess();
            onClose();
        } catch (err) {
            setError('Greška pri evidenciji uplate: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const remaining = row.remainingDebt ?? 0;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                <div
                    className="flex items-center justify-between px-6 py-5"
                    style={{ background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            <DollarSign className="text-white" size={17} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-none">Evidentiraj uplatu</h3>
                            <p className="text-xs text-blue-100 mt-1">{row._candidateName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-100 hover:text-white transition-colors"
                        style={{ background: 'rgba(255,255,255,0.15)' }}
                    >
                        ✕
                    </button>
                </div>

                <div className="px-6 pt-5">
                    <p className="text-sm text-slate-500">
                        Preostalo: <strong className="text-red-600">{fmt(remaining)}</strong>
                    </p>

                    {row.obligations && row.obligations.length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs font-semibold text-slate-500 mb-2">Stanje obaveza:</p>
                            {row.obligations.map((o, i) => (
                                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                                    <span className={o.fullyPaid ? 'text-green-600 line-through' : 'text-slate-700'}>
                                        {o.label}
                                    </span>
                                    <span className={o.fullyPaid ? 'text-green-600 font-medium' : 'text-slate-500'}>
                                        {o.fullyPaid
                                            ? '✓ Plaćeno'
                                            : `Preostalo: ${fmt(o.remainingAmount)}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Iznos uplate (KM) *
                        </label>
                        <input
                            type="number" step="0.01" min="0.01"
                            max={remaining > 0 ? remaining : undefined}
                            required
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            placeholder="npr. 300.00"
                            autoFocus
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm transition-all duration-200"
                            style={{
                                outline: 'none',
                                borderColor: focused ? '#3b82f6' : '',
                                boxShadow: focused ? '0 0 0 4px rgba(59,130,246,0.12)' : '',
                                backgroundColor: focused ? '#fff' : '',
                            }}
                        />
                        <p className="text-xs text-slate-400 mt-2">
                            Sistem automatski raspoređuje uplatu na obaveze redom.
                        </p>
                    </div>
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
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                            style={{
                                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)',
                                boxShadow: loading ? 'none' : '0 4px 15px rgba(59,130,246,0.4)',
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #1a4fc4 0%, #2563eb 100%)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)';
                                    e.currentTarget.style.transform = '';
                                }
                            }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                                    Evidentiram…
                                </span>
                            ) : (
                                'Potvrdi uplatu'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DetailModal({ row, onClose, onPay }) {
    const paidTotal = row.paidAmount ?? 0;
    const total = row.totalAmount ?? 1900;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                <div
                    className="px-6 py-5 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)' }}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <DollarSign className="text-white" size={17} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white leading-none">{row._candidateName}</h2>
                                <p className="text-xs text-blue-100 mt-1">{row._candidateEmail}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-100 hover:text-white transition-colors"
                            style={{ background: 'rgba(255,255,255,0.15)' }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {row.enrollmentEligible
                            ? <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.2)', color: '#bbf7d0' }}>
                                <CheckCircle size={12} /> Upisnina plaćena
                              </span>
                            : <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: '#fde68a' }}>
                                <XCircle size={12} /> Upisnina nije plaćena
                              </span>
                        }
                        {row.examEligible
                            ? <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.2)', color: '#bbf7d0' }}>
                                <CheckCircle size={12} /> Može na ispit
                              </span>
                            : <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: '#fecaca' }}>
                                <XCircle size={12} /> Ne može na ispit
                              </span>
                        }
                    </div>
                </div>

                {/* Sažetak */}
                <div className="grid grid-cols-3 gap-3 px-6 pt-5 flex-shrink-0">
                    <div className="rounded-2xl p-3 text-center" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
                        <p className="text-xs text-blue-500 font-semibold">Ukupno</p>
                        <p className="font-bold text-slate-800 text-sm mt-1">{fmt(total)}</p>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-3 text-center">
                        <p className="text-xs text-green-600 font-semibold">Plaćeno</p>
                        <p className="font-bold text-green-700 text-sm mt-1">{fmt(paidTotal)}</p>
                    </div>
                    <div className="bg-red-50 rounded-2xl p-3 text-center">
                        <p className="text-xs text-red-500 font-semibold">Preostalo</p>
                        <p className="font-bold text-red-700 text-sm mt-1">{fmt(row.remainingDebt)}</p>
                    </div>
                </div>

                {/* Obaveze */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Raspored obaveza</h3>
                    {(row.obligations || []).length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">Nema obaveza</p>
                    ) : (
                        <div className="space-y-3">
                            {(row.obligations || []).map((o, i) => {
                                const pct = o.totalAmount > 0
                                    ? Math.min((o.paidAmount / o.totalAmount) * 100, 100)
                                    : 0;
                                return (
                                    <div key={o.id || i}
                                         className={`border-2 rounded-2xl p-4 transition-all ${o.fullyPaid ? 'border-green-200 bg-green-50' : 'border-slate-100'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {o.fullyPaid
                                                    ? <CheckCircle size={16} className="text-green-600 shrink-0" />
                                                    : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                                                }
                                                <span className={`text-sm font-semibold ${o.fullyPaid ? 'text-green-700' : 'text-slate-800'}`}>
                                                    {o.label}
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">
                                                {fmt(o.totalAmount)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-slate-200 rounded-full mb-1.5">
                                            <div className={`h-full rounded-full ${o.fullyPaid ? 'bg-green-500' : 'bg-blue-500'}`}
                                                 style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Plaćeno: {fmt(o.paidAmount)}</span>
                                            {!o.fullyPaid && <span className="text-red-500">Preostalo: {fmt(o.remainingAmount)}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-slate-100 flex gap-3 flex-shrink-0">
                    {(row.remainingDebt ?? 0) > 0 && (
                        <button
                            onClick={onPay}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                            style={{
                                background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)',
                                boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #1a4fc4 0%, #2563eb 100%)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)';
                                e.currentTarget.style.transform = '';
                            }}
                        >
                            Evidentiraj uplatu
                        </button>
                    )}
                    <button onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                        Zatvori
                    </button>
                </div>
            </div>
        </div>
    );
}

async function generateReport(rows) {
    const { jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const withAccount = rows.filter(r => r._hasAccount);
    const totalAmount = withAccount.reduce((s, a) => s + parseFloat(a.totalAmount || 0), 0);
    const totalPaid   = withAccount.reduce((s, a) => s + parseFloat(a.paidAmount || 0), 0);
    const totalDebt   = withAccount.reduce((s, a) => s + parseFloat(a.remainingDebt || 0), 0);

    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#fff;font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;padding:40px;box-sizing:border-box;';

    container.innerHTML = `
        <div style="text-align:center;border-bottom:2px solid #2563eb;padding-bottom:16px;margin-bottom:24px">
            <div style="font-size:20px;font-weight:700;color:#2563eb">Finansijski Izvještaj</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px">Auto-škola — ${new Date().toLocaleDateString('bs-BA')}</div>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:24px">
            ${[
        ['Ukupno zaduženo', fmt(totalAmount), '#2563eb'],
        ['Naplaćeno',       fmt(totalPaid),   '#16a34a'],
        ['Preostali dug',   fmt(totalDebt),   '#dc2626'],
        ['Kandidata',       withAccount.length,'#374151'],
    ].map(([lbl, val, col]) => `
                <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center">
                    <div style="font-size:10px;color:#6b7280;text-transform:uppercase">${lbl}</div>
                    <div style="font-size:16px;font-weight:700;color:${col};margin-top:4px">${val}</div>
                </div>`).join('')}
        </div>
        <table style="width:100%;border-collapse:collapse">
            <thead>
                <tr style="background:#f8fafc">
                    ${['#','Kandidat','Upisnina','Ukupno','Plaćeno','Preostalo','Status'].map(h =>
        `<th style="padding:9px 10px;text-align:left;font-size:11px;color:#374151;border-bottom:1px solid #e5e7eb">${h}</th>`
    ).join('')}
                </tr>
            </thead>
            <tbody>
                ${withAccount.map((a, i) => {
        const enroll = (a.obligations || []).find(o => o.type === 'ENROLLMENT');
        const enrollOk = enroll?.fullyPaid;
        const debt = parseFloat(a.remainingDebt || 0);
        const paid = parseFloat(a.paidAmount || 0);
        const tot  = parseFloat(a.totalAmount || 1900);
        let bgS = '#dcfce7', colS = '#166534', lbl = 'Izmireno';
        if (debt > 0 && debt < tot) { bgS = '#fef3c7'; colS = '#92400e'; lbl = Math.round((paid/tot)*100)+'% plaćeno'; }
        if (paid === 0) { bgS = '#fee2e2'; colS = '#991b1b'; lbl = 'Nije plaćeno'; }
        return `<tr style="border-bottom:1px solid #f3f4f6">
                        <td style="padding:8px 10px">${i+1}</td>
                        <td style="padding:8px 10px;font-weight:600">${a._candidateName}</td>
                        <td style="padding:8px 10px">
                            <span style="background:${enrollOk?'#dcfce7':'#fef3c7'};color:${enrollOk?'#166534':'#92400e'};padding:2px 7px;border-radius:999px;font-size:11px">
                                ${enrollOk ? 'OK' : 'Nije'}
                            </span>
                        </td>
                        <td style="padding:8px 10px">${fmt(a.totalAmount)}</td>
                        <td style="padding:8px 10px;color:#16a34a">${fmt(a.paidAmount)}</td>
                        <td style="padding:8px 10px;color:#dc2626">${fmt(a.remainingDebt)}</td>
                        <td style="padding:8px 10px">
                            <span style="background:${bgS};color:${colS};padding:2px 7px;border-radius:999px;font-size:11px">${lbl}</span>
                        </td>
                    </tr>`;
    }).join('')}
            </tbody>
        </table>
        <div style="margin-top:24px;text-align:center;color:#9ca3af;font-size:11px">
            Generisano automatski — Finansijski modul Auto-škole
        </div>`;

    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
        pdf.save(`finansijski-izvjestaj-${new Date().toISOString().slice(0,10)}.pdf`);
    } finally {
        document.body.removeChild(container);
    }
}


export default function FinanceDashboard() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [payingRow, setPayingRow] = useState(null);
    const [ensuringId, setEnsuringId] = useState(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const { user, logout } = useAuth();
    const email  = user.email;
    const role   = user.role;

    const roleBadgeStyle =
        role === 'ADMIN'
            ? { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }
            : role === 'INSTRUCTOR'
                ? { background: 'rgba(255,255,255,0.15)', color: '#bfdbfe', border: '1px solid rgba(255,255,255,0.25)' }
                : { background: 'rgba(255,255,255,0.15)', color: '#a7f3d0', border: '1px solid rgba(255,255,255,0.25)' };

    const loadData = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        setError('');
        try {
            const candidatesRes = await api.get('/api/candidates');
            const candidates = candidatesRes.data;

            const candidateIds = candidates.map(c => c.candidateId);
            const statusesRes = await financeApi.getStatuses(candidateIds);
            const statuses = statusesRes.data;

            const merged = candidates.map(c => {
                const account = statuses.find(s => s.candidateId === c.candidateId) || null;
                const name = c.user
                    ? `${c.user.firstName} ${c.user.lastName}`
                    : `Kandidat #${c.candidateId}`;
                return {
                    ...(account || {}),
                    candidateId: c.candidateId,
                    _candidateName: name,
                    _candidateEmail: c.user?.email || '',
                    _hasAccount: !!account,
                };
            });

            setRows(merged);
        } catch (err) {
            setLoadError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const ensureAccount = async (candidateId) => {
        setEnsuringId(candidateId);
        try {
            await financeApi.ensureAccount(candidateId);
            await loadData();
        } catch (err) {
            console.error('ensureAccount error:', err);
            setError('Greška pri kreiranju računa: ' + (err?.response?.data?.message || err?.message || 'Nepoznata greška'));
        } finally {
            setEnsuringId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const withAccounts   = rows.filter(r => r._hasAccount);
    const noAccountCount = rows.filter(r => !r._hasAccount).length;
    const totalAmount    = withAccounts.reduce((s, a) => s + parseFloat(a.totalAmount || 0), 0);
    const totalPaid      = withAccounts.reduce((s, a) => s + parseFloat(a.paidAmount || 0), 0);
    const totalDebt      = withAccounts.reduce((s, a) => s + parseFloat(a.remainingDebt || 0), 0);

    const filtered = rows.filter(r =>
        search === '' ||
        r._candidateName.toLowerCase().includes(search.toLowerCase()) ||
        String(r.candidateId).includes(search)
    );

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
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center border"
                                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.3)' }}
                            >
                                <DollarSign className="text-white" size={22} />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-white leading-none">Finansije</h1>
                                <p className="text-xs text-blue-200 mt-0.5">Evidencija uplata kandidata</p>
                            </div>
                        </div>

                        <Link
                            to="/dashboard"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-100 transition-all duration-200 hover:text-white"
                            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        >
                            <ArrowLeft size={15} />
                            <span className="hidden sm:inline">Nazad na početnu</span>
                        </Link>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <p className="text-sm font-semibold text-white leading-none">{email}</p>
                            <span
                                className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold mt-1"
                                style={roleBadgeStyle}
                            >
                                {role || 'USER'}
                            </span>
                        </div>

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

                {/* Mobile nazad link */}
                <div className="sm:hidden border-t px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)' }}>
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-100 hover:text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                        <ArrowLeft size={15} />
                        Nazad na početnu
                    </Link>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-6xl mx-auto px-4 py-10">
                {/* Section header */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)', boxShadow: '0 4px 15px rgba(59,130,246,0.35)' }}
                        >
                            <DollarSign className="text-white" size={18} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Finansijski Pregled</h2>
                    </div>

                    <button
                        onClick={async () => {
                            setGeneratingPdf(true);
                            try { await generateReport(rows); }
                            finally { setGeneratingPdf(false); }
                        }}
                        disabled={withAccounts.length === 0 || generatingPdf}
                        className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40"
                        style={{
                            background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)',
                            boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
                        }}
                        onMouseEnter={(e) => {
                            if (withAccounts.length === 0 || generatingPdf) return;
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
                        {generatingPdf ? 'Generišem...' : 'Izvještaj'}
                    </button>
                </div>

                <p className="text-slate-500 text-sm mb-8">
                    Pratite uplate, obaveze i status kandidata na jednom mjestu.
                </p>

                {loadError && <ErrorState message={loadError} onRetry={loadData} />}

                {noAccountCount > 0 && !loadError && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3 text-sm text-amber-800">
                        <AlertTriangle size={16} className="flex-shrink-0" />
                        {noAccountCount} kandidat(a) nema finansijski račun — kliknite "Kreiraj račun" pored njihovog imena.
                    </div>
                )}

                {/* Sažetak */}
                {!loadError && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Ukupno zaduženo', value: fmt(totalAmount), icon: DollarSign, bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', iconColor: 'text-blue-500', valueColor: 'text-slate-900' },
                            { label: 'Naplaćeno', value: fmt(totalPaid), icon: CheckCircle, bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', iconColor: 'text-green-500', valueColor: 'text-green-700' },
                            { label: 'Preostali dug', value: fmt(totalDebt), icon: AlertTriangle, bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', iconColor: 'text-red-500', valueColor: 'text-red-600' },
                            { label: 'Kandidata', value: rows.length, icon: GraduationCap, bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', iconColor: 'text-blue-500', valueColor: 'text-blue-700' },
                        ].map(s => (
                            <div
                                key={s.label}
                                className="bg-white rounded-2xl border-2 border-slate-100 p-5 transition-all duration-300"
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
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                    style={{ background: s.bg }}
                                >
                                    <s.icon className={s.iconColor} size={18} />
                                </div>
                                <div className={`text-lg font-bold ${s.valueColor}`}>{s.value}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabela */}
                {!loadError && (
                    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <h3 className="font-bold text-slate-900 text-lg">Svi kandidati</h3>
                            <input
                                type="text" placeholder="Pretraži..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="border-2 border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 w-full sm:w-56"
                                style={{ outline: 'none' }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#3b82f6';
                                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.12)';
                                    e.currentTarget.style.backgroundColor = '#fff';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.boxShadow = '';
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                }}
                            />
                        </div>

                        {error && (
                            <div className="mx-6 mt-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kandidat</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Obaveze</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Preostalo</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                        <div
                                            className="inline-flex w-12 h-12 rounded-xl items-center justify-center mb-3"
                                            style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
                                        >
                                            <DollarSign className="text-blue-400" size={20} />
                                        </div>
                                        <p className="font-medium text-slate-500">Učitavanje...</p>
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">Nema kandidata</td></tr>
                                ) : filtered.map(row => (
                                    <tr key={row.candidateId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center shrink-0"
                                                    style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#3b82f6' }}
                                                >
                                                    {row._candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{row._candidateName}</div>
                                                    <div className="text-xs text-slate-400">{row._candidateEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {!row._hasAccount ? (
                                                <span className="text-xs text-amber-600 font-semibold">Nema račun</span>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${row.enrollmentEligible ? 'text-green-600' : 'text-amber-600'}`}>
                                                            {row.enrollmentEligible ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                                            Upisnina
                                                        </span>
                                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${row.examEligible ? 'text-green-600' : 'text-slate-400'}`}>
                                                            {row.examEligible ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                                        Ispit
                                                        </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 min-w-[180px]">
                                            {row._hasAccount
                                                ? <ObligationsBar obligations={row.obligations} />
                                                : <span className="text-xs text-slate-400">—</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            {row._hasAccount ? (
                                                <span className={`font-bold text-sm ${parseFloat(row.remainingDebt || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {fmt(row.remainingDebt)}
                                                    </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {row._hasAccount ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    {(row.remainingDebt ?? 0) > 0 && (
                                                        <button
                                                            onClick={() => setPayingRow(row)}
                                                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all duration-200"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)',
                                                                boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = 'linear-gradient(135deg, #1a4fc4 0%, #2563eb 100%)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)';
                                                            }}
                                                        >
                                                            Uplata
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedRow(row)}
                                                        className="px-3 py-1.5 border-2 border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                                                    >
                                                        Detalji
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => ensureAccount(row.candidateId)}
                                                    disabled={ensuringId === row.candidateId}
                                                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #1e5adb 0%, #3b82f6 100%)',
                                                        boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
                                                    }}
                                                >
                                                    {ensuringId === row.candidateId ? 'Kreiram...' : 'Kreiraj račun'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {selectedRow && (
                <DetailModal
                    row={selectedRow}
                    onClose={() => setSelectedRow(null)}
                    onPay={() => { setPayingRow(selectedRow); setSelectedRow(null); }}
                />
            )}
            {payingRow && (
                <PaymentModal
                    row={payingRow}
                    onClose={() => setPayingRow(null)}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
}