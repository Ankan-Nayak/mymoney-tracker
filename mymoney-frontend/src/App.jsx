import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Calendar from './pages/Calendar';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import SavingsInvestments from './pages/SavingsInvestments';
import BillsSubscriptions from './pages/BillsSubscriptions';
import LoansDebts from './pages/LoansDebts';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Application Workspace */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/savings-investments" element={<SavingsInvestments />} />
            <Route path="/bills-subscriptions" element={<BillsSubscriptions />} />
            <Route path="/loans-debts" element={<LoansDebts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
