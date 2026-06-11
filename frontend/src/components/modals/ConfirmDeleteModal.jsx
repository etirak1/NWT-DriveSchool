import { Trash2 } from 'lucide-react';

export default function ConfirmDeleteModal({ user, onCancel, onConfirm }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                <div className="flex items-center justify-between px-6 py-5" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            <Trash2 className="text-white" size={17} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Obriši korisnika</h3>
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Da li ste sigurni da želite obrisati korisnika{' '}
                        <span className="font-bold text-slate-900">{user.firstName} {user.lastName}</span>?
                        Ova akcija se ne može poništiti.
                    </p>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                        >
                            Odustani
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', boxShadow: '0 4px 15px rgba(239,68,68,0.4)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
                                e.currentTarget.style.transform = '';
                            }}
                        >
                            Obriši
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
