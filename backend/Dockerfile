# ─────────────────────────────────────────
# PHP 8.4 FPM — Backend Symfony
# ─────────────────────────────────────────
FROM php:8.4-fpm-alpine

# Dépendances système (openssl requis pour la génération des clés JWT)
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    curl \
    openssl \
    icu-dev \
    libzip-dev \
    oniguruma-dev

# Extensions PHP nécessaires pour Symfony
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    zip \
    intl \
    opcache \
    bcmath

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copier uniquement les fichiers de dépendances d'abord (cache Docker)
COPY composer.json composer.lock ./

# Installer les dépendances sans autoloader (sera regénéré après COPY complet)
RUN composer install --no-scripts --no-autoloader --prefer-dist

# Copier le reste du projet
COPY . .

# Générer l'autoloader Symfony
RUN composer dump-autoload --optimize

# Permissions pour Symfony (var/ est dans .gitignore — on le crée avant chown)
RUN mkdir -p /var/www/html/var \
    && chown -R www-data:www-data /var/www/html/var \
    && chmod -R 775 /var/www/html/var

# Augmenter les limites d'upload PHP
RUN printf "upload_max_filesize = 64M\npost_max_size = 128M\nmax_file_uploads = 20\n" \
    > /usr/local/etc/php/conf.d/uploads.ini

# Entrypoint — génère les clés JWT au premier démarrage
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]
