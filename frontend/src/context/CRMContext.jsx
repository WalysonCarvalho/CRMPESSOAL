import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CRMContext = createContext();

export function CRMProvider({ children }) {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCaptacoes: 0,
    totalVendas: 0,
    valorTotalVendas: 0
  });
  const [metas, setMetas] = useState({
    meta_leads: 200,
    meta_captacoes: 8,
    meta_vendas: 50000
  });

  // refreshStats e chamado apos qualquer alteracao de dados
  const refreshStats = useCallback(async () => {
    try {
      const { data } = await api.get('/dashboard');
      setStats(data.stats);
      setMetas(data.metas);
    } catch (err) {
      console.error('Erro ao atualizar stats:', err);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <CRMContext.Provider value={{ stats, metas, refreshStats }}>
      {children}
    </CRMContext.Provider>
  );
}

export const useCRM = () => useContext(CRMContext);
