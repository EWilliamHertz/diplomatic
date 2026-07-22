
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe2, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Landing = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  const isSv = i18n.language === 'sv';
  const domainName = isSv ? 'SamStyre.se' : 'SamStyre.com';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#000000', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
      
      {/* Hyper-Modern Neon Background Accents */}
      <div style={{ position: 'absolute', top: '-30%', left: '-20%', width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(0, 255, 170, 0.05) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(167, 139, 250, 0.05) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(80px)' }}></div>

      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 container mx-auto w-full position-relative z-10">
        <h1 style={{ 
          fontSize: '28px', fontWeight: '900', letterSpacing: '-0.04em',
          background: 'linear-gradient(90deg, #ffffff, #a3a3a3)', 
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase'
        }}>
          {domainName}
        </h1>
        <div className="flex items-center gap-4">
          <select 
            style={{ background: 'transparent', color: '#a3a3a3', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="en" style={{ color: '#000' }}>EN</option>
            <option value="sv" style={{ color: '#000' }}>SV</option>
          </select>
          <button style={{ padding: '10px 24px', borderRadius: '4px', fontSize: '14px', fontWeight: '700', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.05em' }} onClick={() => navigate('/auth?mode=login')}>Log In</button>
          <button style={{ padding: '10px 24px', borderRadius: '4px', fontSize: '14px', fontWeight: '700', color: '#000', background: '#00FFAA', boxShadow: '0 0 20px rgba(0, 255, 170, 0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }} onClick={() => navigate('/auth?mode=register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 container mx-auto position-relative z-10" style={{ marginTop: '40px' }}>
        <div style={{ maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
          
          <div style={{ padding: '6px 16px', background: 'rgba(0, 255, 170, 0.05)', color: '#00FFAA', borderRadius: '4px', fontSize: '12px', fontWeight: '800', border: '1px solid rgba(0, 255, 170, 0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isSv ? 'Framtiden för kollektivt styre' : 'The Future of Collective Governance'}
          </div>

          <h2 style={{ fontSize: '96px', lineHeight: '0.95', fontWeight: '900', letterSpacing: '-0.05em', textTransform: 'uppercase', color: '#ffffff' }}>
            {isSv ? 'Styr. Besluta.' : 'Govern.'} <br/>
            <span style={{ color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}>
              {isSv ? 'Tillsammans.' : 'Collectively.'}
            </span>
          </h2>
          
          <p style={{ fontSize: '20px', color: '#a3a3a3', maxWidth: '600px', lineHeight: '1.6', fontWeight: '400' }}>
            {isSv 
              ? 'Kryptografiskt, flerspråkigt och hypermodernt beslutsfattande för syndikat, startups och moderna organisationer.' 
              : 'Cryptographic, bilingual, and hyper-modern decision making for syndicates, startups, and modern DAOs.'}
          </p>

          <div className="flex gap-4 mt-8">
            <button 
              style={{ 
                padding: '24px 48px', fontSize: '16px', fontWeight: '900', borderRadius: '4px', 
                background: '#00FFAA', color: '#000000', display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: '0 0 40px rgba(0, 255, 170, 0.3)', textTransform: 'uppercase', letterSpacing: '0.05em',
                transition: 'all 0.2s ease'
              }} 
              onClick={() => navigate('/auth?mode=register')}
            >
              {isSv ? 'Starta Er Organisation' : 'Start Your Organization'} <ArrowRight size={24} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Features Row */}
        <div className="grid mt-32 text-left w-full gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '8px' }}>
            <Globe2 size={40} color="#00FFAA" className="mb-6" />
            <h3 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Bilingual First</h3>
            <p style={{ color: '#a3a3a3', fontSize: '16px', lineHeight: '1.6' }}>Native parity between English and Swedish, designed specifically for cross-border collectives operating seamlessly across Europe.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '8px' }}>
            <ShieldCheck size={40} color="#a78bfa" className="mb-6" />
            <h3 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Cryptographic Trust</h3>
            <p style={{ color: '#a3a3a3', fontSize: '16px', lineHeight: '1.6' }}>Tamper-evident vote logs and strict quorum enforcement ensuring absolute consensus on every single decision made.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '8px' }}>
            <Zap size={40} color="#fbbf24" className="mb-6" />
            <h3 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Brutal Aesthetics</h3>
            <p style={{ color: '#a3a3a3', fontSize: '16px', lineHeight: '1.6' }}>Say goodbye to clunky, uninspiring enterprise tools. SamStyre is built for speed, utility, and extreme visual clarity.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
