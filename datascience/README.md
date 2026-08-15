# Ciencia de datos de TechMind

Este módulo contiene el trabajo versionado para entrenar el clasificador de contenido técnico que utiliza la [API Python](../python-api/README.md).

## Archivos

| Archivo | Propósito |
|---|---|
| `Clasificador_Contenido_Tecnico.ipynb` | Preparación, análisis, entrenamiento y evaluación. |
| `dataset_final.csv` | Dataset final de entrenamiento. |
| `pipeline_clasificador.joblib` | Pipeline serializado seleccionado. |
| `metadata.json` | Modelo, versión, métricas y categorías. |

La copia versionada en `python-api/model/` tiene el mismo tamaño y SHA-256 que el pipeline de esta carpeta.

## Datos

`dataset_final.csv` contiene 5 320 filas y tres columnas:

- `titulo`
- `texto`
- `categoria`

Distribución versionada:

| Categoría | Filas |
|---|---:|
| `backend` | 1063 |
| `basesdedatos` | 1066 |
| `cloud` | 1069 |
| `frontend` | 1062 |
| `ia` | 1060 |

El notebook referencia como fuente inicial un objeto CSV de OCI Object Storage y conserva comentada una URL de Google Sheets. El dataset final local es el insumo reproducible disponible en el repositorio; la disponibilidad futura de las fuentes remotas no está garantizada.

## Preparación e entrada del modelo

El notebook documenta:

- revisión de nulos, duplicados y distribución de clases;
- normalización de categorías;
- combinación de `titulo` y `texto` en una entrada textual;
- minúsculas, limpieza de caracteres y stopwords en español;
- transformación TF-IDF;
- partición estratificada 80/20 con `random_state=42`.

El artefacto final recibe una colección de textos. La API construye cada texto combinando título y contenido en el backend.

## Modelos evaluados

El notebook compara mediante validación cruzada:

| Modelo | Accuracy promedio versionado |
|---|---:|
| Logistic Regression | 0.996476 |
| Linear SVC | 0.996475 |
| Multinomial Naive Bayes | 0.995066 |

Se seleccionó Logistic Regression. `metadata.json` registra la versión `1.1`, `accuracy_cv` de `0.9964` y `accuracy_test` de `0.9981`. Estas cifras describen la ejecución versionada; no garantizan el comportamiento sobre datos nuevos ni sustituyen una evaluación externa.

Las categorías del metadato son `backend`, `frontend`, `basesdedatos`, `cloud` e `ia`.

## Artefactos e integración

El pipeline combina vectorización y clasificación y se serializa con joblib. La API carga `model/pipeline_clasificador.joblib` al iniciar y usa `predict` y `predict_proba`.

Al actualizar el modelo deben mantenerse sincronizados:

```text
datascience/pipeline_clasificador.joblib
python-api/model/pipeline_clasificador.joblib
datascience/metadata.json
```

## Reproducir el entrenamiento

El flujo reproducible disponible es abrir y ejecutar en orden `Clasificador_Contenido_Tecnico.ipynb` usando `dataset_final.csv`. El notebook importa al menos:

- pandas;
- matplotlib;
- NLTK y sus stopwords en español;
- scikit-learn;
- joblib;
- `oci` en una celda destinada a integración.

Faltan un `requirements.txt`, versiones fijadas, una definición formal del entorno y un script no interactivo. Por esa razón no existe un comando único confirmado para reproducir exactamente el entrenamiento. También se necesita descargar el corpus `stopwords` de NLTK si no está disponible localmente.

## Limitaciones y consideraciones

- Las métricas se obtuvieron del dataset versionado y pueden no representar textos fuera de esa distribución.
- Las clases están casi balanceadas, pero no hay análisis versionado de sesgo por fuente, idioma, longitud o subdominio.
- No hay pruebas automatizadas de deriva, robustez ni regresión del modelo.
- La API asigna `No clasificado` cuando la probabilidad máxima es menor que `0.50`; ese umbral pertenece al servicio de inferencia, no al pipeline.
- El notebook contiene referencias de red que pueden dejar de estar disponibles.
- Los artefactos binarios y datasets deben revisarse por tamaño, licencia y sensibilidad antes de añadir nuevas versiones. No deben versionarse credenciales ni archivos derivados que contengan datos privados.

[Volver al README principal](../README.md).
