# ------------------------------------------------------------
# Etapa 1: Dependencias PHP (Composer) - misma versión PHP que runtime
# ------------------------------------------------------------
FROM composer:2.7-php8.2 AS vendor
WORKDIR /app

# Copiamos definición de dependencias primero para aprovechar cache
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-progress \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader

# ------------------------------------------------------------
# Etapa 2: Build de assets (Node / Vite)
# ------------------------------------------------------------
FROM node:20-alpine AS assets
WORKDIR /app

# Copiamos manifests de dependencias JS
COPY package.json package-lock.json* ./

# Instalación determinística si existe lockfile
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

# Archivos de configuración y fuentes necesarias para build
COPY vite.config.ts tsconfig.json ./
COPY resources ./resources
COPY public ./public

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
    PHP_OPCACHE_MAX_ACCELERATED_FILES=20000

RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip curl libzip-dev libicu-dev libpq-dev libonig-dev libxml2-dev sqlite3 \
    && docker-php-ext-install intl zip pdo_mysql pdo_sqlite bcmath \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

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

# Copiamos el código fuente (la .env real NO se copia porque estará ignorada en .dockerignore)
COPY . ./

COPY --from=vendor /app/vendor ./vendor
COPY --from=vendor /app/composer.lock ./composer.lock
COPY --from=assets /app/public/build ./public/build

RUN chown -R www-data:www-data storage bootstrap/cache database \
    && find storage -type d -exec chmod 775 {} \; \
    && find storage -type f -exec chmod 664 {} \; \
    && chmod -R 775 bootstrap/cache \
    && if [ -f database/database.sqlite ]; then chmod 664 database/database.sqlite; fi

COPY <<'EOF' /usr/local/bin/docker-entrypoint.sh
#!/usr/bin/env bash
set -e

if [ "${RUN_MIGRATIONS}" = "true" ]; then
  echo "[entrypoint] Ejecutando migraciones..."
  php artisan migrate --force || echo "[entrypoint] Migraciones fallaron (continuando)."
fi

if [ ! -L public/storage ]; then
  php artisan storage:link 2>/dev/null || true
fi

if ! grep -q '^APP_KEY=' .env 2>/dev/null && [ -z "${APP_KEY}" ]; then
  echo "[entrypoint] ADVERTENCIA: Falta APP_KEY. Genera una con: docker exec -it $HOSTNAME php artisan key:generate"
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
