import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import {
  FROM_VERSION,
  TO_VERSION,
  run,
} from "../../migrations/v0.2.0-yelly-lead.js";

const ROOT = join(import.meta.dirname, "..", "..");

describe("migrations/v0.2.0-yelly-lead", () => {
  it("file exists at expected path", () => {
    expect(existsSync(join(ROOT, "migrations", "v0.2.0-yelly-lead.ts"))).toBe(
      true,
    );
  });

  it("declares FROM_VERSION 0.1.0 and TO_VERSION 0.2.0", () => {
    expect(FROM_VERSION).toBe("0.1.0");
    expect(TO_VERSION).toBe("0.2.0");
  });

  it("run() is a no-op that returns applied=true with notes", () => {
    const result = run({ projectRoot: ROOT, installedVersion: "0.1.0" });
    expect(result.applied).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
    expect(result.notes.some((n) => n.includes("yelly-lead"))).toBe(true);
  });
});
