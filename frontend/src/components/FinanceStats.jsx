import React from 'react';

/**
 * FinanceStats – prikaz ključnih finansijskih pokazatelja.
 * Sva računanja dolaze iz roditelja (FinanceManagement) kako bi
 * prezentacijska logika ostala isključivo na frontendu.
 */
export default function FinanceStats({
                                         totalPaid,
                                         totalPending,
                                         remainingDebt,
                                         paymentPercent,
                                         totalPayments,
                                         totalPrice,
                                     }) {
    return (
        <>
            {/* ── 4 stat-kartice ─────────────────────────────────────────── */}
            <div className="stat-grid" style={{ marginBottom: '16px' }}>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div>
                        <div className="stat-value">{totalPaid.toFixed(2)} KM</div>
                        <div className="stat-label">Ukupno uplaćeno</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div>
                        <div className="stat-value">{totalPending.toFixed(2)} KM</div>
                        <div className="stat-label">Na čekanju</div>
                    </div>
                </div>

                <div className="stat-card card-danger">
                    <div className="stat-icon">📉</div>
                    <div>
                        <div className="stat-value">{remainingDebt.toFixed(2)} KM</div>
                        <div className="stat-label">Preostali dug</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🧾</div>
                    <div>
                        <div className="stat-value">{totalPayments}</div>
                        <div className="stat-label">Broj rata</div>
                    </div>
                </div>
            </div>

            {/* ── Progress bar naplate ────────────────────────────────────── */}
            <div className="progress-wrap" style={{ marginBottom: '24px' }}>
                <div className="progress-header">
                    <span>Ukupna naplata</span>
                    <span>
                        {paymentPercent.toFixed(1)}% od {totalPrice.toFixed(2)} KM
                    </span>
                </div>
                <div className="progress-bar-bg">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${paymentPercent.toFixed(1)}%` }}
                    />
                </div>
            </div>
        </>
    );
}