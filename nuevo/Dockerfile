# ------------------------------------------------------------
# Etapa 1: Dependencias PHP (Composer) - misma versión PHP que runtime
# ------------------------------------------------------------
FROM composer:2.7 AS vendor
WORKDIR /app

# Copiamos definición de dependencias primero para aprovechar cache
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-progress \
    --no-interaction \
    --prefer-dist \
    --no-scripts \
    --optimize-autoloader

# ------------------------------------------------------------
# Etapa 2: Build de assets (Node / Vite)
# ------------------------------------------------------------
FROM node:20-bookworm-slim AS assets
WORKDIR /app

# Copiamos manifests de dependencias JS
COPY package.json package-lock.json* ./

# Instalación determinística si existe lockfile
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

# Archivos de configuración y fuentes necesarias para build
COPY vite.config.ts tsconfig.json ./
COPY components.json* ./
COPY resources ./resources
COPY public ./public

# Desactivar generación de tipos Wayfinder (evita ejecutar php artisan en build)
ENV BUILD_WAYFINDER_TYPES=0

# Build de assets de producción
RUN npm run build

# ------------------------------------------------------------
# Etapa 3: Runtime (Apache + PHP 8.2)
# ------------------------------------------------------------
FROM php:8.2-apache-bookworm AS runtime

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    PHP_MEMORY_LIMIT=512M \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0 \
    PHP_OPCACHE_MAX_ACCELERATED_FILES=20000 \
    OPTIMIZE_ON_STARTUP=true

# Paquetes del sistema y extensiones PHP requeridas por Laravel.
# Notas:
#  - mbstring es requerida (server requirements Laravel).
#  - pdo_sqlite se incluye para tests / uso ligero; eliminarlo si sólo usas MySQL y así evitar libs sqlite.
#  - Si eliminas pdo_sqlite puedes quitar libsqlite3-dev sqlite3.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip curl libzip-dev libicu-dev libpq-dev libonig-dev libxml2-dev \
        sqlite3 libsqlite3-dev pkg-config \
    && docker-php-ext-install intl zip pdo_mysql pdo_sqlite bcmath mbstring \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

# Opcache recomendado (docs Laravel: activar en prod)
RUN { \
      echo 'opcache.enable=1'; \
      echo 'opcache.enable_cli=1'; \
      echo 'opcache.memory_consumption=256'; \
      echo 'opcache.interned_strings_buffer=16'; \
      echo 'opcache.max_accelerated_files=20000'; \
      echo 'opcache.validate_timestamps=${PHP_OPCACHE_VALIDATE_TIMESTAMPS}'; \
      echo 'opcache.save_comments=1'; \
      echo 'opcache.fast_shutdown=1'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini \
    && echo 'memory_limit=${PHP_MEMORY_LIMIT}' > /usr/local/etc/php/conf.d/memory-limit.ini

WORKDIR /var/www/html

# Copiamos el código fuente
COPY . ./

# Aseguramos que no arrastramos caches generados con dependencias dev
RUN rm -f bootstrap/cache/*.php || true

COPY --from=vendor /app/vendor ./vendor
COPY --from=vendor /app/composer.lock ./composer.lock
COPY --from=assets /app/public/build ./public/build

# Permisos (storage, cache y opcionalmente base de datos sqlite local)
RUN chown -R www-data:www-data storage bootstrap/cache database \
    && find storage -type d -exec chmod 775 {} \; \
    && find storage -type f -exec chmod 664 {} \; \
    && chmod -R 775 bootstrap/cache \
    && if [ -f database/database.sqlite ]; then chmod 664 database/database.sqlite; fi

# Entrypoint: tareas de descubrimiento y optimización condicional
COPY <<'EOF' /usr/local/bin/docker-entrypoint.sh
#!/usr/bin/env bash
set -e

# Creamos .env temporal si no existe para permitir artisan en contenedores efímeros
if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

# Siempre regeneramos manifests para evitar referencias a dev providers
rm -f bootstrap/cache/packages.php bootstrap/cache/services.php 2>/dev/null || true
php artisan package:discover --ansi || echo "[entrypoint] Advertencia: package:discover falló (continuando)."

# Ejecutar migraciones si se solicita explícitamente
if [ "${RUN_MIGRATIONS}" = "true" ]; then
  echo "[entrypoint] migrate --force"
  php artisan migrate --force || echo "[entrypoint] Migraciones fallaron (continuando)."
fi

# Enlazar storage (idempotente)
if [ ! -L public/storage ]; then
  php artisan storage:link 2>/dev/null || true
fi

# Avisar si falta APP_KEY
if ! grep -q '^APP_KEY=' .env 2>/dev/null && [ -z "${APP_KEY}" ]; then
  echo "[entrypoint] ADVERTENCIA: Falta APP_KEY. Genera una con: docker exec -it $HOSTNAME php artisan key:generate"
fi

# Optimización en arranque (se puede desactivar con OPTIMIZE_ON_STARTUP=false)
if [ "${OPTIMIZE_ON_STARTUP}" = "true" ]; then
  echo "[entrypoint] Optimización de caches (config, route, view, event)"
  php artisan config:cache --ansi || true
  php artisan route:cache --ansi || true
  php artisan view:cache --ansi || true
  php artisan event:cache --ansi || true
fi

exec apache2-foreground
EOF

RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -fsS http://localhost/ || exit 1

EXPOSE 80

# USO RÁPIDO:
# docker build -t casanare-portal .
# docker run -d --name portal -p 8080:80 \
#   -e APP_KEY=base64:XXXXXXXXXXXXXXX= \
#   -e APP_URL=http://localhost:8080 \
#   casanare-portal
