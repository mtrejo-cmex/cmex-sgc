import shutil
from pathlib import Path

# --- CONFIGURACIÓN ---
# Ruta ajustada a tu estructura de directorios en WSL
BASE_PATH = Path("/home/j02076/proyectos/web-development/gestion_calidad/frontend/data/sgc/master")

# Mapeo: Carpeta Nueva (Destino) -> Lista de carpetas originales (Origen)
ESTRUCTURA_DESTINO = {
    "01_NORMATIVO": ["Politicas", "Norma ISO 9001 - 2015", "Matriz de Responsabilidades"],
    "02_PROCESOS": ["Procesos y Registros", "Gestión de Cambios", "Gestión de Riesgos"],
    "03_OPERATIVO": ["Instructivos de Trabajo", "Manuales de S21"],
    "04_FORMATOS": ["Formatos"],
    "05_EVIDENCIA": ["Alta Dirección", "Gestión No Conformidades", "MAC"]
}

# 1. MODO SIMULACIÓN (True = no hace nada, solo imprime)
# 2. MODO REAL (False = mueve los archivos)
DRY_RUN = False

def organizar_archivos():
    if not BASE_PATH.exists():
        print(f"ERROR: La ruta {BASE_PATH} no existe. Verifica la ubicación.")
        return

    print(f"--- Modo ejecución: {'SIMULACIÓN (No se moverá nada)' if DRY_RUN else 'REAL'} ---")
    print(f"Trabajando en: {BASE_PATH}\n")
    
    for categoria, carpetas_origen in ESTRUCTURA_DESTINO.items():
        destino_final = BASE_PATH / categoria
        
        # 1. Crear carpeta destino si no existe
        if not DRY_RUN:
            destino_final.mkdir(parents=True, exist_ok=True)
            
        # 2. Mover carpetas
        for nombre_carpeta in carpetas_origen:
            path_origen = BASE_PATH / nombre_carpeta
            
            # Verificamos si existe (manejo básico de codificación)
            if path_origen.exists():
                print(f"Moviendo: {path_origen.name} -> {categoria}/{nombre_carpeta}")
                if not DRY_RUN:
                    try:
                        shutil.move(str(path_origen), str(destino_final / nombre_carpeta))
                    except Exception as e:
                        print(f"Error moviendo {nombre_carpeta}: {e}")
            else:
                # Si no encuentra la carpeta, listamos lo que sí hay para ayudar a debuguear
                print(f"AVISO: No se encontró la carpeta '{nombre_carpeta}'. Revisa si el nombre tiene tildes o caracteres especiales.")

if __name__ == "__main__":
    organizar_archivos()
    print("\nProceso finalizado.")