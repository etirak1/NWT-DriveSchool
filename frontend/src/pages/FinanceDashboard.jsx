import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ArrowLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Evidentiraj uplatu</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {row._candidateName} — preostalo: <strong className="text-red-600">{fmt(remaining)}</strong>
                    </p>
                </div>

               
                <div className="px-5 pt-4">
                    {row.obligations && row.obligations.length > 0 && (
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Stanje obaveza:</p>
                            {row.obligations.map((o, i) => (
                                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                                    <span className={o.fullyPaid ? 'text-green-600 line-through' : 'text-slate-700'}>
                                        {o.label}
                                    </span>
                                    <span className={o.fullyPaid ? 'text-green-600' : 'text-slate-500'}>
                                        {o.fullyPaid
                                            ? '✓ Plaćeno'
                                            : `Preostalo: ${fmt(o.remainingAmount)}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Iznos uplate (KM) *
                        </label>
                        <input
                            type="number" step="0.01" min="0.01"
                            max={remaining > 0 ? remaining : undefined}
                            required
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="npr. 300.00"
                            autoFocus
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            Sistem automatski raspoređuje uplatu na obaveze redom.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                            Odustani
                        </button>
                        <button type="submit" disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {loading ? 'Evidentira...' : 'Potvrdi uplatu'}
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{row._candidateName}</h2>
                            <p className="text-sm text-gray-400 mt-0.5">{row._candidateEmail}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {row.enrollmentEligible
                            ? <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <CheckCircle size={12} /> Upisnina plaćena
                              </span>
                            : <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                <XCircle size={12} /> Upisnina nije plaćena
                              </span>
                        }
                        {row.examEligible
                            ? <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <CheckCircle size={12} /> Može na ispit
                              </span>
                            : <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                <XCircle size={12} /> Ne može na ispit
                              </span>
                        }
                    </div>

                    {/* Sažetak */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-slate-500">Ukupno</p>
                            <p className="font-bold text-slate-800 text-sm mt-0.5">{fmt(total)}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-green-600">Plaćeno</p>
                            <p className="font-bold text-green-700 text-sm mt-0.5">{fmt(paidTotal)}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-red-500">Preostalo</p>
                            <p className="font-bold text-red-700 text-sm mt-0.5">{fmt(row.remainingDebt)}</p>
                        </div>
                    </div>
                </div>

                {/* Obaveze */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="font-medium text-slate-900 mb-4">Raspored obaveza</h3>
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
                                         className={`border rounded-xl p-4 ${o.fullyPaid ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {o.fullyPaid
                                                    ? <CheckCircle size={16} className="text-green-600 shrink-0" />
                                                    : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                                                }
                                                <span className={`text-sm font-medium ${o.fullyPaid ? 'text-green-700' : 'text-slate-800'}`}>
                                                    {o.label}
                                                </span>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600">
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

                <div className="p-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
                    {(row.remainingDebt ?? 0) > 0 && (
                        <button onClick={onPay}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                            Evidentiraj uplatu
                        </button>
                    )}
                    <button onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
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
        console.log('ensureAccount called with:', candidateId);
        setEnsuringId(candidateId);
        try {
            const res = await financeApi.ensureAccount(candidateId);
            console.log('ensureAccount response:', res);
            await loadData();
        } catch (err) {
            console.error('ensureAccount error:', err);
            setError('Greška pri kreiranju računa: ' + (err?.response?.data?.message || err?.message || 'Nepoznata greška'));
        } finally {
            setEnsuringId(null);
        }
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
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm">
                        <ArrowLeft size={16} /> Nazad na početnu
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800">{email}</p>
                            <span className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700">{role}</span>
                        </div>
                        <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                            <LogOut size={16} /> Odjava
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Finansije</h2>
                        <p className="text-slate-500 text-sm mt-0.5">Evidencija uplata kandidata</p>
                    </div>
                    <button
                        onClick={async () => {
                            setGeneratingPdf(true);
                            try { await generateReport(rows); }
                            finally { setGeneratingPdf(false); }
                        }}
                        disabled={withAccounts.length === 0 || generatingPdf}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 shadow-sm"
                    >
                        {generatingPdf ? 'Generišem...' : 'Izvještaj'}
                    </button>
                </div>

                {loadError && <ErrorState message={loadError} onRetry={loadData} />}

                {noAccountCount > 0 && !loadError && (
                    <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-amber-800">
                        <AlertTriangle size={15} />
                        {noAccountCount} kandidat(a) nema finansijski račun — kliknite "Kreiraj račun" pored njihovog imena.
                    </div>
                )}

                {/* Sažetak */}
                {!loadError && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Ukupno zaduženo', value: fmt(totalAmount),  icon: '📋', color: 'text-slate-900' },
                        { label: 'Naplaćeno',        value: fmt(totalPaid),   icon: '✅', color: 'text-green-700' },
                        { label: 'Preostali dug',    value: fmt(totalDebt),   icon: '⏳', color: 'text-red-600'  },
                        { label: 'Kandidata',        value: rows.length,      icon: '👥', color: 'text-blue-700' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="text-xl mb-1">{s.icon}</div>
                            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>}

                {/* Tabela */}
                {!loadError && <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <h3 className="font-semibold text-slate-900">Svi kandidati</h3>
                        <input type="text" placeholder="Pretraži..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56" />
                    </div>

                    {error && (
                        <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kandidat</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Obaveze</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Preostalo</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">Učitavanje...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">Nema kandidata</td></tr>
                                ) : filtered.map(row => (
                                    <tr key={row.candidateId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                    {row._candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{row._candidateName}</div>
                                                    <div className="text-xs text-slate-400">{row._candidateEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {!row._hasAccount ? (
                                                <span className="text-xs text-amber-600 font-medium">Nema račun</span>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${row.enrollmentEligible ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {row.enrollmentEligible ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                                        Upisnina
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${row.examEligible ? 'text-green-600' : 'text-slate-400'}`}>
                                                        {row.examEligible ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                                        Ispit
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 min-w-[180px]">
                                            {row._hasAccount
                                                ? <ObligationsBar obligations={row.obligations} />
                                                : <span className="text-xs text-slate-400">—</span>
                                            }
                                        </td>
                                        <td className="px-5 py-4">
                                            {row._hasAccount ? (
                                                <span className={`font-semibold text-sm ${parseFloat(row.remainingDebt || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {fmt(row.remainingDebt)}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {!row._hasAccount ? (
                                                <button onClick={() => ensureAccount(row.candidateId)}
                                                        disabled={ensuringId === row.candidateId}
                                                        className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium hover:bg-amber-100 disabled:opacity-50">
                                                    {ensuringId === row.candidateId ? 'Kreira...' : 'Kreiraj račun'}
                                                </button>
                                            ) : (
                                                <div className="flex gap-2 justify-end">
                                                    {parseFloat(row.remainingDebt || 0) > 0 && (
                                                        <button onClick={() => setPayingRow(row)}
                                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                                                            + Uplata
                                                        </button>
                                                    )}
                                                    <button onClick={() => setSelectedRow(row)}
                                                            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200">
                                                        Detalji
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>}
            </div>

            {selectedRow && !payingRow && (
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
                    onSuccess={() => { loadData(); setPayingRow(null); }}
                />
            )}
        </div>
    );
}
