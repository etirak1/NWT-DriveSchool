import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ArrowLeft, AlertTriangle, CheckCircle, XCircle, GraduationCap, Users, BookOpen, UserCheck, DollarSign, FileText, Search } from 'lucide-react';
import { financeApi } from '../services/financeApi';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import { ErrorState } from '../components/States';
import Header from "../components/Header.jsx";

const fmt = (n) =>
    new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'BAM' }).format(n ?? 0);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('bs-BA') : '—');

function ObligationsBar({ obligations }) {
    if (!obligations || obligations.length === 0) return null;
    const colors = ['bg-blue-500', 'bg-blue-400', 'bg-cyan-400', 'bg-teal-400', 'bg-sky-400'];
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
                                {o.fullyPaid && <span className="ml-1 text-emerald-600">✓</span>}
                            </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${colors[i] || 'bg-slate-400'}`}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-white text-base">Evidentiraj uplatu</h2>
                        <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors text-lg leading-none">✕</button>
                    </div>
                    <p className="text-blue-100 text-sm mt-1">
                        {row._candidateName} — preostalo: <strong className="text-white">{fmt(remaining)}</strong>
                    </p>
                </div>

                <div className="px-6 pt-5">
                    {row.obligations && row.obligations.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Stanje obaveza:</p>
                            {row.obligations.map((o, i) => (
                                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                                    <span className={`flex items-center gap-2 ${o.fullyPaid ? 'text-emerald-600' : 'text-slate-700'}`}>
                                        {o.fullyPaid
                                            ? <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                                            : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 shrink-0" />
                                        }
                                        {o.label}
                                    </span>
                                    <span className={`font-medium text-xs ${o.fullyPaid ? 'text-emerald-600' : 'text-slate-500'}`}>
                                        {o.fullyPaid
                                            ? 'Plaćeno'
                                            : `Preostalo: ${fmt(o.remainingAmount)}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                            <XCircle size={15} className="shrink-0" /> {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Iznos uplate (KM) *
                        </label>
                        <input
                            type="number" step="0.01" min="0.01"
                            max={remaining > 0 ? remaining : undefined}
                            required
                            value={amount}
                          
                            onChange={e => { e.target.setCustomValidity(''); setAmount(e.target.value); }}
                            onInvalid={e => {
                                const el = e.target;
                                if (el.validity.rangeOverflow) {
                                    el.setCustomValidity(`Iznos ne smije biti veći od ${el.max} KM.`);
                                } else if (el.validity.rangeUnderflow) {
                                    el.setCustomValidity('Iznos mora biti veći od 0.');
                                } else if (el.validity.valueMissing) {
                                    el.setCustomValidity('Unesite iznos uplate.');
                                } else {
                                    el.setCustomValidity('Neispravan unos.');
                                }
                            }}
                           className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                           placeholder="npr. 300.00"
                           autoFocus
                        />
                        <p className="text-xs text-slate-400 mt-1.5">
                            Sistem automatski raspoređuje uplatu na obaveze redom.
                        </p>
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            Odustani
                        </button>
                        <button type="submit" disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-800 to-blue-500 px-6 py-6 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">{row._candidateName}</h2>
                            <p className="text-blue-200 text-sm mt-0.5">{row._candidateEmail}</p>
                        </div>
                        <button onClick={onClose} className="text-blue-200 hover:text-white text-lg leading-none transition-colors">✕</button>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {row.enrollmentEligible
                            ? <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                                <CheckCircle size={11} /> Upisnina plaćena
                              </span>
                            : <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/30 text-amber-100 rounded-full text-xs font-medium">
                                <XCircle size={11} /> Upisnina nije plaćena
                              </span>
                        }
                        {row.examEligible
                            ? <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                                <CheckCircle size={11} /> Može na ispit
                              </span>
                            : <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-400/30 text-red-100 rounded-full text-xs font-medium">
                                <XCircle size={11} /> Ne može na ispit
                              </span>
                        }
                    </div>

                    {/* Sažetak */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {[
                            { label: 'Ukupno', value: fmt(total), cls: 'bg-white/10 text-white' },
                            { label: 'Plaćeno', value: fmt(paidTotal), cls: 'bg-emerald-400/20 text-emerald-100' },
                            { label: 'Preostalo', value: fmt(row.remainingDebt), cls: 'bg-red-400/20 text-red-100' },
                        ].map(s => (
                            <div key={s.label} className={`${s.cls} rounded-xl p-3 text-center backdrop-blur-sm`}>
                                <p className="text-xs opacity-80">{s.label}</p>
                                <p className="font-bold text-sm mt-0.5">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Obaveze */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide">Raspored obaveza</h3>
                    {(row.obligations || []).length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">Nema obaveza</p>
                    ) : (
                        <div className="space-y-3">
                            {(row.obligations || []).map((o, i) => {
                                const pct = o.totalAmount > 0
                                    ? Math.min((o.paidAmount / o.totalAmount) * 100, 100)
                                    : 0;
                                return (
                                    <div key={o.id || i}
                                         className={`border rounded-xl p-4 transition-colors ${o.fullyPaid ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-white hover:border-blue-100'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2.5">
                                                {o.fullyPaid
                                                    ? <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                                    : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                                                }
                                                <span className={`text-sm font-medium ${o.fullyPaid ? 'text-emerald-700' : 'text-slate-800'}`}>
                                                    {o.label}
                                                </span>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600">
                                                {fmt(o.totalAmount)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full mb-2 overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-500 ${o.fullyPaid ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                 style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Plaćeno: {fmt(o.paidAmount)}</span>
                                            {!o.fullyPaid && <span className="text-red-500 font-medium">Preostalo: {fmt(o.remainingAmount)}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0 bg-slate-50/50">
                    {(row.remainingDebt ?? 0) > 0 && (
                        <button onClick={onPay}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                            Evidentiraj uplatu
                        </button>
                    )}
                    <button onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
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

    const navItems = [
        { label: 'Korisnici', icon: Users, to: '/users' },
        { label: 'Resursi', icon: BookOpen, to: '/resources' },
        { label: 'Kandidati', icon: UserCheck, to: '/candidates' },
        { label: 'Finansije', icon: DollarSign, to: '/finance', active: true },
    ];

    return (
        <div className="min-h-screen bg-slate-100">
            <Header active="Finansije" />

            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
                {/* ── Page title ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-200">
                            <DollarSign size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Finansije</h2>
                            <p className="text-slate-500 text-sm mt-0.5">Evidencija uplata kandidata</p>
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            setGeneratingPdf(true);
                            try { await generateReport(rows); }
                            finally { setGeneratingPdf(false); }
                        }}
                        disabled={withAccounts.length === 0 || generatingPdf}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-md shadow-blue-200"
                    >
                        <FileText size={15} />
                        {generatingPdf ? 'Generišem...' : 'Izvještaj'}
                    </button>
                </div>

                {loadError && <ErrorState message={loadError} onRetry={loadData} />}

                {noAccountCount > 0 && !loadError && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-sm text-amber-800 shadow-sm">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                            <AlertTriangle size={15} className="text-amber-600" />
                        </div>
                        <span>
                            <strong>{noAccountCount} kandidat(a)</strong> nema finansijski račun — kliknite "Kreiraj račun" pored njihovog imena.
                        </span>
                    </div>
                )}

                {/* Sažetak */}
                {!loadError && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                        {[
                            { label: 'Ukupno zaduženo', value: fmt(totalAmount), icon: '📋', color: 'text-slate-900' },
                            { label: 'Naplaćeno',        value: fmt(totalPaid),   icon: '✅', color: 'text-emerald-700' },
                            { label: 'Preostali dug',    value: fmt(totalDebt),   icon: '⏳', color: 'text-red-600'    },
                            { label: 'Kandidata',        value: rows.length,      icon: '👥', color: 'text-blue-700'   },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="text-base sm:text-xl mb-1 sm:mb-2">{s.icon}</div>
                                <div className={`text-sm sm:text-xl font-bold break-all ${s.color}`}>{s.value}</div>
                                <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 font-medium leading-tight">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabela */}
                {!loadError && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-3 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900">Svi kandidati</h3>
                                <p className="text-xs text-slate-400 mt-0.5">{rows.length} ukupno</p>
                            </div>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Pretraži..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-60 transition-all bg-slate-50 focus:bg-white"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                                <XCircle size={14} className="shrink-0" /> {error}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kandidat</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Obaveze</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Preostalo</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm">Učitavanje...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm">
                                            Nema kandidata
                                        </td>
                                    </tr>
                                ) : filtered.map(row => (
                                    <tr key={row.candidateId} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                                                    {row._candidateName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 text-sm">{row._candidateName}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{row._candidateEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {!row._hasAccount ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        Nema račun
                                                    </span>
                                            ) : (
                                                <div className="flex flex-col gap-1.5">
                                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${row.enrollmentEligible ? 'text-emerald-700' : 'text-amber-600'}`}>
                                                            {row.enrollmentEligible
                                                                ? <CheckCircle size={12} className="text-emerald-500" />
                                                                : <XCircle size={12} className="text-amber-500" />
                                                            }
                                                            Upisnina
                                                        </span>
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${row.examEligible ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                            {row.examEligible
                                                                ? <CheckCircle size={12} className="text-emerald-500" />
                                                                : <XCircle size={12} className="text-slate-300" />
                                                            }
                                                        Ispit
                                                        </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px]">
                                            {row._hasAccount
                                                ? <ObligationsBar obligations={row.obligations} />
                                                : <span className="text-slate-300 text-xs">—</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            {row._hasAccount ? (
                                                <span className={`font-bold text-sm ${parseFloat(row.remainingDebt || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                        {fmt(row.remainingDebt)}
                                                    </span>
                                            ) : <span className="text-slate-300 text-xs">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-end">
                                                {!row._hasAccount ? (
                                                    <button onClick={() => ensureAccount(row.candidateId)}
                                                            disabled={ensuringId === row.candidateId}
                                                            className="px-3.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 disabled:opacity-50 transition-colors">
                                                        {ensuringId === row.candidateId ? 'Kreira...' : 'Kreiraj račun'}
                                                    </button>
                                                ) : (
                                                    <>
                                                        {parseFloat(row.remainingDebt || 0) > 0 && (
                                                            <button onClick={() => setPayingRow(row)}
                                                                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                                                                + Uplata
                                                            </button>
                                                        )}
                                                        <button onClick={() => setSelectedRow(row)}
                                                                className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors">
                                                            Detalji
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {filtered.length > 0 && (
                            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
                                <p className="text-xs text-slate-400">Prikazano {filtered.length} od {rows.length} kandidata</p>
                            </div>
                        )}
                    </div>
                )}
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
