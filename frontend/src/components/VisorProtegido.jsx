import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

export default function VisorProtegido({
  isOpen,
  onClose,
  documentoId,
  userRole,
  apiUrl,
}) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [errorVisor, setErrorVisor] = useState(null);
  const [cargando, setCargando] = useState(false);
  const contenedorScrollRef = useRef(null);

  // 1. Bloqueo de atajos en la ventana principal (por si el foco está fuera del PDF)
  useEffect(() => {
    if (!isOpen || userRole === 'calidad') return;

    const manejarAtajosTeclado = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')
      ) {
        e.preventDefault();
        alert(
          'Esta acción está deshabilitada por las políticas de seguridad del SGC.'
        );
      }
    };

    window.addEventListener('keydown', manejarAtajosTeclado);
    return () => window.removeEventListener('keydown', manejarAtajosTeclado);
  }, [isOpen, userRole]);

  // 2. Descarga y conversión a Blob seguro
  useEffect(() => {
    let activo = true;
    let urlLocalTemporal = null;

    if (!isOpen || !documentoId) {
      setBlobUrl(null);
      setErrorVisor(null);
      return;
    }

    const descargarDocumentoSeguro = async () => {
      setCargando(true);
      setErrorVisor(null);
      try {
        const urlPeticion = `${apiUrl}/api/sgc/documentos/${documentoId}/visualizar?rol=${userRole}`;
        const response = await fetch(urlPeticion);

        if (!response.ok) {
          throw new Error(`Error del servidor: Código ${response.status}`);
        }

        const archivoBlob = await response.blob();
        if (activo) {
          urlLocalTemporal = URL.createObjectURL(archivoBlob);
          setBlobUrl(urlLocalTemporal);
        }
      } catch (err) {
        if (activo) setErrorVisor(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    };

    descargarDocumentoSeguro();

    return () => {
      activo = false;
      if (urlLocalTemporal) URL.revokeObjectURL(urlLocalTemporal);
    };
  }, [isOpen, documentoId, userRole, apiUrl]);

  // 3. RETRANSMISIÓN MANUAL DEL SCROLL:
  // Al hacer scroll con la rueda sobre la capa invisible, calculamos el movimiento
  // y desplazamos manualmente el contenedor interno para simular el scroll nativo.
  const manejarScrollFantasma = (e) => {
    if (contenedorScrollRef.current) {
      contenedorScrollRef.current.scrollTop += e.deltaY;
    }
  };

  if (!isOpen || !documentoId) return null;

  const urlFinal = blobUrl
    ? `${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`
    : null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[92vw] h-[90vh] flex flex-col overflow-hidden relative select-none">
        {/* Encabezado Seguro */}
        <div className="flex items-center justify-between bg-slate-900 text-white px-6 py-4">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-100">
              Visor de Consulta Segura SGC
            </h3>
            <p className="text-[11px] text-slate-400">
              Modo lectura activo: Descarga, copia e impresión deshabilitadas
              para tu rol
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-red-600 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Zona del Contenido */}
        <div
          className="flex-1 bg-slate-100 relative overflow-hidden"
          onContextMenu={(e) => e.preventDefault()} // Bloquea clic derecho perimetral
        >
          {cargando && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500 bg-slate-50">
              Generando túnel seguro de lectura...
            </div>
          )}

          {errorVisor && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-600 text-sm p-6 text-center bg-red-50/50">
              <p className="font-bold">Error de Visualización</p>
              <p className="text-xs text-slate-500 mt-2">{errorVisor}</p>
            </div>
          )}

          {urlFinal && !cargando && (
            <div className="w-full h-full relative">
              {/* Contenedor intermedio que sí tiene permitido el scroll de desbordamiento */}
              <div
                ref={contenedorScrollRef}
                className="w-full h-full overflow-y-auto overflow-x-hidden"
              >
                {/* Usamos un <embed> expandido de altura extendida para obligar al contenedor 
                    a generar una barra de scroll controlable por React */}
                <embed
                  src={urlFinal}
                  type="application/pdf"
                  className="w-full h-[200vh] border-none"
                />
              </div>

              {/* ================= ESCUDO INVISIBLE TOTAL Y ABSOLUTO ================= */}
              {/* Esta capa cubre el 100% del PDF. El cursor JAMÁS toca el archivo, por ende:
                  - El clic derecho saca el menú de nuestra app o no saca nada.
                  - Ctrl + S no se activa porque el foco se queda en React.
                  - Pasamos el evento 'onWheel' para que el scroll responda perfectamente.
              */}
              <div
                className="absolute inset-0 bg-transparent z-30 cursor-default"
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onWheel={manejarScrollFantasma}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />

              {/* Escudos extras para esquinas críticas */}
              <div className="absolute top-0 right-0 w-62.5 h-18.75 bg-transparent z-40" />
              <div className="absolute bottom-4 right-4 w-47.5 h-16.25 bg-transparent z-40" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
