import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Calendar, Clock } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const TIPO  = ['Reuniao','Ligacao','Tarefa','Outro'];
const BADGE = { Reuniao:'reuniao',Ligacao:'ligacao',Tarefa:'tarefa',Outro:'novo' };
const DEF   = { titulo:'',descricao:'',data:'',horario:'',tipo:'Reuniao' };

const TIPO_COLORS = { Reuniao:'#4f46e5',Ligacao:'#3b82f6',Tarefa:'#f59e0b',Outro:'#94a3b8' };

export default function Agenda() {
  const [items, setItems]         = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(DEF);
  const [deleteId, setDeleteId]   = useState(null);
  const [saving, setSaving]       = useState(false);

  const load = async () => { const {data} = await api.get('/agenda'); setItems(data); };
  useEffect(() => { load(); }, []);

  const openModal = (item = null) => { setEditItem(item); setForm(item ? {...item} : DEF); setShowModal(true); };

  const save = async () => {
    if (!form.titulo.trim()) return alert('Titulo e obrigatorio');
    setSaving(true);
    try {
      editItem ? await api.put(`/agenda/${editItem.id}`, form)
               : await api.post('/agenda', form);
      await load(); setShowModal(false);
    } catch { alert('Erro ao salvar'); }
    setSaving(false);
  };

  const del = async () => { await api.delete(`/agenda/${deleteId}`); await load(); setDeleteId(null); };

  const hoje = new Date().toISOString().substring(0,10);
  const proximos = items.filter(i => !i.data || i.data >= hoje);
  const passados = items.filter(i => i.data && i.data < hoje);

  const EventCard = ({ item }) => (
    <div className="event-item">
      <div className="event-dot" style={{background: TIPO_COLORS[item.tipo]||'#94a3b8'}} />
      <div style={{flex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <strong style={{fontSize:'13px'}}>{item.titulo}</strong>
          <div style={{display:'flex',gap:'2px'}}>
            <button className="btn-icon" onClick={() => openModal(item)}><Pencil size={12} /></button>
            <button className="btn-icon danger" onClick={() => setDeleteId(item.id)}><Trash2 size={12} /></button>
          </div>
        </div>
        <div style={{display:'flex',gap:'12px',marginTop:'4px',flexWrap:'wrap'}}>
          {item.data && <span style={{fontSize:'11px',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:'3px'}}><Calendar size={10}/>{item.data}</span>}
          {item.horario && <span style={{fontSize:'11px',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:'3px'}}><Clock size={10}/>{item.horario}</span>}
          <span className={`badge badge-${BADGE[item.tipo]||'novo'}`} style={{fontSize:'10px',padding:'1px 6px'}}>{item.tipo}</span>
        </div>
        {item.descricao && <p style={{fontSize:'12px',color:'#94a3b8',marginTop:'4px'}}>{item.descricao}</p>}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle">{items.length} evento(s) registrado(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={14} /> Novo Evento
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card"><div className="empty-state">
          <Calendar size={40} /><p>Nenhum evento agendado</p><small>Clique em "Novo Evento" para comecar</small>
        </div></div>
      ) : (
        <>
          {proximos.length > 0 && (
            <div style={{marginBottom:'20px'}}>
              <h3 style={{fontSize:'13px',fontWeight:'600',color:'var(--text-muted)',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Proximos / Sem Data</h3>
              <div className="event-list">{proximos.map(i => <EventCard key={i.id} item={i} />)}</div>
            </div>
          )}
          {passados.length > 0 && (
            <div>
              <h3 style={{fontSize:'13px',fontWeight:'600',color:'var(--text-muted)',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Passados</h3>
              <div className="event-list" style={{opacity:0.6}}>{passados.map(i => <EventCard key={i.id} item={i} />)}</div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <Modal title={editItem ? 'Editar Evento' : 'Novo Evento'} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </>}>
          <div className="form-group">
            <label className="form-label">Titulo *</label>
            <input className="form-control" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} placeholder="Titulo do evento" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data</label>
              <input className="form-control" type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Horario</label>
              <input className="form-control" type="time" value={form.horario} onChange={e=>setForm({...form,horario:e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select className="form-control" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
              {TIPO.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Descricao</label>
            <textarea className="form-control" rows="3" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} placeholder="Detalhes do evento..." />
          </div>
        </Modal>
      )}

      {deleteId && <ConfirmDialog message="Deseja excluir este evento?" onConfirm={del} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
