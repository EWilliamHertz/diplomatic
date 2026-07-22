import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useStore } from '../store';

export const Treasury = () => {
  const { t } = useTranslation();
  const { balance, transactions } = useStore();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px' }}>{t('treasuryPage.title')}</h2>
      </div>

      {/* Balance Panel */}
      <div className="panel flex flex-col gap-2" style={{ background: 'linear-gradient(135deg, rgba(0, 255, 170, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)', border: '1px solid rgba(0, 255, 170, 0.2)' }}>
        <div className="flex items-center gap-2 text-secondary">
          <Wallet size={20} className="text-mint" />
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{t('treasuryPage.balance')}</span>
        </div>
        <div style={{ fontSize: '48px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em' }}>
          €{balance.toLocaleString()}
        </div>
      </div>

      <div className="panel mt-4">
        <h3 className="mb-4 text-lg font-bold">{t('treasuryPage.recent')}</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
              <th className="py-3 font-medium">{t('treasuryPage.colDate')}</th>
              <th className="py-3 font-medium">{t('treasuryPage.colDesc')}</th>
              <th className="py-3 font-medium text-right">{t('treasuryPage.colAmount')}</th>
              <th className="py-3 font-medium text-right">{t('treasuryPage.colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="py-4 text-secondary text-sm">{tx.date}</td>
                <td className="py-4">{tx.description}</td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-1" style={{ color: tx.amount > 0 ? 'var(--mint)' : 'var(--danger)', fontWeight: 'bold' }}>
                    {tx.amount > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    €{Math.abs(tx.amount).toLocaleString()}
                  </div>
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
