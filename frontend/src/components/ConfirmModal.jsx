import React from 'react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-600 text-sm">{message}</p>
        </div>
        <div className="flex gap-2 p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-canon-red hover:bg-red-700 rounded-lg shadow-sm transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
