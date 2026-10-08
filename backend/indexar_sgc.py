import fitz  # PyMuPDF
from docx import Document

def extraer_metadatos(ruta_archivo):
    metadata = {"autor": "Desconocido", "titulo": "Sin título", "palabras_clave": ""}
    
    try:
        if ruta_archivo.suffix == '.pdf':
            doc = fitz.open(ruta_archivo)
            meta = doc.metadata
            metadata = {"autor": meta.get('author'), "titulo": meta.get('title'), "palabras_clave": meta.get('keywords')}
            doc.close()
            
        elif ruta_archivo.suffix == '.docx':
            doc = Document(ruta_archivo)
            core_props = doc.core_properties
            metadata = {"autor": core_props.author, "titulo": core_props.title, "palabras_clave": core_props.keywords}
            
    except Exception as e:
        print(f"No se pudieron leer metadatos de {ruta_archivo.name}: {e}")
        
    return metadata