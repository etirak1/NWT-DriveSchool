export default function StatusBadge({ status }) {
    const styles = {
        ACTIVE:   { background: 'rgba(16,185,129,0.12)', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' },
        INACTIVE: { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' },
    };
    const s = styles[status] || { background: 'rgba(245,158,11,0.12)', color: '#b45309', border: '1px solid rgba(245,158,11,0.2)' };
    return (
        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full" style={s}>
            {status || '—'}
        </span>
    );
}
