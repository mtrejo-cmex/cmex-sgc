import os
import unicodedata
from database import SessionLocal
import models  # Asegúrate de que este archivo existe en tu proyecto

def normalize_str(s):
    """
    Normaliza strings para ignorar tildes y mayúsculas/minúsculas.
    Ejemplo: 'Gestión' -> 'gestion', 'GESTION' -> 'gestion'
    """
    # NFD descompone los caracteres (ej: ó -> o + ´)
    # ascii, ignore elimina los acentos
    return unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode('utf-8')

def sincronizar_rutas():
    db = SessionLocal()
    try:
        # Obtenemos todos los documentos
        documentos = db.query(models.Documento).all()
        print(f"Iniciando sincronización de {len(documentos)} archivos...")
        
        cambios = 0

        for doc in documentos:
            ruta_db = doc.url_almacenamiento
            
            # Si el archivo existe tal cual, lo saltamos
            if ruta_db and os.path.exists(ruta_db):
                continue
            
            # Si la ruta está vacía, saltamos
            if not ruta_db:
                print(f"[!] ID {doc.id}: Sin ruta registrada.")
                continue

            # Obtenemos el directorio y el nombre del archivo
            directorio = os.path.dirname(ruta_db)
            nombre_archivo_db = os.path.basename(ruta_db)
            
            if not os.path.exists(directorio):
                print(f"[X] Carpeta no encontrada en disco: {directorio}")
                continue

            # Buscamos en la carpeta un archivo que coincida (ignorando diferencias de acentos)
            nombre_normalizado_db = normalize_str(nombre_archivo_db)
            encontrado = False
            
            for archivo_fisico in os.listdir(directorio):
                if normalize_str(archivo_fisico) == nombre_normalizado_db:
                    # ¡Encontrado!
                    nueva_ruta = os.path.join(directorio, archivo_fisico)
                    
                    print(f"[!] Corrección encontrada para ID {doc.id}:")
                    print(f"    BD: {nombre_archivo_db}")
                    print(f"    Disco: {archivo_fisico}")
                    
                    # Actualizamos en BD
                    doc.url_almacenamiento = nueva_ruta
                    cambios += 1
                    encontrado = True
                    break
            
            if not encontrado:
                print(f"[?] No se pudo encontrar el archivo físico para: {nombre_archivo_db}")

        if cambios > 0:
            db.commit()
            print(f"\nÉXITO: Se han actualizado {cambios} registros en la base de datos.")
        else:
            print("\nNo se encontraron registros que necesiten corrección.")

    except Exception as e:
        print(f"Error durante la sincronización: {e}")
        db.rollback()
    finally:
        db.close()
        print("Sincronización finalizada.")

if __name__ == "__main__":
    sincronizar_rutas()