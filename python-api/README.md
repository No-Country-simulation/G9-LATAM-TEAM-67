# API Python de TechMind

Microservicio FastAPI que carga el pipeline entrenado en memoria y clasifica texto técnico para el [backend](../backend/README.md).

## Tecnologías y estructura

- Python 3.12 en el Dockerfile.
- FastAPI 0.111.0.
- Uvicorn 0.30.1.
- Pydantic 2.7.4.
- scikit-learn 1.5.0.
- joblib 1.4.2.

```text
python-api/
├── main.py
├── requeriments.txt
├── Dockerfile
├── descripcion.md
└── model/
    └── pipeline_clasificador.joblib
```

El nombre `requeriments.txt` reproduce el archivo existente y debe usarse así en los comandos.

## Instalación y ejecución local

Desde `python-api/`, con un entorno Python apropiado:

```powershell
python -m pip install -r requeriments.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

`main.py` busca el modelo en `model/pipeline_clasificador.joblib` relativo al directorio de ejecución. Si falta o no puede deserializarse, el arranque falla.

Host y puerto se establecen mediante argumentos de Uvicorn; el código no define variables de entorno específicas para ellos.

## Endpoints

| Método | Ruta | Documentado en OpenAPI | Resultado |
|---|---|---:|---|
| `POST` | `/predict` | Sí | Clasifica el texto; `200`. |
| `POST` | `/predict/` | No | Alias funcional con el mismo contrato; `200`. |

FastAPI ofrece además:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI: `http://localhost:8000/openapi.json`

## Contrato de clasificación

Solicitud:

```json
{
  "texto": "Contenido técnico para clasificar"
}
```

Respuesta ilustrativa:

```json
{
  "category": "cloud",
  "probability": 0.93
}
```

La categoría y probabilidad anteriores son ilustrativas, no el resultado de una prueba incluida en este documento. Las categorías esperadas del modelo versionado son `backend`, `frontend`, `basesdedatos`, `cloud` e `ia`.

El servicio llama a `predict` y `predict_proba`. Si la probabilidad máxima es menor que `0.50`, responde:

```json
{
  "category": "No clasificado",
  "probability": 0.42
}
```

La probabilidad del ejemplo también es ilustrativa.

## Validación y errores

- `200`: inferencia completada.
- `422`: cuerpo ausente, JSON incompatible o campo `texto` no válido según Pydantic.
- `503`: el pipeline no está inicializado al atender la solicitud.
- `500`: error durante `predict` o `predict_proba`.

El esquema exige que `texto` sea una cadena, pero no define longitud mínima ni elimina entradas vacías. La API registra carga del modelo, categoría elegida, confianza débil y errores; no debe enviarse información sensible en el texto.

## Docker

Desde la raíz del repositorio:

```powershell
docker build -f python-api/Dockerfile -t techmind-classifier .
docker run --rm -p 8000:8000 techmind-classifier
```

El Dockerfile copia el modelo desde `datascience/pipeline_clasificador.joblib`, no desde `python-api/model/`, y ejecuta Uvicorn en `0.0.0.0:8000`. El `docker-compose.yml` raíz usa esa imagen como servicio `classifier`.

## Integración con Spring Boot

El backend debe configurar la ruta completa:

```env
APP_CLASSIFIER_API_URL=http://localhost:8000/predict
```

Dentro de Docker Compose usa el nombre de servicio `classifier`. El backend configura timeouts, valida la respuesta y traduce indisponibilidad a `503` y respuestas inválidas a `502`.

## Pruebas, logs y limitaciones

No existen pruebas automatizadas para este módulo. Una comprobación manual, con la API activa, puede hacerse así:

```powershell
$body = @{ texto = "Contenido técnico para clasificar" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8000/predict -ContentType "application/json" -Body $body
```

- Ejecutar desde otro directorio puede impedir encontrar `model/pipeline_clasificador.joblib`.
- El pipeline joblib debe ser compatible con las versiones fijadas y provenir de una fuente confiable.
- No hay autenticación en la API Python; se espera que el backend sea su consumidor.
- No hay endpoint de salud dedicado.
- No se limita tamaño o longitud de `texto` en este servicio.
- Las limitaciones y métricas del modelo se documentan en [datascience](../datascience/README.md).

[Volver al README principal](../README.md).
