// src/components/ExploradorPoliticas.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../utils/icons';

const obtenerDetallesArchivo = (nombreArchivo) => {
  const minuscula = nombreArchivo.toLowerCase();

  if (minuscula.endsWith('.pdf')) {
    return {
      tipo: 'PDF',
      colorBadge: 'bg-red-50 text-red-700 border-red-200',
      Icono: Icons.FileText,
      colorIcono: 'text-[#CC0000]',
      accionTexto: 'Ver Documento',
    };
  }
  if (minuscula.endsWith('.xlsx') || minuscula.endsWith('.xls')) {
    return {
      tipo: 'EXCEL',
      colorBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Icono: Icons.FileSpreadsheet,
      colorIcono: 'text-emerald-600',
      accionTexto: 'Descargar',
    };
  }
  if (minuscula.endsWith('.docx') || minuscula.endsWith('.doc')) {
    return {
      tipo: 'WORD',
      colorBadge: 'bg-blue-50 text-blue-700 border-blue-200',
      Icono: Icons.FileInput,
      colorIcono: 'text-blue-600',
      accionTexto: 'Descargar',
    };
  }

  return {
    tipo: 'IMG/ANEXO',
    colorBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    Icono: Icons.File,
    colorIcono: 'text-amber-600',
    accionTexto: 'Ver Archivo',
  };
};

