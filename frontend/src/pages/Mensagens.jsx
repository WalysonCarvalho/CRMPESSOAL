import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MessageSquare } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const TIPO  = ['Entrada','Saida'];
const BADGE = { Entrada:'entrada',Saida:'saida' };
const DEF   = { contato:'',mensagem:'',tipo:'Entrada',data:'' };

export default function Mensagens() {
  const [items, setItems]         = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(DEF);
  const [deleteId, setDeleteId]   = useState(null);
  const [saving, setSaving]       = useState(false);

  const load = async () => { const {data} = await api.get('/mensagens'); setItems(data); };
  useEffect(() => { load(); }, []);

  const openModal = (item = null) => { setEditItem(item); setForm(item ? {...item} : DEF); setShowModal(true); };

  const save = async () => {
    if (!form.contato.trim()) return alert('Contato e obrigatorio');
    setSaving(true);
    try {
      editItem ? await api.put(`/mensagens/${editItem.id}`, form)
               : await api.post('/mensagens', form);
      await load(); setShowModal(false);
    } catch { alert('Erro ao salvar'); }
    setSaving(false);
  };

  const del = async () => { await api.delete(`/mensagens/${deleteId}`); await load(); setDeleteId(null); };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mensagens</h1>
          <p className="page-subtitle">Historico de contatos</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={14} /> Nova Mensagem
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {items.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={40} />
              <p>Nenhuma mensagem registrada</p>
              <small>Registre o historico de contatos</small>
            </div>
          ) : (
            <table>
              <thead><tr><th>Contato</th><th>Mensagem</th><th>Tipo</th><th>Data</th><th>Registrado</th><th></th></tr></thead>
              <tbody>
                {items.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.contato}</strong></td>
                    <td style={{maxWidth:'250px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-muted)'}}>{m.mensagem||'—'}</td>
                    <td><span className={`badge badge-${BADGE[m.tipo]||'entrada'}`}>{m.tipo}</span></td>
                    <td style={{color:'var(--text-muted)'}}>{m.data||'—'}</td>
                    <td style={{color:'#94a3b8',fontSize:'12px'}}>{m.criado_em?.substring(0,10)}</td>
                    <td>
                      <div style={{display:'flex',gap:'2px'}}>
                        <button className="btn-icon" onClick={() => openModal(m)}><Pencil size={13} /></button>
                        <button className="btn-icon danger" onClick={() => setDeleteId(m.id)}><Trash2 size={13} /></button>
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
        <Modal title={editItem ? 'Editar Mensagem' : 'Nova Mensagem'} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </>}>
          <div className="form-group">
            <label className="form-label">Contato *</label>
            <input className="form-control" value={form.contato} onChange={e=>setForm({...form,contato:e.target.value})} placeholder="Nome do contato" />
          </div>
          <div className="form-group">
            <label className="form-label">Mensagem</label>
            <textarea className="form-control" rows="4" value={form.mensagem} onChange={e=>setForm({...form,mensagem:e.target.value})} placeholder="Conteudo da mensagem..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-control" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
                {TIPO.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Data</label>
              <input className="form-control" type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} />
            </div>
          </div>
        </Modal>
      )}

      {deleteId && <ConfirmDialog message="Deseja excluir esta mensagem?" onConfirm={del} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
