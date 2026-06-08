import { useState, useEffect, useCallback } from 'react';
import { getErrorMessage } from '../utils/helpers';

export function useAsync(asyncFn, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await asyncFn();
            setData(result);
        } catch (e) {
            setError(getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    }, deps);

    useEffect(() => {
        execute();
    }, [execute]);

    return { data, loading, error, refetch: execute };
}