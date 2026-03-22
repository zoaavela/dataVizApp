# =============================================================
# STAGE 1 — Build du frontend React
# =============================================================
FROM node:20-alpine AS front-builder

WORKDIR /app/vue

COPY vue/package*.json ./
RUN npm install

COPY vue/ .

ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# =============================================================
# STAGE 2 — Image finale : PHP + Nginx + MariaDB
# =============================================================
FROM php:8.4-fpm

# --- Outils système + extensions PHP ---
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    default-mysql-server \
    netcat-openbsd \
    git \
    unzip \
    libpng-dev \
    libonig-dev \
    libzip-dev \
    libxml2-dev \
    libicu-dev \
    curl \
    && docker-php-ext-install pdo pdo_mysql mbstring zip opcache intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# --- Composer ---
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# -----------------------------------------------
# Backend Symfony
# -----------------------------------------------
WORKDIR /var/www/api

COPY api/composer.json api/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

COPY api/ .
RUN composer dump-autoload --optimize

# -----------------------------------------------
# Frontend — copie du build React
# -----------------------------------------------
COPY --from=front-builder /app/vue/dist /var/www/front

# -----------------------------------------------
# Configuration Nginx
# -----------------------------------------------
COPY docker/nginx.conf /etc/nginx/sites-available/default

# -----------------------------------------------
# Supervisord
# -----------------------------------------------
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# -----------------------------------------------
# Script d'initialisation
# -----------------------------------------------
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 8000 3306

ENTRYPOINT ["/entrypoint.sh"]
