from models import Documento
from sqlalchemy.orm import class_mapper

# Imprimir las columnas que SQLAlchemy ve en el modelo
mapper = class_mapper(Documento)
print("Columnas detectadas en Documento:")
for column in mapper.columns:
    print(f"- {column.key}")