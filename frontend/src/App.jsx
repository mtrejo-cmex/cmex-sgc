// src/App.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ApprovalPanel from './components/ApprovalPanel';
import DocumentTable from './components/DocumentTable';
import CatalogoMaestro from './components/CatalogoMaestro';
import VisorProtegido from './components/VisorProtegido';
import { ExploradorPoliticas } from './components/ExploradorPoliticas';

export const API_URL = '';
export const RUTA_BASE = '/api/sgc';

export default function App() {
  const [userRole, setUserRole] = useState('calidad');
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [documentos, setDocumentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [docIdParaVisor, setDocIdParaVisor] = useState(null);
  const [cargando, setCargando] = useState(true);

  // 1. Carga de Documentos (usando RUTA_BASE -> /api/sgc/documentos)
  const fetchDocumentos = useCallback(async () => {
    try {
      setCargando(true);
      const response = await fetch(`${RUTA_BASE}/documentos?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setDocumentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      setDocumentos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  // 2. Carga de Categorías / Tipos (usando RUTA_BASE -> /api/sgc/tipos)
  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch(`${RUTA_BASE}/tipos`);
      if (response.ok) {
        const data = await response.json();
        setCategorias(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  // 3. Carga de Tareas Pendientes (usando RUTA_BASE -> /api/sgc/documentos/pendientes)
  const fetchTareasPendientes = useCallback(async () => {
    try {
      const response = await fetch(`${RUTA_BASE}/documentos/pendientes`);
      if (response.ok) {
        const data = await response.json();
        setTareasPendientes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al cargar tareas pendientes:', error);
    }
  }, []);

  useEffect(() => {
    fetchDocumentos();
    fetchCategorias();
    fetchTareasPendientes();
  }, [fetchDocumentos, fetchCategorias, fetchTareasPendientes]);

  const handleAprobar = async (documentoId) => {
    try {
      const response = await fetch(
        `${RUTA_BASE}/documentos/${documentoId}/aprobar`,
        { method: 'PATCH' }
      );
      if (response.ok) {
        fetchDocumentos();
        fetchTareasPendientes();
      }
    } catch (error) {
      console.error('Error en aprobación:', error);
    }
  };

  const handleRechazar = async (documentoId) => {
    try {
      const response = await fetch(
        `${RUTA_BASE}/documentos/${documentoId}/rechazar`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        fetchDocumentos();
        fetchTareasPendientes();
      }
    } catch (error) {
      console.error('Error en rechazo:', error);
    }
  };

  const abrirArchivoSeguro = (documentoOId) => {
    if (!documentoOId) return;

    if (typeof documentoOId === 'object' && documentoOId.url_almacenamiento) {
      window.open(documentoOId.url_almacenamiento, '_blank');
      return;
    }

    let idFinal =
      typeof documentoOId === 'object'
        ? Number(documentoOId.id)
        : Number(documentoOId);
    const docEncontrado = documentos.find((d) => Number(d.id) === idFinal);

    if (docEncontrado && docEncontrado.url_almacenamiento) {
      window.open(docEncontrado.url_almacenamiento, '_blank');
    } else {
      console.error(
        'No se encontró la URL de almacenamiento para el documento con ID:',
        idFinal
      );
    }
  };

  const resultadosBusqueda = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const term = searchQuery.toLowerCase();
    return documentos.filter(
      (doc) =>
        (doc.nombre || '').toLowerCase().includes(term) ||
        (doc.codigo || '').toLowerCase().includes(term) ||
        (doc.Nombre_Area || '').toLowerCase().includes(term)
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

        <div className="flex-1 p-8 max-w-7xl w-full mx-auto">
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
                <div className="space-y-6">
                  <div className="border-b border-neutral-200 pb-4">
                    <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">
                      Portal de Información Corporativa
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                      Systems Management & QMS Compliance Platform
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                    <div className="xl:col-span-2">
                      {cargando ? (
                        <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-slate-400 text-xs">
                          Cargando catálogo maestro...
                        </div>
                      ) : (
                        <CatalogoMaestro
                          documentos={documentos}
                          categorias={categorias}
                          onOpenDocument={abrirArchivoSeguro}
                          onRefresh={fetchDocumentos}
                        />
                      )}
                    </div>

                    <div className="xl:col-span-1 space-y-6">
                      {userRole === 'calidad' && (
                        <ApprovalPanel
                          tareas={tareasPendientes}
                          onAprobar={handleAprobar}
                          onRechazar={handleRechazar}
                          apiUrl={API_URL}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeComponent === 'catalogo' && (
                <CatalogoMaestro
                  documentos={documentos}
                  categorias={categorias}
                  onOpenDocument={abrirArchivoSeguro}
                  onRefresh={fetchDocumentos}
                />
              )}

              {activeComponent === 'politicas' && <ExploradorPoliticas />}

              {activeComponent === 'ambiental' && (
                <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-xs">
                  <h2 className="text-lg font-bold text-neutral-900 uppercase tracking-tight">
                    Sistema de Gestión Ambiental
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Repositorio de normativas ecológicas y control de impacto
                    ambiental.
                  </p>
                </div>
              )}

              {activeComponent === 'certificados' && (
                <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-xs">
                  <h2 className="text-lg font-bold text-neutral-900 uppercase tracking-tight">
                    Certificados
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Documentación oficial de certificaciones corporativas
                    vigentes.
                  </p>
                </div>
              )}

              {activeComponent === 'manuales_s21' && (
                <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-xs">
                  <h2 className="text-lg font-bold text-neutral-900 uppercase tracking-tight">
                    Manuales S21
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Guías operativas y manuales técnicos del sistema S21.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
