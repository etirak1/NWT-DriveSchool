import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { decodeJwt } from '../auth/jwt';

const AuthContext = createContext(null);

function parseUser(token) {
    if (!token) return null;
    const payload = decodeJwt(token);
    if (!payload) return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
        userId: payload.userId,
        email:  payload.sub,
        role:   payload.role,
        exp:    payload.exp,
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => parseUser(localStorage.getItem('token')));

    const login = useCallback((token) => {
        localStorage.setItem('token', token);
        setUser(parseUser(token));
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);


    useEffect(() => {
        const handleForceLogout = () => logout();
        window.addEventListener('auth:logout', handleForceLogout);
        return () => window.removeEventListener('auth:logout', handleForceLogout);
    }, [logout]);


    useEffect(() => {
        if (!user?.exp) return;
        const msUntilExpiry = user.exp * 1000 - Date.now();
        if (msUntilExpiry <= 0) { logout(); return; }
        const timer = setTimeout(logout, msUntilExpiry);
        return () => clearTimeout(timer);
    }, [user?.exp, logout]);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'ADMIN',
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth mora biti unutar AuthProvider-a');
    return context;
}