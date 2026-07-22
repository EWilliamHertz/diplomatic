import { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dashboard } from './pages/Dashboard';
import { Decisions } from './pages/Decisions';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Members } from './pages/Members';
import { Join } from './pages/Join';
import { Treasury } from './pages/Treasury';
import { Information } from './pages/Information';
import { Leads } from './pages/Leads';
import { Customers } from './pages/Customers';
import { Calculator } from './pages/Calculator';
import { Orders } from './pages/Orders';
import { 
  LayoutDashboard, 
  Gavel, 
  Wallet, 
  Users, 
  Settings as SettingsIcon,
  Megaphone,
  UserCheck,
  ShoppingCart,
  UserPlus,
  Upload,
  X,
  LogOut,
  MessageSquare,
  Calculator as CalcIcon
} from 'lucide-react';

const ImportModal = ({ isOpen, onClose, itemName }: { isOpen: boolean, onClose: () => void, itemName: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="panel" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="flex justify-between items-center">
          <h3 style={{ fontSize: '18px' }}>Import {itemName}(s)</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        {success ? (
          <div className="flex flex-col items-center justify-center p-6 text-mint text-center gap-2">
             <div style={{ fontSize: '48px' }}>✓</div>
             <p>Successfully imported {file?.name}</p>
          </div>
        ) : (
          <>
            <p className="text-secondary" style={{ fontSize: '14px' }}>Upload a CSV or XLSX file to import {itemName.toLowerCase()}s in bulk.</p>
            <div 
              style={{ border: '2px dashed var(--panel-border)', borderRadius: '8px', padding: '32px', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload size={24} className="text-secondary mx-auto mb-2" />
              <p className="text-secondary">{file ? file.name : 'Click to select CSV or XLSX file'}</p>
              <input 
                id="file-upload" 
                type="file" 
                accept=".csv,.xlsx" 
                style={{ display: 'none' }} 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleImport} disabled={!file || loading}>
                {loading ? 'Importing...' : 'Start Import'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const PageHeader = ({ title, itemName }: { title: string, itemName: string }) => {
  const [isImportOpen, setImportOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px' }}>{title}</h2>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setImportOpen(true)}>Import {itemName}(s)</button>
          <button className="btn btn-primary">+ Add {itemName}</button>
        </div>
      </div>
      <ImportModal isOpen={isImportOpen} onClose={() => setImportOpen(false)} itemName={itemName} />
    </>
  );
};

import { Marketing } from './pages/Marketing';

const Settings = () => <div className="panel"><PageHeader title="Settings" itemName="Setting" /></div>;

function AppLayout() {
  const { t, i18n } = useTranslation();
  
  const navItems = [
    { to: "/app/dashboard", icon: <LayoutDashboard size={20} />, label: t('nav.dashboard') },
    { to: "/app/information", icon: <MessageSquare size={20} />, label: t('nav.information') },
    { to: "/app/decisions", icon: <Gavel size={20} />, label: t('nav.decisions') },
    { to: "/app/treasury", icon: <Wallet size={20} />, label: t('nav.treasury') },
    { to: "/app/calculator", icon: <CalcIcon size={20} />, label: "Calculator" },
    { to: "/app/members", icon: <Users size={20} />, label: t('nav.members') },
    { to: "/app/leads", icon: <UserPlus size={20} />, label: t('nav.leads') },
    { to: "/app/customers", icon: <UserCheck size={20} />, label: t('nav.customers') },
    { to: "/app/orders", icon: <ShoppingCart size={20} />, label: t('nav.orders') },
    { to: "/app/marketing", icon: <Megaphone size={20} />, label: t('nav.marketing') },
    { to: "/app/settings", icon: <SettingsIcon size={20} />, label: t('nav.settings') },
  ];

  const BrandLogo = () => (
    <div className="flex items-center gap-3">
      <img src="/IMG_5324.webp" alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
    </div>
  );

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
          <BrandLogo />
        </div>
        <nav className="flex flex-col gap-2" style={{ flex: 1, overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-col gap-4" style={{ marginTop: '24px' }}>
          <select 
            className="panel" 
            style={{ padding: '8px', cursor: 'pointer', background: 'var(--panel-bg)', color: 'white', border: '1px solid var(--panel-border)', borderRadius: '8px' }}
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="sv">Svenska</option>
          </select>
          <a href="/" className="nav-link" style={{ color: 'var(--danger)' }} onClick={() => localStorage.removeItem('token')}>
            <LogOut size={20} /> Logout
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="container">
          {/* Header area for mobile (logo + lang toggle) */}
          <div className="flex items-center justify-between md:hidden" style={{ marginBottom: '24px' }}>
             <BrandLogo />
             <select 
              style={{ padding: '4px 8px', background: 'var(--panel-bg)', color: 'white', border: '1px solid var(--panel-border)', borderRadius: '4px' }}
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              <option value="en">EN</option>
              <option value="sv">SV</option>
            </select>
          </div>
          
          <Routes>
            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="information" element={<Information />} />
            <Route path="decisions" element={<Decisions />} />
            <Route path="treasury" element={<Treasury />} />
            <Route path="calculator" element={<Calculator />} />
            <Route path="members" element={<Members />} />
            <Route path="leads" element={<Leads />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav" style={{ overflowX: 'auto', justifyContent: 'flex-start' }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ minWidth: '80px', flexShrink: 0 }}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

import { StoreProvider } from './store';

function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/join" element={<Join />} />
        <Route path="/app/*" element={<AppLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  );
}

export default App;
