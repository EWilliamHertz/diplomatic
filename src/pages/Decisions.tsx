import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, MinusCircle, AlertCircle, Plus, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store';
import type { Proposal } from '../store';

export const Decisions = () => {
  const { t } = useTranslation();
  const { proposals, addProposal, voteOnProposal, addArgument } = useStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);

  const [expandedArgs, setExpandedArgs] = useState<Record<string, boolean>>({});
  const [newArgText, setNewArgText] = useState('');
  const [argType, setArgType] = useState<'pro'|'con'>('pro');
  const [activeProposalForArg, setActiveProposalForArg] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newProposal: Proposal = {
      id: Math.random().toString(36).substring(7),
      title: newTitle,
      description: newDesc,
      amount: newAmount,
      status: 'active',
      votes: { for: 0, against: 0, abstain: 0 },
      totalMembers: 10,
      userVote: null,
      arguments: []
    };

    addProposal(newProposal);
    setNewTitle('');
    setNewDesc('');
    setNewAmount(0);
    setIsCreating(false);
  };

  const toggleArgs = (id: string) => {
    setExpandedArgs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddArgument = (e: React.FormEvent, proposalId: string) => {
    e.preventDefault();
    if (!newArgText.trim()) return;
    addArgument(proposalId, {
      id: Math.random().toString(36).substring(7),
      type: argType,
      text: newArgText,
      author: 'You (Admin)'
    });
    setNewArgText('');
    setActiveProposalForArg(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px' }}>{t('proposals.title')}</h2>
        <button className="btn btn-primary" onClick={() => setIsCreating(true)}>+ {t('proposals.create')}</button>
      </div>

      {isCreating && (
        <div className="panel mb-6 border-2" style={{ borderColor: 'var(--mint)' }}>
          <h3 className="mb-4 font-bold">{t('proposals.createTitle')}</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder={t('proposals.titlePlaceholder')} 
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--panel-border)', borderRadius: '8px', color: '#fff' }}
            />
            <textarea 
              placeholder={t('proposals.descPlaceholder')} 
              value={newDesc} onChange={e => setNewDesc(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--panel-border)', borderRadius: '8px', color: '#fff', minHeight: '100px' }}
            />
            <input 
              type="number" 
              placeholder={t('proposals.amountPlaceholder')} 
              value={newAmount === 0 ? '' : newAmount} onChange={e => setNewAmount(parseFloat(e.target.value) || 0)}
              style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--panel-border)', borderRadius: '8px', color: '#fff' }}
            />
            <p className="text-sm text-secondary">If approved, this will automatically deduct/add to the Treasury.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>{t('common.cancel')}</button>
              <button type="submit" className="btn btn-primary">{t('common.confirm')}</button>
            </div>
          </form>
        </div>
      )}

      {proposals.length === 0 && !isCreating ? (
        <div className="flex flex-col items-center justify-center p-12 text-secondary panel" style={{ borderStyle: 'dashed' }}>
          <AlertCircle size={48} className="mb-4 opacity-50" />
          <p>{t('proposals.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {proposals.map(proposal => {
            const totalVotes = proposal.votes.for + proposal.votes.against + proposal.votes.abstain;
            const forPct = totalVotes > 0 ? (proposal.votes.for / proposal.totalMembers) * 100 : 0;
            const againstPct = totalVotes > 0 ? (proposal.votes.against / proposal.totalMembers) * 100 : 0;
            const abstainPct = totalVotes > 0 ? (proposal.votes.abstain / proposal.totalMembers) * 100 : 0;

            const isExpanded = expandedArgs[proposal.id];

            return (
              <div key={proposal.id} className="panel flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{proposal.title}</h3>
                    <p className="text-secondary" style={{ marginTop: '4px' }}>{proposal.description}</p>
                    {proposal.amount !== 0 && (
                      <div className="mt-2 text-sm font-bold" style={{ color: proposal.amount > 0 ? 'var(--mint)' : 'var(--danger)' }}>
                        Financial Impact: €{Math.abs(proposal.amount).toLocaleString()} {proposal.amount < 0 ? '(Expense)' : '(Income)'}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-sm`} style={{ backgroundColor: proposal.status === 'active' ? 'var(--amber)' : proposal.status === 'approved' ? 'var(--mint)' : 'var(--danger)', color: proposal.status === 'active' || proposal.status === 'approved' ? '#000' : '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {t(`proposals.status.${proposal.status}`)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm text-secondary" style={{ fontSize: '12px' }}>
                    <span>{proposal.votes.for} {t('proposals.voteFor')} • {proposal.votes.against} {t('proposals.voteAgainst')}</span>
                    <span>{Math.floor((proposal.votes.for / proposal.totalMembers) * 100)}% / 51% {t('proposals.quorum')}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--panel-bg)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${forPct}%`, background: 'var(--mint)', transition: 'width 0.3s' }}></div>
                    <div style={{ width: `${againstPct}%`, background: 'var(--danger)', transition: 'width 0.3s' }}></div>
                    <div style={{ width: `${abstainPct}%`, background: 'var(--text-secondary)', transition: 'width 0.3s' }}></div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--panel-border)' }}>
                  <button onClick={() => toggleArgs(proposal.id)} className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isExpanded ? t('proposals.hideProsCons') : `${t('proposals.viewProsCons')} (${proposal.arguments.length})`}
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col gap-4 mt-4">
                      {proposal.arguments.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <h4 className="text-mint font-bold flex items-center gap-1"><ThumbsUp size={14}/> {t('proposals.addPro')}</h4>
                            {proposal.arguments.filter(a => a.type === 'pro').map(arg => (
                              <div key={arg.id} className="p-2 rounded" style={{ background: 'rgba(0, 232, 162, 0.1)', borderLeft: '2px solid var(--mint)' }}>
                                <p className="text-sm">{arg.text}</p>
                                <span className="text-xs text-secondary opacity-70">- {arg.author}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-2">
                            <h4 className="text-danger font-bold flex items-center gap-1"><ThumbsDown size={14}/> {t('proposals.addCon')}</h4>
                            {proposal.arguments.filter(a => a.type === 'con').map(arg => (
                              <div key={arg.id} className="p-2 rounded" style={{ background: 'rgba(244, 63, 94, 0.1)', borderLeft: '2px solid var(--danger)' }}>
                                <p className="text-sm">{arg.text}</p>
                                <span className="text-xs text-secondary opacity-70">- {arg.author}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-secondary"></p>
                      )}

                      {activeProposalForArg === proposal.id ? (
                        <form onSubmit={(e) => handleAddArgument(e, proposal.id)} className="flex flex-col gap-2 mt-2">
                          <div className="flex gap-2">
                            <select value={argType} onChange={(e) => setArgType(e.target.value as 'pro'|'con')} style={{ padding: '8px', background: 'var(--panel-bg)', color: '#fff', border: '1px solid var(--panel-border)', borderRadius: '4px' }}>
                              <option value="pro">{t('proposals.addPro')}</option>
                              <option value="con">{t('proposals.addCon')}</option>
                            </select>
                            <input type="text" value={newArgText} onChange={e => setNewArgText(e.target.value)} placeholder="..." style={{ flex: 1, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--panel-border)', borderRadius: '4px', color: '#fff' }} />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button type="button" className="text-sm text-secondary" onClick={() => setActiveProposalForArg(null)}>{t('common.cancel')}</button>
                            <button type="submit" className="text-sm text-mint font-bold">{t('proposals.addArg')}</button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => setActiveProposalForArg(proposal.id)} className="btn btn-secondary text-sm mt-2" style={{ padding: '6px 12px', alignSelf: 'flex-start' }}>
                          <Plus size={14} /> {t('proposals.addArg')}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {proposal.status === 'active' && !proposal.userVote && (
                  <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--panel-border)' }}>
                    <button onClick={() => voteOnProposal(proposal.id, 'for')} className="btn flex-1" style={{ background: 'rgba(0, 232, 162, 0.1)', color: 'var(--mint)', border: '1px solid var(--mint)' }}>
                      <CheckCircle2 size={16} /> {t('proposals.voteFor')}
                    </button>
                    <button onClick={() => voteOnProposal(proposal.id, 'against')} className="btn flex-1" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                      <XCircle size={16} /> {t('proposals.voteAgainst')}
                    </button>
                    <button onClick={() => voteOnProposal(proposal.id, 'abstain')} className="btn flex-1 btn-secondary">
                      <MinusCircle size={16} /> {t('proposals.voteAbstain')}
                    </button>
                  </div>
                )}

                {proposal.userVote && (
                  <div className="mt-4 pt-4 border-t text-sm text-secondary flex items-center gap-2" style={{ borderColor: 'var(--panel-border)' }}>
                    <AlertCircle size={16} />
                    You voted <strong>{t(`proposals.vote${proposal.userVote.charAt(0).toUpperCase() + proposal.userVote.slice(1)}`)}</strong> on this proposal.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
