import { LitellmProvider } from "./litellm";
import type { PricingProvider } from "./types";

/** All active collectors. Add new providers here (see CONTRIBUTING.md). */
export const pricingProviders: PricingProvider[] = [new LitellmProvider()];
