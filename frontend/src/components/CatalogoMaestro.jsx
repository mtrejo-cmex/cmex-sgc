// src/components/CatalogoMaestro.jsx
import React, { useState, useMemo } from 'react';
import DocumentTable from './DocumentTable';

const MACROPROCESOS_DEF = [
  {
    codigo: 'CO',
    nombre: 'Corporativo',
    descripcion:
      'Lineamientos, políticas y procedimientos de ámbito general corporativo',
    colorBorder: 'border-l-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    areasConocidas: [
      { codigo: 'SG', nombre: 'Gestión del Sistema de Gestión de Calidad' },
      { codigo: 'DE', nombre: 'Dirección Estratégica' },
      { codigo: 'RH', nombre: 'Gestión del Capital Humano' },
      { codigo: 'TI', nombre: 'Tecnologías de la Información' },
      { codigo: 'FIN', nombre: 'Finanzas y Administración' },
    ],
  },
  {
    codigo: 'BB',
    nombre: 'Business to Business',
    descripcion:
      'Procesos operativos y comerciales orientados a soluciones empresariales',
    colorBorder: 'border-l-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    areasConocidas: [
      { codigo: 'COM', nombre: 'Comercial B2B' },
      { codigo: 'OPS', nombre: 'Operaciones y Logística B2B' },
      { codigo: 'SOP', nombre: 'Soporte Técnico Especializado' },
    ],
  },
  {
    codigo: 'MC',
    nombre: 'Mercado de Consumo',
    descripcion:
      'Procesos de atención, distribución y ventas para el mercado masivo',
    colorBorder: 'border-l-purple-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    areasConocidas: [
      { codigo: 'VTA', nombre: 'Ventas Retail y Canal Masivo' },
      { codigo: 'MKT', nombre: 'Marketing y Publicidad' },
      { codigo: 'SAC', nombre: 'Servicio de Atención al Consumidor' },
    ],
  },
];

