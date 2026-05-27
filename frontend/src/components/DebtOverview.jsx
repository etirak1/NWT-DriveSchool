import React, { useMemo } from 'react';

/**
 * DebtOverview – grupira uplate po kandidatu i računa dug.
 * Sva logika je isključivo na frontendu; ne šalje dodatne zahtjeve.
 */
export default function DebtOverview({ payments, totalPrice }) {
    // ── Grupisanje i obračun po kandidatu ────────────────────────────────────
    const candidateDebts = useMemo(() => {
        const map = {};

        payments.forEach(p => {
            const id = String(p.candidateAccount?.id ?? p.candidateId ?? 'N/A');
            if (!map[id]) {
                map[id] = { id, paid: 0, pending: 0, count: 0 };
            }
            if (p.status === 'PAID')    map[id].paid    += (p.amount || 0);
            if (p.status === 'PENDING') map[id].pending += (p.amount || 0);
            map[id].count++;
        });

        return Object.values(map).map(c => ({
            ...c,
            debt:    Math.max(0, totalPrice - c.paid),
            percent: Math.min(100, (c.paid / totalPrice) * 100),
        })).sort((a, b) => b.debt - a.debt);
    }, [payments, totalPrice]);

    const totalDebt = candidateDebts.reduce((s, c) => s + c.debt, 0);

    // ── Boja progress bara ovisno o procentu otplate ─────────────────────────
    const barColor = (pct) => {
        if (pct >= 100) return '#3B6D11';
        if (pct >= 50)  return '#854F0B';
        return '#A32D2D';
    };

    return (
        <div>
            {/* ── Sažetak ─────────────────────────────────────────────────── */}
            <div className="stat-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card card-danger">
                    <div className="stat-icon">📉</div>
                    <div>
                        <div className="stat-value">{totalDebt.toFixed(2)} KM</div>
                        <div className="stat-label">Ukupni dug svih kandidata</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div>
                        <div className="stat-value">
                            {candidateDebts.filter(c => c.debt === 0).length}
                        </div>
                        <div className="stat-label">Kandidata bez duga</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚠️</div>
                    <div>
                        <div className="stat-value">
                            {candidateDebts.filter(c => c.debt > 0).length}
                        </div>
                        <div className="stat-label">Kandidata s dugom</div>
                    </div>
                </div>
            </div>

            {/* ── Tabela po kandidatu ─────────────────────────────────────── */}
            <div className="table-wrap">
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>Kandidat (ID)</th>
                        <th>Uplaćeno</th>
                        <th>Na čekanju</th>
                        <th>Preostali dug</th>
                        <th style={{ minWidth: '160px' }}>Procenat otplate</th>
                    </tr>
                    </thead>
                    <tbody>
                    {candidateDebts.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: '24px' }}>
                                Nema podataka o kandidatima.
                            </td>
                        </tr>
                    ) : (
                        candidateDebts.map(c => (
                            <tr key={c.id}>
                                <td>Kandidat #{c.id}</td>
                                <td style={{ color: '#3B6D11', fontWeight: 500 }}>
                                    {c.paid.toFixed(2)} KM
                                </td>
                                <td style={{ color: '#854F0B' }}>
                                    {c.pending.toFixed(2)} KM
                                </td>
                                <td style={{ color: c.debt > 0 ? '#A32D2D' : '#3B6D11', fontWeight: 500 }}>
                                    {c.debt.toFixed(2)} KM
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            flex: 1,
                                            height: '8px',
                                            background: '#eee',
                                            borderRadius: '99px',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${c.percent.toFixed(1)}%`,
                                                background: barColor(c.percent),
                                                borderRadius: '99px',
                                                transition: 'width 0.4s ease',
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '12px', minWidth: '38px', textAlign: 'right' }}>
                                                {c.percent.toFixed(0)}%
                                            </span>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                * Dug = razlika od ukupne cijene vozačkog ispita ({totalPrice.toFixed(2)} KM).
                Obračun se vrši isključivo na osnovu uplata sa statusom PAID.
            </p>
        </div>
    );
}