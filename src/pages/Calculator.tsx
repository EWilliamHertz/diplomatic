import { useState } from 'react';
import { useStore } from '../store';
import { Calculator as CalcIcon, Save, History } from 'lucide-react';

export const Calculator = () => {
  const { calculations, addCalculation } = useStore();
  const [title, setTitle] = useState('');
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Very simple safe eval for arithmetic
      // We will just use new Function since it's an internal tool, but sanitize it a bit
      const sanitized = formula.replace(/[^-()\d/*+.]/g, '');
      const res = new Function('return ' + sanitized)();
      setResult(res.toString());
    } catch (err) {
      setResult('Error');
    }
  };

  const handleSave = async () => {
    if (result && result !== 'Error' && title) {
      await addCalculation({ title, formula, result });
      setTitle('');
      setFormula('');
      setResult(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px' }}>Calculator Log</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="panel flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <CalcIcon className="text-mint" />
            <h3 className="text-lg font-bold">New Calculation</h3>
          </div>
          <form onSubmit={handleCalculate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-secondary">Title / Description</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Booster box profits"
                className="input p-2 rounded bg-black/20 border border-white/10 text-white" 
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-secondary">Formula</label>
              <input 
                type="text" 
                value={formula} 
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g. (450 * 750) - 55000"
                className="input p-2 rounded bg-black/20 border border-white/10 text-white font-mono" 
                required
              />
            </div>
            <button type="submit" className="btn btn-secondary mt-2">Calculate</button>
          </form>

          {result !== null && (
            <div className="mt-4 p-4 rounded bg-mint/10 border border-mint/20 flex flex-col gap-2">
              <div className="text-secondary text-sm">Result:</div>
              <div className="text-2xl font-bold font-mono text-mint">{result}</div>
              <button 
                onClick={handleSave} 
                disabled={!title || result === 'Error'}
                className="btn btn-primary flex items-center justify-center gap-2 mt-2"
              >
                <Save size={16} /> Save to Log
              </button>
            </div>
          )}
        </div>

        <div className="panel flex flex-col gap-4 max-h-[600px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-4">
            <History className="text-secondary" />
            <h3 className="text-lg font-bold">Organization Log</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {calculations.length === 0 ? (
              <div className="text-secondary text-sm text-center py-8">No saved calculations yet.</div>
            ) : (
              calculations.map(calc => (
                <div key={calc.id} className="p-3 rounded border border-white/5 bg-black/40 flex flex-col gap-1">
                  <div className="font-bold">{calc.title}</div>
                  <div className="text-sm font-mono text-secondary">{calc.formula}</div>
                  <div className="font-mono text-mint font-bold mt-1">= {calc.result}</div>
                  <div className="text-xs text-secondary/50 mt-2">{new Date(calc.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
