// src/components/Sidebar.jsx
import React from 'react';
import { Icons } from '../utils/icons';

export default function Sidebar({
  userRole,
  activeComponent,
  setActiveComponent,
}) {
  // Función para determinar si el botón está activo
  const isActive = (component) => activeComponent === component;

  // Clases base para botones del menú (Tema Claro)
  const getButtonClass = (component) => `
    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-xs
    ${
      isActive(component)
        ? 'bg-canon-red text-white shadow-lg shadow-canon-red/20 font-bold'
        : 'text-slate-600 hover:bg-slate-100'
    }
  `;

  return (
    <aside className="w-72 bg-white border-r border-slate-200 text-slate-600 flex flex-col shadow-sm shrink-0">
      <div className="p-6 border-b border-slate-100">
        <img
          src="/canon_logo.jpg"
          alt="Canon"
          className="w-full mb-3 rounded-sm object-contain"
        />
        <h1 className="text-slate-900 font-bold text-base leading-tight tracking-wide">
          Plataforma Corporativa
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Portal General
        </p>

        {/* 1. POLÍTICAS CORPORATIVAS */}
        <button
          onClick={() => setActiveComponent('politicas')}
          className={getButtonClass('politicas')}
        >
          <Icons.FileText className="w-4 h-4 shrink-0" />
          <span className="truncate">Políticas Corporativas</span>
        </button>

        {/* 2. SISTEMA DE GESTIÓN AMBIENTAL */}
        <button
          onClick={() => setActiveComponent('ambiental')}
          className={getButtonClass('ambiental')}
        >
          <Icons.Leaf className="w-4 h-4 shrink-0" />
          <span className="truncate">Sistema de Gestión Ambiental</span>
        </button>

        {/* 3. SISTEMA DE GESTIÓN DE CALIDAD (Muestra el Catálogo Maestro) */}
        <button
          onClick={() => setActiveComponent('dashboard')}
          className={getButtonClass('dashboard')}
        >
          <Icons.ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="truncate">Sistema de Gestión de Calidad</span>
        </button>

        {/* 4. CERTIFICADOS */}
        <button
          onClick={() => setActiveComponent('certificados')}
          className={getButtonClass('certificados')}
        >
          <Icons.Award className="w-4 h-4 shrink-0" />
          <span className="truncate">Certificados</span>
        </button>

        {/* 5. MANUALES S21 */}
        <button
          onClick={() => setActiveComponent('manuales_s21')}
          className={getButtonClass('manuales_s21')}
        >
          <Icons.BookOpen className="w-4 h-4 shrink-0" />
          <span className="truncate">Manuales S21</span>
        </button>

        {/* SECCIÓN DE GESTIÓN DE CALIDAD (Rol Calidad) */}
        {userRole === 'calidad' && (
          <div className="pt-5 mt-4 border-t border-slate-100 animate-in slide-in-from-left-4 fade-in duration-300">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Gestión y Configuración
            </p>

            {/* BOTÓN CATÁLOGO MAESTRO (Opcional extra si deseas acceso directo) */}
            <button
              onClick={() => setActiveComponent('catalogo')}
              className={getButtonClass('catalogo')}
            >
              <Icons.FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">Catálogo Maestro</span>
            </button>

            {/* BOTÓN CONFIGURACIÓN */}
            <button
              onClick={() => setActiveComponent('configuracion')}
              className={getButtonClass('configuracion')}
            >
              <Icons.Settings className="w-4 h-4 shrink-0" />
              <span className="truncate">Configuración</span>
            </button>
          </div>
        )}
      </nav>

      {/* Bloque del Perfil de Usuario */}
      <div className="p-4 m-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-full bg-canon-red flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
          ADM
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-slate-900 text-xs font-bold truncate">ADMIN</p>
          <p className="text-slate-500 text-[10px] truncate font-medium">
            Líder de Calidad
          </p>
        </div>
      </div>
    </aside>
  );
}
