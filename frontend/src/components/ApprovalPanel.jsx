import React, { useState } from 'react';
import { Icons } from '../utils/icons';
import HistorialModal from './HistorialModal';
import ConfirmModal from './ConfirmModal';

export default function ApprovalPanel({
  tareas = [],
  onAprobar,
  onRechazar,
  apiUrl,
}) {
  const [selectedDocId, setSelectedDocId] = useState(null);

  const [confirmData, setConfirmData] = useState({
    isOpen: false,
    id: null,
    codigo: '',
    modo: 'aprobar',
  });

  const handleOpenConfirmAprobar = (tarea) => {
    setConfirmData({
      isOpen: true,
      id: tarea.id,
      codigo: tarea.codigo,
      modo: 'aprobar',
    });
  };

  const handleOpenConfirmRechazar = (tarea) => {
    setConfirmData({
      isOpen: true,
      id: tarea.id,
      codigo: tarea.codigo,
      modo: 'rechazar',
    });
  };

  const handleConfirmAction = () => {
    if (confirmData.modo === 'aprobar' && onAprobar) {
      onAprobar(confirmData.id);
    } else if (confirmData.modo === 'rechazar' && onRechazar) {
      onRechazar(confirmData.id);
    }
    setConfirmData({ ...confirmData, isOpen: false });
  };

  const handleVerArchivo = (documentoId) => {
    const urlVisualizar = `/api/sgc/documentos/${documentoId}/visualizar?rol=calidad`;
    window.open(urlVisualizar, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Contenedor principal con min-w-0 y overflow-hidden para proteger bordes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-w-0 w-full overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
        {/* Encabezado del Panel */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="text-amber-500 shrink-0">
              <Icons.CheckCircle />
            </div>
            <span>Bandeja de Aprobaciones</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Requieren tu acción para modificar el SGC
          </p>
        </div>

        {/* Lista de Tareas */}
        <div className="p-4 sm:p-5 space-y-4 min-w-0">
          {tareas.map((tarea) => (
            <div
              key={tarea.id}
              className="p-3.5 sm:p-4 border border-slate-200 rounded-xl hover:border-canon-red transition-all bg-white shadow-sm hover:shadow-md group min-w-0 overflow-hidden"
            >
              <div className="flex justify-between items-start gap-2 mb-2 sm:mb-3">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md uppercase tracking-wide shrink-0
                  ${tarea.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}
                >
                  {tarea.accion}
                </span>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {tarea.fecha}
                </span>
              </div>

              <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-canon-red transition-colors truncate">
                {tarea.codigo}
              </h4>
              <p className="text-slate-600 text-xs sm:text-sm mb-3 leading-tight truncate">
                {tarea.nombre}
              </p>

              {/* Botón de inspección y vista previa */}
              <div className="mb-3 sm:mb-4">
                <button
                  type="button"
                  onClick={() => handleVerArchivo(tarea.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors group/btn"
                >
                  <span>👁️ Ver archivo</span>
                </button>
              </div>

              {/* Pie de tarjeta con acciones ajustado a flex-wrap */}
              <div className="pt-3 border-t border-slate-100 space-y-3 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                  {/* Solicitante con truncate para evitar que estire el contenedor */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium min-w-0 max-w-35 sm:max-w-none">
                    <span className="shrink-0">
                      <Icons.Users />
                    </span>
                    <span className="truncate">{tarea.solicitante}</span>
                  </div>

                  {/* Grupo de Botones: Rechazar y Aprobar con flex-nowrap interno */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    <button
                      onClick={() => handleOpenConfirmRechazar(tarea)}
                      className="border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all duration-300"
                    >
                      Rechazar
                    </button>

                    <button
                      onClick={() => handleOpenConfirmAprobar(tarea)}
                      className="bg-slate-900 hover:bg-canon-red text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md shrink-0"
                    >
                      Aprobar
                    </button>
                  </div>
                </div>

                {!tarea.accion?.includes('Validar') && (
                  <button
                    onClick={() => setSelectedDocId(tarea.id)}
                    className="w-full text-center text-[11px] font-semibold text-canon-red hover:underline p-1 transition-colors"
                  >
                    Ver historial de cambios &rarr;
                  </button>
                )}
              </div>
            </div>
          ))}

          {tareas.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-4">
              No hay tareas pendientes.
            </p>
          )}
        </div>
      </div>

      {/* --- Modales --- */}
      <ConfirmModal
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ ...confirmData, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={
          confirmData.modo === 'aprobar'
            ? 'Confirmar Aprobación'
            : 'Confirmar Rechazo'
        }
        message={
          confirmData.modo === 'aprobar'
            ? `¿Estás seguro de que deseas aprobar el documento "${confirmData.codigo}"? Esta acción cambiará su estado a VIGENTE.`
            : `¿Estás seguro de que deseas rechazar el documento "${confirmData.codigo}"? Esta acción eliminará la propuesta y su archivo temporal permanentemente.`
        }
      />

      {selectedDocId && (
        <HistorialModal
          documentoId={selectedDocId}
          onClose={() => setSelectedDocId(null)}
        />
      )}
    </>
  );
}
