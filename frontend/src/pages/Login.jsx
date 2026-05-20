import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {

            const response = await api.post('/auth/login', { email, password });
            const token = response.data.token;

            localStorage.setItem('token', token);
            navigate('/dashboard');
            window.location.reload();
        } catch (error) {
            alert("Pogrešni podaci ili servis nije dostupan");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="p-8 bg-white shadow-lg rounded-2xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">DriveSchool Prijava</h2>
                <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg mb-4"
                       value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Lozinka" className="w-full p-3 border rounded-lg mb-6"
                       value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">Prijavi se</button>
            </form>
        </div>
    );
};

export default Login;