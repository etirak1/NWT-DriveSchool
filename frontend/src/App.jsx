import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CandidateDashboard from './pages/CandidateDashboard';
import BookLesson from './pages/BookLesson';
import Login from './pages/Login';

import './App.css'

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          {isAuthenticated ? (
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<CandidateDashboard />} />
                <Route path="/book" element={<BookLesson />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Route>
          ) : (
              <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </BrowserRouter>
  );
}

export default App;
