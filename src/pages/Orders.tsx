import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { ImportModal } from '../components/ImportModal';
import { Download, LayoutGrid, List as ListIcon, ArrowUpDown, Trash2, CheckSquare, Square } from 'lucide-react';

export const Orders = () => {
  const { t } = useTranslation();
  const { orders, importOrders, updateOrderStatus, bulkUpdateOrderStatus, deleteOrder, bulkDeleteOrders } = useStore();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Extract all unique columns from the orders
  const columns = Array.from(new Set(orders.flatMap(l => Object.keys(l).filter(k => k !== 'id' && k !== 'status'))));

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortCol) return 0;
    const aVal = a[sortCol] ?? '';
    const bVal = b[sortCol] ?? '';
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const kanbanColumns = ['new', 'contacted', 'qualified', 'lost'];

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedOrders.map(l => l.id));
    }
  };

  const selectNext = (count: number) => {
    const unselected = sortedOrders.filter(l => !selectedIds.includes(l.id)).slice(0, count);
    setSelectedIds(prev => [...prev, ...unselected.map(l => l.id)]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkStatusChange = (status: string) => {
    bulkUpdateOrderStatus(selectedIds, status);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    bulkDeleteOrders(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="flex flex-col gap-6" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="flex justify-between items-center" style={{ flexShrink: 0 }}>
        <h2 style={{ fontSize: '24px' }}>{t('nav.orders') ?? 'Orders'}</h2>
        <div className="flex gap-2">
          <div className="flex bg-black/30 rounded-lg p-1 border border-white/10">
            <button onClick={() => setView('table')} className={`p-2 rounded ${view === 'table' ? 'bg-mint text-black' : 'text-secondary hover:text-white'}`}><ListIcon size={18} /></button>
            <button onClick={() => setView('kanban')} className={`p-2 rounded ${view === 'kanban' ? 'bg-mint text-black' : 'text-secondary hover:text-white'}`}><LayoutGrid size={18} /></button>
          </div>
          <button className="btn btn-secondary flex items-center gap-2" onClick={() => setIsImportOpen(true)}>
            <Download size={18} /> Import XLSX
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }} className="flex flex-col gap-4">
        {selectedIds.length > 0 && (
          <div className="panel py-3 px-4 flex items-center justify-between border-mint bg-mint/10" style={{ borderStyle: 'solid', borderWidth: '1px' }}>
             <div className="font-bold text-mint">{selectedIds.length} orders selected</div>
             <div className="flex items-center gap-3">
               <span className="text-sm text-secondary">Change status:</span>
               <select 
                 className="bg-black border border-white/10 rounded p-1 text-sm outline-none focus:border-mint"
                 onChange={(e) => handleBulkStatusChange(e.target.value)}
                 value=""
               >
                 <option value="" disabled>Select Status...</option>
                 {kanbanColumns.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
               </select>
               <button onClick={handleBulkDelete} className="btn btn-secondary text-sm px-3 py-1 flex items-center gap-2 hover:text-danger hover:border-danger">
                 <Trash2 size={14} /> Delete Selected
               </button>
             </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-secondary panel h-full" style={{ borderStyle: 'dashed' }}>
            <p>No orders found. Import an Excel file to get started.</p>
          </div>
        ) : view === 'table' ? (
          <div className="panel" style={{ overflowX: 'auto' }}>
            <div className="flex gap-2 mb-4">
              <button onClick={toggleSelectAll} className="btn btn-secondary text-xs px-2 py-1">
                {selectedIds.length === sortedOrders.length ? 'Deselect All' : 'Select All'}
              </button>
              <button onClick={() => selectNext(5)} className="btn btn-secondary text-xs px-2 py-1">+5</button>
              <button onClick={() => selectNext(10)} className="btn btn-secondary text-xs px-2 py-1">+10</button>
              <button onClick={() => selectNext(25)} className="btn btn-secondary text-xs px-2 py-1">+25</button>
              <button onClick={() => selectNext(50)} className="btn btn-secondary text-xs px-2 py-1">+50</button>
            </div>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
                  <th className="py-3 font-medium px-4 w-10">
                    <button onClick={toggleSelectAll} className="text-secondary hover:text-white">
                      {selectedIds.length > 0 && selectedIds.length === sortedOrders.length ? <CheckSquare size={16} className="text-mint" /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className="py-3 font-medium px-4">Status</th>
                  {columns.map(col => (
                    <th key={col} className="py-3 font-medium px-4 cursor-pointer hover:text-white" onClick={() => handleSort(col)}>
                      <div className="flex items-center gap-1">{col} <ArrowUpDown size={14} /></div>
                    </th>
                  ))}
                  <th className="py-3 font-medium px-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map(order => (
                  <tr key={order.id} className="group hover:bg-white/5 transition cursor-pointer" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => toggleSelect(order.id)}>
                    <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(order.id)} className="text-secondary hover:text-white mt-1">
                        {selectedIds.includes(order.id) ? <CheckSquare size={16} className="text-mint" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', outline: 'none' }}
                      >
                        {kanbanColumns.map(c => <option key={c} value={c} className="bg-black">{c.toUpperCase()}</option>)}
                      </select>
                    </td>
                    {columns.map(col => (
                      <td key={col} className="py-4 px-4 text-sm text-gray-300">{order[col] || '-'}</td>
                    ))}
                    <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 h-full" style={{ minWidth: '800px' }}>
            {kanbanColumns.map(status => (
              <div key={status} className="panel flex flex-col gap-4 h-full bg-black/40 border border-white/5">
                <h3 className="font-bold text-secondary uppercase tracking-widest text-xs border-b border-white/10 pb-2">{status} ({orders.filter(l => l.status === status).length})</h3>
                <div className="flex flex-col gap-3 overflow-y-auto">
                  {orders.filter(l => l.status === status).map(order => (
                    <div key={order.id} className="p-3 rounded border border-white/10 bg-black/60 shadow-lg cursor-pointer hover:border-mint/50 transition relative group">
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="absolute top-2 right-2 text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition bg-black/80 rounded p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                      {columns.slice(0, 3).map(col => (
                        <div key={col} className="text-sm pr-6"><span className="text-secondary text-xs">{col}:</span> {order[col] || '-'}</div>
                      ))}
                      <select 
                        value={order.status} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="mt-3 w-full"
                        style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', outline: 'none' }}
                      >
                        {kanbanColumns.map(c => <option key={c} value={c} className="bg-black">{c.toUpperCase()}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} target="Orders" onImport={importOrders} />
    </div>
  );
};
