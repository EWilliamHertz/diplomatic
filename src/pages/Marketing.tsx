import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import type { Campaign } from '../store';
import { Megaphone, Plus, Calendar, Target, AlignLeft } from 'lucide-react';

export const Marketing = () => {
  const { t } = useTranslation();
  const { campaigns, addCampaign } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [strategy, setStrategy] = useState('');
  const [period, setPeriod] = useState('');
  const [status, setStatus] = useState<'planned' | 'active' | 'completed'>('planned');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCampaign: Campaign = {
      id: Math.random().toString(36).substring(7),
      title,
      description,
      strategy,
      period,
      status
    };

    addCampaign(newCampaign);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setStrategy('');
    setPeriod('');
    setStatus('planned');
  };

  return (
    <div className="flex flex-col gap-6" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="flex justify-between items-center" style={{ flexShrink: 0 }}>
        <h2 style={{ fontSize: '24px' }}>{t('nav.marketing') ?? 'Marketing Campaigns'}</h2>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Campaign
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-secondary panel h-full" style={{ borderStyle: 'dashed' }}>
             <Megaphone size={48} className="mb-4 opacity-50" />
             <p>No campaigns planned yet. Create your first marketing campaign to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(camp => (
              <div key={camp.id} className="panel flex flex-col gap-4 relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-1 h-full" 
                  style={{ background: camp.status === 'active' ? 'var(--mint)' : camp.status === 'completed' ? 'var(--secondary)' : 'var(--lilac)' }}
                />
                
                <div className="flex justify-between items-start pl-2">
                  <h3 className="font-bold text-lg">{camp.title}</h3>
                  <span 
                    className="text-xs px-2 py-1 rounded uppercase tracking-wider font-bold"
                    style={{ 
                      background: camp.status === 'active' ? 'rgba(0,255,170,0.1)' : 'rgba(255,255,255,0.05)',
                      color: camp.status === 'active' ? 'var(--mint)' : 'var(--text-secondary)'
                    }}
                  >
                    {camp.status}
                  </span>
                </div>
                
                {camp.description && (
                  <div className="flex items-start gap-2 text-secondary text-sm pl-2">
                    <AlignLeft size={16} className="mt-1 flex-shrink-0" />
                    <p>{camp.description}</p>
                  </div>
                )}
                
                {camp.strategy && (
                  <div className="flex items-start gap-2 text-secondary text-sm pl-2">
                    <Target size={16} className="mt-1 flex-shrink-0" />
                    <p><strong>Strategy:</strong> {camp.strategy}</p>
                  </div>
                )}
                
                {camp.period && (
                  <div className="flex items-center gap-2 text-secondary text-sm pl-2">
                    <Calendar size={16} />
                    <span>{camp.period}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '500px', maxWidth: '90vw' }}>
            <h3 className="text-xl font-bold mb-4">Plan Marketing Campaign</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-secondary mb-1">Campaign Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none focus:border-mint"
                  placeholder="e.g. Summer Outreach"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm text-secondary mb-1">Description (What is it?)</label>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none focus:border-mint"
                  rows={2}
                  placeholder="Details about the campaign..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-secondary mb-1">Strategy (How will it act out?)</label>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none focus:border-mint"
                  rows={3}
                  placeholder="e.g. Cold email sequence to 50 European shops..."
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-secondary mb-1">Period</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none focus:border-mint"
                    placeholder="e.g. Q3 2026, Future, Blank"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  />
                </div>
                
                <div className="w-1/3">
                  <label className="block text-sm text-secondary mb-1">Status</label>
                  <select 
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none focus:border-mint"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
