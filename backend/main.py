from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, engine
import models, schemas
import unicodedata
from pathlib import Path

models.Base.metadata.create_all(bind=engine)

# Directorio local donde se encuentran las políticas corporativas
POLITICAS_DIR = Path("../frontend/data/sgc/politicas_canon")

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def normalize_str(s):
    return unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode('utf-8')

# --- RUTAS PRINCIPALES DEL SGC ---

@app.get("/api/sgc/documentos")
def get_documentos(db: Session = Depends(get_db)):
    query = text("""
        SELECT 
            d.id,
            d.codigo,
            d.nombre,
            d.version_actual,
            d.estado,
            d.url_almacenamiento,
            p.Codigo_Proceso,
            p.Nombre_Proceso,
            a.Codigo_Area,
            a.Nombre_Area,
            t.nombre AS tipo_documento
        FROM dbo.Documentos d
        LEFT JOIN dbo.SGC_Procesos p ON d.Id_Proceso = p.Id_Proceso
        LEFT JOIN dbo.Cat_Areas_SGC a ON d.Id_Area_SGC = a.Id_Area
        LEFT JOIN dbo.TiposDocumento t ON d.tipo_id = t.id
    """)
    result = db.execute(query).mappings().all()
    return result

@app.get("/api/sgc/tipos")
def get_tipos(db: Session = Depends(get_db)):
    query = text("SELECT id, codigo, nombre FROM dbo.TiposDocumento WHERE activo = 1")
    return db.execute(query).mappings().all()

@app.get("/api/sgc/documentos/pendientes")
def get_pendientes(db: Session = Depends(get_db)):
    query = text("""
        SELECT id, codigo, nombre, estado, version_actual
        FROM dbo.Documentos 
        WHERE estado = 'EN_REVISION'
    """)
    return db.execute(query).mappings().all()

# main.py

@app.get("/api/sgc/documentos/{documento_id}/visualizar")
def visualizar_documento(documento_id: int, rol: str = "estandar", db: Session = Depends(get_db)):
    query = text("SELECT id, nombre, url_almacenamiento FROM dbo.Documentos WHERE id = :id")
    doc = db.execute(query, {"id": documento_id}).mappings().first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado en la base de datos.")
    
    # O bien rediriges a la URL de almacenamiento (Google Docs, etc.) o devuelves la metadata
    return {
        "id": doc["id"],
        "nombre": doc["nombre"],
        "url_almacenamiento": doc["url_almacenamiento"]
    }

@app.get("/api/sgc/documentos/{documento_id}")
def obtener_detalle_documento(documento_id: int, db: Session = Depends(get_db)):
    query = text("SELECT * FROM dbo.Documentos WHERE id = :id")
    doc = db.execute(query, {"id": documento_id}).mappings().first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
        
    return doc

@app.get("/api/sgc/politicas")
def get_politicas_locales():
    try:
        if not POLITICAS_DIR.exists():
            POLITICAS_DIR.mkdir(parents=True, exist_ok=True)
            return []
        
        archivos = []
        # .rglob('*') busca de forma recursiva en todos los subdirectorios
        for file_path in POLITICAS_DIR.rglob('*'):
            if file_path.is_file():
                if file_path.name.startswith('.'):
                    continue
                
                # Extraer la ruta relativa para deducir jerarquía si está organizada en carpetas
                relative_path = file_path.relative_to(POLITICAS_DIR)
                parts = relative_path.parts
                
                # Jerarquía dinámica basada en la estructura de carpetas locales
                # Ejemplo: politicas_canon / [Departamento] / [Subdireccion] / [Seccion] / archivo.pdf
                departamento = parts[0] if len(parts) > 3 else "General"
                subdireccion = parts[1] if len(parts) > 3 else (parts[0] if len(parts) > 2 else "Corporativo")
                seccion = parts[2] if len(parts) > 3 else (parts[1] if len(parts) > 2 else (parts[0] if len(parts) > 1 else "Normativa"))
                
                nombre_limpio = file_path.stem.replace('_', ' ').replace('-', ' ').title()

                archivos.append({
                    "id": str(file_path),
                    "titulo": nombre_limpio,
                    "nombre_archivo": file_path.name,
                    "departamento": departamento,
                    "subdireccion": subdireccion,
                    "seccion": seccion,
                    "url_almacenamiento": str(relative_path)
                })
                
        return archivos
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})


@app.get("/api/sgc/politicas/visualizar")
def visualizar_politica_local(path: str):
    # Ruta completa combinada de forma segura
    archivo_path = POLITICAS_DIR / path
    if archivo_path.exists() and archivo_path.is_file():
        return FileResponse(path=str(archivo_path))
    raise HTTPException(status_code=404, detail="Archivo no encontrado en el servidor.")