# ------------------------------------------------------------
# Stage 1: PHP base (FPM) con extensiones requeridas (sin SQLite)
# ------------------------------------------------------------
FROM php:8.4-fpm-alpine AS php-base

ENV PHP_MEMORY_LIMIT=512M \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0 \
    PHP_OPCACHE_MAX_ACCELERATED_FILES=20000 \
    APP_ENV=production \
    APP_DEBUG=false \
    OPTIMIZE_ON_STARTUP=true

RUN set -eux; \
    apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev oniguruma-dev libpq-dev curl-dev; \
    apk add --no-cache git unzip bash icu-libs libzip oniguruma libpq curl nginx curl; \
    docker-php-ext-configure intl; \
    docker-php-ext-install -j"$(nproc)" intl zip pdo_mysql pdo_pgsql bcmath mbstring opcache; \
    { \
      echo 'opcache.enable=1'; \
      echo 'opcache.enable_cli=1'; \
      echo 'opcache.memory_consumption=256'; \
      echo 'opcache.interned_strings_buffer=16'; \
      echo 'opcache.max_accelerated_files='${PHP_OPCACHE_MAX_ACCELERATED_FILES}; \
      echo 'opcache.validate_timestamps='${PHP_OPCACHE_VALIDATE_TIMESTAMPS}; \
      echo 'opcache.save_comments=1'; \
      echo 'opcache.fast_shutdown=1'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini; \
    echo 'memory_limit='${PHP_MEMORY_LIMIT} > /usr/local/etc/php/conf.d/memory-limit.ini; \
    apk del .build-deps; \
    rm -rf /tmp/* /var/cache/apk/*

WORKDIR /var/www/html

# ------------------------------------------------------------
# Stage 2: Vendor (Composer install sin dev)
# ------------------------------------------------------------
FROM php-base AS vendor
ENV COMPOSER_ALLOW_SUPERUSER=1 COMPOSER_NO_INTERACTION=1
RUN set -eux; php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"; php composer-setup.php --install-dir=/usr/local/bin --filename=composer; rm composer-setup.php
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-progress --no-scripts --prefer-dist --optimize-autoloader

# ------------------------------------------------------------
# Stage 3: Assets (Node / Vite + Inertia)
# ------------------------------------------------------------
FROM node:20-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
COPY vite.config.ts tsconfig.json ./
COPY components.json* ./
COPY resources ./resources
COPY public ./public
ENV BUILD_WAYFINDER_TYPES=0
RUN npm run build

# ------------------------------------------------------------
# Stage 4: Runtime final (PHP-FPM + Nginx)
# ------------------------------------------------------------
FROM php-base AS runtime

# Crear usuario no root
RUN set -eux; addgroup -g 1000 -S www || true; adduser -S -D -H -u 1000 -G www www || true

# nginx.conf completo con bloque http que incluye conf.d
COPY <<'NGINXMAIN' /etc/nginx/nginx.conf
user  www;  # Usuario definido
worker_processes auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;
    client_max_body_size 25M;

    # Logs (puedes redirigir a stdout/stderr)
    access_log /dev/stdout;
    error_log  /dev/stderr warn;

    include /etc/nginx/conf.d/*.conf;
}
NGINXMAIN

# Server block aislado
COPY <<'SERVERCONF' /etc/nginx/conf.d/app.conf
server {
    listen 80 default_server;
    server_name _;
    root /var/www/html/public;
    index index.php index.html;

    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;

    location /favicon.ico { try_files $uri /favicon.ico =204; }
    location /robots.txt  { try_files $uri /robots.txt  =404; }

    location /storage/ {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        fastcgi_read_timeout 60s;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~* \.(?:css|js|mjs|jpg|jpeg|png|gif|svg|webp|ico|woff2?)$ {
        try_files $uri /index.php?$query_string;
        expires 7d;
        access_log off;
    }
}
SERVERCONF

# Copiar código fuente y artefactos
COPY . ./
RUN rm -f bootstrap/cache/*.php || true
COPY --from=vendor /var/www/html/vendor ./vendor
COPY --from=vendor /var/www/html/composer.lock ./composer.lock
COPY --from=assets /app/public/build ./public/build

# Permisos
RUN chown -R www:www storage bootstrap/cache database public \
    && find storage -type d -exec chmod 775 {} \; \
    && find storage -type f -exec chmod 664 {} \; \
    && chmod -R 775 bootstrap/cache \
    && if [ -f database/database.sqlite ]; then chmod 664 database/database.sqlite; fi

# Ajustes php-fpm
RUN sed -i 's/^;clear_env = no/clear_env = no/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^user = www-data/user = www/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^group = www-data/group = www/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^;pm.max_children = 5/pm.max_children = 20/' /usr/local/etc/php-fpm.d/www.conf || true

# Entrypoint
COPY <<'ENTRYPOINT' /usr/local/bin/docker-entrypoint.sh
#!/usr/bin/env bash
set -e
cd /var/www/html

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

rm -f bootstrap/cache/packages.php bootstrap/cache/services.php 2>/dev/null || true
php artisan package:discover --ansi || echo "[entrypoint] WARN: package:discover falló (continuando)"

if [ ! -L public/storage ]; then
  php artisan storage:link 2>/dev/null || true
fi

if ! grep -q '^APP_KEY=' .env 2>/dev/null && [ -z "${APP_KEY}" ]; then
  echo "[entrypoint] ADVERTENCIA: Falta APP_KEY. Genera una con: docker exec -it $HOSTNAME php artisan key:generate"
fi

if [ "${RUN_MIGRATIONS}" = "true" ]; then
  echo "[entrypoint] Ejecutando migraciones"
  php artisan migrate --force || echo "[entrypoint] WARN: migraciones fallaron"
fi

if [ "${OPTIMIZE_ON_STARTUP}" = "true" ]; then
  echo "[entrypoint] Cacheando config/rutas/vistas/eventos"
  php artisan config:cache --ansi || true
  php artisan route:cache --ansi || true
  php artisan view:cache --ansi || true
  php artisan event:cache --ansi || true
fi

php-fpm -D
exec nginx -g 'daemon off;'
ENTRYPOINT

RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -fsS http://localhost/ || exit 1
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# USO:
# docker build -t casanare-portal:php84-fpm .
# docker run -d --name portal -p 8080:80 \
#   -e APP_KEY=base64:XXXX...= \
#   -e APP_URL=https://tu-dominio \
#   casanare-portal:php84-fpm
