import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User, Building } from 'lucide-react';

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('GlimmerFall'); // Prefilled with user's org
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      setLoading(false);
      if (email && password) {
        localStorage.setItem('token', 'mock-jwt-token');
        navigate('/app/dashboard');
      } else {
        setError('Please fill in all fields');
      }
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(0, 232, 162, 0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(167, 139, 250, 0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>

      <div className="panel" style={{ width: '100%', maxWidth: '420px', padding: '40px', position: 'relative', zIndex: 10, backdropFilter: 'blur(40px)', background: 'rgba(6, 11, 24, 0.7)' }}>
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <img src="/IMG_5324.webp" alt="SamStyre Logo" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} />
          <h1 style={{ 
            fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px',
            background: 'linear-gradient(90deg, var(--mint), var(--lilac))', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
          }}>SamStyre</h1>
        </div>
        <p className="text-secondary text-center text-sm mb-8">The operating system for collectives.</p>
        
        {/* Rebuilt Segmented Control for Toggles */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            style={{ 
              flex: 1, padding: '10px 0', fontSize: '14px', fontWeight: '600', borderRadius: '8px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: mode === 'login' ? 'var(--panel-border)' : 'transparent', 
              color: mode === 'login' ? '#fff' : 'var(--text-secondary)',
              boxShadow: mode === 'login' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
          <button 
            style={{ 
              flex: 1, padding: '10px 0', fontSize: '14px', fontWeight: '600', borderRadius: '8px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: mode === 'register' ? 'var(--panel-border)' : 'transparent', 
              color: mode === 'register' ? '#fff' : 'var(--text-secondary)',
              boxShadow: mode === 'register' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        {error && <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-secondary font-medium">Your Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    value={name} onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '15px', transition: 'border-color 0.2s' }} 
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-secondary font-medium">Organization Name</label>
                <div style={{ position: 'relative' }}>
                  <Building size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    value={orgName} onChange={(e) => setOrgName(e.target.value)}
                    style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '15px', transition: 'border-color 0.2s' }} 
                    placeholder="e.g. GlimmerFall"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm text-secondary font-medium">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="email" 
                value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '15px', transition: 'border-color 0.2s' }} 
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-secondary font-medium">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '15px', transition: 'border-color 0.2s' }} 
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Rebuilt Submit Button with Glow Effect */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '16px', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'var(--mint)', color: '#060B18', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 24px rgba(0, 232, 162, 0.4)', transition: 'all 0.2s ease', opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Enter Workspace' : 'Create Account'} 
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
