import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { financeApi, paymentApi } from '../services/financeApi';
import { getCurrentRole, getCurrentEmail, isAdmin } from '../auth/jwt';

const fmt = (n) =>
    new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'BAM' }).format(n ?? 0);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('bs-BA') : '—');

const StatusBadge = ({ status }) => {
    const map = {
        PAID:    { label: 'Plaćeno',      cls: 'bg-green-100 text-green-700 border border-green-200' },
        PENDING: { label: 'Na čekanju',   cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
        OVERDUE: { label: 'Kasni',        cls: 'bg-red-100 text-red-700 border border-red-200' },
        PARTIAL: { label: 'Djelimično',   cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
    };
    const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
};

function NewPaymentModal({ account, onClose, onSuccess }) {
    const [form, setForm] = useState({ amount: '', dueDate: '', status: 'PENDING', datePaid: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await paymentApi.create({
                candidateId: account.id,
                amount: parseFloat(form.amount),
                dueDate: form.dueDate,
                status: form.status,
                datePaid: form.datePaid || null,
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError('Greška pri kreiranju uplate: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Nova Uplata</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        ${account.user?.firstName} ${account.user?.lastName} — Preostali dug: <strong>{fmt(account.remainingDebt)}</strong>
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Iznos (BAM) *</label>
                        <input type="number" step="0.01" min="0.01" required value={form.amount}
                               onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                               className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                               placeholder="0.00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Datum dospijeća *</label>
                        <input type="date" required value={form.dueDate}
                               onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                               className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="PENDING">Na čekanju</option>
                            <option value="PAID">Plaćeno</option>
                            <option value="OVERDUE">Kasni</option>
                            <option value="PARTIAL">Djelimično</option>
                        </select>
                    </div>
                    {(form.status === 'PAID' || form.status === 'PARTIAL') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Datum uplate</label>
                            <input type="date" value={form.datePaid}
                                   onChange={e => setForm(f => ({ ...f, datePaid: e.target.value }))}
                                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            Odustani
                        </button>
                        <button type="submit" disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                            {loading ? 'Čuvanje...' : 'Dodaj Uplatu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CandidateDetailModal({ account, onClose, onAddPayment }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPayments = useCallback(async () => {
        try {
            const data = await paymentApi.getByCandidateId(account.id);
            setPayments(data || []);
        } catch {
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }, [account.id]);

    useEffect(() => { loadPayments(); }, [loadPayments]);

    const totalPaid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + parseFloat(p.amount || 0), 0);

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{account.user?.firstName} {account.user?.lastName}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">{account.user?.email} · Upisan: {fmtDate(account.enrollmentDate)}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-blue-50 rounded-xl p-3">
                            <p className="text-xs text-blue-600 font-medium">Ukupan dug</p>
                            <p className="text-base font-bold text-blue-800 mt-0.5">{fmt(account.totalAmount)}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-xs text-green-600 font-medium">Plaćeno</p>
                            <p className="text-base font-bold text-green-800 mt-0.5">{fmt(totalPaid)}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3">
                            <p className="text-xs text-red-600 font-medium">Preostalo</p>
                            <p className="text-base font-bold text-red-800 mt-0.5">{fmt(account.remainingDebt)}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Napredak plaćanja</span>
                            <span>{account.totalAmount > 0 ? Math.round((totalPaid / account.totalAmount) * 100) : 0}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-500"
                                 style={{ width: `${account.totalAmount > 0 ? Math.min((totalPaid / account.totalAmount) * 100, 100) : 0}%` }} />
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Uplate ({payments.length})</h3>
                        <button onClick={onAddPayment}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                            + Nova Uplata
                        </button>
                    </div>
                    {loading ? (
                        <div className="text-center py-8 text-gray-400 text-sm">Učitavanje...</div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">Nema uplata</div>
                    ) : (
                        <div className="space-y-2">
                            {payments.map(p => (
                                <div key={p.paymentId || p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm">💳</div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{fmt(p.amount)}</p>
                                            <p className="text-xs text-gray-500">Dospijeće: {fmtDate(p.dueDate)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={p.status} />
                                        {p.datePaid && <p className="text-xs text-gray-400 mt-1">Plaćeno: {fmtDate(p.datePaid)}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-gray-100 flex-shrink-0">
                    <button onClick={onClose}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Zatvori
                    </button>
                </div>
            </div>
        </div>
    );
}

function generateReport(accounts) {
    const total = accounts.reduce((s, a) => s + parseFloat(a.totalAmount || 0), 0);
    const collected = accounts.reduce((s, a) => s + (parseFloat(a.totalAmount || 0) - parseFloat(a.remainingDebt || 0)), 0);
    const remaining = accounts.reduce((s, a) => s + parseFloat(a.remainingDebt || 0), 0);

    const html = `<!DOCTYPE html><html lang="bs"><head><meta charset="UTF-8"><title>Finansijski Izvještaj</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;padding:40px;color:#1a1a1a}
.header{text-align:center;margin-bottom:32px;border-bottom:2px solid #2563eb;padding-bottom:20px}
.header h1{font-size:24px;color:#2563eb;font-weight:700}.header p{color:#6b7280;font-size:13px;margin-top:4px}
.summary{display:flex;gap:16px;margin-bottom:32px}.summary-card{flex:1;border:1px solid #e5e7eb;border-radius:12px;padding:16px;text-align:center}
.summary-card .label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px}
.summary-card .value{font-size:20px;font-weight:700;margin-top:4px}
.total .value{color:#2563eb}.collected .value{color:#16a34a}.remaining .value{color:#dc2626}
table{width:100%;border-collapse:collapse;font-size:13px}thead tr{background:#f8fafc}
th{padding:10px 12px;text-align:left;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb}
td{padding:10px 12px;border-bottom:1px solid #f3f4f6}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500}
.badge-ok{background:#dcfce7;color:#166534}.badge-warn{background:#fef3c7;color:#92400e}.badge-err{background:#fee2e2;color:#991b1b}
.footer{margin-top:32px;text-align:center;color:#9ca3af;font-size:12px}</style></head>
<body>
<div class="header"><h1>🏫 Finansijski Izvještaj</h1>
<p>Auto-škola · ${new Date().toLocaleDateString('bs-BA')}</p></div>
<div class="summary">
<div class="summary-card total"><div class="label">Ukupno zaduženo</div><div class="value">${fmt(total)}</div></div>
<div class="summary-card collected"><div class="label">Prikupljeno</div><div class="value">${fmt(collected)}</div></div>
<div class="summary-card remaining"><div class="label">Preostalo</div><div class="value">${fmt(remaining)}</div></div>
<div class="summary-card"><div class="label">Br. kandidata</div><div class="value" style="color:#374151">${accounts.length}</div></div>
</div>
<table><thead><tr><th>#</th><th>Kandidat ID</th><th>Datum upisa</th><th>Ukupno</th><th>Preostalo</th><th>Status</th></tr></thead>
<tbody>${accounts.map((a, i) => {
        const debt = parseFloat(a.remainingDebt || 0);
        const tot = parseFloat(a.totalAmount || 0);
        const pct = tot > 0 ? Math.round(((tot - debt) / tot) * 100) : 0;
        let cls = 'badge-ok', lbl = 'Plaćeno';
        if (debt > 0 && debt < tot) { cls = 'badge-warn'; lbl = pct + '% plaćeno'; }
        if (debt >= tot && tot > 0) { cls = 'badge-err'; lbl = 'Nije plaćeno'; }
        return `<tr><td>${i+1}</td><td><strong>${a.id}</strong></td><td>${fmtDate(a.enrollmentDate)}</td><td>${fmt(a.totalAmount)}</td><td>${fmt(a.remainingDebt)}</td><td><span class="badge ${cls}">${lbl}</span></td></tr>`;
    }).join('')}</tbody></table>
<div class="footer">Generisano automatski · Finansijski modul Auto-škole</div>
</body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
}

function generateUplatnica(account) {
    const html = `<!DOCTYPE html><html lang="bs"><head><meta charset="UTF-8"><title>Uplatnica #${account.id}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Courier New',monospace;padding:40px;background:#fff}
.uplatnica{border:2px solid #1a1a1a;border-radius:4px;max-width:600px;margin:0 auto}
.u-header{background:#1e3a8a;color:white;padding:16px 20px}
.u-header h1{font-size:18px;font-weight:700;letter-spacing:1px}.u-header p{font-size:12px;opacity:0.8;margin-top:2px}
.u-body{padding:20px}.u-row{display:flex;gap:16px;margin-bottom:12px}.u-field{flex:1}
.u-field label{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:3px}
.u-field .val{font-size:14px;font-weight:600;border-bottom:1px solid #d1d5db;padding-bottom:4px}
.u-amount{background:#f0f9ff;border:1px dashed #2563eb;border-radius:8px;padding:16px;margin:16px 0;text-align:center}
.u-amount .amount-label{font-size:11px;color:#2563eb;text-transform:uppercase;letter-spacing:1px}
.u-amount .amount-val{font-size:32px;font-weight:700;color:#1e3a8a;margin-top:4px}
.barcode{text-align:center;padding:16px;border-top:1px dashed #e5e7eb;font-size:11px;color:#9ca3af;letter-spacing:3px}
.u-footer{background:#f8fafc;padding:12px 20px;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb}</style></head>
<body><div class="uplatnica">
<div class="u-header"><h1>🏫 UPLATNICA — AUTO-ŠKOLA</h1><p>Finansijski servis</p></div>
<div class="u-body">
<div class="u-row">
<div class="u-field"><label>Kandidat ID</label><div class="val">#${account.id}</div></div>
<div class="u-field"><label>Datum upisa</label><div class="val">${fmtDate(account.enrollmentDate)}</div></div>
<div class="u-field"><label>Datum uplatnice</label><div class="val">${new Date().toLocaleDateString('bs-BA')}</div></div>
</div>
<div class="u-amount"><div class="amount-label">Iznos za uplatu (preostali dug)</div><div class="amount-val">${fmt(account.remainingDebt)}</div></div>
<div class="u-row">
<div class="u-field"><label>Ukupan iznos obuke</label><div class="val">${fmt(account.totalAmount)}</div></div>
<div class="u-field"><label>Već uplaćeno</label><div class="val">${fmt((account.totalAmount || 0) - (account.remainingDebt || 0))}</div></div>
</div>
<div class="u-row">
<div class="u-field"><label>Primatelj</label><div class="val">Auto-škola d.o.o.</div></div>
<div class="u-field"><label>IBAN</label><div class="val">BA39 1234 5678 9012 3456</div></div>
</div>
<div class="u-row"><div class="u-field"><label>Svrha doznake</label><div class="val">Obuka kandidata #${account.id}</div></div></div>
</div>
<div class="barcode">||| | || | ||| || | |||| | || | ||| | ||||||<br>REF: AŠ-${String(account.id).padStart(6,'0')}-${new Date().getFullYear()}</div>
<div class="u-footer">Uplatnica je generisana automatski. Čuvajte kao dokaz o obavezi.</div>
</div></body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
}

export default function FinanceDashboard() {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [paymentTarget, setPaymentTarget] = useState(null);
    const [refresh, setRefresh] = useState(0);

    const role = getCurrentRole();
    const email = getCurrentEmail();
    const userIsAdmin = isAdmin();

    const totalDebt = accounts.reduce((s, a) => s + parseFloat(a.remainingDebt || 0), 0);
    const totalCollected = accounts.reduce((s, a) => s + (parseFloat(a.totalAmount || 0) - parseFloat(a.remainingDebt || 0)), 0);
    const totalAmount = accounts.reduce((s, a) => s + parseFloat(a.totalAmount || 0), 0);

    const loadAccounts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await financeApi.getAllPaginated(page, 10);
            setAccounts(data.content || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            setError('Nije moguće učitati podatke: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [page, refresh]);

    useEffect(() => { loadAccounts(); }, [loadAccounts]);

    const filtered = accounts.filter(a =>
        search === '' || String(a.id).includes(search) || (a.user?.firstName + ' ' + a.user?.lastName).toLowerCase().includes(search.toLowerCase())
    );

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
                            <p className="text-xs text-slate-500">Finansijski Servis</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {userIsAdmin && (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link to="/users" className="px-3 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-semibold">Manage Users</Link>
                                <Link to="/resources" className="px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold">Resource Management</Link>
                                <Link to="/candidates" className="px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-semibold">Candidates</Link>
                                <Link to="/finance" className="px-3 py-2 text-sm bg-amber-100 text-amber-800 rounded-lg font-semibold">💰 Finance</Link>
                            </div>
                        )}
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800">{email}</p>
                            <span className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700">{role}</span>
                        </div>
                        <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Page title + report button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">💰 Finansijski Servis</h2>
                        <p className="text-slate-500 text-sm mt-1">Praćenje uplata i finansijsko poslovanje auto-škole</p>
                    </div>
                    <button onClick={() => generateReport(accounts)} disabled={accounts.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm">
                        📄 Generiši Izvještaj
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Ukupno zaduženo', value: fmt(totalAmount),    icon: '📋', color: 'text-slate-900' },
                        { label: 'Naplaćeno',        value: fmt(totalCollected), icon: '✅', color: 'text-green-700' },
                        { label: 'Preostali dug',    value: fmt(totalDebt),      icon: '⏳', color: 'text-red-600'   },
                        { label: 'Broj kandidata',   value: accounts.length,     icon: '👥', color: 'text-blue-700'  },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="text-2xl mb-2">{s.icon}</div>
                            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <h3 className="font-semibold text-slate-900">Kandidati</h3>
                        <input type="text" placeholder="Pretraži po ID kandidata..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64" />
                    </div>

                    {error && (
                        <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-slate-50 text-left">
                                <th className="px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Kandidat</th>
                                <th className="px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Datum upisa</th>
                                <th className="px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Ukupno</th>
                                <th className="px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Preostalo</th>
                                <th className="px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Napredak</th>
                                <th className="px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Akcije</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                    <div className="animate-pulse">Učitavanje...</div>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">Nema pronađenih kandidata</td></tr>
                            ) : filtered.map(a => {
                                const tot = parseFloat(a.totalAmount || 0);
                                const debt = parseFloat(a.remainingDebt || 0);
                                const pct = tot > 0 ? Math.min(((tot - debt) / tot) * 100, 100) : 0;
                                return (
                                    <tr key={a.id || a.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                                                    {a.user?.firstName?.[0]}{a.user?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{a.user?.firstName} {a.user?.lastName}</div>
                                                    <div className="text-xs text-slate-400">{a.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{fmtDate(a.enrollmentDate)}</td>
                                        <td className="px-5 py-4 font-medium text-slate-900">{fmt(a.totalAmount)}</td>
                                        <td className="px-5 py-4">
                                                <span className={debt > 0 ? 'font-semibold text-red-600' : 'font-semibold text-green-600'}>
                                                    {fmt(debt)}
                                                </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full min-w-[60px]">
                                                    <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : pct > 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                                         style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs text-slate-500 w-8">{Math.round(pct)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setSelectedAccount(a)}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                                                    Detalji
                                                </button>
                                                <button onClick={() => generateUplatnica(a)}
                                                        className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors" title="Generiši uplatnicu">
                                                    🧾
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Stranica {page + 1} od {totalPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors">
                                    ← Prethodna
                                </button>
                                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors">
                                    Sljedeća →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedAccount && !paymentTarget && (
                <CandidateDetailModal
                    account={selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                    onAddPayment={() => setPaymentTarget(selectedAccount)}
                />
            )}

            {paymentTarget && (
                <NewPaymentModal
                    account={paymentTarget}
                    onClose={() => setPaymentTarget(null)}
                    onSuccess={() => {
                        setRefresh(r => r + 1);
                        setPaymentTarget(null);
                    }}
                />
            )}
        </div>
    );
}