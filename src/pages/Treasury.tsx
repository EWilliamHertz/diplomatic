
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Plus, X } from 'lucide-react';
import { useStore } from '../store';

export const Treasury = () => {
  const { t } = useTranslation();
  const { balance, transactions, addTransaction } = useStore();
  
  const [showModal, setShowModal] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income'|'expense'>('expense');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const numAmount = type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
    await addTransaction({
      description: desc,
      amount: numAmount,
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(false);
    setDesc('');
    setAmount('');
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px' }}>{t('treasuryPage.title')}</h2>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> New Transaction
        </button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex justify-between items-center">
              <h3 style={{ fontSize: '18px' }}>Add Transaction</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-secondary">Type</label>
                <div className="flex gap-2">
                  <button type="button" className={`flex-1 p-2 rounded border ${type === 'income' ? 'border-mint text-mint bg-mint/10' : 'border-panel-border text-secondary'}`} onClick={() => setType('income')}>Income (+)</button>
                  <button type="button" className={`flex-1 p-2 rounded border ${type === 'expense' ? 'border-danger text-danger bg-danger/10' : 'border-panel-border text-secondary'}`} onClick={() => setType('expense')}>Expense (-)</button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-secondary">Description</label>
                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="input p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', color: 'white' }} required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-secondary">Amount (SEK)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', color: 'white' }} required min="1" />
              </div>
              <button type="submit" className="btn btn-primary mt-2">Save Transaction</button>
            </form>
          </div>
        </div>
      )}

      {/* Balance Panel */}
      <div className="panel flex flex-col gap-2" style={{ background: 'linear-gradient(135deg, rgba(0, 255, 170, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)', border: '1px solid rgba(0, 255, 170, 0.2)' }}>
        <div className="flex items-center gap-2 text-secondary">
          <Wallet size={20} className="text-mint" />
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{t('treasuryPage.balance')}</span>
        </div>
        <div style={{ fontSize: '48px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em' }}>
          {balance.toLocaleString()} SEK
        </div>
      </div>

      <div className="panel mt-4">
        <h3 className="mb-4 text-lg font-bold">{t('treasuryPage.recent')}</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
              <th className="py-3 font-medium">{t('treasuryPage.colDate')}</th>
              <th className="py-3 font-medium">{t('treasuryPage.colDesc')}</th>
              <th className="py-3 font-medium text-right text-mint">In (+)</th>
              <th className="py-3 font-medium text-right text-danger">Out (-)</th>
              <th className="py-3 font-medium text-right">{t('treasuryPage.colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-white/5 transition" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="py-4 text-secondary text-sm font-mono">{tx.date}</td>
                <td className="py-4">{tx.description}</td>
                <td className="py-4 text-right font-mono font-bold text-mint">
                  {tx.amount > 0 ? `+${tx.amount.toLocaleString()} SEK` : '-'}
                </td>
                <td className="py-4 text-right font-mono font-bold text-danger">
                  {tx.amount < 0 ? `${tx.amount.toLocaleString()} SEK` : '-'}
                </td>
                <td className="py-4 text-right">
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    background: tx.status === 'completed' ? 'rgba(0, 255, 170, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: tx.status === 'completed' ? 'var(--mint)' : 'var(--text-primary)'
                  }}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