export const ExploradorPoliticas = () => {
  const [politicas, setPoliticas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados de navegación jerárquica
  const [depSeleccionado, setDepSeleccionado] = useState(null);
  const [subSeleccionada, setSubSeleccionada] = useState(null);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);

  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const REGISTROS_POR_PAGINA = 10;

  useEffect(() => {
    fetch('/api/sgc/politicas')
      .then((res) => res.json())
      .then((data) => {
        setPoliticas(Array.isArray(data) ? data : []);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error al cargar politicas:', err);
        setCargando(false);
      });
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [
    depSeleccionado,
    subSeleccionada,
    seccionSeleccionada,
    busqueda,
    filtroTipo,
  ]);

  // Función para manejar el botón de retroceso inteligente
  const handleRegresar = () => {
    if (seccionSeleccionada) {
      setSeccionSeleccionada(null);
    } else if (subSeleccionada) {
      setSubSeleccionada(null);
    } else if (depSeleccionado) {
      setDepSeleccionado(null);
    }
  };

  // Árbol estructurado de 3 Niveles: Departamento -> Subdirección -> Sección -> Archivos
  const mapaEstructurado = useMemo(() => {
    const mapa = {};
    politicas.forEach((pol) => {
      const dep = pol.departamento;
      const sub = pol.subdireccion;
      const sec = pol.seccion;

      if (!mapa[dep]) mapa[dep] = {};
      if (!mapa[dep][sub]) mapa[dep][sub] = {};
      if (!mapa[dep][sub][sec]) mapa[dep][sub][sec] = [];

      mapa[dep][sub][sec].push(pol);
    });
    return mapa;
  }, [politicas]);

  // Documentos filtrados para la vista de tabla final
  const documentosVisibles = useMemo(() => {
    let lista = politicas;

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      return lista.filter(
        (p) =>
          p.titulo.toLowerCase().includes(term) ||
          p.departamento.toLowerCase().includes(term) ||
          p.subdireccion.toLowerCase().includes(term) ||
          p.seccion.toLowerCase().includes(term) ||
          p.nombre_archivo.toLowerCase().includes(term)
      );
    }

    if (depSeleccionado) {
      lista = lista.filter((p) => p.departamento === depSeleccionado);
    }

    if (subSeleccionada) {
      lista = lista.filter((p) => p.subdireccion === subSeleccionada);
    }

    if (seccionSeleccionada) {
      lista = lista.filter((p) => p.seccion === seccionSeleccionada);
    }

    if (filtroTipo !== 'TODOS') {
      lista = lista.filter((p) => {
        const ext = p.nombre_archivo.toLowerCase();
        if (filtroTipo === 'PDF') return ext.endsWith('.pdf');
        if (filtroTipo === 'EXCEL')
          return ext.endsWith('.xlsx') || ext.endsWith('.xls');
        if (filtroTipo === 'WORD')
          return ext.endsWith('.docx') || ext.endsWith('.doc');
        return true;
      });
    }

    return lista;
  }, [
    politicas,
    depSeleccionado,
    subSeleccionada,
    seccionSeleccionada,
    filtroTipo,
    busqueda,
  ]);

  // Paginación
  const totalPaginas =
    Math.ceil(documentosVisibles.length / REGISTROS_POR_PAGINA) || 1;
  const documentosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    return documentosVisibles.slice(inicio, inicio + REGISTROS_POR_PAGINA);
  }, [documentosVisibles, paginaActual]);

  if (cargando) {
    return (
      <div className="p-12 text-center text-xs text-neutral-400 font-medium bg-white rounded-xl border border-neutral-200">
        Escaneando infraestructura de políticas corporativas...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. CABECERA PRINCIPAL CON BUSCADOR Y BOTÓN DE REGRESO GLOBAL */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {(depSeleccionado || busqueda) && (
            <button
              onClick={handleRegresar}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all border border-neutral-200 shrink-0"
              title="Regresar al nivel anterior"
            >
              <span>←</span> Regresar
            </button>
          )}
          <div>
            <span className="text-[10px] font-mono font-black text-[#CC0000] uppercase tracking-widest block">
              Lineamientos e Instructivos Corporativos
            </span>
            <h1 className="text-base font-bold text-neutral-900 uppercase tracking-tight mt-0.5">
              Repositorio de Políticas Canon
            </h1>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por código, proceso o palabra clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-neutral-50 text-xs pl-8 pr-8 py-2 rounded-lg border border-neutral-200 focus:bg-white focus:outline-none focus:border-[#CC0000] transition-all"
          />
          <Icons.Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5" />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
            >
              <Icons.X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. MIGA DE PAN DE NAVEGACIÓN Y FILTROS POR FORMATO */}
      <div className="bg-neutral-50 px-4 py-2.5 rounded-lg border border-neutral-200 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap font-mono uppercase text-[11px]">
          <button
            onClick={() => {
              setDepSeleccionado(null);
              setSubSeleccionada(null);
              setSeccionSeleccionada(null);
              setBusqueda('');
            }}
            className={`font-bold transition-colors ${
              !depSeleccionado && !busqueda
                ? 'text-[#CC0000]'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Departamentos
          </button>

          {depSeleccionado && !busqueda && (
            <>
              <span className="text-neutral-300">/</span>
              <button
                onClick={() => {
                  setSubSeleccionada(null);
                  setSeccionSeleccionada(null);
                }}
                className={`font-bold transition-colors ${
                  !subSeleccionada
                    ? 'text-[#CC0000]'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {depSeleccionado}
              </button>
            </>
          )}

          {subSeleccionada && !busqueda && (
            <>
              <span className="text-neutral-300">/</span>
              <button
                onClick={() => setSeccionSeleccionada(null)}
                className={`font-bold transition-colors ${
                  !seccionSeleccionada
                    ? 'text-[#CC0000]'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {subSeleccionada}
              </button>
            </>
          )}

          {seccionSeleccionada && !busqueda && (
            <>
              <span className="text-neutral-300">/</span>
              <span className="text-[#CC0000] font-bold">
                {seccionSeleccionada}
              </span>
            </>
          )}

          {busqueda && (
            <>
              <span className="text-neutral-300">/</span>
              <span className="text-amber-700 font-bold">
                Búsqueda global: "{busqueda}"
              </span>
            </>
          )}
        </div>

        {/* Filtro Rápido por Formato */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-neutral-200 text-[10px] font-bold">
          {['TODOS', 'PDF', 'EXCEL', 'WORD'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-2.5 py-1 rounded transition-all ${
                filtroTipo === tipo
                  ? 'bg-[#CC0000] text-white'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* 3. NIVEL 1: TARJETAS DE DEPARTAMENTOS */}
      {!depSeleccionado && !busqueda && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(mapaEstructurado).map(([dep, subdirecciones]) => {
            const totalSub = Object.keys(subdirecciones).length;
            let totalDocs = 0;
            Object.values(subdirecciones).forEach((sec) => {
              Object.values(sec).forEach((docs) => (totalDocs += docs.length));
            });

            return (
              <button
                key={dep}
                onClick={() => setDepSeleccionado(dep)}
                className="bg-white p-4 rounded-xl border border-neutral-200 hover:border-[#CC0000] hover:shadow-sm transition-all text-left flex flex-col justify-between h-32 group"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Icons.Home className="w-5 h-5 text-[#CC0000] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded border border-neutral-200">
                      {totalSub} áreas
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-tight line-clamp-2">
                    {dep}
                  </h3>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-[10px] text-neutral-400">
                  <span>{totalDocs} archivos</span>
                  <span className="text-[#CC0000] font-bold group-hover:translate-x-1 transition-transform">
                    Explorar →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. NIVEL 2: SUBDIRECCIONES */}
      {depSeleccionado && !subSeleccionada && !busqueda && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Áreas Operativas de{' '}
              <span className="text-[#CC0000]">{depSeleccionado}</span>
            </h2>
            <button
              onClick={() => setDepSeleccionado(null)}
              className="text-[11px] text-neutral-500 hover:text-neutral-800 font-bold bg-white px-3 py-1.5 rounded-lg border border-neutral-200 shadow-2xs transition-colors"
            >
              ← Volver a Departamentos
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(mapaEstructurado[depSeleccionado] || {}).map(
              ([subnombre, secciones]) => {
                const totalSecciones = Object.keys(secciones).length;
                let totalArchivos = 0;
                Object.values(secciones).forEach(
                  (arr) => (totalArchivos += arr.length)
                );

                return (
                  <button
                    key={subnombre}
                    onClick={() => setSubSeleccionada(subnombre)}
                    className="bg-white p-4 rounded-lg border border-neutral-200 hover:border-[#CC0000] transition-all text-left flex items-center justify-between shadow-2xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <Icons.FileText className="w-4 h-4 text-neutral-400 group-hover:text-[#CC0000] shrink-0" />
                      <div>
                        <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-tight truncate">
                          {subnombre}
                        </h3>
                        <p className="text-[10px] text-neutral-400">
                          {totalSecciones}{' '}
                          {totalSecciones === 1 ? 'proceso' : 'procesos'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-1 rounded border border-neutral-200 shrink-0">
                      {totalArchivos} docs
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* 5. NIVEL 3: SECCIONES / PROCESOS */}
      {depSeleccionado &&
        subSeleccionada &&
        !seccionSeleccionada &&
        !busqueda && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Procesos de{' '}
                <span className="text-[#CC0000]">{subSeleccionada}</span>
              </h2>
              <button
                onClick={() => setSubSeleccionada(null)}
                className="text-[11px] text-neutral-500 hover:text-neutral-800 font-bold bg-white px-3 py-1.5 rounded-lg border border-neutral-200 shadow-2xs transition-colors"
              >
                ← Volver a Áreas
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(
                mapaEstructurado[depSeleccionado]?.[subSeleccionada] || {}
              ).map(([secNombre, docs]) => (
                <button
                  key={secNombre}
                  onClick={() => setSeccionSeleccionada(secNombre)}
                  className="bg-white p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-400 transition-all text-left flex items-center justify-between shadow-2xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Icons.File className="w-4 h-4 text-neutral-400 group-hover:text-[#CC0000] shrink-0" />
                    <span className="text-xs font-bold text-neutral-700 uppercase tracking-tight truncate">
                      {secNombre}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200 shrink-0">
                    {docs.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      {/* 6. VISTA DETALLE FINAL: TABLA DE DOCUMENTOS PAGINADA */}
      {(seccionSeleccionada || busqueda) && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs space-y-0">
          <div className="px-4 py-3 bg-neutral-50/80 border-b border-neutral-200 flex justify-between items-center text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSeccionSeleccionada(null)}
                className="text-[11px] text-neutral-600 hover:text-[#CC0000] font-bold transition-colors"
              >
                ← Volver a Procesos
              </button>
              <span className="text-neutral-300">|</span>
              <span className="font-bold text-neutral-700 uppercase">
                {busqueda
                  ? 'Resultados de Búsqueda Global'
                  : `${subSeleccionada} / ${seccionSeleccionada}`}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">
              Mostrando {documentosPaginados.length} de{' '}
              {documentosVisibles.length} archivos
            </span>
          </div>

          {documentosVisibles.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 italic">
              No se localizaron políticas con los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-400 uppercase text-[9px] tracking-wider border-b border-neutral-200">
                    <th className="w-[50%] px-4 py-2.5 font-bold">
                      Documento / Política
                    </th>
                    <th className="w-[25%] px-2 py-2.5 font-bold">
                      Ubicación / Proceso
                    </th>
                    <th className="w-[10%] px-2 py-2.5 font-bold text-center">
                      Formato
                    </th>
                    <th className="w-[15%] px-4 py-2.5 font-bold text-right">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {documentosPaginados.map((doc) => {
                    const detalles = obtenerDetallesArchivo(doc.nombre_archivo);
                    const ComponenteIcono = detalles.Icono;

                    return (
                      <tr
                        key={doc.id}
                        className="hover:bg-neutral-50/70 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-xs font-medium text-neutral-800">
                          <div className="flex items-center gap-2.5">
                            <ComponenteIcono
                              className={`w-4 h-4 shrink-0 ${detalles.colorIcono}`}
                            />
                            <span
                              className="truncate"
                              title={doc.nombre_archivo}
                            >
                              {doc.titulo}
                            </span>
                          </div>
                        </td>

                        <td className="px-2 py-2.5 text-[10px] font-mono text-neutral-500 uppercase truncate">
                          {doc.subdireccion} / {doc.seccion}
                        </td>

                        <td className="px-2 py-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[9px] border ${detalles.colorBadge}`}
                          >
                            {detalles.tipo}
                          </span>
                        </td>

                        <td className="px-4 py-2.5 text-xs text-right whitespace-nowrap">
                          <a
                            href={`/api/sgc/politicas/visualizar?path=${encodeURIComponent(doc.url_almacenamiento)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-700 hover:text-[#CC0000] hover:underline font-bold uppercase tracking-wider text-[11px] transition-colors"
                          >
                            {detalles.accionTexto}
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginador */}
          {totalPaginas > 1 && (
            <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center text-xs">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 bg-white border border-neutral-200 rounded font-bold text-neutral-600 disabled:opacity-40 hover:bg-neutral-100 transition-colors"
              >
                ← Anterior
              </button>

              <span className="text-neutral-500 text-[11px] font-mono">
                Página <strong>{paginaActual}</strong> de{' '}
                <strong>{totalPaginas}</strong>
              </span>

              <button
                disabled={paginaActual === totalPaginas}
                onClick={() =>
                  setPaginaActual((p) => Math.min(p + 1, totalPaginas))
                }
                className="px-3 py-1 bg-white border border-neutral-200 rounded font-bold text-neutral-600 disabled:opacity-40 hover:bg-neutral-100 transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
