// src/components/DocumentTable.jsx
import React from 'react';
import { getFileIcon } from '../utils/fileHelpers';

const getFileColor = (nombre) => {
  if (!nombre) return 'text-slate-400';
  const extension = nombre.split('.').pop().toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'text-red-600';
    case 'doc':
    case 'docx':
      return 'text-blue-600';
    case 'xls':
    case 'xlsx':
      return 'text-emerald-600';
    case 'ppt':
    case 'pptx':
      return 'text-orange-600';
    case 'mp4':
    case 'mov':
    case 'avi':
      return 'text-purple-600';
    default:
      return 'text-slate-400';
  }
};

export default function DocumentTable({
  documentos = [],
  searchQuery = '',
  onOpenDocument,
}) {
  // Función para resaltar las coincidencias en el texto
  const highlightMatch = (text, query) => {
    if (!text) return '';
    if (!query || query.trim() === '') return text;

    const parts = String(text).split(new RegExp(`(${query})`, 'gi'));

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={i}
          className="bg-yellow-200 text-slate-900 font-bold px-0.5 rounded"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleKeyDown = (e, doc) => {
    if (e.key === 'Enter' && onOpenDocument) {
      onOpenDocument(doc);
    }
  };

  // Manejo visual cuando la lista está vacía
  if (!documentos || documentos.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        No hay documentos disponibles para mostrar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="px-4 py-3 text-center">Tipo</th>
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Nombre del Archivo</th>
            <th className="px-4 py-3">Macroproceso / Área</th>
            <th className="px-4 py-3 text-center">Versión</th>
            <th className="px-4 py-3 text-center">Estado</th>
            <th className="px-4 py-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {documentos.map((doc, index) => {
            const nombreArchivo = doc.nombre || 'Sin nombre';
            const IconComponent = getFileIcon(nombreArchivo);
            const colorClass = getFileColor(nombreArchivo);

            return (
              <tr
                key={doc.id || index}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => handleKeyDown(e, doc)}
                className="group cursor-pointer hover:bg-slate-50 transition-all duration-200 outline-none focus:bg-slate-100"
                onClick={() => onOpenDocument && onOpenDocument(doc)}
              >
                {/* ICONO DE EXTENSIÓN */}
                <td className={`px-4 py-3.5 w-10 text-center ${colorClass}`}>
                  <IconComponent size={18} strokeWidth={1.5} />
                </td>

                {/* CÓDIGO */}
                <td className="px-4 py-3.5 font-mono font-semibold text-[#CC0000] whitespace-nowrap">
                  {highlightMatch(doc.codigo || 'S/C', searchQuery)}
                </td>

                {/* NOMBRE DEL ARCHIVO Y TIPO */}
                <td className="px-4 py-3.5 font-medium text-slate-800 max-w-xs truncate">
                  <p title={nombreArchivo}>
                    {highlightMatch(nombreArchivo, searchQuery)}
                  </p>
                  {doc.tipo_documento && (
                    <span className="text-[10px] text-slate-400 font-normal block">
                      {doc.tipo_documento}
                    </span>
                  )}
                </td>

                {/* MACROPROCESO Y ÁREA (Lectura directa de las llaves del backend) */}
                <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                  <span className="font-semibold text-slate-700 block">
                    {doc.Nombre_Proceso || 'Corporativo'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {doc.Nombre_Area || '-'}
                  </span>
                </td>

                {/* VERSIÓN */}
                <td className="px-4 py-3.5 text-center font-semibold text-slate-600 whitespace-nowrap">
                  v{doc.version_actual ?? 1}
                </td>

                {/* ESTADO */}
                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      doc.estado === 'Vigente'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {doc.estado || 'Vigente'}
                  </span>
                </td>

                {/* ACCIÓN */}
                <td className="px-4 py-3.5 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#CC0000] bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                    Ver
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
