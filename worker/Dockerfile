# Multi-stage build para Celery Worker
FROM python:3.11-slim as builder

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Imagen final ligera de producción
FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /install /usr/local
COPY ./tasks ./tasks

RUN adduser --disabled-password --gecos '' celeryuser && chown -R celeryuser:celeryuser /app
USER celeryuser

CMD ["celery", "-A", "tasks.celery_app", "worker", "--beat", "--loglevel=info", "-c", "2"]
