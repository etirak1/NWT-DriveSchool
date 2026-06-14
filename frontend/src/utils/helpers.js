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

export const getErrorMessage = (error) => {
    if (!error) return 'Došlo je do neočekivane greške.';

    const status = error.response?.status;

    // Status codes where we always show a friendly local message
    // (overrides any raw server message like "Service Unavailable")
    const priorityMessages = {
        503: 'Servis trenutno nije dostupan. Pokušajte malo kasnije.',
        500: 'Serverska greška. Pokušajte ponovo.',
        403: 'Nemate dozvolu za ovu akciju.',
    };
    if (status && priorityMessages[status]) return priorityMessages[status];

    const serverMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (typeof error.response?.data === 'string' ? error.response.data : null);

    if (serverMsg) return serverMsg;

    const statusMessages = {
        400: 'Uneseni podaci nisu ispravni. Provjerite unos.',
        404: 'Traženi resurs nije pronađen.',
        409: 'Resurs već postoji.',
    };

    if (status && statusMessages[status]) return statusMessages[status];
    if (!error.response) return 'Nije moguće uspostaviti vezu sa serverom.';

    return 'Došlo je do neočekivane greške.';
};

export const repairStatusLabel = (status) => {
    const map = {
        PENDING: 'Na čekanju',
        IN_PROGRESS: 'U toku',
        COMPLETED: 'Završeno',
        PLANNED: 'Planirano',
    };

    return map[status] || status;
};