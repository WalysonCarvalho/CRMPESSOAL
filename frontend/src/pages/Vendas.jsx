import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const STATUS  = ['Pendente','Negociacao','Fechado','Cancelado'];
const BADGE   = { Pendente:'pendente',Negociacao:'negociacao',Fechado:'fechado',Cancelado:'cancelado' };
const DEF     = { cliente:'',valor:'',data:'',status:'Pendente',observacoes:'' };
const fmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0);

export default function Vendas() {
  const { refreshStats } = useCRM();
  const [vendas, setVendas]       = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(DEF);
  const [deleteId, setDeleteId]   = useState(null);
  const [saving, setSaving]       = useState(false);

  const load = async () => { const {data} = await api.get('/vendas'); setVendas(data); };
  useEffect(() => { load(); }, []);

  const total    = vendas.reduce((s, v) => s + v.valor, 0);
  const fechados = vendas.filter(v => v.status === 'Fechado').reduce((s, v) => s + v.valor, 0);

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? {...item, valor: String(item.valor)} : DEF);
    setShowModal(true);
  };

  const save = async () => {
    if (!form.cliente.trim() || !form.valor) return alert('Cliente e valor sao obrigatorios');
    setSaving(true);
    try {
      const p = {...form, valor: parseFloat(form.valor)};
      editItem ? await api.put(`/vendas/${editItem.id}`, p)
               : await api.post('/vendas', p);
      await load(); refreshStats(); setShowModal(false);
    } catch { alert('Erro ao salvar'); }
    setSaving(false);
  };

  const del = async () => { await api.delete(`/vendas/${deleteId}`); await load(); refreshStats(); setDeleteId(null); };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendas</h1>
          <p className="page-subtitle">{vendas.length} negocio(s) · Total: <strong style={{color:'#10b981'}}>{fmt(total)}</strong> · Fechado: <strong style={{color:'#4f46e5'}}>{fmt(fechados)}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={14} /> Nova Venda
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {vendas.length === 0 ? (
            <div className="empty-state">
              <TrendingUp size={40} />
              <p>Nenhuma venda registrada</p>
              <small>Clique em "Nova Venda" para comecar</small>
            </div>
          ) : (
            <table>
              <thead><tr>
                <th>Cliente</th><th>Valor</th><th>Data</th><th>Status</th><th>Observacoes</th><th></th>
              </tr></thead>
              <tbody>
                {vendas.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.cliente}</strong></td>
                    <td style={{color:'#10b981',fontWeight:'700'}}>{fmt(v.valor)}</td>
                    <td style={{color:'var(--text-muted)'}}>{v.data || '—'}</td>
                    <td><span className={`badge badge-${BADGE[v.status]||'pendente'}`}>{v.status}</span></td>
                    <td style={{color:'#94a3b8',maxWidth:'180px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.observacoes||'—'}</td>
                    <td>
                      <div style={{display:'flex',gap:'2px'}}>
                        <button className="btn-icon" onClick={() => openModal(v)}><Pencil size={13} /></button>
                        <button className="btn-icon danger" onClick={() => setDeleteId(v.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title={editItem ? 'Editar Venda' : 'Nova Venda'} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </>}>
          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <input className="form-control" value={form.cliente} onChange={e=>setForm({...form,cliente:e.target.value})} placeholder="Nome do cliente" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valor (R$) *</label>
              <input className="form-control" type="number" step="0.01" min="0" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})} placeholder="0,00" />
            </div>
            <div className="form-group">
              <label className="form-label">Data</label>
              <input className="form-control" type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              {STATUS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Observacoes</label>
            <textarea className="form-control" rows="3" value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})} placeholder="Notas opcionais..." />
          </div>
        </Modal>
      )}

      {deleteId && <ConfirmDialog message="Deseja excluir esta venda permanentemente?" onConfirm={del} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
