#  Clasificador Inteligente de Contenido Técnico
### Ciencia de Datos | Hackathon Oracle Next Education (ONE) G9 – Alura & Oracle

##  Descripción

Este repositorio contiene el desarrollo de la etapa de **Ciencia de Datos** del proyecto **Clasificador Inteligente de Contenido Técnico**, realizado para el Hackathon **Oracle Next Education (ONE) G9 – Alura & Oracle**.

El objetivo fue desarrollar un modelo de **Machine Learning** capaz de clasificar automáticamente contenido técnico en cinco categorías principales, facilitando la organización y consulta de repositorios de conocimiento.

El modelo desarrollado será consumido posteriormente por una **API REST**, formando parte de una solución integral desplegada en **Oracle Cloud Infrastructure (OCI)**.

---

#  Objetivos

- Construir un dataset de contenido técnico con todo el equipo.
- Analizar la calidad de los datos mediante EDA.
- Preparar y limpiar el texto para el entrenamiento.
- Transformar documentos utilizando TF-IDF.
- Comparar diferentes algoritmos de clasificación.
- Seleccionar el modelo con mejor desempeño.
- Exportar el modelo para su integración con Backend.

---

#  Categorías del modelo

El clasificador identifica automáticamente contenido perteneciente a las siguientes categorías:

- Backend
- Frontend
- Bases de Datos
- Cloud
- Inteligencia Artificial (IA)

---

#  Flujo de trabajo

```text
Carga del Dataset
        │
        ▼
Análisis Exploratorio (EDA)
        │
        ▼
Limpieza y Normalización
        │
        ▼
Preprocesamiento del Texto
        │
        ▼
Vectorización (TF-IDF)
        │
        ▼
Train / Test Split
        │
        ▼
Construcción de Pipelines
        │
        ▼
Entrenamiento de Modelos
        │
        ▼
Validación Cruzada
        │
        ▼
Selección del Mejor Modelo
        │
        ▼
Evaluación
        │
        ▼
Serialización (.joblib)
```

---

# 🛠 Tecnologías utilizadas

## Lenguaje

- Python 3

## Librerías

- Pandas
- NumPy
- Matplotlib
- Scikit-Learn
- Joblib

## Técnicas de Ciencia de Datos

- Análisis Exploratorio de Datos (EDA)
- Procesamiento de Lenguaje Natural (NLP)
- Limpieza y normalización de texto
- TF-IDF
- Machine Learning Supervisado
- Pipeline de Scikit-Learn
- Validación Cruzada (Cross Validation)

---

#  Análisis Exploratorio (EDA)

Durante esta etapa se realizaron las siguientes actividades:

- Exploración del dataset.
- Identificación de valores nulos.
- Eliminación de registros duplicados.
- Corrección de inconsistencias en las categorías.
- Revisión de la distribución de clases.
- Validación de la estructura de los datos.

---

#  Preprocesamiento del texto

Se aplicó un proceso de limpieza para mejorar la calidad del entrenamiento:

- Conversión a minúsculas.
- Eliminación de signos de puntuación.
- Eliminación de caracteres especiales.
- Eliminación de stopwords.
- Eliminación de espacios innecesarios.
- Unificación del título y la descripción en un único documento de entrada.

---

#  Vectorización

El texto fue convertido a variables numéricas utilizando la técnica:

**TF-IDF (Term Frequency – Inverse Document Frequency)**

Esta representación permite identificar la importancia relativa de cada palabra dentro del conjunto de documentos y generar las características utilizadas por los modelos de Machine Learning.

---

#  Modelos evaluados

Se entrenaron y compararon tres algoritmos de clasificación:

| Modelo | Descripción |
|---------|-------------|
| Logistic Regression | Clasificador lineal multiclase |
| Multinomial Naive Bayes | Modelo probabilístico para clasificación de texto |
| Linear SVC | Máquina de Soporte Vectorial lineal |

---

#  Comparación de modelos

Los modelos fueron comparados utilizando **Validación Cruzada (Cross Validation)** con cinco particiones.

## Accuracy promedio

