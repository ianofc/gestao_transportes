import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AbrirCaixaModal({ isOpen, onClose, onSave, error }) {
  const [saldoInicial, setSaldoInicial] = useState('0.00');

  useEffect(() => {
    if (isOpen) {
      setSaldoInicial('0.00');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const saldo = parseFloat(saldoInicial);
    if (isNaN(saldo)) {
      alert("Valor inválido.");
      return;
    }
    onSave({ saldo_inicial: saldo });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 m-4">
        
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-2xl font-semibold text-gray-800">Abrir Caixa</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="saldo_inicial" className="block text-sm font-medium text-gray-700">
              Saldo Inicial (R$)
            </label>
            <input
              type="number"
              step="0.01"
              name="saldo_inicial"
              id="saldo_inicial"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          
          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          <div className="flex justify-end pt-6 space-x-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-brand-500 text-white rounded-lg shadow hover:bg-brand-600 transition-colors">Abrir Caixa</button>
          </div>
        </form>
      </div>
    </div>
  );
}