import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, Target,
  MessageSquare, Calendar, BarChart2, Settings, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/vendas', icon: TrendingUp, label: 'Vendas' },
  { to: '/captacao', icon: Target, label: 'Captacao' },
  { to: '/mensagens', icon: MessageSquare, label: 'Mensagens' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatorios' },
  { to: '/configuracoes', icon: Settings, label: 'Configuracoes' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="mobile-topbar">
        <div className="mobile-brand">
          <h1>CRM<span>.</span></h1>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {open && <div className="mobile-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <h1>CRM<span>.</span></h1>
          <p>Gestao de Vendas</p>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Menu</div>

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}