import { describe, expect, it } from "vitest";
import { MODELS } from "./litellm";
import { vendorLabel, websiteForVendor } from "./format";

describe("websiteForVendor", () => {
  it("resolves an official site for every catalog vendor", () => {
    for (const m of MODELS) {
      expect(websiteForVendor(vendorLabel(m.vendor))).toMatch(/^https:\/\//);
    }
  });

  it("maps known vendors to their official sites", () => {
    expect(websiteForVendor("NVIDIA")).toBe("https://build.nvidia.com/");
    expect(websiteForVendor("Qwen")).toBe("https://www.alibabacloud.com/");
  });

  it("returns null for unknown vendors", () => {
    expect(websiteForVendor("nope")).toBeNull();
  });
});
