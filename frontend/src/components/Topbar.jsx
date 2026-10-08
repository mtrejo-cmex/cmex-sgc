// src/components/Topbar.jsx
import React from 'react';
import { Icons } from '../utils/icons';
import isoLogo from '../assets/getsitelogo.png'; // 1. Importamos la imagen

export default function Topbar({
  userRole,
  setUserRole,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
      {/* 2. Contenedor del Título con el Logo */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-slate-800">
          Políticas y Sistemas de Gestión
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Barra de Búsqueda */}
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-slate-400">
            <Icons.Search />
          </span>
          <input
            type="text"
            placeholder="Buscar documentos..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canon-red/20 focus:border-canon-red transition-all w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Selector de Rol */}
        <select
          className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-canon-red/20"
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
        >
          <option value="empleado">Vista Empleado</option>
          <option value="calidad">Vista Líder de Calidad</option>
        </select>
      </div>
    </header>
  );
}
