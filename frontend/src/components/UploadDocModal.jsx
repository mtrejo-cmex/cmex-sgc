import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

export default function UploadDocModal({
  isOpen,
  onClose,
  idProcesoReal,
  nombreCarpeta,
  onUploadSuccess,
  apiUrl,
}) {
  const [file, setFile] = useState(null);
  const [areaId, setAreaId] = useState('');
  const [tipoId, setTipoId] = useState('');
  // Se mantiene internamente como PENDIENTE de forma transparente para el usuario
  const [estado] = useState('PENDIENTE');
  const [subiendo, setSubiendo] = useState(false);

  // Catálogos
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [cargandoTipos, setCargandoTipos] = useState(false);

  // Las 6 áreas fijas validadas en tu Cat_Areas_SGC
  const areasSGC = [
    { id: 1, nombre: 'Gestión de Cambios' },
    { id: 2, nombre: 'Gestión de Riesgos' },
    { id: 3, nombre: 'Normativo' },
    { id: 4, nombre: 'Operativo' },
    { id: 5, nombre: 'Formatos' },
    { id: 6, nombre: 'Evidencia' },
  ];

  // Cargar dinámicamente los Tipos de Documento desde tu base de datos
  useEffect(() => {
    if (isOpen) {
      const cargarTiposCat = async () => {
        setCargandoTipos(true);
        try {
          const response = await fetch(`${apiUrl}/api/tipos`);
          if (response.ok) {
            const data = await response.json();
            setTiposDocumento(data.filter((t) => t.activo !== false));
          }
        } catch (error) {
          console.error('Error al cargar catálogo de tipos:', error);
        } finally {
          setCargandoTipos(false);
        }
      };
      cargarTiposCat();
    }
  }, [isOpen, apiUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !areaId || !tipoId || !estado) {
      alert(
        'Por favor, completa todos los campos obligatorios del formulario.'
      );
      return;
    }

    setSubiendo(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id_proceso_or_doc', idProcesoReal);
    formData.append('id_area', areaId);
    formData.append('tipo_id', tipoId);
    formData.append('estado', estado);

    try {
      const response = await fetch(`${apiUrl}/api/sgc/documentos/cargar`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert(
          '¡Propuesta de documento registrada y almacenada en zona temporal con éxito!'
        );
        setFile(null);
        setAreaId('');
        setTipoId('');
        if (onUploadSuccess) onUploadSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error en el servidor: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Error en la petición de subida:', error);
      alert('Error de conexión con el servidor.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden transition-all">
        {/* Cabecera */}
        <div className="flex items-center justify-between bg-slate-50 px-5 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Cargar Nuevo Documento
            </h3>
            <p className="text-[11px] text-slate-500 truncate max-w-[320px]">
              Carpeta Destino: {nombreCarpeta}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 1. Selección de Área SGC */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              1. Área SGC
            </label>
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 font-medium text-slate-700 focus:outline-none focus:border-canon-red transition-colors"
              required
            >
              <option value="">-- Selecciona Area --</option>
              {areasSGC.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Selección de Tipo de Documento */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              2. Tipo de Documento (Catálogo)
            </label>
            {cargandoTipos ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-canon-red" />{' '}
                Cargando tipos de base de datos...
              </div>
            ) : (
              <select
                value={tipoId}
                onChange={(e) => setTipoId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 font-medium text-slate-700 focus:outline-none focus:border-canon-red transition-colors"
                required
              >
                <option value="">-- Selecciona el Tipo de Archivo --</option>
                {tiposDocumento.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    [{tipo.codigo}] - {tipo.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 3. Selector de Archivo Físico */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              3. Archivo:
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-canon-red rounded-lg p-5 text-center cursor-pointer transition-colors bg-slate-50/50 relative">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required
              />
              <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
              <span className="block text-xs font-semibold text-slate-700 truncate max-w-full px-2">
                {file ? file.name : 'Arrastra tu archivo aquí o explora'}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                PDF, DOCX, XLSX o PPTX
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={subiendo}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-canon-red rounded-lg shadow-sm transition-all duration-300 disabled:opacity-50 transform hover:scale-102"
            >
              {subiendo && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {subiendo ? 'Procesando...' : 'Comenzar Carga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
