FROM python:3.12-slim

WORKDIR /app

COPY python-api/requeriments.txt .
RUN pip install --no-cache-dir -r requeriments.txt

COPY python-api/main.py .
COPY datascience/pipeline_clasificador.joblib ./model/pipeline_clasificador.joblib

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
