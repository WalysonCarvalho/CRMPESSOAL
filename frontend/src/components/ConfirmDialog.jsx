import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <Modal
      title="Confirmar exclusao"
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger-outline" onClick={onConfirm}>Excluir</button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <AlertTriangle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
          {message || 'Tem certeza que deseja excluir este item? Esta acao nao pode ser desfeita.'}
        </p>
      </div>
    </Modal>
  );
}
