from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List

# =========================================================================
# ESTRUCTURA ORGANIZACIONAL Y RESPONSABLES
# =========================================================================

class DivisionRead(BaseModel):
    id_division: int = Field(alias="idDivision")
    codigo_division: str = Field(alias="codigoDivision")
    nombre_division: str = Field(alias="nombreDivision")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class AreaCorporativaRead(BaseModel):
    id_area_corp: int = Field(alias="idAreaCorp")
    nombre_area_corp: str = Field(alias="nombreAreaCorp")
    division: Optional[DivisionRead] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class ResponsableRead(BaseModel):
    usuario_rh: str = Field(alias="usuarioRh")
    nombre: str
    apellido_paterno: str = Field(alias="apellidoPaterno")
    apellido_materno: Optional[str] = Field(None, alias="apellidoMaterno")
    correo_corporativo: str = Field(alias="correoCorporativo")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class SGCProcesoRead(BaseModel):
    id_proceso: int = Field(alias="idProceso")
    codigo_proceso: str = Field(alias="codigoProceso")
    nombre_proceso: str = Field(alias="nombreProceso")
    tipo_proceso: str = Field(alias="tipoProceso")
    activo: bool
    
    area_corporativa: Optional[AreaCorporativaRead] = Field(None, alias="areaCorporativa")
    responsables: List[ResponsableRead] = Field(default=[])

    responsables_concatenados: Optional[str] = Field(None, alias="responsablesConcatenados")
    correos_concatenados: Optional[str] = Field(None, alias="correosConcatenados")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class AreaSGCRead(BaseModel):
    id_area: int = Field(alias="idArea")
    codigo_area: str = Field(alias="codigoArea")
    nombre_area: str = Field(alias="nombreArea")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


# =========================================================================
# ESQUEMAS PARA DOCUMENTOS Y CATÁLOGOS (ORDEN CORREGIDO)
# =========================================================================

# 1. Esquema base/creación de Documentos (DEBE IR PRIMERO)
class DocumentoCreate(BaseModel):
    codigo: str
    nombre: str
    tipo_id: Optional[int] = None
    estado: Optional[str] = "Vigente"
    url_almacenamiento: Optional[str] = None


# 2. Esquema de lectura de Documentos (HEREDA DE DocumentoCreate)
class DocumentoRead(DocumentoCreate):
    id: int
    fecha_creacion: datetime = Field(alias="fechaCreacion")
    version_actual: int = Field(alias="versionActual")
    tipo_nombre: Optional[str] = Field(None, alias="tipoNombre")
    
    proceso: Optional[SGCProcesoRead] = None 
    area_sgc: Optional[AreaSGCRead] = Field(None, alias="areaSgc")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


# --- Esquemas para el Catálogo Maestro (Tipos/Categorías) ---
class TipoBase(BaseModel):
    codigo: str
    nombre: str
    activo: Optional[bool] = True

class TipoCreate(TipoBase):
    pass

class TipoRead(TipoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# --- Esquemas para el Historial de Versiones ---
class VersionRead(BaseModel):
    id: int
    documento_id: int
    numero_version: int
    fecha_aprobacion: datetime
    aprobado_por: Optional[str] = None  
    archivo_path: Optional[str] = None  
    es_vigente: bool
    motivo_cambio: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class HabilitarAreaRequest(BaseModel):
    id_proceso: int = Field(alias="idProceso")
    id_area: int = Field(alias="idArea")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class AreaEstatusResponse(BaseModel):
    id_area: int = Field(alias="idArea")
    nombre_area: str = Field(alias="nombreArea")
    codigo_area: str = Field(alias="codigoArea")
    habilitado: bool = Field(default=False, alias="habilitado")
    fecha_habilitacion: Optional[datetime] = Field(default=None, alias="fechaHabilitacion")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)