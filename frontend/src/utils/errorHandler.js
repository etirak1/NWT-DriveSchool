export function parseApiError(error, options = {}) {
    const {
        fallback = 'Došlo je do greške.',
        conflictMessage,
    } = options;

    const status = error?.response?.status;
    const body   = error?.response?.data;

    // 409 Conflict — optional caller-supplied override
    if (status === 409 && conflictMessage) {
        return conflictMessage;
    }

    if (typeof body === 'string' && body.trim()) {
        return body.trim();
    }

    if (body?.message) {
        return body.message;
    }

    if (body && typeof body === 'object') {
        const values = Object.values(body).filter(v => typeof v === 'string');
        if (values.length) return values.join(' ');
    }

    return fallback;
}