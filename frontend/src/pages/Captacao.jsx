import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const STATUS = ['Em andamento','Concluido','Cancelado'];
const BADGE  = { 'Em andamento':'andamento','Concluido':'concluido','Cancelado':'cancelado' };
const DEF    = { titulo:'',descricao:'',status:'Em andamento' };

export default function Captacao() {
  const { metas, refreshStats } = useCRM();
  const [items, setItems]         = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(DEF);
  const [deleteId, setDeleteId]   = useState(null);
  const [saving, setSaving]       = useState(false);

  const load = async () => { const {data} = await api.get('/captacoes'); setItems(data); };
  useEffect(() => { load(); }, []);

  const meta    = metas.meta_captacoes || 8;
  const percent = Math.min(100, Math.round(items.length / meta * 100));
  const done    = items.filter(i => i.status === 'Concluido').length;

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? {...item} : DEF);
    setShowModal(true);
  };

  const save = async () => {
    if (!form.titulo.trim()) return alert('Titulo e obrigatorio');
    setSaving(true);
    try {
      editItem ? await api.put(`/captacoes/${editItem.id}`, form)
               : await api.post('/captacoes', form);
      await load(); refreshStats(); setShowModal(false);
    } catch { alert('Erro ao salvar'); }
    setSaving(false);
  };

  const del = async () => { await api.delete(`/captacoes/${deleteId}`); await load(); refreshStats(); setDeleteId(null); };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Captacao</h1>
          <p className="page-subtitle">{items.length} registros · {done} concluidos</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={14} /> Nova Captacao
        </button>
      </div>

      {/* Meta card */}
      <div className="card" style={{marginBottom:'20px'}}>
        <div className="card-body">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div className="stat-icon amber" style={{width:'36px',height:'36px'}}><Target size={16} /></div>
              <div>
                <div style={{fontWeight:'700',fontSize:'15px'}}>Meta de Captacao</div>
                <div style={{fontSize:'12px',color:'var(--text-muted)'}}>Progresso atual</div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'24px',fontWeight:'800',color:'#f59e0b'}}>{items.length}<span style={{fontSize:'14px',color:'#94a3b8'}}>/{meta}</span></div>
              <div style={{fontSize:'12px',color:'var(--text-muted)'}}>{percent}% concluido</div>
            </div>
          </div>
          <div className="progress-bar" style={{height:'8px'}}>
            <div className="progress-fill amber" style={{width:`${percent}%`}} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {items.length === 0 ? (
            <div className="empty-state">
              <Target size={40} />
              <p>Nenhuma captacao registrada</p>
              <small>Clique em "Nova Captacao" para comecar</small>
            </div>
          ) : (
            <table>
              <thead><tr><th>#</th><th>Titulo</th><th>Descricao</th><th>Status</th><th>Data</th><th></th></tr></thead>
              <tbody>
                {items.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{color:'#94a3b8',fontSize:'12px',fontWeight:'600'}}>{i+1}</td>
                    <td><strong>{c.titulo}</strong></td>
                    <td style={{color:'var(--text-muted)',maxWidth:'220px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.descricao||'—'}</td>
                    <td><span className={`badge badge-${BADGE[c.status]||'andamento'}`}>{c.status}</span></td>
                    <td style={{color:'#94a3b8',fontSize:'12px'}}>{c.criado_em?.substring(0,10)}</td>
                    <td>
                      <div style={{display:'flex',gap:'2px'}}>
                        <button className="btn-icon" onClick={() => openModal(c)}><Pencil size={13} /></button>
                        <button className="btn-icon danger" onClick={() => setDeleteId(c.id)}><Trash2 size={13} /></button>
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
        <Modal title={editItem ? 'Editar Captacao' : 'Nova Captacao'} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </>}>
          <div className="form-group">
            <label className="form-label">Titulo *</label>
            <input className="form-control" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} placeholder="Titulo da captacao" />
          </div>
          <div className="form-group">
            <label className="form-label">Descricao</label>
            <textarea className="form-control" rows="3" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} placeholder="Descricao opcional..." />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              {STATUS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </Modal>
      )}

      {deleteId && <ConfirmDialog message="Deseja excluir esta captacao permanentemente?" onConfirm={del} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
