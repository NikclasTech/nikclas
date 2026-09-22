# Nikclas

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](../LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178FC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pricing: LiteLLM](https://img.shields.io/badge/Pricing-LiteLLM_API-4DE3FF)](https://api.litellm.ai/)

<img width="600" src="../public/banner.png" alt="Nikclas-Banner" />

**Hoehren Sie auf, zu viel fuer Tokens zu zahlen.** Nikclas vergleicht
Preise pro Million Tokens ($/1M) fuehrender KI-Modelle, damit Sie
dieselbe Qualitaet guenstiger liefern.

Lesen auf: [English](../README.md) | [Espanol](README.es.md) |
[Francais](README.fr.md) | [中文](README.zh.md)

## Inhalt

- [1. Ueberblick](#1-ueberblick)
- [2. Funktionen](#2-funktionen)
- [3. Tech-Stack](#3-tech-stack)
- [4. Projektstruktur](#4-projektstruktur)
- [5. Erste Schritte](#5-erste-schritte)
- [6. Preisdaten](#6-preisdaten)
- [7. Verfuegbare Skripte](#7-verfuegbare-skripte)
- [8. Lizenz](#8-lizenz)

## 1. Ueberblick

Nikclas ist eine einseitige React-Anwendung, die eine Frage beantwortet:
Welches KI-Modell erledigt dieselbe Aufgabe am guenstigsten?

Sie beginnt mit einem Thesen-Hero (Live-Preistafel, sortiert nach
Input-$/1M) und setzt sich mit einem Kopf-an-Kopf-Vergleich fort:
Anbieter und Modell auf jeder Seite waehlen, Preisabstand sehen und ein
Urteil mit der exakten Ersparnis pro 1M Input-Tokens erhalten.

Alle Preise werden live von der
[LiteLLM-Modellkatalog-API](https://api.litellm.ai/) geladen.

## 2. Funktionen

- **Live-Preistafel** — die 4 meistgenutzten Flaggschiff-Modelle
  (`gpt-4o-mini`, `gpt-4o`, `claude-sonnet-4-6`, `deepseek-chat`),
  sortiert nach Input-$/1M mit Balken in Log-Skala, `BEST`- / `AVOID`-
  Markierungen und Statusanzeige live / synchronisiert / Cache.
- **Kopf-an-Kopf-Vergleich** — Anbieter- und Modellauswahl auf beiden
  Seiten, Tausch-Button, Datenblaetter pro Modell (Input, Output,
  Kontext, Tempo), zentrale Ersparnisanzeige und Urteil in klarer
  Sprache.
- **Live-Preise mit ehrlichem Fallback** — Preise werden von
  `https://api.litellm.ai/model_catalog/{model_id}` abgefragt, 24h in
  `localStorage` gecacht, mit gebuendeltem Snapshot (verifiziert am
  2026-09-22) als Rueckfall. Die UI nennt stets die angezeigte Quelle.
- **Tech-Identitaet** — Display-Schrift Chakra Petch, Fliesstext Inter,
  Daten in JetBrains Mono; Tiefblau-Blueprint-Theme mit Signal-Cyan
  (Compute) und Amber (Ersparnis).
- **Standardmaessig barrierearm** — semantische Landmarken, gelabelte
  Formulare, sichtbarer Tastaturfokus, Live-Regionen fuer Preise und
  `prefers-reduced-motion`-Unterstuetzung.

## 3. Tech-Stack

| Ebene   | Technologie                       |
| ------- | --------------------------------- |
| UI      | React 19 + TypeScript             |
| Build   | Vite 8                            |
| Styling | Tailwind CSS 4                    |
| Fonts   | Chakra Petch, Inter, JetBrains Mono (Google Fonts) |
| Daten   | LiteLLM-Modellkatalog-API (`api.litellm.ai`) |
| Lint    | ESLint + typescript-eslint        |

Kein Backend noetig. Die App ist ein statischer Build, der die
oeffentliche Preis-API direkt aus dem Browser aufruft.

## 4. Projektstruktur

```text
.
├── components/
│   ├── hero/
│   │   ├── HeroSection.tsx    # These, CTAs, Kennzahlen + Layout
│   │   └── PriceBoard.tsx     # Live-Preistafel-Konsole
│   └── compare/
│       ├── CompareSection.tsx # State, Ersparnis-Mathe, Urteil
│       ├── CompareForm.tsx    # Anbieter- + Modellauswahl, Swap
│       └── ModelCard.tsx      # Modell-Datenblatt
├── src/
│   ├── lib/
│   │   ├── litellm.ts         # Katalog, API-Client, Cache, Hook
│   │   └── format.ts          # Formatierung, Labels, Skalen
│   ├── App.tsx                # Komponiert HeroSection + CompareSection
│   ├── main.tsx               # React-Einstiegspunkt
│   └── index.css              # Tailwind-Theme, Fonts, Animationen
├── docs/
│   ├── README.es.md           # Spanische Uebersetzung
│   ├── README.fr.md           # Franzoesische Uebersetzung
│   ├── README.de.md           # Deutsche Uebersetzung
│   └── README.zh.md           # Chinesische Uebersetzung
├── public/                    # Statische Assets (Banner, Favicon, Icons)
├── index.html                 # Fonts, Meta, Titel
└── LICENSE                    # GNU General Public License v3.0
```

## 5. Erste Schritte

### Voraussetzungen

- Node.js 20+ und npm.

### Installation

```bash
npm install
```

### Dev-Server

```bash
npm run dev
```

http://localhost:5173/ im Browser oeffnen.

### Produktions-Build

```bash
npm run build
npm run preview
```

`npm run build` prueft Typen (`tsc -b`) und erzeugt die statische Seite
in `dist/`, ablegbar auf jedem Static-Hoster.

## 6. Preisdaten

### Quelle

`GET https://api.litellm.ai/model_catalog/{model_id}` liefert Kosten
pro Token (`input_cost_per_token`, `output_cost_per_token`). Die App
multipliziert mit 1.000.000 fuer $/1M und liest `max_input_tokens` fuer
das Kontextfenster. Die Metadaten werden bei jedem Laden aus dem
LiteLLM-Katalog aktualisiert (dedupliziert, dann 24h Cache).

Der API-Free-Tier erlaubt 100 Requests/Tag pro IP ohne Key; ein
kompletter Ladevorgang des 13-Modelle-Katalogs kostet 13 Requests.

### Bekannte Einschraenkung: CORS

`api.litellm.ai` sendet keinen `Access-Control-Allow-Origin`-Header
(mit und ohne `Origin`-Header verifiziert; `OPTIONS` antwortet 405),
daher blockieren Browser ggf. die Live-Antwort. Dann zeigt die App den
gebuendelten Snapshot und kennzeichnet ihn als Cache. Wer die App hinter
einem eigenen Backend oder Proxy betreibt, das an `api.litellm.ai`
weiterleitet, erhaelt Live-Daten ohne eine Komponente zu aendern.

### Gebuendelter Snapshot (verifiziert 2026-09-22, $/1M)

| Modell | Anbieter | Input | Output | Kontext |
| ------ | -------- | ----- | ------ | ------- |
| gpt-4o-mini | OpenAI | $0.15 | $0.60 | 128k |
| deepseek-chat | DeepSeek | $0.28 | $0.42 | 131k |
| deepseek-v4-flash | DeepSeek | $0.30 | $1.20 | 1M |
| gemini-2.5-flash-lite | Google | $0.10 | $0.40 | 1M |
| gpt-5.6-luna | OpenAI | $0.20 | $1.20 | 922k |
| zai/glm-5.3 | z.ai | $1.40 | $4.40 | 1M |
| xai/grok-4.5 | xAI | $2.00 | $6.00 | 500k |
| gpt-4o | OpenAI | $2.50 | $10.00 | 128k |
| claude-sonnet-4-6 | Anthropic | $3.00 | $15.00 | 1M |
| moonshot/kimi-k3 | Kimi | $3.00 | $15.00 | 1M |
| claude-fable-5-1 | Anthropic | $10.00 | $50.00 | 1M |
| gpt-6-astra | OpenAI | $10.00 | $50.00 | 922k |
| claude-opus-4-1 | Anthropic | $15.00 | $75.00 | 200k |

Die Median-Tempi auf den Karten sind statische Richtwerte; Preise und
Kontext sind die Live-Felder.

## 7. Verfuegbare Skripte

| Befehl          | Beschreibung                             |
| --------------- | ---------------------------------------- |
| `npm run dev`     | Vite-Dev-Server starten                  |
| `npm run build`   | Typen pruefen und Produktion bauen       |
| `npm run preview` | Produktions-Build lokal ansehen          |
| `npm run lint`    | ESLint ueber das Projekt laufen lassen   |

## 8. Lizenz

Dieses Projekt steht unter der **GNU General Public License v3.0 oder
spaeter (GPLv3+)**. Volltext siehe [LICENSE](../LICENSE).

Sie duerfen diese Software ausfuehren, untersuchen, teilen und aendern,
sofern jedes verteilte Werk unter derselben Lizenz bleibt und sein
Quellcode verfuegbar ist.
