# Nikclas

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](../LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178FC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pricing: LiteLLM](https://img.shields.io/badge/Pricing-LiteLLM_API-4DE3FF)](https://api.litellm.ai/)

<img width="600" src="../public/banner.png" alt="Banner de Nikclas" />

**Deja de pagar de mas por tokens.** Nikclas compara precios por millon de
tokens ($/1M) entre modelos de IA frontera para que envies la misma
calidad por menos dinero.

Leer en: [English](../README.md) | [Francais](README.fr.md) |
[Deutsch](README.de.md) | [中文](README.zh.md)

## Indice

- [1. Descripcion general](#1-descripcion-general)
- [2. Funcionalidades](#2-funcionalidades)
- [3. Tecnologias](#3-tecnologias)
- [4. Estructura del proyecto](#4-estructura-del-proyecto)
- [5. Primeros pasos](#5-primeros-pasos)
- [6. Datos de precios](#6-datos-de-precios)
- [7. Scripts disponibles](#7-scripts-disponibles)
- [8. Licencia](#8-licencia)

## 1. Descripcion general

Nikclas es una aplicacion React de una sola pagina que responde a una
pregunta: que modelo de IA hace el mismo trabajo por menos dinero?

Abre con un hero de tesis (panel de precios en vivo ordenado por $/1M de
entrada) y continua con un comparador cara a cara: elige proveedor y
modelo en cada lado, mira la diferencia de precio y recibe un veredicto
con el ahorro exacto por millon de tokens de entrada.

Todos los precios se cargan en vivo desde la
[API del catalogo de modelos de LiteLLM](https://api.litellm.ai/).

## 2. Funcionalidades

- **Panel de precios en vivo** — los 4 modelos insignia de mayor trafico
  (`gpt-4o-mini`, `gpt-4o`, `claude-sonnet-4-6`, `deepseek-chat`),
  ordenados por $/1M de entrada con barras en escala logaritmica,
  etiquetas `BEST` / `AVOID` e indicador de estado en vivo /
  sincronizando / cache.
- **Comparador cara a cara** — selectores de proveedor y modelo en ambos
  lados, boton de intercambio, fichas por modelo (entrada, salida,
  contexto, velocidad, capacidades para desarrolladores), enlaces
  oficiales al proveedor, lectura central del ahorro y veredicto en
  lenguaje claro.
- **Calculadora mensual** — introduce los M tokens mensuales de entrada
  y salida (o un preset) y mira el coste mensual y diario por modelo con
  el ranking completo, del mas barato al mas caro.
- **Precios en vivo con respaldo honesto** — los precios se piden a
  `https://api.litellm.ai/model_catalog/{model_id}`, se cachean en
  `localStorage` durante 24h y, si no hay conexion, se usa una foto fija
  incluida (verificada el 2026-09-22). La interfaz siempre indica que
  fuente se muestra.
- **Identidad visual tech** — tipografia de pantalla Chakra Petch, texto
  Inter, datos en JetBrains Mono; tema azul noche con plano de fondo y
  acentos cian (computo) y ambar (ahorro).
- **Accesible por defecto** — puntos de referencia semanticos,
  controles de formulario etiquetados, foco de teclado visible, regiones
  en vivo para los precios y soporte de `prefers-reduced-motion`.

## 3. Tecnologias

| Capa    | Tecnologia                        |
| ------- | --------------------------------- |
| UI      | React 19 + TypeScript             |
| Build   | Vite 8                            |
| Estilos | Tailwind CSS 4                    |
| Fuentes | Chakra Petch, Inter, JetBrains Mono (Google Fonts) |
| Datos   | API del catalogo de LiteLLM (`api.litellm.ai`) |
| Lint    | ESLint + typescript-eslint        |

No se necesita backend. La aplicacion es una build estatica que llama a
la API publica de precios desde el navegador.

## 4. Estructura del proyecto

```text
.
├── components/
│   ├── hero/
│   │   ├── HeroSection.tsx    # Tesis, CTAs, estadisticas + layout
│   │   └── PriceBoard.tsx     # Consola del panel de precios
│   └── compare/
│       ├── CompareSection.tsx # Estado, calculo del ahorro, veredicto
│       ├── CompareForm.tsx    # Selectores de proveedor y modelo, swap
│       └── ModelCard.tsx      # Ficha de modelo
├── src/
│   ├── lib/
│   │   ├── litellm.ts         # Catalogo, cliente API, cache, hook
│   │   └── format.ts          # Formato, etiquetas, escalas de barras
│   ├── App.tsx                # Compone HeroSection + CompareSection
│   ├── main.tsx               # Punto de entrada de React
│   └── index.css              # Tema Tailwind, fuentes, animaciones
├── docs/
│   ├── README.es.md           # Traduccion al espanol
│   ├── README.fr.md           # Traduccion al frances
│   ├── README.de.md           # Traduccion al aleman
│   └── README.zh.md           # Traduccion al chino
├── public/                    # Activos estaticos (banner, favicon, iconos)
├── index.html                 # Fuentes, meta, titulo
└── LICENSE                    # Licencia GNU GPL v3.0
```

## 5. Primeros pasos

### Requisitos

- Node.js 20+ y npm.

### Instalacion

```bash
npm install
```

### Servidor de desarrollo

```bash
npm run dev
```

Abre http://localhost:5173/ en tu navegador.

### Build de produccion

```bash
npm run build
npm run preview
```

`npm run build` verifica tipos (`tsc -b`) y genera el sitio estatico en
`dist/`, servible desde cualquier hosting estatico.

## 6. Datos de precios

### Fuente

`GET https://api.litellm.ai/model_catalog/{model_id}` devuelve costes
por token (`input_cost_per_token`, `output_cost_per_token`). La app los
multiplica por 1.000.000 para mostrar $/1M y lee `max_input_tokens`
para la ventana de contexto. Los metadatos se actualizan desde el
catalogo de LiteLLM en cada carga (peticiones deduplicadas y cache de
24h).

El plan gratuito de la API permite 100 peticiones/dia por IP sin clave;
una carga fresca del catalogo completo de 15 modelos usa 15 peticiones.

### Limitacion conocida: CORS

`api.litellm.ai` no envia la cabecera `Access-Control-Allow-Origin`
(verificado con y sin cabecera `Origin`; `OPTIONS` devuelve 405), asi
que los navegadores pueden bloquear la respuesta en vivo. En ese caso la
app muestra la foto fija incluida y la etiqueta como cache. Servir la
app detras de un backend o proxy propio que reenvie a `api.litellm.ai`
restaura los datos en vivo sin cambiar ningun componente.

### Foto fija incluida (verificada el 2026-09-22, $/1M)

| Modelo | Proveedor | Entrada | Salida | Contexto |
| ------ | --------- | ------- | ------ | -------- |
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

Las velocidades medias de las fichas son valores estaticos
orientativos; precios y contexto son los campos en vivo.

### Actualizaciones automaticas

No hay base de datos: `data/pricing.json` es el dataset actual y
`git log -- data/pricing.json` es el historico. Cada 6 horas el workflow
`pricing-update` ejecuta el collector, valida y abre un pull request si
hay cambios (nunca escribe directo en `main`); saltos de 3x o mas se
marcan `[possible-anomaly]`. Mira [CONTRIBUTING.md](../CONTRIBUTING.md)
para contribuir, incluido como anadir un proveedor.

## 7. Scripts disponibles

| Comando         | Descripcion                              |
| --------------- | ---------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo de Vite |
| `npm run build`   | Verifica tipos y genera produccion       |
| `npm run preview` | Previsualiza la build localmente         |
| `npm run lint`    | Ejecuta ESLint en el proyecto            |

## 8. Licencia

Este proyecto esta licenciado bajo la **Licencia Publica General de GNU
v3.0 o posterior (GPLv3+)**. Mira [LICENSE](../LICENSE) para el texto
completo.

Eres libre de ejecutar, estudiar, compartir y modificar este software,
siempre que cualquier obra distribuida mantenga la misma licencia y su
codigo fuente siga disponible.