| Modelo | Accuracy |
|---------|----------:|
| 🥇 Logistic Regression | **0.996476** |
| 🥈 Linear SVC | **0.996475** |
| 🥉 Multinomial Naive Bayes | **0.995066** |

De acuerdo con los resultados obtenidos, **Logistic Regression** fue seleccionado como el modelo final por presentar el mejor desempeño promedio.

---

#  Evaluación del modelo

El modelo seleccionado fue evaluado sobre el conjunto de prueba utilizando las siguientes métricas:

- Accuracy
- Precision
- Recall
- F1-Score
- Matriz de Confusión

**Accuracy obtenido en el conjunto de prueba:** **0.9981**

Los resultados mostraron un buen desempeño en todas las categorías, permitiendo una clasificación consistente del contenido técnico.

---

#  Archivos generados

Durante el proyecto se generaron los siguientes archivos:

| Archivo | Descripción |
|----------|-------------|
| dataset_final.csv | Dataset limpio utilizado para entrenamiento |
| pipeline_clasificador.joblib | Modelo entrenado listo para producción |
| metadata.json | Información del modelo y métricas principales |

Estos archivos fueron preparados para su almacenamiento en **Oracle Cloud Infrastructure (OCI Object Storage)** y posterior consumo por la API del proyecto.

---

#  Estructura del proyecto

```text
DataScience/

├── Clasificador_Contenido_Tecnico.ipynb
├── README.md
├── dataset_final.csv
├── metadata.json
└── pipeline_clasificador.joblib
```

---

#  Ejemplo de uso

```python
texto = [

  """Título: "Administración y Optimización de Bases de Datos Relacionales En este curso se estudian los fundamentos del diseño y administración de bases de datos relacionales utilizando PostgreSQL, MySQL y Oracle Database. El contenido aborda la creación de tablas, definición de claves primarias y foráneas, restricciones de integridad, normalización de datos y modelado entidad-relación para garantizar estructuras eficientes y consistentes. Posteriormente se desarrollan consultas SQL de diferente complejidad utilizando sentencias SELECT, WHERE, GROUP BY, HAVING y ORDER BY para filtrar y organizar la información almacenada. También se profundiza en el uso de INNER JOIN, LEFT JOIN y RIGHT JOIN para relacionar múltiples tablas y obtener información consolidada de diferentes fuentes. El curso incluye la creación de índices para optimizar el rendimiento de las consultas, el uso de vistas para simplificar el acceso a la información y procedimientos almacenados para automatizar procesos repetitivos dentro del sistema gestor de bases de datos. Además, se trabajan conceptos relacionados con transacciones, propiedades ACID, control de concurrencia, bloqueo de registros y recuperación ante fallos para garantizar la integridad de la información en ambientes con múltiples usuarios. Finalmente, se realizan ejercicios de optimización de consultas mediante el análisis de planes de ejecución, ajuste de índices y monitoreo del rendimiento utilizando herramientas propias de Oracle Database y PostgreSQL"""

]
prediccion = modelo.predict(texto)
probabilidades = modelo.predict_proba(texto)

print("Categoría predicha:", prediccion[0])
print("\nProbabilidades:")

for categoria, prob in zip(modelo.classes_, probabilidades[0]):
    print(f"{categoria}: {prob:.2%}")
print(prediccion)
```

### Resultado esperado

```text
Categoría predicha: basesdedatos

Probabilidades:
backend: 3.83%
basesdedatos: 87.16%
cloud: 3.15%
frontend: 2.62%
ia: 3.24%
```

---

#  Integración con Oracle Cloud Infrastructure (OCI)

Como parte del proyecto, el modelo entrenado, el dataset y los archivos de configuración fueron preparados para almacenarse en un **Bucket de Oracle Cloud Infrastructure (Object Storage)**.

Esta integración permite que la API desarrollada por el equipo de Backend cargue el modelo entrenado y realice predicciones sobre nuevos contenidos técnicos.

---

#  Equipo

Proyecto desarrollado durante el **Hackathon Oracle Next Education (ONE) G9 – Alura & Oracle**.

