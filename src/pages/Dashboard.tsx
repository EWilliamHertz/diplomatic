import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Users, Wallet, Calendar, AlertCircle } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { useStore } from '../store';

// Placeholder hook to simulate data loading
const useDashboardData = () => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        runway: '14 mo',
        cashPosition: '€142,500',
        monthlyBurn: '€9,800',
        activeMembers: '12'
      });
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return { loading, data };
};

export const Dashboard = () => {
  const { t } = useTranslation();
  const { loading, data } = useDashboardData();
  const { balance } = useStore();

  return (
    <div className="flex flex-col gap-6">
      <h2 style={{ fontSize: '24px' }}>{t('dashboard.title')}</h2>
      
      {/* KPI Row */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="panel flex flex-col gap-2">
          <div className="flex items-center gap-2 text-secondary">
            <Calendar size={16} />
            <span style={{ fontSize: '14px' }}>{t('dashboard.runway')}</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {loading ? <Skeleton width="80px" height="32px" /> : (data?.runway ?? '---')}
          </div>
        </div>
        
        <div className="panel flex flex-col gap-2">
          <div className="flex items-center gap-2 text-secondary">
            <Wallet size={16} />
            <span style={{ fontSize: '14px' }}>{t('dashboard.cashPosition')}</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--mint)' }}>
            €{balance.toLocaleString()}
          </div>
        </div>
        
        <div className="panel flex flex-col gap-2">
          <div className="flex items-center gap-2 text-secondary">
            <TrendingUp size={16} />
            <span style={{ fontSize: '14px' }}>{t('dashboard.monthlyBurn')}</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--danger)' }}>
            {loading ? <Skeleton width="100px" height="32px" /> : (data?.monthlyBurn ?? '---')}
          </div>
        </div>
        
        <div className="panel flex flex-col gap-2">
          <div className="flex items-center gap-2 text-secondary">
            <Users size={16} />
            <span style={{ fontSize: '14px' }}>{t('dashboard.activeMembers')}</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--lilac)' }}>
            {loading ? <Skeleton width="60px" height="32px" /> : (data?.activeMembers ?? '---')}
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Radar Chart Placeholder */}
        <div className="panel flex flex-col gap-4">
          <h3>Governance Health</h3>
          <div className="flex items-center justify-center flex-col gap-2" style={{ height: '200px', border: '1px dashed var(--panel-border)', borderRadius: '8px' }}>
            {loading ? <Skeleton width="100%" height="100%" className="rounded-lg" /> : (
              <>
                <AlertCircle size={24} className="text-secondary" />
                <span className="text-secondary">No data available</span>
              </>
            )}
          </div>
        </div>
        
        {/* Active Proposals Panel */}
        <div className="panel flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <h3>{t('dashboard.recentDecisions')}</h3>
             <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }}>View All</button>
          </div>
          <div className="flex flex-col gap-2">
             {loading ? (
               <>
                 <Skeleton height="80px" />
                 <Skeleton height="80px" />
               </>
             ) : (
                <div className="flex items-center justify-center p-6 text-secondary flex-col gap-2 border border-dashed rounded-lg" style={{ borderColor: 'var(--panel-border)' }}>
                  <AlertCircle size={24} />
                  <span>No recent decisions</span>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
