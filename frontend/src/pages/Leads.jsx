import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const STATUS  = ['Novo','Contato','Qualificado','Proposta','Fechado','Perdido'];
const ORIGEM  = ['Manual','Instagram','WhatsApp','Indicacao','Site','Facebook','Google','Outro'];
const BADGE   = { Novo:'novo',Contato:'contato',Qualificado:'qualificado',Proposta:'proposta',Fechado:'fechado',Perdido:'perdido' };
const DEF     = { nome:'',telefone:'',email:'',origem:'Manual',status:'Novo' };

export default function Leads() {
  const { refreshStats } = useCRM();
  const [leads, setLeads]         = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [statusF, setStatusF]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(DEF);
  const [deleteId, setDeleteId]   = useState(null);
  const [saving, setSaving]       = useState(false);

  const load = async () => {
    const { data } = await api.get('/leads');
    setLeads(data);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(leads.filter(l =>
      (!q || l.nome.toLowerCase().includes(q) || (l.email||'').toLowerCase().includes(q) || (l.telefone||'').includes(q)) &&
      (!statusF || l.status === statusF)
    ));
  }, [search, statusF, leads]);

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? { ...item } : DEF);
    setShowModal(true);
  };

  const save = async () => {
    if (!form.nome.trim()) return alert('Nome e obrigatorio');
    setSaving(true);
    try {
      editItem ? await api.put(`/leads/${editItem.id}`, form)
               : await api.post('/leads', form);
      await load(); refreshStats(); setShowModal(false);
    } catch { alert('Erro ao salvar'); }
    setSaving(false);
  };

  const del = async () => {
    await api.delete(`/leads/${deleteId}`);
    await load(); refreshStats(); setDeleteId(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">{filtered.length} de {leads.length} contatos</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={14} /> Novo Lead
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-wrap">
          <Search size={14} />
          <input className="form-control" placeholder="Buscar por nome, email ou telefone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{width:'160px'}} value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Users size={40} />
              <p>Nenhum lead encontrado</p>
              <small>Clique em "Novo Lead" para comecar</small>
            </div>
          ) : (
            <table>
              <thead><tr>
                <th>Nome</th><th>Telefone</th><th>Email</th>
                <th>Origem</th><th>Status</th><th>Data</th><th></th>
              </tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.nome}</strong></td>
                    <td>{l.telefone || <span style={{color:'#cbd5e1'}}>—</span>}</td>
                    <td>{l.email || <span style={{color:'#cbd5e1'}}>—</span>}</td>
                    <td style={{color:'var(--text-muted)'}}>{l.origem}</td>
                    <td><span className={`badge badge-${BADGE[l.status]||'novo'}`}>{l.status}</span></td>
                    <td style={{color:'#94a3b8',fontSize:'12px'}}>{l.criado_em?.substring(0,10)}</td>
                    <td>
                      <div style={{display:'flex',gap:'2px'}}>
                        <button className="btn-icon" title="Editar" onClick={() => openModal(l)}><Pencil size={13} /></button>
                        <button className="btn-icon danger" title="Excluir" onClick={() => setDeleteId(l.id)}><Trash2 size={13} /></button>
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
        <Modal title={editItem ? 'Editar Lead' : 'Novo Lead'} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </>}>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input className="form-control" value={form.nome} onChange={e => setForm({...form,nome:e.target.value})} placeholder="Nome completo" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-control" value={form.telefone} onChange={e => setForm({...form,telefone:e.target.value})} placeholder="(11) 99999-9999" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="email@exemplo.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Origem</label>
              <select className="form-control" value={form.origem} onChange={e => setForm({...form,origem:e.target.value})}>
                {ORIGEM.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                {STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && <ConfirmDialog message="Deseja excluir este lead permanentemente?" onConfirm={del} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
