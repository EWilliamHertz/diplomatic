import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, UserPlus, X, User } from 'lucide-react';
import { useStore } from '../store';

export const Members = () => {
  const { t } = useTranslation();
  const { members, addMemberManually } = useStore();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Member');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/send-invite-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsInviteOpen(false);
        setEmail('');
      }, 2500);
    } catch (err: any) {
      alert("Error sending email: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addMemberManually({ name, email, role });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsManualOpen(false);
        setEmail('');
        setName('');
        setRole('Member');
      }, 2000);
    } catch (err: any) {
      alert("Error adding member: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px' }}>{t('nav.members')}</h2>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2" onClick={() => setIsManualOpen(true)}>
            <User size={18} /> Add Manually
          </button>
          <button className="btn btn-primary flex items-center gap-2" onClick={() => setIsInviteOpen(true)}>
            <UserPlus size={18} /> {t('membersPage.inviteBtn')}
          </button>
        </div>
      </div>

      <div className="panel">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
              <th className="py-3 font-medium">{t('membersPage.colName')}</th>
              <th className="py-3 font-medium">{t('membersPage.colEmail')}</th>
              <th className="py-3 font-medium">{t('membersPage.colRole')}</th>
              <th className="py-3 font-medium">{t('membersPage.colJoined')}</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="py-4 flex items-center gap-3">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 255, 170, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00FFAA', fontWeight: 'bold' }}>
                    {m.name.charAt(0)}
                  </div>
                  {m.name}
                </td>
                <td className="py-4 text-secondary">{m.email}</td>
                <td className="py-4">
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    background: m.role === 'Super Admin' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: m.role === 'Super Admin' ? 'var(--lilac)' : 'var(--text-primary)'
                  }}>
                    {m.role}
                  </span>
                </td>
                <td className="py-4 text-secondary">{m.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isManualOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-between items-center">
              <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Add Member Manually</h3>
              <button onClick={() => setIsManualOpen(false)} className="text-secondary hover:text-white transition"><X size={20} /></button>
            </div>
            
            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-mint text-center gap-4">
                 <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 255, 170, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <User size={32} />
                 </div>
                 <div>
                   <h4 className="font-bold text-lg mb-1 text-white">Member Added!</h4>
                 </div>
              </div>
            ) : (
              <form onSubmit={handleManualAdd} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-secondary font-medium">Name</label>
                  <input 
                    type="text" required
                    value={name} onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                    placeholder="Enter name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-secondary font-medium">{t('membersPage.emailLabel')}</label>
                  <input 
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                    placeholder={t('membersPage.emailPlaceholder')}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-secondary font-medium">Role</label>
                  <select 
                    value={role} onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsManualOpen(false)}>{t('common.cancel')}</button>
                  <button type="submit" className="btn" disabled={loading} style={{ background: '#00FFAA', color: '#000', fontWeight: 'bold' }}>
                    {loading ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {isInviteOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-between items-center">
              <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>{t('membersPage.inviteTitle')}</h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-secondary hover:text-white transition"><X size={20} /></button>
            </div>
            
            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-mint text-center gap-4">
                 <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 255, 170, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Mail size={32} />
                 </div>
                 <div>
                   <h4 className="font-bold text-lg mb-1 text-white">{t('membersPage.inviteSent')}</h4>
                   <p className="text-sm">{t('membersPage.inviteSentDesc')} {email}</p>
                 </div>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="flex flex-col gap-4">
                <p className="text-secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  {t('membersPage.inviteDesc')}
                </p>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-sm text-secondary font-medium">{t('membersPage.emailLabel')}</label>
                  <input 
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                    placeholder={t('membersPage.emailPlaceholder')}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsInviteOpen(false)}>{t('common.cancel')}</button>
                  <button type="submit" className="btn" disabled={loading} style={{ background: '#00FFAA', color: '#000', fontWeight: 'bold' }}>
                    {loading ? t('membersPage.sending') : t('membersPage.sendInvite')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
