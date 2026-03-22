# Vision — Dashboard INSEE Logements Sociaux

> Visualisation interactive des données INSEE sur les logements sociaux en France.

**Application en ligne** : [v1sion.pages.dev](https://v1sion.pages.dev)

---

## Sommaire

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation locale](#installation-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Déploiement en production](#déploiement-en-production)
- [Rôles et authentification](#rôles-et-authentification)
- [Structure du projet](#structure-du-projet)
- [Données](#données)

---

## À propos

**Vision** est un dashboard web permettant d'explorer et de visualiser les données de l'INSEE relatives aux logements sociaux en France. Les données sont issues de fichiers CSV officiels, stockées en base MySQL et exposées via une API REST Symfony. Le frontend React les restitue sous forme de graphiques et tableaux interactifs.

La version en ligne est hébergée sur un dépôt GitLab privé et déployée automatiquement via **Cloudflare Pages**.

---

## Fonctionnalités

- Visualisation de données INSEE sur les logements sociaux (graphiques, tableaux)
- Lecture et traitement de fichiers CSV
- Exploration et filtrage des données
- Gestion de rôles : accès public, ADMIN et SUPER ADMIN avec authentification JWT
- Environnement Docker pour tester l'application en local

---

## Architecture

```
┌─────────────────────────────────────┐
│            UTILISATEUR              │
└──────────────────┬──────────────────┘
                   │ HTTPS
     ┌─────────────▼─────────────┐
     │      FRONT — React        │
     │    Cloudflare Pages       │
     │  (dépôt GitLab privé)     │
     └─────────────┬─────────────┘
                   │ REST API (JSON)
     ┌─────────────▼─────────────┐
     │      BACK — Symfony       │
     │       Alwaysdata          │
     │       PHP + MySQL         │
     └─────────────┬─────────────┘
                   │
     ┌─────────────▼─────────────┐
     │      Base de données      │
     │          MySQL            │
     │  (données issues des CSV) │
     └───────────────────────────┘
```

- Le **front** est une SPA React hébergée sur **Cloudflare Pages**, déployée automatiquement depuis un dépôt GitLab privé.
- Le **back** est une API REST construite avec **Symfony**, hébergée sur **Alwaysdata**.
- Les données CSV de l'INSEE sont importées et stockées en **MySQL**.
- Le dossier `shared` contient les types et structures partagés entre le front et le back.
- Le dossier `docker` permet de faire tourner l'application complète en local.

---

## Stack technique

| Couche             | Technologie       |
|--------------------|-------------------|
| Frontend           | React / Vite      |
| Backend            | PHP / Symfony     |
| Base de données    | MySQL             |
| Authentification   | JWT               |
| Hébergement front  | Cloudflare Pages  |
| Hébergement back   | Alwaysdata        |
| CI/CD front        | GitLab + Cloudflare |
| Source des données | CSV INSEE         |

---

## Prérequis

### Avec Docker (recommandé)

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- C'est tout.

### Sans Docker

- **Node.js** >= 18 et **npm**
- **PHP** >= 8.4
- **Composer**
- **MySQL** (ou MariaDB)
- **Symfony CLI** *(optionnel mais recommandé)*
- **Git**

---

## Installation locale

### Méthode rapide — Docker

```bash
cd docker
docker compose up --build
```

L'application sera accessible sur `http://localhost` après quelques minutes. Voir le [README Docker](docker/README.md) pour plus de détails.

---

### Méthode manuelle

#### 1. Cloner le dépôt

```bash
git clone https://github.com/zoaavela/vision.git
cd vision
```

#### 2. Backend — Symfony (`/api`)

```bash
cd api

# Installer les dépendances PHP
composer install

# Copier et configurer le fichier d'environnement
cp .env .env.local

# Créer la base de données
php bin/console doctrine:database:create

# Lancer les migrations
php bin/console doctrine:migrations:migrate

# Générer les clés JWT
php bin/console lexik:jwt:generate-keypair

# Lancer le serveur Symfony
symfony server:start
```

L'API sera accessible sur `http://localhost:8000`.

#### 3. Frontend — React (`/vue`)

```bash
cd ../vue

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le front sera accessible sur `http://localhost:5173`.

---

## Variables d'environnement

### Backend — `api/.env.local`

```env
DATABASE_URL="mysql://utilisateur:motdepasse@127.0.0.1:3306/vision"

JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=ta_passphrase

APP_ENV=dev
APP_SECRET=ta_app_secret
```

### Frontend — `vue/.env.local`

```env
VITE_API_URL=http://localhost:8000
```

---

## Déploiement en production

### Frontend — Cloudflare Pages

Le front est hébergé sur un **dépôt GitLab privé** et déployé automatiquement sur **Cloudflare Pages** à chaque push sur la branche `main`.

URL de production : [v1sion.pages.dev](https://v1sion.pages.dev)

### Backend — Alwaysdata

Le backend Symfony est hébergé sur **Alwaysdata**. Les mises à jour se font via SSH :

```bash
ssh utilisateur@ssh-utilisateur.alwaysdata.net

cd /chemin/vers/api

git pull origin main
composer install --no-dev --optimize-autoloader
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console cache:clear --env=prod
```

---

## Rôles et authentification

| Rôle         | Accès                                         | Auth   |
|--------------|-----------------------------------------------|--------|
| Public       | Consultation des dashboards et visualisations | Aucune |
| ADMIN        | Gestion des données, import CSV               | JWT    |
| SUPER ADMIN  | Gestion des utilisateurs et configuration     | JWT    |

Les tokens JWT sont envoyés dans le header :

```
Authorization: Bearer <token>
```

---

## Structure du projet

```
vision/
├── api/                    # Backend Symfony (API REST)
│   ├── src/
│   │   ├── Controller/     # Endpoints de l'API
│   │   ├── Entity/         # Entités Doctrine (MySQL)
│   │   └── ...
│   ├── config/
│   ├── migrations/
│   └── ...
├── vue/                    # Frontend React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages / routes
│   │   └── ...
│   └── ...
├── shared/                 # Types et structures partagés front/back
├── docker/                 # Environnement Docker pour les tests locaux
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
├── .github/
│   └── workflows/          # CI/CD GitHub Actions
└── .gitignore
```

---

## Données

Les données proviennent des **fichiers CSV publiés par l'INSEE** sur les logements sociaux en France. Elles sont importées en base MySQL et exposées via l'API Symfony.

Source officielle : [insee.fr](https://www.insee.fr)
