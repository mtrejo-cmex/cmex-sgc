from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timezone

Base = declarative_base()

# =========================================================================
# 1. TABLA INTERMEDIA MANY-TO-MANY (RESPONSABLES <-> PROCESOS)
# =========================================================================
responsables_proceso = Table(
    'Responsables_Proceso',
    Base.metadata,
    Column('Id_Proceso', Integer, ForeignKey('SGC_Procesos.Id_Proceso', ondelete='CASCADE'), primary_key=True),
    Column('usuario_rh', String(20), ForeignKey('SGC_Responsables.usuario_rh', ondelete='CASCADE'), primary_key=True)
)

# =========================================================================
# 2. NUEVOS MODELOS MAESTROS DEL SGC (3FN)
# =========================================================================

class CatDivision(Base):
    __tablename__ = 'Cat_Divisiones'

    Id_Division = Column(Integer, primary_key=True, index=True)
    Codigo_Division = Column(String(20), unique=True, nullable=False) # ADM, MKT, SALES...
    Nombre_Division = Column(String(100), nullable=True)
    Activo = Column(Boolean, default=True)

    # Relación hacia Áreas
    areas = relationship("CatAreaCorporativa", back_populates="division")


class CatAreaCorporativa(Base):
    __tablename__ = 'Cat_Areas_Corporativas'

    Id_Area_Corp = Column(Integer, primary_key=True, index=True)
    Nombre_Area_Corp = Column(String(100), unique=True, nullable=False) # IT, Logística...
    Id_Division = Column(Integer, ForeignKey('Cat_Divisiones.Id_Division'), nullable=False)
    Activo = Column(Boolean, default=True)

    # Relaciones
    division = relationship("CatDivision", back_populates="areas")
    procesos = relationship("SGCProceso", back_populates="area_corporativa")


class SGCResponsable(Base):
    __tablename__ = 'SGC_Responsables'

    usuario_rh = Column(String(20), primary_key=True, index=True) # JXXXX o CXXXX
    apellido_paterno = Column(String(50), nullable=False)
    apellido_materno = Column(String(50), nullable=True)
    nombre = Column(String(100), nullable=False)
    correo_corporativo = Column(String(150), unique=True, nullable=False)
    activo = Column(Boolean, default=True)

    # Relación Many-to-Many invertida
    procesos = relationship("SGCProceso", secondary=responsables_proceso, back_populates="responsables")


class SGCProceso(Base):
    __tablename__ = 'SGC_Procesos'

    Id_Proceso = Column(Integer, primary_key=True, index=True)
    Codigo_Proceso = Column(String(20), unique=True, nullable=False) # PRO-XXX
    Nombre_Proceso = Column(String(200), nullable=False)
    Tipo_Proceso = Column(String(50), nullable=True) # Estrategico, Operativo, SGC
    Id_Area_Corp = Column(Integer, ForeignKey('Cat_Areas_Corporativas.Id_Area_Corp'), nullable=True)
    Activo = Column(Boolean, default=True)

    # Relaciones
    area_corporativa = relationship("CatAreaCorporativa", back_populates="procesos")
    responsables = relationship("SGCResponsable", secondary=responsables_proceso, back_populates="procesos")
    
    # Relación hacia tus documentos existentes
    documentos = relationship("Documento", back_populates="proceso_rel")


# =========================================================================
# 3. TUS MODELOS EXISTENTES (PRESERVADOS Y ENLAZADOS)
# =========================================================================

class TipoDocumento(Base):
    __tablename__ = 'TiposDocumento'

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(5), unique=True, index=True, nullable=False)
    nombre = Column(String(50), nullable=False)
    activo = Column(Boolean, default=True)
    
    documentos = relationship("Documento", back_populates="tipo")


class Documento(Base):
    __tablename__ = 'Documentos'

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), nullable=False)
    nombre = Column(String(255), nullable=False)
    tipo_id = Column(Integer, ForeignKey('TiposDocumento.id'), nullable=True)
    estado = Column(String(20), nullable=True)
    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    version_actual = Column(Integer, default=1)
    url_almacenamiento = Column(String(500), nullable=True)
    
    # Llave foránea para amarrar el documento con el catálogo SGC_Procesos
    Id_Proceso = Column(Integer, ForeignKey('SGC_Procesos.Id_Proceso'), nullable=True)

    # Relaciones
    tipo = relationship("TipoDocumento", back_populates="documentos")
    versiones = relationship("VersionesDocumento", back_populates="documento")
    proceso_rel = relationship("SGCProceso", back_populates="documentos")


class VersionesDocumento(Base):
    __tablename__ = 'VersionesDocumento'

    id = Column(Integer, primary_key=True, index=True)
    documento_id = Column(Integer, ForeignKey('Documentos.id'), nullable=False) 
    numero_version = Column(Integer, nullable=False)
    fecha_aprobacion = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    aprobado_por = Column(String(100), nullable=True)
    archivo_path = Column(String(500), nullable=True)
    es_vigente = Column(Boolean, default=False)
    motivo_cambio = Column(String(255), nullable=True)

    # Relación al padre
    documento = relationship("Documento", back_populates="versiones")