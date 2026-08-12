# Descripción breve

Este microservicio está implementado con FastAPI (aplicación definida en `main.py`) y ofrece un endpoint de inferencia de texto técnico.

- **Propósito:** Clasificar contenido textual técnico y devolver la categoría más probable.
- **Inicio:** Al arrancar carga en memoria el pipeline serializado en `model/pipeline_clasificador.joblib`.
- **Endpoint principal:** `POST /predict` — recibe JSON con el campo `texto` y devuelve `{category, probability}`.
- **Comportamiento:** Si la confianza máxima es menor a 0.50, responde `"No clasificado"` con la probabilidad asociada; si falta el archivo del modelo, falla en el arranque.
- **Registro:** Usa logging para eventos informativos, advertencias y errores.

