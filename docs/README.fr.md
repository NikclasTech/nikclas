# Nikclas

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](../LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178FC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pricing: LiteLLM](https://img.shields.io/badge/Pricing-LiteLLM_API-4DE3FF)](https://api.litellm.ai/)

<img width="600" src="../public/banner.png" alt="Banniere Nikclas" />

**Arretez de surpayer vos tokens.** Nikclas compare les prix par million
de tokens ($/1M) des modeles d'IA de pointe pour livrer la meme qualite
a moindre cout.

Lire dans : [English](../README.md) | [Espanol](README.es.md) |
[Deutsch](README.de.md) | [中文](README.zh.md)

## Sommaire

- [1. Apercu](#1-apercu)
- [2. Fonctionnalites](#2-fonctionnalites)
- [3. Stack technique](#3-stack-technique)
- [4. Structure du projet](#4-structure-du-projet)
- [5. Demarrage](#5-demarrage)
- [6. Donnees tarifaires](#6-donnees-tarifaires)
- [7. Scripts disponibles](#7-scripts-disponibles)
- [8. Licence](#8-licence)

## 1. Apercu

Nikclas est une application React monopage qui repond a une question :
quel modele d'IA fait le meme travail pour le moins cher ?

Elle s'ouvre sur un hero de these (tableau des prix en direct trie par
$/1M en entree) puis propose un comparateur en face a face : choisissez
un fournisseur et un modele de chaque cote, visualisez l'ecart de prix
et recevez un verdict avec l'economie exacte par million de tokens
d'entree.

Tous les prix sont charges en direct depuis l'
[API du catalogue LiteLLM](https://api.litellm.ai/).

## 2. Fonctionnalites

- **Tableau des prix en direct** — les 4 modeles phares les plus
  utilises (`gpt-4o-mini`, `gpt-4o`, `claude-sonnet-4-6`,
  `deepseek-chat`), tries par $/1M en entree avec barres en echelle
  logarithmique, etiquettes `BEST` / `AVOID` et indicateur de statut en
  direct / synchronisation / cache.
- **Comparateur en face a face** — selecteurs de fournisseur et de
  modele des deux cotes, bouton d'echange, fiches par modele (entree,
  sortie, contexte, vitesse, capacites developpeur), liens officiels
  vers le fournisseur, lecture centrale de l'economie et verdict en
  langage clair.
- **Calculateur mensuel** — saisissez les M tokens mensuels d'entree et
  de sortie (ou un preset) et voyez la facture mensuelle et quotidienne
  par modele avec le classement complet, du moins cher au plus cher.
- **Prix en direct avec repli honnete** — les prix sont demandes a
  `https://api.litellm.ai/model_catalog/{model_id}`, mis en cache dans
  `localStorage` pendant 24h, avec repli sur un instantane integre
  (verifie le 2026-09-22) hors ligne. L'interface indique toujours la
  source affichee.
- **Identite visuelle tech** — typographie d'affichage Chakra Petch,
  texte courant Inter, donnees en JetBrains Mono ; theme bleu nuit facon
  plan technique avec accents cyan (calcul) et ambre (economies).
- **Accessible par defaut** — reperes semantiques, controles de
  formulaire etiquetes, focus clavier visible, regions live pour les
  prix et prise en charge de `prefers-reduced-motion`.

## 3. Stack technique

| Couche  | Technologie                       |
| ------- | --------------------------------- |
| UI      | React 19 + TypeScript             |
| Build   | Vite 8                            |
| Styles  | Tailwind CSS 4                    |
| Polices | Chakra Petch, Inter, JetBrains Mono (Google Fonts) |
| Donnees | API du catalogue LiteLLM (`api.litellm.ai`) |
| Lint    | ESLint + typescript-eslint        |

Aucun backend requis. L'application est un build statique qui appelle
l'API publique de prix directement depuis le navigateur.

## 4. Structure du projet

```text
.
├── components/
│   ├── hero/
│   │   ├── HeroSection.tsx    # These, CTAs, stats + mise en page
│   │   └── PriceBoard.tsx     # Console du tableau des prix
│   └── compare/
│       ├── CompareSection.tsx # Etat, calcul de l'economie, verdict
│       ├── CompareForm.tsx    # Selecteurs fournisseur et modele, echange
│       └── ModelCard.tsx      # Fiche modele
├── src/
│   ├── lib/
│   │   ├── litellm.ts         # Catalogue, client API, cache, hook
│   │   └── format.ts          # Formatage, libelles, echelles
│   ├── App.tsx                # Compose HeroSection + CompareSection
│   ├── main.tsx               # Point d'entree React
│   └── index.css              # Theme Tailwind, polices, animations
├── docs/
│   ├── README.es.md           # Traduction espagnole
│   ├── README.fr.md           # Traduction francaise
│   ├── README.de.md           # Traduction allemande
│   └── README.zh.md           # Traduction chinoise
├── public/                    # Actifs statiques (banniere, favicon, icones)
├── index.html                 # Polices, meta, titre
└── LICENSE                    # Licence publique generale GNU v3.0
```

## 5. Demarrage

### Prerequis

- Bun 1.2+.

### Installation

```bash
bun install
```

### Serveur de developpement

```bash
bun run dev
```

Ouvrez http://localhost:5173/ dans votre navigateur.

### Build de production

```bash
bun run build
bun run preview
```

`bun run build` verifie les types (`tsc -b`) et genere le site statique
dans `dist/`, deployable sur n'importe quel hebergeur statique.

## 6. Donnees tarifaires

### Source

`GET https://api.litellm.ai/model_catalog/{model_id}` renvoie les couts
par token (`input_cost_per_token`, `output_cost_per_token`).
L'application les multiplie par 1 000 000 pour afficher des $/1M et lit
`max_input_tokens` pour la fenetre de contexte. Les metadonnees sont
reactualisees depuis le catalogue LiteLLM a chaque chargement
(requetes dedupliquees, puis cache 24h).

Le plan gratuit de l'API autorise 100 requetes/jour par IP sans cle ; un
chargement complet du catalogue de 15 modeles utilise 15 requetes.

### Limite connue : CORS

`api.litellm.ai` n'envoie pas l'en-tete `Access-Control-Allow-Origin`
(verifie avec et sans en-tete `Origin` ; `OPTIONS` renvoie 405), donc
les navigateurs peuvent bloquer la reponse en direct. Dans ce cas
l'application affiche l'instantane integre en l'etiquetant comme cache.
Servir l'application derriere votre propre backend ou proxy qui relaie
vers `api.litellm.ai` restaure les donnees en direct sans changer aucun
composant.

### Instantane integre (verifie le 2026-09-22, $/1M)

| Modele | Fournisseur | Entree | Sortie | Contexte |
| ------ | ----------- | ------ | ------ | -------- |
| gpt-4o-mini | OpenAI | $0.15 | $0.60 | 128k |
| deepseek-chat | DeepSeek | $0.28 | $0.42 | 131k |
| deepseek-v4-flash | DeepSeek | $0.30 | $1.20 | 1M |
| deepinfra/nvidia/Llama-3.1-Nemotron-70B-Instruct | NVIDIA | $0.60 | $0.60 | 131k |
| gemini-2.5-flash-lite | Google | $0.10 | $0.40 | 1M |
| gpt-5.6-luna | OpenAI | $0.20 | $1.20 | 922k |
| zai/glm-5.3 | z.ai | $1.40 | $4.40 | 1M |
| qwencloud/qwen-max | Qwen | $1.60 | $6.40 | 31k |
| xai/grok-4.5 | xAI | $2.00 | $6.00 | 500k |
| gpt-4o | OpenAI | $2.50 | $10.00 | 128k |
| claude-sonnet-4-6 | Anthropic | $3.00 | $15.00 | 1M |
| moonshot/kimi-k3 | Kimi | $3.00 | $15.00 | 1M |
| claude-fable-5-1 | Anthropic | $10.00 | $50.00 | 1M |
| gpt-6-astra | OpenAI | $10.00 | $50.00 | 922k |
| claude-opus-5 | Anthropic | $5.00 | $25.00 | 1M |

Les vitesses medianes des fiches sont des valeurs statiques
indicatives ; prix et contexte sont les champs en direct.

### Mises a jour automatiques

Pas de base de donnees : `data/pricing.json` est le jeu actuel et
`git log -- data/pricing.json` en est l'historique. Toutes les 6 heures
le workflow `pricing-update` execute le collector, valide et ouvre une
pull request en cas de changement (jamais d'ecriture directe sur
`main`) ; les bonds de 3x ou plus sont marques `[possible-anomaly]`.
Voir [CONTRIBUTING.md](../CONTRIBUTING.md) pour contribuer, y compris
l'ajout d'un fournisseur.

## 7. Scripts disponibles

| Commande        | Description                              |
| --------------- | ---------------------------------------- |
| `bun run dev`     | Demarre le serveur de developpement Vite |
| `bun run build`   | Verifie les types et build la production |
| `bun run preview` | Previsualise le build localement         |
| `bun run lint`    | Execute ESLint sur le projet             |

## 8. Licence

Ce projet est sous **Licence publique generale GNU v3.0 ou ulterieure
(GPLv3+)**. Voir [LICENSE](../LICENSE) pour le texte complet.

Vous etes libre d'executer, d'etudier, de partager et de modifier ce
logiciel, a condition que toute oeuvre distribuee conserve la meme
licence et que son code source reste disponible.
