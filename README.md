# Nikclas

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178FC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pricing: LiteLLM](https://img.shields.io/badge/Pricing-LiteLLM_API-4DE3FF)](https://api.litellm.ai/)

<img width="600" src="./public/banner.png" alt="Nikclas banner" />

**Stop overpaying for tokens.** Nikclas compares $/1M token prices across
frontier AI models so you can ship the same quality for less.

Read this in: [Espanol](docs/README.es.md) | [Francais](docs/README.fr.md) |
[Deutsch](docs/README.de.md) | [中文](docs/README.zh.md)

## Contents

- [1. Overview](#1-overview)
- [2. Features](#2-features)
- [3. Tech stack](#3-tech-stack)
- [4. Project structure](#4-project-structure)
- [5. Getting started](#5-getting-started)
- [6. Pricing data](#6-pricing-data)
- [7. Available scripts](#7-available-scripts)
- [8. License](#8-license)

## 1. Overview

Nikclas is a single-page React application that answers one question:
which AI model does the same job for the least money?

It opens with a thesis hero (live price board sorted by input $/1M) and
continues with a head-to-head comparator: pick a provider and a model on
each side, see the price gap, and get a verdict with the exact saving per
1M input tokens.

All prices load live from the
[LiteLLM Model Catalog API](https://api.litellm.ai/).

## 2. Features

- **Live price board** — the 4 highest-traffic flagships
  (`gpt-4o-mini`, `gpt-4o`, `claude-sonnet-4-6`, `deepseek-chat`), sorted
  by input $/1M with log-scale bars, `BEST` / `AVOID` tags and a live /
  syncing / cached status indicator.
- **Head-to-head comparator** — provider and model selectors on both
  sides, swap button, per-model datasheets (input, output, context,
  speed), a central savings readout and a plain-language verdict.
- **Live pricing with honest fallback** — prices are fetched from
  `https://api.litellm.ai/model_catalog/{model_id}`, cached in
  `localStorage` for 24h, and fall back to a bundled snapshot (verified
  2026-09-22) while loading or offline. The UI always states which source
  is on screen.
- **Tech-styled identity** — Chakra Petch display type, Inter body text,
  JetBrains Mono data type; deep-navy blueprint theme with signal-cyan
  (compute) and amber (savings) accents.
- **Accessible by default** — semantic landmarks, labelled form controls,
  visible keyboard focus, live regions for price updates, and
  `prefers-reduced-motion` support.

## 3. Tech stack

| Layer   | Technology                        |
| ------- | --------------------------------- |
| UI      | React 19 + TypeScript             |
| Build   | Vite 8                            |
| Styling | Tailwind CSS 4                    |
| Fonts   | Chakra Petch, Inter, JetBrains Mono (Google Fonts) |
| Data    | LiteLLM Model Catalog API (`api.litellm.ai`) |
| Lint    | ESLint + typescript-eslint        |

No backend is required. The app is a static build that calls the public
pricing API directly from the browser.

## 4. Project structure

```text
.
├── components/
│   ├── hero/
│   │   ├── HeroSection.tsx    # Thesis, CTAs, stats + board layout
│   │   └── PriceBoard.tsx     # Live price-board console
│   └── compare/
│       ├── CompareSection.tsx # State, savings math, verdict
│       ├── CompareForm.tsx    # Provider + model selectors, swap
│       └── ModelCard.tsx      # Model datasheet card
├── src/
│   ├── lib/
│   │   ├── litellm.ts         # Catalog, API client, cache, hook
│   │   └── format.ts          # Formatting, vendor labels, bar scales
│   ├── App.tsx                # Composes HeroSection + CompareSection
│   ├── main.tsx               # React entry point
│   └── index.css              # Tailwind theme, fonts, animations
├── docs/
│   ├── README.es.md           # Spanish translation
│   ├── README.fr.md           # French translation
│   ├── README.de.md           # German translation
│   └── README.zh.md           # Chinese translation
├── public/                    # Static assets (banner, favicon, icons)
├── index.html                 # Fonts, meta, title
└── LICENSE                    # GNU General Public License v3.0
```

## 5. Getting started

### Prerequisites

- Node.js 20+ and npm.

### Install

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

Open http://localhost:5173/ in your browser.

### Production build

```bash
npm run build
npm run preview
```

`npm run build` type-checks (`tsc -b`) and emits the static site to
`dist/`, which can be served by any static host.

## 6. Pricing data

### Source

`GET https://api.litellm.ai/model_catalog/{model_id}` returns per-token
costs (`input_cost_per_token`, `output_cost_per_token`). The app
multiplies them by 1,000,000 to display $/1M tokens, and reads
`max_input_tokens` for the context window. Model metadata refreshes from
LiteLLM's catalog on every load (deduplicated, then cached 24h).

The API free tier allows 100 requests/day per IP without a key; a fresh
load of the full 13-model catalog uses 13 requests.

### Known limitation: CORS

`api.litellm.ai` does not send an `Access-Control-Allow-Origin` header
(verified with and without an `Origin` header; `OPTIONS` returns 405),
so browsers may block the live response. In that case the app renders the
bundled snapshot and labels it as cached. Serving the app behind your own
backend or proxy that forwards to `api.litellm.ai` restores live data
without changing any component.

### Bundled snapshot (verified 2026-09-22, $/1M)

| Model | Provider | Input | Output | Context |
| ----- | -------- | ----- | ------ | ------- |
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

Median speeds shown on the cards are indicative static values; prices and
context windows are the live fields.

## 7. Available scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`     | Start the Vite dev server                |
| `npm run build`   | Type-check and build for production      |
| `npm run preview` | Preview the production build locally     |
| `npm run lint`    | Run ESLint over the project              |

## 8. License

This project is licensed under the **GNU General Public License v3.0
or later (GPLv3+)**. See [LICENSE](LICENSE) for the full text.

You are free to run, study, share and modify this software, provided
that any distributed work remains under the same license and its source
code stays available.
