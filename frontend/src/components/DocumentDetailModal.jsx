import React from 'react';

export default function DocumentDetailModal({ isOpen, onClose, doc }) {
  if (!isOpen || !doc) return null;

  // Lógica para obtener la ruta amigable
  // Extraemos lo que está después de "master/"
  const friendlyPath = doc.url_almacenamiento.includes('master/')
    ? doc.url_almacenamiento.split('master/')[1]
    : doc.url_almacenamiento;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Header - Canon Red sólido */}
        <div className="bg-red-600 px-6 py-4">
          <h3 className="text-white font-bold text-lg">
            Detalles del Documento
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">
              Nombre
            </label>
            <p className="text-slate-800 font-medium text-sm">{doc.nombre}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">
                Categoría
              </label>
              <p className="text-slate-700 text-sm font-medium">
                {doc.tipo_nombre}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">
                Versión
              </label>
              <p className="text-slate-700 text-sm">
                {doc.version_actual || '1.0'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">
              Fecha de Creación
            </label>
            <p className="text-slate-700 text-sm">
              {doc.fecha_creacion
                ? new Date(doc.fecha_creacion).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">
              Ubicación en SGC
            </label>
            <p className="text-slate-600 text-xs break-all bg-slate-50 p-2 rounded border border-slate-100">
              {friendlyPath}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-colors text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
