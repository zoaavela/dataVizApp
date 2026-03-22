# \# Vizion — Dashboard INSEE Logements Sociaux

# 

# > Visualisation interactive des données INSEE sur les logements sociaux en France.

# 

# \*\*Application en ligne\*\* : \[vizion.ct.ws](https://vizion.ct.ws/)

# 

# \---

# 

# \## Sommaire

# 

# \- \[À propos](#-à-propos)

# \- \[Fonctionnalités](#-fonctionnalités)

# \- \[Architecture](#-architecture)

# \- \[Stack technique](#-stack-technique)

# \- \[Prérequis](#-prérequis)

# \- \[Installation locale](#-installation-locale)

# \- \[Variables d'environnement](#-variables-denvironnement)

# \- \[Déploiement en production](#-déploiement-en-production)

# \- \[Rôles \& authentification](#-rôles--authentification)

# \- \[Structure du projet](#-structure-du-projet)

# 

# \---

# 

# \## À propos

# 

# \*\*Vizion\*\* est un dashboard web permettant d'explorer et de visualiser les données de l'INSEE relatives aux logements sociaux en France. Les données sont issues de fichiers CSV officiels et exposées via une API REST, puis affichées sous forme de graphiques et tableaux interactifs dans une interface Vue.js.

# 

# \---

# 

# \## Fonctionnalités

# 

# \- 📊 Visualisation de données INSEE sur les logements sociaux (graphiques, tableaux)

# \- 📁 Lecture et traitement de fichiers CSV

# \- 🔍 Exploration et filtrage des données

# \- 🔐 Gestion de rôles : accès public, ADMIN et SUPER ADMIN

# \- 🔄 CI/CD automatisé via GitHub Actions

# 

# \---

# 

# \## Architecture

# 

# ```

# ┌──────────────────────────────────────────────────────┐

# │                    UTILISATEUR                        │

# └───────────────────────┬──────────────────────────────┘

# &#x20;                       │ HTTPS

# &#x20;         ┌─────────────▼──────────────┐

# &#x20;         │      FRONT — Vue.js        │

# &#x20;         │   Hébergé sur GitHub Pages │

# &#x20;         │   (déployé via Actions)    │

# &#x20;         └─────────────┬──────────────┘

# &#x20;                       │ REST API (JSON)

# &#x20;         ┌─────────────▼──────────────┐

# &#x20;         │      BACK — Symfony        │

# &#x20;         │   Hébergé sur Alwaysdata   │

# &#x20;         │   PHP + MySQL              │

# &#x20;         └─────────────┬──────────────┘

# &#x20;                       │

# &#x20;         ┌─────────────▼──────────────┐

# &#x20;         │       Base de données      │

# &#x20;         │          MySQL             │

# &#x20;         │  (données issues des CSV)  │

# &#x20;         └────────────────────────────┘

# ```

# 

# \- Le \*\*front\*\* est une SPA Vue.js, buildée et déployée automatiquement sur \*\*GitHub Pages\*\* via un workflow GitHub Actions.

# \- Le \*\*back\*\* est une API REST construite avec \*\*Symfony\*\*, hébergée sur \*\*Alwaysdata\*\*, configurée via SSH.

# \- Les données CSV de l'INSEE sont importées et stockées en \*\*MySQL\*\*.

# \- Le dossier `shared` contient les types et structures partagés entre le front et le back.

# 

# \---

# 

# \## Stack technique

# 

# | Couche | Technologie |

# |---|---|

# | Frontend | React |

# | Backend | PHP — Symfony |

# | Base de données | MySQL |

# | Authentification | JWT |

# | Hébergement front | GitHub Pages |

# | Hébergement back | Alwaysdata |

# | CI/CD | GitHub Actions |

# | Source des données | CSV INSEE |

# 

# \---

# 

# \## Prérequis

# 

# Avant d'installer le projet en local, assure-toi d'avoir :

# 

# \- \*\*Node.js\*\* ≥ 18 et \*\*npm\*\* ou \*\*yarn\*\*

# \- \*\*PHP\*\* ≥ 8.1

# \- \*\*Composer\*\*

# \- \*\*MySQL\*\* (ou MariaDB)

# \- \*\*Symfony CLI\*\* \*(optionnel mais recommandé)\*

# \- \*\*Git\*\*

# 

# \---

# 

# \## Installation locale

# 

# \### 1. Cloner le dépôt

# 

# ```bash

# git clone https://github.com/zoaavela/vision.git

# cd vision

# ```

# 

# \---

# 

# \### 2. Backend — Symfony (`/api`)

# 

# ```bash

# cd api

# 

# \# Installer les dépendances PHP

# composer install

# 

