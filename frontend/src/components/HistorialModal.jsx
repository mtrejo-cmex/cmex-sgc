import React, { useState, useEffect } from 'react';
import { Icons } from '../utils/icons';

export default function HistorialModal({ documentoId, onClose }) {
  const [historial, setHistorial] = useState([]); // Inicializado como array vacío
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/documentos/${documentoId}/historial`
        );

        if (!response.ok) throw new Error('Error en la respuesta del servidor');

        const data = await response.json();

        // Depuración: Aseguramos que data es un array
        console.log('Datos recibidos de la API:', data);

        setHistorial(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        setHistorial([]); // Reseteamos a array vacío en caso de error
      } finally {
        setLoading(false);
      }
    };

    if (documentoId) fetchHistorial();
  }, [documentoId]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Historial de Cambios</h3>
          {/* Reemplazo de Icons.X por &times; para evitar errores de importación */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors font-bold text-2xl px-2"
          >
            &times;
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-center py-4 text-slate-500">Cargando...</p>
          ) : historial.length === 0 ? (
            <p className="text-center py-4 text-slate-500">
              No hay registros de historial.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-slate-500 uppercase text-xs">
                <tr>
                  <th className="py-2 text-left">Versión</th>
                  <th className="py-2 text-left">Fecha</th>
                  <th className="py-2 text-left">Aprobado por</th>
                  <th className="py-2 text-left">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historial.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-canon-red">
                      v{v.numero_version}
                    </td>
                    <td className="py-3 text-slate-600">
                      {v.fecha_aprobacion
                        ? new Date(v.fecha_aprobacion).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td className="py-3 text-slate-700">
                      {v.aprobado_por || 'N/A'}
                    </td>
                    <td className="py-3 text-slate-600 italic">
                      {v.motivo_cambio || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
