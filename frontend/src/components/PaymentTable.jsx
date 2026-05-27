import React, { useState, useMemo } from 'react';

/**
 * PaymentTable – prikazuje listu uplata sa filterima.
 * Filtriranje je isključivo na frontendu (useMemo),
 * bez dodatnih zahtjeva prema serveru.
 */
export default function PaymentTable({ payments, formatDate }) {
    const [filterStatus, setFilterStatus]       = useState('ALL');
    const [filterCandidate, setFilterCandidate] = useState('');
    const [sortField, setSortField]             = useState('datePaid');
    const [sortDir, setSortDir]                 = useState('desc');

    // ── Jedinstveni ID-ovi kandidata za dropdown ─────────────────────────────
    const candidateIds = useMemo(() => {
        const ids = new Set();
        payments.forEach(p => {
            const id = p.candidateAccount?.id ?? p.candidateId;
            if (id !== undefined && id !== null) ids.add(String(id));
        });
        return [...ids].sort((a, b) => Number(a) - Number(b));
    }, [payments]);

    // ── Filtriranje i sortiranje – samo frontend logika ──────────────────────
    const displayed = useMemo(() => {
        let list = [...payments];

        if (filterStatus !== 'ALL') {
            list = list.filter(p => p.status === filterStatus);
        }

        if (filterCandidate) {
            list = list.filter(p =>
                String(p.candidateAccount?.id ?? p.candidateId ?? '') === filterCandidate
            );
        }

        list.sort((a, b) => {
            let valA = a[sortField] ?? '';
            let valB = b[sortField] ?? '';
            if (sortField === 'amount') {
                valA = Number(valA);
                valB = Number(valB);
            }
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return list;
    }, [payments, filterStatus, filterCandidate, sortField, sortDir]);

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const sortIcon = (field) => {
        if (sortField !== field) return ' ↕';
        return sortDir === 'asc' ? ' ↑' : ' ↓';
    };

    const statusBadge = (status) => {
        if (status === 'PAID')    return <span className="badge badge-success">Plaćeno</span>;
        if (status === 'PENDING') return <span className="badge badge-warning">Na čekanju</span>;
        return <span className="badge badge-danger">{status}</span>;
    };

    return (
        <>
            {/* ── Filteri ─────────────────────────────────────────────────── */}
            <div className="filter-row" style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                    className="filter-select"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">Sve uplate</option>
                    <option value="PAID">Plaćeno (PAID)</option>
                    <option value="PENDING">Na čekanju (PENDING)</option>
                </select>

                <select
                    className="filter-select"
                    value={filterCandidate}
                    onChange={e => setFilterCandidate(e.target.value)}
                >
                    <option value="">Svi kandidati</option>
                    {candidateIds.map(id => (
                        <option key={id} value={id}>Kandidat #{id}</option>
                    ))}
                </select>

                <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#888' }}>
                    {displayed.length} zapis(a)
                </span>
            </div>

            {/* ── Tabela ──────────────────────────────────────────────────── */}
            <div className="table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID Rate</th>
                            <th
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => toggleSort('datePaid')}
                            >
                                Datum uplate{sortIcon('datePaid')}
                            </th>
                            <th
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => toggleSort('amount')}
                            >
                                Iznos{sortIcon('amount')}
                            </th>
                            <th>Status</th>
                            <th>Kandidat (ID)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayed.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: '24px' }}>
                                    Nema uplata za odabrane filtere.
                                </td>
                            </tr>
                        ) : (
                            displayed.map(p => (
                                <tr key={p.paymentId ?? p.id}>
                                    <td>{p.paymentId ?? p.id}</td>
                                    <td>{formatDate(p.datePaid)}</td>
                                    <td><strong>{p.amount?.toFixed(2)} KM</strong></td>
                                    <td>{statusBadge(p.status)}</td>
                                    <td>{p.candidateAccount?.id ?? p.candidateId}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}