import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';
import { useCRM } from '../context/CRMContext';

const COLORS = ['#4f46e5','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6'];
const fmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0);

export default function Relatorios() {
  const { stats, metas } = useCRM();
  const [leadsStatus, setLeadsStatus]     = useState([]);
  const [vendasStatus, setVendasStatus]   = useState([]);
  const [leadsOrigem, setLeadsOrigem]     = useState([]);
  const [totalVendas, setTotalVendas]     = useState(0);
  const [period, setPeriod]               = useState('todos');

  useEffect(() => { loadData(); }, [period]);

  const loadData = async () => {
    try {
      const [leadsRes, vendasRes] = await Promise.all([api.get('/leads'), api.get('/vendas')]);

      // Filter by period
      const now = new Date();
      const filterDate = (dateStr) => {
        if (!dateStr || period === 'todos') return true;
        const d = new Date(dateStr);
        if (period === '7d') return (now - d) <= 7*86400000;
        if (period === '30d') return (now - d) <= 30*86400000;
        if (period === '90d') return (now - d) <= 90*86400000;
        return true;
      };

      const leads  = leadsRes.data.filter(l => filterDate(l.criado_em));
      const vendas = vendasRes.data.filter(v => filterDate(v.criado_em));

      // Leads por status
      const ls = {};
      leads.forEach(l => { ls[l.status] = (ls[l.status]||0)+1; });
      setLeadsStatus(Object.entries(ls).map(([name,value])=>({name,value})));

      // Leads por origem
      const lo = {};
      leads.forEach(l => { lo[l.origem] = (lo[l.origem]||0)+1; });
      setLeadsOrigem(Object.entries(lo).map(([name,value])=>({name,value})));

      // Vendas por status
      const vs = {};
      vendas.forEach(v => { vs[v.status] = (vs[v.status]||0)+v.valor; });
      setVendasStatus(Object.entries(vs).map(([name,valor])=>({name,valor})));

      setTotalVendas(vendas.reduce((s,v)=>s+v.valor,0));
    } catch(e){ console.error(e); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatorios</h1>
          <p className="page-subtitle">Analise do seu desempenho</p>
        </div>
        <select className="form-control" style={{width:'160px'}} value={period} onChange={e=>setPeriod(e.target.value)}>
          <option value="todos">Todo periodo</option>
          <option value="7d">Ultimos 7 dias</option>
          <option value="30d">Ultimos 30 dias</option>
          <option value="90d">Ultimos 90 dias</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="stats-grid" style={{marginBottom:'24px'}}>
        {[
          {label:'Total de Leads',  value: stats.totalLeads,     meta: metas.meta_leads,     color:'#4f46e5'},
          {label:'Captacoes',       value: stats.totalCaptacoes, meta: metas.meta_captacoes, color:'#f59e0b'},
          {label:'Negocios',        value: stats.totalVendas,    meta: null,                 color:'#3b82f6'},
          {label:'Receita Total',   value: fmt(totalVendas),     meta: null,                 color:'#10b981'},
        ].map((k,i) => (
          <div key={i} className="stat-card">
            <div className="stat-value" style={{color: k.color, fontSize:'26px'}}>{k.value}</div>
            <div className="stat-label">{k.label}</div>
            {k.meta && <div style={{fontSize:'11px',color:'#94a3b8',marginTop:'4px'}}>Meta: {k.meta}</div>}
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="chart-wrap">
            <p className="card-title" style={{marginBottom:'16px'}}>Leads por Status</p>
            {leadsStatus.length === 0
              ? <div style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>Sem dados</div>
              : <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={leadsStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({name,value})=>`${name}: ${value}`} labelLine={false} fontSize={10}>
                      {leadsStatus.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        <div className="card">
          <div className="chart-wrap">
            <p className="card-title" style={{marginBottom:'16px'}}>Vendas por Status (R$)</p>
            {vendasStatus.length === 0
              ? <div style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>Sem dados</div>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={vendasStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v=>fmt(v)} contentStyle={{fontSize:12,borderRadius:8,border:'1px solid #e2e8f0'}} />
                    <Bar dataKey="valor" radius={[5,5,0,0]}>
                      {vendasStatus.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        <div className="card">
          <div className="chart-wrap">
            <p className="card-title" style={{marginBottom:'16px'}}>Leads por Origem</p>
            {leadsOrigem.length === 0
              ? <div style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>Sem dados</div>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={leadsOrigem} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} width={70} />
                    <Tooltip contentStyle={{fontSize:12,borderRadius:8,border:'1px solid #e2e8f0'}} />
                    <Bar dataKey="value" radius={[0,5,5,0]} fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <p className="card-title" style={{marginBottom:'16px'}}>Resumo Geral</p>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {[
                {label:'Leads Captados',    value: `${stats.totalLeads} / ${metas.meta_leads||200}`,    pct: Math.min(100,Math.round(stats.totalLeads/(metas.meta_leads||200)*100)),    color:'#4f46e5'},
                {label:'Captacoes',         value: `${stats.totalCaptacoes} / ${metas.meta_captacoes||8}`, pct: Math.min(100,Math.round(stats.totalCaptacoes/(metas.meta_captacoes||8)*100)), color:'#f59e0b'},
                {label:'Meta de Vendas',    value: `${fmt(stats.valorTotalVendas)} / ${fmt(metas.meta_vendas||50000)}`, pct: Math.min(100,Math.round(stats.valorTotalVendas/(metas.meta_vendas||50000)*100)), color:'#10b981'},
              ].map((item,i) => (
                <div key={i}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'4px'}}>
                    <span style={{color:'var(--text-muted)'}}>{item.label}</span>
                    <span style={{fontWeight:'600'}}>{item.value} <span style={{color:item.color}}>({item.pct}%)</span></span>
                  </div>
                  <div className="progress-bar" style={{height:'6px'}}>
                    <div className="progress-fill" style={{width:`${item.pct}%`,background:item.color}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
