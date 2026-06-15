import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { parseApiError } from '../utils/errorHandler';

export function useUserManagement() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [sortBy, setSortBy] = useState('userId');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showAdd, setShowAdd] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);
    const [searchFocused, setSearchFocused] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const debounceTimer = useRef(null);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(val);
            setPage(0);
        }, 400);
    };

    const queryKey = ['users', page, size, sortBy, debouncedSearch, roleFilter];

    const { data, isLoading: loading, error: queryError } = useQuery({
        queryKey,
        queryFn: () =>
            api.get('/api/users', {
                params: {
                    page, size, sortBy,
                    role: roleFilter,
                    search: debouncedSearch.trim() || undefined,
                },
            }).then(r => r.data),
        keepPreviousData: true,
    });

    const users = Array.isArray(data?.content) ? data.content : [];
    const totalPages = data?.totalPages || 0;
    const totalElements = data?.totalElements || 0;

    const error = queryError
        ? (queryError?.response?.status === 403
            ? 'Nemate dozvolu za pregled korisnika.'
            : parseApiError(queryError, { fallback: 'Greška pri učitavanju korisnika.' }))
        : '';

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

    const handleDelete = async (u) => {
        try {
            await api.delete(`/api/users/${u.userId}`);
            setDeletingUser(null);
            invalidate();
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            queryClient.invalidateQueries({ queryKey: ['instructors'] });
            queryClient.invalidateQueries({ queryKey: ['instructors-combined'] });
            queryClient.invalidateQueries({ queryKey: ['theoryPlans'] });
        } catch (err) {
            alert(parseApiError(err, {
                fallback: 'Greška pri brisanju.',
                conflictMessage: 'Korisnik se ne može obrisati jer ima aktivne termine.',
            }));
            setDeletingUser(null);
        }
    };

    const handleToggleStatus = async (u) => {
        const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await api.patch(
                `/api/users/${u.userId}`,
                [{ op: 'replace', path: '/status', value: newStatus }],
                { headers: { 'Content-Type': 'application/json-patch+json' } }
            );
            invalidate();
        } catch (err) {
            alert(parseApiError(err, { fallback: 'Greška pri ažuriranju statusa.' }));
        }
    };

    return {
        users, totalPages, totalElements,
        page, setPage, size, sortBy, setSortBy,
        search, roleFilter, setRoleFilter,
        loading, error,
        showAdd, setShowAdd,
        deletingUser, setDeletingUser,
        searchFocused, setSearchFocused,
        handleSearchChange, handleDelete, handleToggleStatus,
        loadUsers: invalidate,
    };
}
