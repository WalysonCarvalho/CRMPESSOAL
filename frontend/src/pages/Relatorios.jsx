import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Target, TrendingUp, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api from '../services/api';
import { useCRM } from '../context/CRMContext';

const COLORS = ['#4f46e5','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6'];
const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const BADGE_LEADS  = { Novo:'novo', Contato:'contato', Qualificado:'qualificado', Proposta:'proposta', Fechado:'fechado', Perdido:'perdido' };
const BADGE_VENDAS = { Pendente:'pendente', Negociacao:'negociacao', Fechado:'fechado', Cancelado:'cancelado' };
const BADGE_CAP    = { 'Em andamento':'andamento', 'Concluido':'concluido', 'Cancelado':'cancelado' };
const TIPO_AGENDA_COLORS = { Reuniao:'#4f46e5', Ligacao:'#3b82f6', Tarefa:'#f59e0b', Outro:'#94a3b8' };

const NOMES_MES = {
  '01':'Janeiro','02':'Fevereiro','03':'Março','04':'Abril',
  '05':'Maio','06':'Junho','07':'Julho','08':'Agosto',
  '09':'Setembro','10':'Outubro','11':'Novembro','12':'Dezembro'
};

function formatMes(mes) {
  if (!mes) return '';
  const [ano, m] = mes.split('-');
  return `${NOMES_MES[m] || m} / ${ano}`;
}

