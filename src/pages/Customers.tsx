import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { ImportModal } from '../components/ImportModal';
import { Download, ArrowUpDown, Trash2, CheckSquare, Square } from 'lucide-react';

export const Customers = () => {
  const { t } = useTranslation();
  const { customers, importCustomers, deleteCustomer, bulkDeleteCustomers } = useStore();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Extract all unique columns
  const columns = Array.from(new Set(customers.flatMap(c => Object.keys(c).filter(k => k !== 'id'))));

  const sortedCustomers = [...customers].sort((a, b) => {
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

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedCustomers.map(c => c.id));
    }
  };

  const selectNext = (count: number) => {
    const unselected = sortedCustomers.filter(c => !selectedIds.includes(c.id)).slice(0, count);
    setSelectedIds(prev => [...prev, ...unselected.map(c => c.id)]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    bulkDeleteCustomers(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="flex flex-col gap-6" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="flex justify-between items-center" style={{ flexShrink: 0 }}>
        <h2 style={{ fontSize: '24px' }}>{t('nav.customers') ?? 'Customers'}</h2>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-2" onClick={() => setIsImportOpen(true)}>
            <Download size={18} /> Import XLSX
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }} className="flex flex-col gap-4">
        {selectedIds.length > 0 && (
          <div className="panel py-3 px-4 flex items-center justify-between border-mint bg-mint/10" style={{ borderStyle: 'solid', borderWidth: '1px' }}>
             <div className="font-bold text-mint">{selectedIds.length} customers selected</div>
             <div className="flex items-center gap-3">
               <button onClick={handleBulkDelete} className="btn btn-secondary text-sm px-3 py-1 flex items-center gap-2 hover:text-danger hover:border-danger">
                 <Trash2 size={14} /> Delete Selected
               </button>
             </div>
          </div>
        )}

        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-secondary panel h-full" style={{ borderStyle: 'dashed' }}>
            <p>No customers found. Import an Excel file to get started.</p>
          </div>
        ) : (
          <div className="panel" style={{ overflowX: 'auto' }}>
            <div className="flex gap-2 mb-4">
              <button onClick={toggleSelectAll} className="btn btn-secondary text-xs px-2 py-1">
                {selectedIds.length === sortedCustomers.length ? 'Deselect All' : 'Select All'}
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
                      {selectedIds.length > 0 && selectedIds.length === sortedCustomers.length ? <CheckSquare size={16} className="text-mint" /> : <Square size={16} />}
                    </button>
                  </th>
                  {columns.map(col => (
                    <th key={col} className="py-3 font-medium px-4 cursor-pointer hover:text-white" onClick={() => handleSort(col)}>
                      <div className="flex items-center gap-1">{col} <ArrowUpDown size={14} /></div>
                    </th>
                  ))}
                  <th className="py-3 font-medium px-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.map(customer => (
                  <tr key={customer.id} className="group hover:bg-white/5 transition cursor-pointer" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => toggleSelect(customer.id)}>
                    <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(customer.id)} className="text-secondary hover:text-white mt-1">
                        {selectedIds.includes(customer.id) ? <CheckSquare size={16} className="text-mint" /> : <Square size={16} />}
                      </button>
                    </td>
                    {columns.map(col => (
                      <td key={col} className="py-4 px-4 text-sm text-gray-300">{customer[col] || '-'}</td>
                    ))}
                    <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => deleteCustomer(customer.id)}
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
        )}
      </div>

      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} target="Customers" onImport={importCustomers} />
    </div>
  );
};
