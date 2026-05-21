import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-slate-900">Login uspješan! 🎉</h1>
        <p className="text-slate-500 mt-2">
          JWT token je sačuvan u localStorage. Ovdje će ići ostatak aplikacije.
        </p>
        <button
          onClick={handleLogout}
          className="mt-6 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-5 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}