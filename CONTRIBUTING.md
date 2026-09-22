# Contributing to Nikclas

Thank you for contributing. This guide covers the development setup,
the pricing-data system and how to add a new provider.

## Development setup

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev      # Vite dev server at http://localhost:5173/
npm test         # unit tests (vitest)
npm run lint     # ESLint
npm run build    # typecheck (tsc -b) + production build
```

## Pricing data

There is no database. Prices live in versioned files and Git is the
price history (`git log -- data/pricing.json`):

```text
data/
├── providers.json   # provider id, name, website, official pricing URL
├── models.json      # model id, name, provider id, context window
└── pricing.json     # one row per (model, input|output) with price, source, date
```

Every 6 hours the `pricing-update` workflow runs the collector
(`npm run collect:pricing`), validates the result
(`npm run validate:pricing`) and opens a pull request titled
`chore: update AI model pricing` when something changed. Changes of 3x
or more are kept in the PR but marked `[possible-anomaly]` in the title
for human review. `main` is never written to directly.

Source-link health is checked weekly by the `link-check` workflow
(`npm run check:links`), which opens an issue if a pricing source
breaks.

## Adding a new provider

1. **Create the provider.** Add a file under
   `src/pricing/providers/`, e.g. `acme.ts`, implementing the
   `PricingProvider` interface from `src/pricing/providers/types.ts`:

   ```typescript
   import type { PricingProvider } from "./types";

   export class AcmeProvider implements PricingProvider {
     readonly name = "acme";
     async fetchPricing() {
       // Fetch the official provider pricing page/API and return
       // ModelPricing[] (model id, $/1M input/output, context, source).
     }
   }
   ```

   Prefer the provider's official documentation or pricing page over
   third-party aggregators. Keep requests sequential with timeouts and
   respect the site's usage policies.

2. **Implement the collector.** Keep HTTP in the provider file so the
   parsing stays unit-testable.
3. **Implement the parser.** Map the source format to `ModelPricing`
   (scale per-token costs by 1,000,000, preserve the source URL).
4. **Register it** in `src/pricing/providers/index.ts`.
5. **Add the provider, its models and official source** to
   `data/providers.json`, `data/models.json` and the app catalog in
   `src/lib/litellm.ts` (`MODELS`).
6. **Add tests** under `src/pricing/` covering the parser mapping,
   normalization and at least one edge case (missing fields, HTTP
   error).
7. **Add the official source URL** to `data/providers.json`
   (`pricing_url`) so the link checker covers it.
8. **Run validation**: `npm run validate:pricing`, `npm test`,
   `npm run lint`, `npm run build`.
9. **Open a pull request.** CI runs lint, tests, build and data
   validation on every PR.

## Pull request rules

- Keep changes focused; one topic per PR.
- Never commit directly to `main`; the pricing bot follows the same rule.
- Use conventional titles (`feat:`, `fix:`, `chore:`, `docs:`).
- Make sure `npm run lint`, `npm test` and `npm run build` pass locally.
