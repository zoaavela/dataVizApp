#!/bin/bash
set -e

echo "--- Vision — Démarrage de l'initialisation ---"

# -----------------------------------------------
# 1. Démarrer MySQL
# -----------------------------------------------
echo "[1/7] Démarrage de MySQL..."
mysqld_safe --bind-address=127.0.0.1 --port=3306 &

echo "  En attente de MySQL..."
until mysqladmin --socket=/var/run/mysqld/mysqld.sock ping --silent 2>/dev/null; do
    echo "  MySQL pas encore prêt, nouvelle tentative dans 1s..."
    sleep 1
done
echo "  MySQL prêt."

# -----------------------------------------------
# 2. Créer la base et l'utilisateur si besoin
# -----------------------------------------------
echo "[2/7] Initialisation de la base de données..."
mysql --socket=/var/run/mysqld/mysqld.sock -u root <<SQL
CREATE DATABASE IF NOT EXISTS vision CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'vision'@'%' IDENTIFIED BY 'vision';
GRANT ALL PRIVILEGES ON vision.* TO 'vision'@'%';
FLUSH PRIVILEGES;
SQL

# -----------------------------------------------
# 3. Migrations Symfony
# -----------------------------------------------
echo "[3/7] Lancement des migrations Symfony..."
cd /var/www/api
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

# -----------------------------------------------
# 4. Fixtures — users par défaut (seulement au premier démarrage)
# -----------------------------------------------
echo "[4/7] Chargement des utilisateurs par défaut..."
USER_COUNT=$(mysql --socket=/var/run/mysqld/mysqld.sock -u root -e "SELECT COUNT(*) FROM vision.user;" -s -N 2>/dev/null || echo "0")
if [ "$USER_COUNT" = "0" ]; then
    php bin/console doctrine:fixtures:load --no-interaction
    echo "  Utilisateurs par défaut créés."
else
    echo "  Des utilisateurs existent déjà, on passe."
fi

# -----------------------------------------------
# 5. Import des données CSV (seulement au premier démarrage)
# -----------------------------------------------
echo "[5/7] Import des données INSEE..."
DATA_COUNT=$(mysql --socket=/var/run/mysqld/mysqld.sock -u root -e "SELECT COUNT(*) FROM vision.territoire;" -s -N 2>/dev/null || echo "0")
if [ "$DATA_COUNT" = "0" ]; then
    php bin/console app:import-csv
    echo "  Données importées."
else
    echo "  Données déjà présentes, on passe."
fi

# -----------------------------------------------
# 6. Générer les clés JWT si elles n'existent pas
# -----------------------------------------------
echo "[6/7] Génération des clés JWT..."
if [ ! -f config/jwt/private.pem ]; then
    php bin/console lexik:jwt:generate-keypair --skip-if-exists
    echo "  Clés JWT générées."
else
    echo "  Clés JWT déjà présentes, on passe."
fi

# -----------------------------------------------
# 7. Cache Symfony
# -----------------------------------------------
echo "[7/7] Nettoyage du cache Symfony..."
php bin/console cache:clear --env=prod --no-debug

echo ""
echo "-----------------------------------------------"
echo "  Vision est pret !"
echo "  Frontend   -> http://localhost"
echo "  API        -> http://localhost:8000"
echo "  MySQL      -> localhost:3306  (vision / vision)"
echo ""
echo "  Comptes par defaut :"
echo "  ADMIN      -> admin@vision.fr / admin1234"
echo "  SUPERADMIN -> superadmin@vision.fr / superadmin1234"
echo "-----------------------------------------------"
echo ""

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
