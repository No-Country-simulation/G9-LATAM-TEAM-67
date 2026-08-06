import os
import logging
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import joblib

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TechMind – Organización Inteligente del Conocimiento Técnico",
    description="Endpoint optimizado para la clasificación directa de texto técnico.",
    version="1.0.0"
)

class ContenidoInput(BaseModel):
    texto: str = Field(..., description="Cuerpo o descripción del contenido")

class ClasificacionOutput(BaseModel):
    category: str = Field(..., description="Categoría asignada al contenido")
    probability: float = Field(..., description="Confianza de la predicción (0 a 1)")

model_pipeline = None

@app.on_event("startup")
def load_model():
    """Carga el modelo serializado en memoria RAM al arrancar el servidor."""
    global model_pipeline
    model_path = os.path.join("model", "pipeline_clasificador.joblib")
    
    if not os.path.exists(model_path):
        logger.error(f"Falta el archivo esencial del modelo en: {model_path}")
        raise FileNotFoundError(f"Archivo no encontrado: {model_path}")
    
    try:
        model_pipeline = joblib.load(model_path)
        logger.info("Modelo de Machine Learning cargado exitosamente en memoria.")
    except Exception as e:
        logger.critical(f"Fallo crítico al inicializar el modelo: {str(e)}")
        raise e

@app.post(
    "/predict", 
    response_model=ClasificacionOutput, 
    status_code=status.HTTP_200_OK,
    summary="Clasifica el texto y devuelve únicamente la categoría determinada."
)
@app.post(
    "/predict/",
    response_model=ClasificacionOutput,
    status_code=status.HTTP_200_OK,
    summary="Clasifica el texto y devuelve únicamente la categoría determinada.",
    include_in_schema=False)
async def clasificar_texto(payload: ContenidoInput):
    if model_pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="El motor de inferencia no está inicializado."
        )
    
    try:
        texto_a_procesar = f"{payload.texto}"
        
        categoria_predicha = model_pipeline.predict([texto_a_procesar])[0]
        
        probabilidades = model_pipeline.predict_proba([texto_a_procesar])[0]
        if max(probabilidades) < 0.50:
            logger.warning(f"Inferencia débil ({max(probabilidades):.2f}). Categorizado como 'No clasificado'.")
            return ClasificacionOutput(category="No clasificado", probability=max(probabilidades))

        logger.info(f"Procesamiento exitoso. Categoría asignada: {categoria_predicha}")
        return ClasificacionOutput(category=categoria_predicha, probability=max(probabilidades))
        
    except Exception as e:
        logger.error(f"Error interno durante la inferencia: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error en el procesamiento analítico del texto."
        )