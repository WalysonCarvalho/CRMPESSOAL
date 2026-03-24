import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Vendas from './pages/Vendas';
import Captacao from './pages/Captacao';
import Mensagens from './pages/Mensagens';
import Agenda from './pages/Agenda';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';

export default function App() {
  return (
    <CRMProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/vendas" element={<Vendas />} />
              <Route path="/captacao" element={<Captacao />} />
              <Route path="/mensagens" element={<Mensagens />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CRMProvider>
  );
}
