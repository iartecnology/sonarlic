# Dockerfile maestro para Dokploy Application
FROM python:3.11-slim

# Instalar Node.js 20, Nginx, Supervisor y herramientas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    build-essential \
    nginx \
    supervisor \
    procps \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Instalar dependencias Python de Backend y Worker
COPY backend/requirements.txt ./backend_requirements.txt
COPY worker/requirements.txt ./worker_requirements.txt
RUN pip install --no-cache-dir -r backend_requirements.txt && \
    pip install --no-cache-dir -r worker_requirements.txt

# 2. Compilar Frontend Next.js
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

WORKDIR /app

# 3. Copiar código de backend, worker y scripts de DB
COPY backend/ ./backend/
COPY worker/ ./worker/
COPY docker/ ./docker/

# 4. Configurar NGINX
RUN rm /etc/nginx/sites-enabled/default 2>/dev/null || true
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# 5. Configuración de Supervisord para orquestar Backend y Frontend
RUN mkdir -p /var/log/supervisor
RUN cat << 'SEOF' > /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:backend]
directory=/app/backend
command=uvicorn app.main:app --host 0.0.0.0 --port 8000
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:frontend]
directory=/app/frontend
command=npm run start -- -p 3000
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
SEOF

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
