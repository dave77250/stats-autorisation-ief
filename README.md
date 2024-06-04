# stats-autorisation-ief

Différentes DSDEN partagent leurs stats, chaque département indépendant des autres.
Heureusement les pages ont la même structure, et il est donc possible d'y récupérer des informations.
Cet outil permet de collecter les stats en question et de générer un fichier CSV, qui peut ensuite être importé dans Excel ou un outil de BI.

# Prérequis

Pour utiliser cet outil, il faut :
- NodeJS, téléchargeable gratuitement depuis https://nodejs.org/
- Un ordinateur (PC/Mac/Linux)
- Un peu de familiarité avec la ligne de commande

# Installation

Avant la première utilisation, il vous faut :
- télécharger les sources (depuis ici)
- ouvrir une ligne de commande, et vous placer dans le dossier contenant les sources
- exécuter la commande : npm install

# Utilisation

Depuis la ligne de commande, exécuter la commande: npm run start

L'outil générera alors un fichier stats-(date du jour).csv dans le dossier de l'outil.
