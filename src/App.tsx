import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Schemes from './pages/Schemes';
import MandiPrices from './pages/MandiPrices';

function AppRoutes() {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-green-50 text-green-800 font-bold">Loading Kisan AI...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Onboarding />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/chat" element={user ? <Chat /> : <Navigate to="/" />} />
      <Route path="/schemes" element={user ? <Schemes /> : <Navigate to="/" />} />
      <Route path="/mandi" element={user ? <MandiPrices /> : <Navigate to="/" />} />
      <Route path="/advisory" element={user ? <Chat /> : <Navigate to="/" />} /> {/* Reuse Chat for advisory for now */}
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