# \# Copier et configurer le fichier d'environnement

# cp .env .env.local

# \# → Renseigne ta connexion MySQL et ta clé JWT (voir section Variables d'environnement)

# 

# \# Créer la base de données

# php bin/console doctrine:database:create

# 

# \# Lancer les migrations

# php bin/console doctrine:migrations:migrate

# 

# \# Générer les clés JWT

# php bin/console lexik:jwt:generate-keypair

# 

# \# (Optionnel) Importer les données CSV

# php bin/console app:import-csv

# 

# \# Lancer le serveur Symfony

# symfony server:start

# \# ou sans Symfony CLI :

# php -S localhost:8000 -t public/

# ```

# 

# L'API sera accessible sur `http://localhost:8000`.

# 

# \---

# 

# \### 3. Frontend — Vue.js (`/vue`)

# 

# ```bash

# cd ../vue

# 

# \# Installer les dépendances

# npm install

# 

# \# Copier et configurer le fichier d'environnement

# cp .env.example .env.local

# \# → Renseigne l'URL de l'API (ex: http://localhost:8000)

# 

# \# Lancer le serveur de développement

# npm run dev

# ```

# 

# Le front sera accessible sur `http://localhost:5173` (ou le port affiché dans le terminal).

# 

# \---

# 

# \## Variables d'environnement

# 

# \### Backend (`api/.env.local`)

# 

# ```env

# \# Base de données

# DATABASE\_URL="mysql://utilisateur:motdepasse@127.0.0.1:3306/vizion"

# 

# \# JWT

# JWT\_SECRET\_KEY=%kernel.project\_dir%/config/jwt/private.pem

# JWT\_PUBLIC\_KEY=%kernel.project\_dir%/config/jwt/public.pem

# JWT\_PASSPHRASE=ta\_passphrase

# 

# APP\_ENV=dev

# APP\_SECRET=ta\_app\_secret

# ```

# 

# \### Frontend (`vue/.env.local`)

# 

# ```env

# VITE\_API\_URL=http://localhost:8000

# ```

# 

# \---

# 

# \## Déploiement en production

# 

# \### Frontend — GitHub Pages

# 

# Le front est déployé automatiquement via \*\*GitHub Actions\*\* à chaque push sur la branche `main`. Le workflow build le projet Vue.js et publie le résultat sur GitHub Pages.

# 

# Aucune action manuelle requise — il suffit de pousser les modifications.

# 

# \### Backend — Alwaysdata

# 

# Le backend Symfony est hébergé sur \*\*Alwaysdata\*\*. La configuration et les mises à jour se font via \*\*SSH\*\* :

# 

# ```bash

# ssh utilisateur@ssh-utilisateur.alwaysdata.net

# 

# cd /chemin/vers/api

# 

# git pull origin main

# composer install --no-dev --optimize-autoloader

# php bin/console doctrine:migrations:migrate --no-interaction

# php bin/console cache:clear --env=prod

# ```

# 

# > La base MySQL est gérée depuis le panel Alwaysdata ou via le client MySQL en SSH.

# 

# \---

# 

# \## Rôles \& authentification

# 

# | Rôle | Accès | Auth |

# |---|---|---|

# | \*\*Public\*\* | Consultation des dashboards et visualisations | Aucune |

# | \*\*ADMIN\*\* | Gestion des données, import CSV | JWT |

# | \*\*SUPER ADMIN\*\* | Gestion des utilisateurs et configuration | JWT |

# 

# Les tokens JWT sont générés à la connexion et doivent être envoyés dans le header `Authorization: Bearer <token>` pour les routes protégées.

# 

# \---

# 

# \## Structure du projet

# 

# ```

# vision/

# ├── api/                  # Backend Symfony (API REST)

# │   ├── src/

# │   │   ├── Controller/   # Endpoints de l'API

# │   │   ├── Entity/       # Entités Doctrine (MySQL)

# │   │   └── ...

# │   ├── config/

# │   ├── migrations/

# │   └── ...

# ├── vue/                  # Frontend Vue.js

# │   ├── src/

# │   │   ├── components/   # Composants Vue

# │   │   ├── views/        # Pages / routes

# │   │   └── ...

# │   └── ...

# ├── shared/               # Diagrammes / Gestion de Projet

# ├── .github/

# │   └── workflows/        # CI/CD GitHub Actions

# └── .gitignore

# ```

# 

# \---

# 

# \## Données

# 

# Les données proviennent des \*\*fichiers CSV publiés par l'INSEE\*\* sur les logements sociaux en France. Elles sont importées en base MySQL et exposées via l'API Symfony.

# 

# Source officielle : \[insee.fr](https://www.insee.fr)

