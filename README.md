# Eco-Bliss-Bath-Test

Projet de tests automatisés réalisé avec Cypress dans le cadre de la formation Testeur Logiciel d'OpenClassrooms.

Ce dépôt contient uniquement les tests. L'application web EcoBlissBath est fournie séparément et doit être exécutée indépendamment.

## 1. Prérequis

- Node.js et npm
- Docker Desktop (pour le backend de l'application)
- Le projet web EcoBlissBath, installé et fonctionnel

L'environnement de test utilise les adresses suivantes :


Frontend Angular : http://localhost:4200 

Backend API : http://localhost:8081 

Ces adresses sont configurées dans `cypress.config.js`.

## 2. Installation

Cloner ce dépôt Git, puis ouvrir un terminal à sa racine.

Installer les dépendances du projet :

```bash
npm install
```

Si l'exécutable Cypress n'a pas été téléchargé automatiquement, exécuter :

```bash
npx cypress install
```

Pour vérifier l'installation :

```bash
npx cypress verify
```

## 3. Configuration

Le projet utilise un fichier `cypress.env.json` pour centraliser les paramètres d'environnement et les jeux de données des tests.

1. À la racine du projet, copier le fichier `cypress.env.example.json`.
2. Renommer la copie en `cypress.env.json`.
3. Renseigner les identifiants d'un compte utilisateur de test existant (`testEmail` et `testPassword`).
4. Adapter si nécessaire les URL du frontend et de l'API, ainsi que les identifiants des produits et les autres données de test.

Le fichier `cypress.env.json` est exclu du dépôt Git via `.gitignore`, afin de ne pas exposer les identifiants.
Le fichier `cypress.env.example.json` est quant à lui versionné et sert de modèle de configuration pour reproduire l'environnement de test.


## 4. Exécution des tests

Avant de lancer les tests, s'assurer que le frontend et le backend EcoBlissBath sont démarrés et accessibles.

Depuis la racine du projet :

```bash
npx cypress open
```

Ou utiliser le raccourci npm configuré :

```bash
npm test
```

Cypress ouvre son interface graphique. Sélectionner **E2E Testing**, puis un navigateur, et lancer les fichiers de tests souhaités.

Pour exécuter les tests directement depuis le terminal :

```bash
npx cypress run
```

Il est également possible de sélectionner un navigateur avec l'option `--browser chrome` ou `--browser firefox`.

## 5. Organisation des tests

Les tests sont regroupés dans le dossier `cypress/e2e/` :

- **Tests API** : vérification des endpoints et des réponses HTTP.
- **Smoke tests** : vérification rapide des fonctionnalités essentielles.
- **Tests fonctionnels** : scénarios d'authentification et de gestion du panier.
- **Tests de sécurité** : recherche de vulnérabilités XSS.

Les fonctions utilitaires et les sélecteurs réutilisables sont regroupés dans `cypress/support/tools.js`.

## 6. Informations complémentaires

Certains tests créent ou modifient des données dans l'application (comptes utilisateurs, avis, commandes).

Il est recommandé d'exécuter cette campagne sur un environnement de test dédié, avec des données pouvant être réinitialisées si nécessaire.