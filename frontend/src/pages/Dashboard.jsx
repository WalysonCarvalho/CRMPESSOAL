import React, { useEffect, useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Users, TrendingUp, Target, DollarSign, RefreshCw } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import api from '../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const fmtK = (v) => v >= 1000 ? `R$ ${(v/1000).toFixed(1)}k` : fmt(v);

const BAR_COLORS = ['#4f46e5','#10b981','#f59e0b','#ef4444','#8b5cf6'];

export default function Dashboard() {
  const { stats, metas, refreshStats } = useCRM();
  const [leadsChart, setLeadsChart] = useState([]);
  const [vendasChart, setVendasChart] = useState([]);
  const [statusLeads, setStatusLeads] = useState([]);

  const loadCharts = async () => {
    try {
      const [leadsRes, vendasRes] = await Promise.all([
        api.get('/leads'),
        api.get('/vendas')
      ]);

      // Leads por mes
      const byMonth = {};
      leadsRes.data.forEach(l => {
        const m = l.criado_em ? l.criado_em.substring(0, 7) : '';
        if (m) byMonth[m] = (byMonth[m] || 0) + 1;
      });
      const sorted = Object.keys(byMonth).sort().slice(-7);
      setLeadsChart(sorted.map(m => ({
        name: m.substring(5) + '/' + m.substring(2, 4),
        leads: byMonth[m]
      })));

      // Vendas por status
      const byStatus = {};
      vendasRes.data.forEach(v => {
        byStatus[v.status] = (byStatus[v.status] || 0) + v.valor;
      });
      setVendasChart(Object.entries(byStatus).map(([name, valor]) => ({ name, valor })));

      // Leads por status
      const ls = {};
      leadsRes.data.forEach(l => { ls[l.status] = (ls[l.status] || 0) + 1; });
      setStatusLeads(Object.entries(ls).map(([name, count]) => ({ name, count })));

    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    refreshStats();
    loadCharts();
  }, []);

  const leadsP  = Math.min(100, Math.round(stats.totalLeads / (metas.meta_leads || 200) * 100));
  const capP    = Math.min(100, Math.round(stats.totalCaptacoes / (metas.meta_captacoes || 8) * 100));
  const vendasP = Math.min(100, Math.round(stats.valorTotalVendas / (metas.meta_vendas || 50000) * 100));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visao geral do seu funil de vendas</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { refreshStats(); loadCharts(); }}>
          <RefreshCw size={13} /> Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value">{stats.totalLeads}<span>/{metas.meta_leads || 200}</span></div>
              <div className="stat-label">Leads Captados</div>
            </div>
            <div className="stat-icon indigo"><Users size={18} /></div>
          </div>
          <div className="stat-pct"><span>Progresso da meta</span><span style={{fontWeight:600,color:'#4f46e5'}}>{leadsP}%</span></div>
          <div className="progress-bar"><div className="progress-fill indigo" style={{width:`${leadsP}%`}} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value">{stats.totalCaptacoes}<span>/{metas.meta_captacoes || 8}</span></div>
              <div className="stat-label">Captacoes</div>
            </div>
            <div className="stat-icon amber"><Target size={18} /></div>
          </div>
          <div className="stat-pct"><span>Progresso da meta</span><span style={{fontWeight:600,color:'#f59e0b'}}>{capP}%</span></div>
          <div className="progress-bar"><div className="progress-fill amber" style={{width:`${capP}%`}} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value" style={{fontSize:'22px'}}>{fmtK(stats.valorTotalVendas)}</div>
              <div className="stat-label">Total em Vendas</div>
            </div>
            <div className="stat-icon green"><DollarSign size={18} /></div>
          </div>
          <div className="stat-pct"><span>Meta: {fmtK(metas.meta_vendas || 50000)}</span><span style={{fontWeight:600,color:'#10b981'}}>{vendasP}%</span></div>
          <div className="progress-bar"><div className="progress-fill green" style={{width:`${vendasP}%`}} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-value">{stats.totalVendas}</div>
              <div className="stat-label">Negocios Registrados</div>
            </div>
            <div className="stat-icon blue"><TrendingUp size={18} /></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <div className="chart-wrap">
            <p className="card-title" style={{marginBottom:'16px'}}>Leads por Mes</p>
            {leadsChart.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px 0',color:'#94a3b8',fontSize:'13px'}}>Nenhum dado ainda</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={leadsChart}>
                  <defs>
                    <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{fontSize:12,borderRadius:8,border:'1px solid #e2e8f0'}} />
                  <Area type="monotone" dataKey="leads" stroke="#4f46e5" strokeWidth={2} fill="url(#cg1)" dot={{fill:'#4f46e5',r:3}} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="chart-wrap">
            <p className="card-title" style={{marginBottom:'16px'}}>Vendas por Status (R$)</p>
            {vendasChart.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px 0',color:'#94a3b8',fontSize:'13px'}}>Nenhum dado ainda</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={vendasChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => fmt(v)} contentStyle={{fontSize:12,borderRadius:8,border:'1px solid #e2e8f0'}} />
                  <Bar dataKey="valor" radius={[5,5,0,0]}>
                    {vendasChart.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Funil */}
      {statusLeads.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Funil de Leads</span></div>
          <div className="card-body">
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {statusLeads.map((s, i) => (
                <div key={i} style={{flex:'1 1 120px',background:'#f8fafc',borderRadius:'10px',padding:'14px',textAlign:'center',border:'1px solid var(--border)'}}>
                  <div style={{fontSize:'24px',fontWeight:'800',color:BAR_COLORS[i%BAR_COLORS.length]}}>{s.count}</div>
                  <div style={{fontSize:'12px',color:'var(--text-muted)',marginTop:'2px'}}>{s.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
