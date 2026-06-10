export default function RoleBadge({ role }) {
    const styles = {
        ADMIN:      { background: 'rgba(139,92,246,0.12)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.2)' },
        INSTRUCTOR: { background: 'rgba(59,130,246,0.12)', color: '#1d4ed8', border: '1px solid rgba(59,130,246,0.2)' },
        CANDIDATE:  { background: 'rgba(16,185,129,0.12)', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' },
    };
    const s = styles[role] || { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
    return (
        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full" style={s}>
            {role || '—'}
        </span>
    );
}
