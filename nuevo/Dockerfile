# --- ETAPA 1: Builder Unificado (PHP + Node.js) ---
FROM php:8.3-fpm-alpine AS builder

# Instalamos dependencias del sistema
RUN apk add --no-cache \
    $PHPIZE_DEPS \
    linux-headers \
    libzip-dev \
    libpng-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    oniguruma-dev \
    zlib-dev \
    git \
    unzip \
    nodejs \
    npm

# Instalamos las extensiones de PHP
RUN docker-php-ext-install pdo_mysql zip gd exif pcntl bcmath sockets

# Instalamos Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos todos los archivos de la aplicación
COPY --chown=www-data:www-data . .

# Asignamos la propiedad del directorio de trabajo al usuario www-data
RUN chown www-data:www-data /app

# Instalamos dependencias de Composer (backend)
USER www-data
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Instalamos dependencias de NPM y compilamos los assets (frontend)
RUN npm install
RUN npm run build
USER root

# Optimizamos Laravel para producción
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

# --- ETAPA 2: Imagen Final de Producción ---
FROM php:8.3-fpm-alpine

WORKDIR /var/www

# Instalamos las dependencias de desarrollo, compilamos extensiones y luego las limpiamos
RUN apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        linux-headers \
        libzip-dev \
        libpng-dev \
        freetype-dev \
        libjpeg-turbo-dev \
        oniguruma-dev \
    && apk add --no-cache libzip libpng freetype libjpeg-turbo oniguruma \
    && docker-php-ext-install pdo_mysql zip gd exif pcntl bcmath sockets \
    && apk del .build-deps

# Instalamos Supervisor y Nginx
RUN apk add --no-cache supervisor nginx

# Copiamos la configuración de Nginx y Supervisor
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copiamos la aplicación ya construida desde la etapa builder
COPY --from=builder --chown=www-data:www-data /app .

# Asignamos los permisos correctos para Laravel
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Exponemos el puerto 80
EXPOSE 80

# Comando para iniciar Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
