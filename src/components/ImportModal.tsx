import { useState, useRef } from 'react';
import { X, FileSpreadsheet, Check, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: 'Leads' | 'Customers';
  onImport: (data: any[]) => void;
}

export const ImportModal = ({ isOpen, onClose, target, onImport }: ImportModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [fileData, setFileData] = useState<any[]>([]);
  const [columns, setColumns] = useState<{ key: string; selected: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        if (json && json.length > 0) {
          const allKeys = new Set<string>();
          json.forEach(row => {
            if (row && typeof row === 'object') {
              Object.keys(row).forEach(k => allKeys.add(k));
            }
          });
          const cols = Array.from(allKeys).map(k => ({ key: k, selected: true }));
          setColumns(cols);
          setFileData(json);
          setStep(2);
        } else {
          alert("The file appears to be empty or could not be read properly.");
        }
      } catch (err) {
        console.error("Error parsing file:", err);
        alert("There was an error parsing the file. Please ensure it is a valid Excel or CSV file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const toggleColumn = (key: string) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, selected: !c.selected } : c));
  };

  const handleFinalImport = () => {
    const selectedKeys = columns.filter(c => c.selected).map(c => c.key);
    
    // Filter the data based on selected columns
    const finalData = fileData.map(row => {
      const newRow: any = { id: Math.random().toString(36).substring(7) };
      if (target === 'Leads') {
         newRow.status = 'new'; // Default status for Kanban
      }
      selectedKeys.forEach(k => {
        if (row[k] !== undefined) {
          newRow[k] = row[k];
        }
      });
      return newRow;
    });

    onImport(finalData);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="panel flex flex-col gap-6" style={{ width: '600px', maxWidth: '90vw', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Import to {target}</h3>
          <button onClick={onClose} className="text-secondary hover:text-white transition"><X size={20} /></button>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-secondary">Upload an XLSX, XLS, or CSV file to import {target.toLowerCase()} into your database.</p>
            <div 
              className="border-2 border-dashed flex flex-col items-center justify-center p-12 rounded-xl cursor-pointer hover:bg-white/5 transition"
              style={{ borderColor: 'var(--panel-border)' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet size={48} className="text-mint mb-4 opacity-80" />
              <p className="font-bold mb-1">Click to select file</p>
              <p className="text-sm text-secondary">.xlsx, .xls, .csv up to 10MB</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileUpload}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-secondary">We found {fileData.length} records. Select the columns you want to import.</p>
            
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              {columns.map(col => (
                <div 
                  key={col.key} 
                  onClick={() => toggleColumn(col.key)}
                  className="flex items-center gap-3 p-3 rounded cursor-pointer transition border"
                  style={{ 
                    background: col.selected ? 'rgba(0, 255, 170, 0.1)' : 'rgba(255,255,255,0.02)',
                    borderColor: col.selected ? 'rgba(0, 255, 170, 0.3)' : 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `1px solid ${col.selected ? 'var(--mint)' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: col.selected ? 'var(--mint)' : 'transparent' }}>
                    {col.selected && <Check size={14} color="#000" strokeWidth={3} />}
                  </div>
                  <span className="font-medium text-sm truncate" style={{ color: col.selected ? '#fff' : 'var(--text-secondary)' }}>{col.key}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setStep(1); setFileData([]); }}>Back</button>
              <button type="button" className="btn flex items-center gap-2" style={{ background: '#00FFAA', color: '#000', fontWeight: 'bold' }} onClick={handleFinalImport}>
                Import {fileData.length} records <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
