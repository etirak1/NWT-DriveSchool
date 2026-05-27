import React, { useMemo } from 'react';

/**
 * FinanceReport – generisanje finansijskog izvještaja.
 * Sve agregacije su na frontendu; window.print() pokriva štampu / PDF.
 */
export default function FinanceReport({
                                          payments,
                                          totalPrice,
                                          totalPaid,
                                          totalPending,
                                          remainingDebt,
                                          paymentPercent,
                                      }) {
    const today = new Date().toLocaleDateString('bs-BA', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });

    // ── Uplate grupisane po mjesecu ──────────────────────────────────────────
    const byMonth = useMemo(() => {
        const map = {};
        payments
            .filter(p => p.status === 'PAID' && p.datePaid)
            .forEach(p => {
                const d = new Date(p.datePaid);
                if (isNaN(d)) return;
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                map[key] = (map[key] || 0) + (p.amount || 0);
            });

        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, amount]) => {
                const [yr, mo] = key.split('-');
                const label = new Date(Number(yr), Number(mo) - 1)
                    .toLocaleDateString('bs-BA', { month: 'long', year: 'numeric' });
                return { key, label, amount };
            });
    }, [payments]);

    // ── Uplatnice (svaka PAID uplata = potencijalna uplatnica) ───────────────
    const receipts = useMemo(() =>
            payments
                .filter(p => p.status === 'PAID')
                .sort((a, b) => new Date(b.datePaid) - new Date(a.datePaid)),
        [payments]
    );

    const maxMonthAmount = byMonth.reduce((m, r) => Math.max(m, r.amount), 0) || 1;

    return (
        <div className="report-page">
            {/* ── Akcija: štampaj ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '8px' }}>
                <button className="btn btn-outline" onClick={() => window.print()}>
                    🖨️ Štampaj izvještaj
                </button>
            </div>

            {/* ── Generalni sažetak ────────────────────────────────────────── */}
            <section className="report-section" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
                    📋 Generalni sažetak — {today}
                </h2>

                <ReportRow label="Ukupna cijena vozačkog"       value={`${totalPrice.toFixed(2)} KM`} />
                <ReportRow label="Ukupno naplaćeno (PAID)"      value={`${totalPaid.toFixed(2)} KM`}      color="#3B6D11" />
                <ReportRow label="Na čekanju (PENDING)"         value={`${totalPending.toFixed(2)} KM`}   color="#854F0B" />
                <ReportRow label="Preostali dug (procjena)"     value={`${remainingDebt.toFixed(2)} KM`}  color="#A32D2D" bold />
                <ReportRow label="Procenat naplate"             value={`${paymentPercent.toFixed(1)}%`}   bold />
                <ReportRow label="Ukupan broj evidentiranih rata" value={String(payments.length)} />
            </section>

            {/* ── Uplate po mjesecu ────────────────────────────────────────── */}
            <section className="report-section" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
                    📅 Uplate po mjesecu (PAID)
                </h2>

                {byMonth.length === 0 ? (
                    <p style={{ color: '#888', fontSize: '13px' }}>Nema podataka za prikaz.</p>
                ) : (
                    byMonth.map(({ key, label, amount }) => (
                        <div key={key} style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                <span>{label}</span>
                                <strong>{amount.toFixed(2)} KM</strong>
                            </div>
                            <div style={{ height: '8px', background: '#eee', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${((amount / maxMonthAmount) * 100).toFixed(1)}%`,
                                    background: '#1D9E75',
                                    borderRadius: '99px',
                                }} />
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* ── Uplatnice ────────────────────────────────────────────────── */}
            <section className="report-section" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
                    🧾 Uplatnice (PAID uplate)
                </h2>

                {receipts.length === 0 ? (
                    <p style={{ color: '#888', fontSize: '13px' }}>Nema evidentiranih uplata.</p>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Br. uplatnice</th>
                                <th>Datum</th>
                                <th>Kandidat</th>
                                <th>Iznos</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {receipts.map((p, i) => (
                                <tr key={p.paymentId ?? p.id}>
                                    <td style={{ color: '#888' }}>
                                        {String(receipts.length - i).padStart(4, '0')}
                                    </td>
                                    <td>
                                        {p.datePaid
                                            ? new Date(p.datePaid).toLocaleDateString('bs-BA')
                                            : '—'}
                                    </td>
                                    <td>#{p.candidateAccount?.id ?? p.candidateId}</td>
                                    <td><strong>{p.amount?.toFixed(2)} KM</strong></td>
                                    <td>
                                        <span className="badge badge-success">Plaćeno</span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <p style={{ fontSize: '11px', color: '#aaa', textAlign: 'right' }}>
                Izvještaj generisan: {today} | Auto-škola DriveSchool
            </p>
        </div>
    );
}

// ── Pomoćna komponenta za red izvještaja ─────────────────────────────────────
function ReportRow({ label, value, color, bold }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid #f0f0f0',
            fontSize: '13px',
        }}>
            <span style={{ color: '#555' }}>{label}</span>
            <span style={{ color: color ?? 'inherit', fontWeight: bold ? 600 : 400 }}>
                {value}
            </span>
        </div>
    );
}