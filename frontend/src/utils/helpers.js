export const formatDate = (dateStr) => {
    if (!dateStr) return '—';

    return new Date(dateStr).toLocaleDateString('bs-BA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export const daysUntil = (dateStr) => {
    if (!dateStr) return null;

    const diff = new Date(dateStr) - new Date();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const isExpiringSoon = (dateStr, days = 15) => {
    const d = daysUntil(dateStr);

    return d !== null && d <= days && d >= 0;
};

export const isExpired = (dateStr) => {
    const d = daysUntil(dateStr);

    return d !== null && d < 0;
};

export const vehicleStatusLabel = (status) => {
    const map = {
        ACTIVE: 'Aktivno',
        INACTIVE: 'Neaktivno',
        IN_SERVICE: 'Na servisu',
        UNAVAILABLE: 'Nedostupno',
    };

    return map[status] || status;
};

export const vehicleStatusColor = (status) => {
    const map = {
        ACTIVE: 'status-active',
        INACTIVE: 'status-inactive',
        IN_SERVICE: 'status-service',
        UNAVAILABLE: 'status-unavailable',
    };

    return map[status] || 'status-inactive';
};

export const instructorStatusColor = (available) =>
    available ? 'status-active' : 'status-inactive';

export const repairStatusLabel = (status) => {
    const map = {
        PENDING: 'Na čekanju',
        IN_PROGRESS: 'U toku',
        COMPLETED: 'Završeno',
        PLANNED: 'Planirano',
    };

    return map[status] || status;
};

