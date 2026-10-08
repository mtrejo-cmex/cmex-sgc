import React, { useState } from 'react';

const UploadVersionModal = ({
  isOpen,
  onClose,
  documentoId,
  onUpdateSuccess,
}) => {
  const [file, setFile] = useState(null);
  const [aprobadoPor, setAprobadoPor] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('aprobado_por', aprobadoPor);
    formData.append('motivo', motivo);

    try {
      const response = await fetch(
        `http://localhost:8000/api/documentos/${documentoId}/nueva-version`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Error al actualizar la versión');

      alert('Versión actualizada con éxito');
      onUpdateSuccess();
      onClose();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Overlay con fondo oscuro semitransparente
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {/* Contenido del modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Subir Nueva Versión
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600">
              Archivo
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600">
              Aprobado por
            </label>
            <input
              type="text"
              placeholder="Nombre del aprobador"
              value={aprobadoPor}
              onChange={(e) => setAprobadoPor(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600">
              Motivo del cambio
            </label>
            <textarea
              placeholder="Describe brevemente el cambio..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600 h-24"
              required
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Subiendo...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVersionModal;
