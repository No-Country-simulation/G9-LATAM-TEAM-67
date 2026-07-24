# 1. Importación de las librerías necesarias
import os
import pandas as pd
import joblib
from google.colab import files  # Librería exclusiva de Colab para manejo de archivos
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

print("Por favor, selecciona y sube tu archivo 'dataset_hackathon.csv' desde tu equipo:")

# 2. Línea interactiva para subir el CSV en Google Colab
uploaded = files.upload()

# Obtener el nombre del archivo subido dinámicamente
csv_filename = list(uploaded.keys())[0]

print(f"\nArchivo '{csv_filename}' cargado con éxito. Iniciando procesamiento de datos...")

# 3. Carga del DataFrame utilizando Pandas
df = pd.read_csv(csv_filename)

# Validación rápida de estructura en la consola de Colab
print("\nVista previa de los datos cargados:")
print(df.head(3))

# 4. Combinación de los campos de texto (Título + Texto)
# Aseguramos que se traten como Strings y manejamos posibles valores nulos
X = df["titulo"].fillna("") + " " + df["texto"].fillna("")
y = df["categoria"]

# 5. División de datos (80% Entrenamiento, 20% Validación)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 6. Configuración del Pipeline de Machine Learning (TF-IDF + Regresión Logística)
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        max_features=5000
    )),
    ('classifier', LogisticRegression(
        multi_class='ovr',
        solver='liblinear',
        random_state=42
    ))
])

# 7. Entrenamiento del modelo analítico
print(f"\nEntrenando el modelo con {len(X_train)} registros...")
pipeline.fit(X_train, y_train)

# 8. Evaluación y generación del reporte de métricas requerido por el Hackathon
print("\nEvaluando el rendimiento en el conjunto de validación...")
y_pred = pipeline.predict(X_test)

print("\n================ REPORTES DE MÉTRICAS ================")
print(f"Precisión global del modelo (Accuracy): {accuracy_score(y_test, y_pred):.2f}")
print("\nReporte detallado por categoría:")
print(classification_report(y_test, y_pred))
print("======================================================")

# 9. Serialización y exportación del modelo
output_filename = "modelo_clasificador.pkl"
joblib.dump(pipeline, output_filename)
print(f"\nModelo serializado correctamente como '{output_filename}'.")

# 10. Descarga automática del archivo .pkl a tu computadora local
print("Iniciando la descarga automática del modelo...")
files.download(output_filename)