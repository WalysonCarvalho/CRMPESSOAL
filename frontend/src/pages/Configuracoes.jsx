import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import api from '../services/api';

export default function Configuracoes() {
  const { metas, refreshStats } = useCRM();
  const [form, setForm]       = useState({ meta_leads: 200, meta_captacoes: 8, meta_vendas: 50000 });
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    if (metas && Object.keys(metas).length > 0) {
      setForm({ ...metas });
    }
  }, [metas]);

  const handleSave = async () => {
  setSaving(true);
  try {
    await api.post('/configuracoes', {
      meta_leads: parseFloat(form.meta_leads) || 200,
      meta_captacoes: parseFloat(form.meta_captacoes) || 8,
      meta_vendas: parseFloat(form.meta_vendas) || 50000
    });

    await refreshStats();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  } catch (error) {
    console.error(error);
    alert('Erro ao salvar');
  }
  setSaving(false);
};

  const fields = [
    {
      key: 'meta_leads',
      label: 'Meta de Leads',
      desc: 'Numero total de leads que deseja captar',
      icon: '👥',
      min: 1, step: 10
    },
    {
      key: 'meta_captacoes',
      label: 'Meta de Captacoes',
      desc: 'Numero de captacoes que deseja realizar',
      icon: '🎯',
      min: 1, step: 1
    },
    {
      key: 'meta_vendas',
      label: 'Meta de Vendas (R$)',
      desc: 'Valor total em vendas que deseja atingir',
      icon: '💰',
      min: 0, step: 1000
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuracoes</h1>
          <p className="page-subtitle">Defina as metas do seu CRM</p>
        </div>
        {saved && (
          <div style={{display:'flex',alignItems:'center',gap:'6px',color:'#10b981',fontSize:'13px',fontWeight:'600',background:'rgba(16,185,129,0.08)',padding:'8px 14px',borderRadius:'8px',border:'1px solid rgba(16,185,129,0.2)'}}>
            <CheckCircle size={15} /> Configuracoes salvas!
          </div>
        )}
      </div>

      <div style={{maxWidth:'560px'}}>
        <div className="card">
          <div className="card-header">
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div className="stat-icon indigo" style={{width:'32px',height:'32px'}}><Settings size={15} /></div>
              <span className="card-title">Metas do Sistema</span>
            </div>
          </div>
          <div className="card-body">
            <p style={{color:'var(--text-muted)',fontSize:'13px',marginBottom:'24px',lineHeight:'1.6'}}>
              Configure as metas que apareceram no Dashboard e nos Relatorios. Essas metas serao usadas para calcular o progresso em tempo real.
            </p>

            {fields.map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">
                  <span style={{marginRight:'6px'}}>{f.icon}</span>{f.label}
                </label>
                <input
                  className="form-control"
                  type="number"
                  min={f.min}
                  step={f.step}
                  value={form[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                />
                <p style={{fontSize:'11px',color:'#94a3b8',marginTop:'4px'}}>{f.desc}</p>
              </div>
            ))}

            <div style={{marginTop:'8px'}}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{width:'100%',justifyContent:'center',padding:'11px'}}>
                <Save size={14} />
                {saving ? 'Salvando...' : 'Salvar Configuracoes'}
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{marginTop:'16px'}}>
          <div className="card-body" style={{padding:'20px 24px'}}>
            <h3 style={{fontSize:'13px',fontWeight:'600',marginBottom:'12px'}}>Metas Atuais</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {fields.map(f => (
                <div key={f.key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:'13px',color:'var(--text-muted)'}}>{f.icon} {f.label}</span>
                  <strong style={{fontSize:'14px',color:'var(--text)'}}>{f.key === 'meta_vendas' ? `R$ ${Number(form[f.key]).toLocaleString('pt-BR')}` : form[f.key]}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