export default function CatalogoMaestro({
  documentos = [],
  categorias = [],
  onOpenDocument,
}) {
  const [filtroProceso, setFiltroProceso] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  // Estado para colapsar Macroprocesos (Nivel 1)
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    CO: true,
    BB: true,
    MC: true,
  });

  // Estado para colapsar Subcategorías/Áreas de forma independiente (Nivel 2)
  // Clave compuesta: "MACRO-AREA" (ej: "CO-SG")
  const [areasAbiertas, setAreasAbiertas] = useState({});

  const toggleSeccion = (codigo) => {
    setSeccionesAbiertas((prev) => ({
      ...prev,
      [codigo]: !prev[codigo],
    }));
  };

  const toggleArea = (macroCodigo, areaCodigo) => {
    const key = `${macroCodigo}-${areaCodigo}`;
    setAreasAbiertas((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key], // Por defecto abierto (true), al hacer clic conmuta
    }));
  };

  // 1. Filtrado general por tipo y macroproceso
  const documentosFiltrados = useMemo(() => {
    return documentos.filter((doc) => {
      const codigoProc = doc.Codigo_Proceso || 'CO';
      const cumpleProceso =
        filtroProceso === 'TODOS' || codigoProc === filtroProceso;

      const tipoDoc = doc.tipo_documento || doc.tipo_nombre || '';
      const cumpleTipo =
        filtroTipo === 'TODOS' ||
        tipoDoc === tipoDoc ||
        String(doc.tipo_id) === String(filtroTipo);

      return cumpleProceso && cumpleTipo;
    });
  }, [documentos, filtroProceso, filtroTipo]);

  return (
    <div className="space-y-6">
      {/* CABECERA CON FILTROS */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#CC0000] bg-red-50 px-2 py-0.5 rounded border border-red-100">
            Estructura SGC CMEX 2026
          </span>
          <h2 className="text-lg font-black text-neutral-900 mt-1 uppercase tracking-tight">
            Catálogo Maestro Completo por Áreas
          </h2>
        </div>

        {/* SELECTORES DE FILTRADO */}
        <div className="flex items-center gap-3">
          <select
            value={filtroProceso}
            onChange={(e) => setFiltroProceso(e.target.value)}
            className="text-xs font-semibold bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-700 outline-none focus:border-[#CC0000] transition-colors cursor-pointer"
          >
            <option value="TODOS">Todos los Macroprocesos</option>
            <option value="CO">[CO] Corporativo</option>
            <option value="BB">[BB] Business to Business</option>
            <option value="MC">[MC] Mercado de Consumo</option>
          </select>

          {categorias.length > 0 && (
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="text-xs font-semibold bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-700 outline-none focus:border-[#CC0000] transition-colors cursor-pointer"
            >
              <option value="TODOS">Todos los Tipos</option>
              {categorias.map((cat) => (
                <option key={cat.id || cat.codigo} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* RENDERIZADO DE MACROPROCESOS */}
      {MACROPROCESOS_DEF.map((macro) => {
        if (filtroProceso !== 'TODOS' && filtroProceso !== macro.codigo) {
          return null;
        }

        const estaAbierto = seccionesAbiertas[macro.codigo];

        // Mapear áreas conocidas e insertar sus documentos
        const areasConDocumentos = macro.areasConocidas.map((areaDef) => {
          const docsDelArea = documentosFiltrados.filter(
            (doc) =>
              (doc.Codigo_Proceso || '').toUpperCase() === macro.codigo &&
              (doc.Codigo_Area || '').toUpperCase() === areaDef.codigo
          );
          return {
            ...areaDef,
            documentos: docsDelArea,
          };
        });

        // Áreas dinámicas adicionales que vengan de BD
        const codigosConocidos = new Set(
          macro.areasConocidas.map((a) => a.codigo)
        );
        const areasDinamicas = documentosFiltrados
          .filter(
            (doc) =>
              (doc.Codigo_Proceso || '').toUpperCase() === macro.codigo &&
              doc.Codigo_Area &&
              !codigosConocidos.has(doc.Codigo_Area.toUpperCase())
          )
          .reduce((acc, doc) => {
            const codigo = doc.Codigo_Area;
            if (!acc[codigo]) {
              acc[codigo] = {
                codigo,
                nombre: doc.Nombre_Area || 'Área Operativa',
                documentos: [],
              };
            }
            acc[codigo].documentos.push(doc);
            return acc;
          }, {});

        const todasLasAreas = [
          ...areasConDocumentos,
          ...Object.values(areasDinamicas),
        ];
        const totalDocsMacro = todasLasAreas.reduce(
          (acc, a) => acc + a.documentos.length,
          0
        );

        return (
          <div
            key={macro.codigo}
            className={`bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden border-l-4 ${macro.colorBorder}`}
          >
            {/* CABECERA DEL MACROPROCESO */}
            <div
              onClick={() => toggleSeccion(macro.codigo)}
              className="p-4 bg-neutral-50/80 hover:bg-neutral-100/70 cursor-pointer flex items-center justify-between border-b border-neutral-200 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-black font-mono px-2.5 py-1 rounded-md border ${macro.badgeBg}`}
                >
                  {macro.codigo}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">
                    {macro.nombre}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {macro.descripcion}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold font-mono text-neutral-600 bg-white px-2.5 py-1 rounded-full border border-neutral-200">
                  {totalDocsMacro}{' '}
                  {totalDocsMacro === 1 ? 'documento' : 'documentos'}
                </span>
                <span className="text-neutral-400 text-xs font-bold">
                  {estaAbierto ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* CONTENIDO DE LAS SUBCATEGORÍAS / ÁREAS */}
            {estaAbierto && (
              <div className="p-4 space-y-4 bg-white">
                {todasLasAreas.map((area) => {
                  const areaKey = `${macro.codigo}-${area.codigo}`;
                  // Por defecto está abierto a menos que se haya marcado explícitamente como false
                  const areaAbierta = areasAbiertas[areaKey] !== false;

                  return (
                    <div
                      key={area.codigo}
                      className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50/30"
                    >
                      {/* Cabecera de la Subcategoría / Área (Clickeable para colapsar) */}
                      <div
                        onClick={() => toggleArea(macro.codigo, area.codigo)}
                        className="px-4 py-2.5 bg-neutral-100/80 hover:bg-neutral-200/60 cursor-pointer border-b border-neutral-200 flex items-center justify-between transition-colors select-none"
                      >
                        <span className="text-xs font-bold font-mono text-neutral-800 uppercase flex items-center gap-2">
                          <span>📁</span> {area.codigo} - {area.nombre}
                        </span>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                              area.documentos.length > 0
                                ? 'bg-white text-neutral-700 border-neutral-200'
                                : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                            }`}
                          >
                            {area.documentos.length}{' '}
                            {area.documentos.length === 1
                              ? 'archivo'
                              : 'archivos'}
                          </span>
                          <span className="text-neutral-400 text-[10px] font-bold">
                            {areaAbierta ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>

                      {/* Contenido colapsable del área */}
                      {areaAbierta && (
                        <div>
                          {area.documentos.length === 0 ? (
                            <div className="p-4 text-center text-xs text-neutral-400 italic bg-white">
                              Sin documentos registrados en esta área.
                            </div>
                          ) : (
                            <div className="p-1 bg-white">
                              <DocumentTable
                                documentos={area.documentos}
                                searchQuery=""
                                onOpenDocument={onOpenDocument}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
