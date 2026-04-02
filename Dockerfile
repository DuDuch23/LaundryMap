FROM php:8.5-apache

# Installer les dépendances nécessaires pour PDO MySQL
RUN apt-get update && apt-get install -y libzip-dev && \
    docker-php-ext-install pdo pdo_mysql zip

# Copier le fichier de configuration Apache
COPY config/000-default.conf /etc/apache2/sites-available/000-default.conf

# Copier le contenu du dossier public vers le répertoire par défaut d'Apache
COPY public/ /var/www/html/

# Appliquer les permissions pour Apache
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html