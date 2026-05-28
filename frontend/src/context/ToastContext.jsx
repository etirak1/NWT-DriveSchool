import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: "fixed", bottom: "1rem", right: "1rem",
                display: "flex", flexDirection: "column", gap: "0.5rem", zIndex: 9999
            }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        padding: "0.75rem 1.25rem",
                        borderRadius: "8px",
                        color: "white",
                        backgroundColor: t.type === "error" ? "#e53e3e" : t.type === "warning" ? "#dd6b20" : "#38a169",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        minWidth: "200px"
                    }}>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast mora biti unutar ToastProvider-a");
    return context;
}