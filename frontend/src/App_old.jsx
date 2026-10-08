import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ApprovalPanel from './components/ApprovalPanel';
import CategorySection from './components/CategorySection';
import NewsWidget from './components/NewsWidget';
import ModalNews from './components/ModalNews';
import PaginaComite from './components/PaginaComite';
import DocumentTable from './components/DocumentTable';
import CatalogoMaestro from './components/CatalogoMaestro';
import Configuracion from './components/Configuracion';
import VisorProtegido from './components/VisorProtegido';
import { DocumentosPorArea } from './components/DocumentosPorArea';

const RUTA_BASE =
  '/home/j02076/proyectos/web-development/gestion_calidad/frontend/data/sgc/master';
const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://b458-201-149-27-187.ngrok-free.app';

export default function App() {
  const [userRole, setUserRole] = useState('calidad');
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [documentos, setDocumentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [docIdParaVisor, setDocIdParaVisor] = useState(null);

  // Estados para la estructura relacional por Áreas y Divisiones (3FN)
  const [estructurasPorArea, setEstructurasPorArea] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);

  // Estado para rastrear qué acordeones de división están abiertos
  const [divisionesAbiertas, setDivisionesAbiertas] = useState({});

  const [novedades] = useState([
    {
      tipo: 'documento',
      titulo: 'Pro-056 Gestión de Riesgos',
      subtitulo: 'Conócelo y crea tu matriz de gestión',
      ruta: `${RUTA_BASE}/02_PROCESOS/Procesos y Registros/PRO-056 PROCESO GESTION DE RIESGOS/PRO-056 PROCESO GESTION DE RIESGOS.pdf`,
    },
    {
      tipo: 'documento',
      titulo: 'Pro-053 Gestión de cambios',
      subtitulo: 'Nuevas herramientas disponibles, conócelas',
      ruta: `${RUTA_BASE}/02_PROCESOS/Procesos y Registros/PRO-053 PROCESO GESTIÓN DE CAMBIOS QMS/PRO-053 PROCESO GESTIÓN DE CAMBIOS QMS.pdf`,
    },
    {
      tipo: 'info',
      titulo: 'Auditoria de Recertificación',
      subtitulo: 'Semana del 04 al 08 de Diciembre',
      contenidoExtendido:
        'La auditoria externa se llevará a cabo de forma presencial. Es vital tener la documentación al día.',
    },
  ]);

  const toggleDivision = (divNombre) => {
    setDivisionesAbiertas((prev) => ({
      ...prev,
      [divNombre]: !prev[divNombre],
    }));
  };

  // --- Funciones de Carga de Datos ---
  const fetchDocumentos = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/documentos?t=${Date.now()}`);
      const data = await response.json();
      setDocumentos(data);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    }
  }, []);

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/tipos`);
      const data = await response.json();
      setCategorias(data.filter((c) => c.codigo && c.nombre !== 'sgc.txt'));
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  const fetchTareasPendientes = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/documentos/pendientes`);
      if (response.ok) {
        const data = await response.json();
        setTareasPendientes(
          data.map((doc) => ({
            id: doc.id,
            codigo: doc.codigo,
            nombre: doc.nombre,
            accion: doc.accion,
            fecha: doc.fecha,
            solicitante: doc.solicitante,
            color: doc.color,
          }))
        );
      }
    } catch (error) {
      console.error('Error al cargar tareas pendientes:', error);
    }
  }, []);

  const fetchDocumentosPorAreas = useCallback(async () => {
    setLoadingAreas(true);
    try {
      const response = await fetch(
        `${API_URL}/api/sgc/areas/documentos-estructurados`
      );
      if (response.ok) {
        const data = await response.json();
        setEstructurasPorArea(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al cargar la matriz relacional por áreas:', error);
    } finally {
      setLoadingAreas(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentos();
    fetchCategorias();
    fetchTareasPendientes();
    fetchDocumentosPorAreas();
  }, [
    fetchDocumentos,
    fetchCategorias,
    fetchTareasPendientes,
    fetchDocumentosPorAreas,
  ]);

  const handleAprobar = async (documentoId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/documentos/${documentoId}/aprobar`,
        { method: 'PATCH' }
      );
      if (response.ok) {
        fetchDocumentos();
        fetchTareasPendientes();
        fetchDocumentosPorAreas();
      }
    } catch (error) {
      console.error('Error en aprobación:', error);
    }
  };

  const handleRechazar = async (documentoId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/documentos/${documentoId}/rechazar`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        fetchDocumentos();
        fetchTareasPendientes();
        fetchDocumentosPorAreas();
      }
    } catch (error) {
      console.error('Error en rechazo:', error);
    }
  };

  const abrirArchivoSeguro = (documentoOId) => {
    if (!documentoOId) return;
    let idFinal =
      typeof documentoOId === 'object'
        ? Number(documentoOId.id)
        : Number(documentoOId);

    if (userRole === 'calidad') {
      const urlDescarga = `${API_URL}/api/sgc/documentos/${idFinal}/visualizar?rol=${userRole}`;
      window.open(urlDescarga, '_blank');
    } else {
      setDocIdParaVisor(idFinal);
    }
  };

  const resultadosBusqueda = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const term = searchQuery.toLowerCase();
    return documentos.filter(
      (doc) =>
        (doc.nombre || '').toLowerCase().includes(term) ||
        (doc.codigo || '').toLowerCase().includes(term)
    );
  }, [documentos, searchQuery]);

  return (
    <div className="min-h-screen bg-neutral-100 flex font-sans subpixel-antialiased">
      <VisorProtegido
        isOpen={docIdParaVisor !== null}
        onClose={() => setDocIdParaVisor(null)}
        documentoId={docIdParaVisor}
        userRole={userRole}
        apiUrl={API_URL}
      />

      <ModalNews
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newsItem={selectedNews}
      />

      <Sidebar
        userRole={userRole}
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <Topbar
          userRole={userRole}
          setUserRole={setUserRole}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex-1 p-8 max-w-400 w-full mx-auto">
          {searchQuery.trim().length > 0 ? (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-neutral-900 mb-6 border-l-4 border-[#CC0000] pl-3">
                Resultados para "{searchQuery}"
              </h2>
              <div className="bg-white rounded-lg border border-neutral-200 shadow-xs p-2">
                <DocumentTable
                  documentos={resultadosBusqueda}
                  searchQuery={searchQuery}
                  onOpenDocument={abrirArchivoSeguro}
                />
              </div>
            </div>
          ) : (
            <>
              {activeComponent === 'dashboard' && (
                <>
                  <div className="mb-6 border-b border-neutral-200 pb-4">
                    <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">
                      Portal de Información Corporativa
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                      Systems Management & QMS Compliance Platform
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                    {/* PANEL IZQUIERDO */}
                    <div className="xl:col-span-2 space-y-6">
                      <NewsWidget
                        novedades={novedades}
                        onOpenModal={(item) => {
                          setSelectedNews(item);
                          setIsModalOpen(true);
                        }}
                        onOpenDocument={abrirArchivoSeguro}
                      />

                      {/* CONTENEDOR DE ACORDEONES CON ESTILOS INSTITUCIONALES */}
                      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
                        <div className="mb-6">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#CC0000] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            Repositorio de Documentos por Área Organizacional
                          </span>
                          <h2 className="text-lg font-black text-neutral-900 mt-1.5 uppercase tracking-tight">
                            Estructura Operativa por Departamentos
                          </h2>
                        </div>

                        {loadingAreas ? (
                          <div className="py-12 text-center text-sm text-neutral-400 italic">
                            Consultando infraestructura de datos...
                          </div>
                        ) : estructurasPorArea.length === 0 ? (
                          <div className="py-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                            No se localizaron registros organizacionales.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {[
                              ...new Set(
                                estructurasPorArea.map((a) => a.division)
                              ),
                            ]
                              .sort()
                              .map((divNombre) => {
                                const areasDeEstaDivision =
                                  estructurasPorArea.filter(
                                    (a) => a.division === divNombre
                                  );
                                const estaAbierto =
                                  !!divisionesAbiertas[divNombre];

                                return (
                                  <div
                                    key={divNombre}
                                    className="border border-neutral-200 rounded-lg overflow-hidden bg-white transition-all duration-150 shadow-2xs"
                                  >
                                    {/* Encabezado del Acordeón */}
                                    <button
                                      onClick={() => toggleDivision(divNombre)}
                                      className="w-full flex items-center justify-between px-5 py-3.5 bg-neutral-50 hover:bg-neutral-100/70 transition-colors text-left focus:outline-none border-l-4 border-neutral-400"
                                      style={
                                        estaAbierto
                                          ? { borderColor: '#CC0000' }
                                          : {}
                                      }
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs font-black tracking-wider text-neutral-900 uppercase">
                                          {divNombre === 'GENERAL'
                                            ? 'PROCESOS GLOBALES'
                                            : `DIVISIÓN ${divNombre}`}
                                        </span>
                                        <span className="text-[11px] font-bold text-neutral-400 bg-white border px-2 py-0.5 rounded">
                                          {areasDeEstaDivision.length}{' '}
                                          {areasDeEstaDivision.length === 1
                                            ? 'Área'
                                            : 'Áreas'}
                                        </span>
                                      </div>
                                      <span className="text-neutral-500 font-mono text-xs font-bold">
                                        {estaAbierto ? '▼' : '►'}
                                      </span>
                                    </button>

                                    {/* Celdas Desplegables Internas */}
                                    {estaAbierto && (
                                      <div className="p-4 bg-white border-t border-neutral-100 animate-in fade-in slide-in-from-top-1 duration-150">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {areasDeEstaDivision.map(
                                            (area, idx) => {
                                              const areaKey =
                                                area.id_area ||
                                                area.id ||
                                                `area-${idx}`;
                                              const areaNombre =
                                                area.nombre_area ||
                                                area.nombre ||
                                                'Área sin nombre';
                                              const areaCodigo =
                                                area.codigo_area ||
                                                area.codigo ||
                                                'S/C';
                                              const docsCount =
                                                area.documentos?.length || 0;
                                              const esSeleccionada =
                                                areaSeleccionada?.id_area ===
                                                  area.id_area &&
                                                area.id_area !== undefined;

                                              return (
                                                <button
                                                  key={areaKey}
                                                  onClick={() =>
                                                    setAreaSeleccionada(area)
                                                  }
                                                  className={`p-4 text-left rounded-md border transition-all flex flex-col justify-between h-24 ${
                                                    esSeleccionada
                                                      ? 'border-[#CC0000] bg-red-50/20 shadow-xs ring-1 ring-[#CC0000]/10'
                                                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                                                  }`}
                                                >
                                                  <div className="min-w-0 w-full">
                                                    <div className="flex justify-between items-center">
                                                      <span
                                                        className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border ${
                                                          esSeleccionada
                                                            ? 'bg-[#CC0000] text-white border-[#CC0000]'
                                                            : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                                                        }`}
                                                      >
                                                        {areaCodigo}
                                                      </span>
                                                    </div>
                                                    <h3 className="text-xs font-bold text-neutral-800 mt-2 line-clamp-1 uppercase tracking-tight">
                                                      {areaNombre}
                                                    </h3>
                                                    {/* NUEVO: Muestra el responsable en texto secundario muy sutil dentro de la tarjeta */}
                                                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                                                      Resp:{' '}
                                                      {area.responsable ||
                                                        'Por Asignar'}
                                                    </p>
                                                  </div>
                                                  <span className="text-[10px] font-medium text-neutral-400">
                                                    {docsCount}{' '}
                                                    {docsCount === 1
                                                      ? 'documento vigente'
                                                      : 'documentos vigentes'}
                                                  </span>
                                                </button>
                                              );
                                            }
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLUMNA DERECHA */}
                    <div className="xl:col-span-1 flex flex-col space-y-6">
                      {userRole === 'calidad' && (
                        <ApprovalPanel
                          tareas={tareasPendientes}
                          onAprobar={handleAprobar}
                          onRechazar={handleRechazar}
                          apiUrl={API_URL}
                        />
                      )}

                      {/* EXPLORADOR DE ARCHIVOS PRESENTACIONAL */}
                      <div className="bg-white p-5 rounded-xl shadow-xs border border-neutral-200 sticky top-4">
                        <div className="flex justify-between items-center border-b border-neutral-200 pb-3 mb-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                            Explorador De Archivos
                          </h4>
                          {areaSeleccionada && (
                            <button
                              onClick={() => setAreaSeleccionada(null)}
                              className="text-neutral-400 hover:text-[#CC0000] text-2xs font-bold uppercase tracking-wider transition-colors"
                            >
                              [Limpiar]
                            </button>
                          )}
                        </div>

                        {areaSeleccionada ? (
                          <>
                            <div className="bg-neutral-50 p-3 rounded border border-neutral-200 mb-4 border-l-4 border-l-[#CC0000]">
                              <span className="text-[9px] font-mono font-black text-[#CC0000] uppercase tracking-wider">
                                DEPARTAMENTO:{' '}
                                {areaSeleccionada.codigo_area || 'S/C'}
                              </span>
                              <h3 className="text-xs font-black text-neutral-900 mt-0.5 uppercase tracking-wide">
                                {areaSeleccionada.nombre_area || 'Sin nombre'}
                              </h3>
                            </div>

                            <DocumentosPorArea
                              estructuraSgc={[areaSeleccionada]}
                            />
                          </>
                        ) : (
                          <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                            Seleccione un departamento del panel izquierdo para
                            desplegar sus archivos vigentes.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeComponent === 'comite' && <PaginaComite />}

              {activeComponent === 'catalogo' && (
                <CatalogoMaestro
                  documentos={documentos}
                  categorias={categorias}
                  onOpenDocument={abrirArchivoSeguro}
                  onRefresh={fetchDocumentos}
                />
              )}
              {activeComponent === 'configuracion' && <Configuracion />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