export default function Relatorios() {
  const { metas } = useCRM();
  const [meses, setMeses]       = useState([]);
  const [mesSel, setMesSel]     = useState('');
  const [leads, setLeads]       = useState([]);
  const [captacoes, setCaptacoes] = useState([]);
  const [vendas, setVendas]     = useState([]);
  const [agenda, setAgenda]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [aba, setAba]           = useState('resumo');

  useEffect(() => { loadMeses(); }, []);
  useEffect(() => { if (mesSel) loadData(mesSel); }, [mesSel]);

  const loadMeses = async () => {
    try {
      const { data } = await api.get('/meses');
      setMeses(data);
      if (data.length > 0) setMesSel(data[0]);
    } catch (e) { console.error(e); }
  };

  const loadData = async (mes) => {
    setLoading(true);
    try {
      const [l, c, v, a] = await Promise.all([
        api.get(`/leads?mes=${mes}`),
        api.get(`/captacoes?mes=${mes}`),
        api.get(`/vendas?mes=${mes}`),
        api.get(`/agenda?mes=${mes}`),
      ]);
      setLeads(l.data);
      setCaptacoes(c.data);
      setVendas(v.data);
      setAgenda(a.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const totalVendas    = vendas.reduce((s, v) => s + v.valor, 0);
  const vendasFechadas = vendas.filter(v => v.status === 'Fechado').reduce((s, v) => s + v.valor, 0);

  const leadsStatusArr = Object.entries(
    leads.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const vendasStatusArr = Object.entries(
    vendas.reduce((acc, v) => { acc[v.status] = (acc[v.status] || 0) + v.valor; return acc; }, {})
  ).map(([name, valor]) => ({ name, valor }));

  const abas = [
    { id: 'resumo',    label: 'Resumo' },
    { id: 'leads',     label: `Leads (${leads.length})` },
    { id: 'captacoes', label: `Captações (${captacoes.length})` },
    { id: 'vendas',    label: `Vendas (${vendas.length})` },
    { id: 'agenda',    label: `Agenda (${agenda.length})` },
  ];

  const tabStyle = (id) => ({
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: aba === id ? '700' : '500',
    color: aba === id ? '#4f46e5' : 'var(--text-muted)',
    borderBottom: aba === id ? '2px solid #4f46e5' : '2px solid transparent',
    background: 'none',
    border: 'none',
    borderBottom: aba === id ? '2px solid #4f46e5' : '2px solid transparent',
    cursor: 'pointer',
    marginBottom: '-1px',
    transition: 'all .15s',
  });

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Histórico mensal completo</p>
        </div>
        <select
          className="form-control"
          style={{ width: '200px' }}
          value={mesSel}
          onChange={e => { setMesSel(e.target.value); setAba('resumo'); }}
        >
          {meses.length === 0 && <option value="">Nenhum mês disponível</option>}
          {meses.map(m => <option key={m} value={m}>{formatMes(m)}</option>)}
        </select>
      </div>

      {/* Sem dados */}
      {meses.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <BarChart2 size={40} />
            <p>Nenhum dado disponível ainda</p>
            <small>Os relatórios aparecerão aqui conforme você adiciona registros</small>
          </div>
        </div>
      )}

      {meses.length > 0 && (
        <>
          {/* Abas */}
          <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
            {abas.map(a => (
              <button key={a.id} style={tabStyle(a.id)} onClick={() => setAba(a.id)}>
                {a.label}
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' }}>
              Carregando...
            </div>
          )}

          {/* ── ABA RESUMO ─────────────────────────────────────── */}
          {!loading && aba === 'resumo' && (
            <>
              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                {[
                  { label: 'Leads',      value: leads.length,     meta: metas.meta_leads,     color: '#4f46e5', icon: '👥' },
                  { label: 'Captações',  value: captacoes.length, meta: metas.meta_captacoes, color: '#f59e0b', icon: '🎯' },
                  { label: 'Negócios',   value: vendas.length,    meta: null,                 color: '#3b82f6', icon: '📊' },
                  { label: 'Receita',    value: fmt(totalVendas), meta: null,                 color: '#10b981', icon: '💰' },
                ].map((k, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>{k.icon}</div>
                    <div className="stat-value" style={{ color: k.color, fontSize: '26px' }}>{k.value}</div>
                    <div className="stat-label">{k.label}</div>
                    {k.meta && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Meta: {k.meta}</div>}
                  </div>
                ))}
              </div>

              <div className="charts-grid">
                {/* Leads por status */}
                <div className="card">
                  <div className="chart-wrap">
                    <p className="card-title" style={{ marginBottom: '16px' }}>Leads por Status</p>
                    {leadsStatusArr.length === 0
                      ? <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Sem dados</div>
                      : <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie data={leadsStatusArr} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                              label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                              {leadsStatusArr.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                    }
                  </div>
                </div>

                {/* Vendas por status */}
                <div className="card">
                  <div className="chart-wrap">
                    <p className="card-title" style={{ marginBottom: '16px' }}>Vendas por Status (R$)</p>
                    {vendasStatusArr.length === 0
                      ? <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Sem dados</div>
                      : <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={vendasStatusArr}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={v => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                            <Bar dataKey="valor" radius={[5, 5, 0, 0]}>
                              {vendasStatusArr.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                    }
                  </div>
                </div>

                {/* Progresso de metas */}
                <div className="card">
                  <div className="card-body">
                    <p className="card-title" style={{ marginBottom: '16px' }}>Metas — {formatMes(mesSel)}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {[
                        { label: 'Leads',     value: `${leads.length} / ${metas.meta_leads || 200}`,                           pct: Math.min(100, Math.round(leads.length / (metas.meta_leads || 200) * 100)),          color: '#4f46e5' },
                        { label: 'Captações', value: `${captacoes.length} / ${metas.meta_captacoes || 8}`,                     pct: Math.min(100, Math.round(captacoes.length / (metas.meta_captacoes || 8) * 100)),    color: '#f59e0b' },
                        { label: 'Vendas',    value: `${fmt(totalVendas)} / ${fmt(metas.meta_vendas || 50000)}`, pct: Math.min(100, Math.round(totalVendas / (metas.meta_vendas || 50000) * 100)), color: '#10b981' },
                      ].map((item, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                            <span style={{ fontWeight: '600' }}>{item.value} <span style={{ color: item.color }}>({item.pct}%)</span></span>
                          </div>
                          <div className="progress-bar" style={{ height: '6px' }}>
                            <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resumo agenda */}
                <div className="card">
                  <div className="card-body">
                    <p className="card-title" style={{ marginBottom: '16px' }}>Agenda — {formatMes(mesSel)}</p>
                    {agenda.length === 0
                      ? <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>Nenhum evento</div>
                      : <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {['Reuniao', 'Ligacao', 'Tarefa', 'Outro'].map(tipo => {
                            const count = agenda.filter(a => a.tipo === tipo).length;
                            if (!count) return null;
                            return (
                              <div key={tipo} style={{ flex: '1 1 90px', background: '#f8fafc', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: TIPO_AGENDA_COLORS[tipo] }}>{count}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{tipo}</div>
                              </div>
                            );
                          })}
                        </div>
                    }
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── ABA LEADS ──────────────────────────────────────── */}
          {!loading && aba === 'leads' && (
            <div className="card">
              <div className="table-wrap">
                {leads.length === 0
                  ? <div className="empty-state"><Users size={40} /><p>Nenhum lead em {formatMes(mesSel)}</p></div>
                  : <table>
                      <thead><tr><th>Nome</th><th>Telefone</th><th>Email</th><th>Origem</th><th>Status</th><th>Data</th></tr></thead>
                      <tbody>
                        {leads.map(l => (
                          <tr key={l.id}>
                            <td><strong>{l.nome}</strong></td>
                            <td>{l.telefone || '—'}</td>
                            <td>{l.email || '—'}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{l.origem}</td>
                            <td><span className={`badge badge-${BADGE_LEADS[l.status] || 'novo'}`}>{l.status}</span></td>
                            <td style={{ color: '#94a3b8', fontSize: '12px' }}>{l.criado_em?.substring(0, 10)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                }
              </div>
            </div>
          )}

          {/* ── ABA CAPTAÇÕES ───────────────────────────────────── */}
          {!loading && aba === 'captacoes' && (
            <div className="card">
              <div className="table-wrap">
                {captacoes.length === 0
                  ? <div className="empty-state"><Target size={40} /><p>Nenhuma captação em {formatMes(mesSel)}</p></div>
                  : <table>
                      <thead><tr><th>#</th><th>Título</th><th>Descrição</th><th>Status</th><th>Data</th></tr></thead>
                      <tbody>
                        {captacoes.map((c, i) => (
                          <tr key={c.id}>
                            <td style={{ color: '#94a3b8', fontSize: '12px' }}>{i + 1}</td>
                            <td><strong>{c.titulo}</strong></td>
                            <td style={{ color: 'var(--text-muted)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.descricao || '—'}</td>
                            <td><span className={`badge badge-${BADGE_CAP[c.status] || 'andamento'}`}>{c.status}</span></td>
                            <td style={{ color: '#94a3b8', fontSize: '12px' }}>{c.criado_em?.substring(0, 10)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                }
              </div>
            </div>
          )}

          {/* ── ABA VENDAS ──────────────────────────────────────── */}
          {!loading && aba === 'vendas' && (
            <div className="card">
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '20px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Total: <strong style={{ color: '#10b981' }}>{fmt(totalVendas)}</strong>
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Fechado: <strong style={{ color: '#4f46e5' }}>{fmt(vendasFechadas)}</strong>
                </span>
              </div>
              <div className="table-wrap">
                {vendas.length === 0
                  ? <div className="empty-state"><TrendingUp size={40} /><p>Nenhuma venda em {formatMes(mesSel)}</p></div>
                  : <table>
                      <thead><tr><th>Cliente</th><th>Valor</th><th>Data</th><th>Status</th><th>Observações</th></tr></thead>
                      <tbody>
                        {vendas.map(v => (
                          <tr key={v.id}>
                            <td><strong>{v.cliente}</strong></td>
                            <td style={{ color: '#10b981', fontWeight: '700' }}>{fmt(v.valor)}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{v.data || '—'}</td>
                            <td><span className={`badge badge-${BADGE_VENDAS[v.status] || 'pendente'}`}>{v.status}</span></td>
                            <td style={{ color: '#94a3b8', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.observacoes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                }
              </div>
            </div>
          )}

          {/* ── ABA AGENDA ──────────────────────────────────────── */}
          {!loading && aba === 'agenda' && (
            <div className="card">
              <div className="table-wrap">
                {agenda.length === 0
                  ? <div className="empty-state"><Calendar size={40} /><p>Nenhum evento em {formatMes(mesSel)}</p></div>
                  : <table>
                      <thead><tr><th>Título</th><th>Data</th><th>Horário</th><th>Tipo</th><th>Descrição</th></tr></thead>
                      <tbody>
                        {agenda.map(a => (
                          <tr key={a.id}>
                            <td><strong>{a.titulo}</strong></td>
                            <td style={{ color: 'var(--text-muted)' }}>{a.data || '—'}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{a.horario || '—'}</td>
                            <td>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: TIPO_AGENDA_COLORS[a.tipo] || '#94a3b8' }}>
                                {a.tipo}
                              </span>
                            </td>
                            <td style={{ color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.descricao || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                }
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}