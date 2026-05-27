import React, { useState, useEffect, useCallback } from 'react';
import { financeApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/helpers';
import PaymentTable from '../components/PaymentTable';
import DebtOverview from '../components/DebtOverview';
import FinanceReport from '../components/FinanceReport';
import PaymentModal from '../components/PaymentModal';
import FinanceStats from '../components/FinanceStats';

// Ukupna cijena vozačkog ispita – prezentacijska konstanta, ostaje na frontendu
const TOTAL_PRICE = 1200.00;

export default function FinanceManagement() {
    const [payments, setPayments]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'debt' | 'report'
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();

    // ── Dohvati uplate sa servera (samo JSON, bez HTML) ──────────────────────
    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await financeApi.getAll();
            setPayments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Greška pri učitavanju uplata:', err);
            showToast('Greška pri učitavanju uplata.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // ── Prezentacijska logika – obračun na frontendu ─────────────────────────
    const totalPaid = payments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalPending = payments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const remainingDebt = Math.max(0, TOTAL_PRICE - totalPaid);
    const paymentPercent = Math.min(100, (totalPaid / TOTAL_PRICE) * 100);

    // ── Callback koji modal poziva nakon uspješne uplate ─────────────────────
    const handlePaymentCreated = useCallback(async () => {
        setShowModal(false);
        await fetchPayments();
        showToast('Uplata uspješno evidentirana!');
    }, [fetchPayments, showToast]);

    if (loading) {
        return (
            <div className="spinner-wrap">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="page">
            {/* ── Zaglavlje stranice ───────────────────────────────────────── */}
            <header className="page-header">
                <div>
                    <h1 className="page-title">Finansije i Rate</h1>
                    <p className="page-sub">Pregled ekonomskog poslovanja auto-škole</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-outline" onClick={() => window.print()}>
                        🖨️ Generiši izvještaj
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        + Nova uplata (Rata)
                    </button>
                </div>
            </header>

            {/* ── Kartica statistike ───────────────────────────────────────── */}
            <FinanceStats
                totalPaid={totalPaid}
                totalPending={totalPending}
                remainingDebt={remainingDebt}
                paymentPercent={paymentPercent}
                totalPayments={payments.length}
                totalPrice={TOTAL_PRICE}
            />

            {/* ── Tabovi za navigaciju između prikaza ─────────────────────── */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                >
                    📋 Uplate
                </button>
                <button
                    className={`tab ${activeTab === 'debt' ? 'active' : ''}`}
                    onClick={() => setActiveTab('debt')}
                >
                    📉 Obračun duga
                </button>
                <button
                    className={`tab ${activeTab === 'report' ? 'active' : ''}`}
                    onClick={() => setActiveTab('report')}
                >
                    📊 Finansijski izvještaj
                </button>
            </div>

            {/* ── Sadržaj aktivnog taba ────────────────────────────────────── */}
            {activeTab === 'payments' && (
                <PaymentTable payments={payments} formatDate={formatDate} />
            )}

            {activeTab === 'debt' && (
                <DebtOverview
                    payments={payments}
                    totalPrice={TOTAL_PRICE}
                    formatDate={formatDate}
                />
            )}

            {activeTab === 'report' && (
                <FinanceReport
                    payments={payments}
                    totalPrice={TOTAL_PRICE}
                    totalPaid={totalPaid}
                    totalPending={totalPending}
                    remainingDebt={remainingDebt}
                    paymentPercent={paymentPercent}
                />
            )}

            {/* ── Modal za novu uplatu ─────────────────────────────────────── */}
            {showModal && (
                <PaymentModal
                    onClose={() => setShowModal(false)}
                    onSuccess={handlePaymentCreated}
                    showToast={showToast}
                />
            )}
        </div>
    );
}