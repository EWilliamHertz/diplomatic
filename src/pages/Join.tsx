import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock, User, ShieldCheck } from 'lucide-react';

export const Join = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!token) {
      // If no token, bounce to home
      navigate('/');
    }
  }, [token, navigate]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate accepting invite and establishing membership
    setTimeout(() => {
      setLoading(false);
      setJoined(true);
      setTimeout(() => {
        // Redirect to dashboard as a logged-in user
        localStorage.setItem('token', 'mock-jwt-token');
        navigate('/app/dashboard');
      }, 2000);
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(0, 255, 170, 0.08) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

      <div className="panel" style={{ width: '100%', maxWidth: '420px', padding: '40px', position: 'relative', zIndex: 10, background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {joined ? (
          <div className="flex flex-col items-center justify-center text-center py-6 gap-4">
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 255, 170, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00FFAA' }}>
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mt-2">Welcome to SamStyre!</h2>
            <p className="text-secondary">Your membership is now established. Redirecting you to the dashboard...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a3a3a3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  SamStyre
                </h1>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-white text-center mb-2">You've been invited</h2>
            <p className="text-secondary text-sm text-center mb-8">Join your organization to participate in governance decisions.</p>

            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-secondary font-medium">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" required
                    value={name} onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '15px' }} 
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-secondary font-medium">Choose a Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '15px' }} 
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  marginTop: '16px', padding: '16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: '#00FFAA', color: '#000', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 24px rgba(0, 255, 170, 0.4)', transition: 'all 0.2s ease', opacity: loading ? 0.8 : 1
                }}
              >
                {loading ? 'Securing Membership...' : 'Accept Invite & Join'} <ArrowRight size={20} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
