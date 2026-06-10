import { useState, useEffect } from 'react';
import { api } from '../api/client';

export function useFinance(candidateId) {
    const [financeStatus, setFinanceStatus] = useState(null);
    const [payments,      setPayments]      = useState([]);

    useEffect(() => {
        if (!candidateId) return;
        const load = async () => {
            try {
                const res = await api.get(`/accounts/${candidateId}/status`);
                setFinanceStatus(res.data);
            } catch { /* optional */ }

            try {
                const res = await api.get(`/accounts/${candidateId}/payments`);
                setPayments(res.data || []);
            } catch { /* ignore */ }
        };
        load();
    }, [candidateId]);

    return { financeStatus, payments };
}
