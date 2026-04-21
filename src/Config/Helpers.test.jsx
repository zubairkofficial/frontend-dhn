import { describe, it, expect } from "vitest";
import Helpers from "./Helpers";

describe("Helpers", () => {
  it("exposes apiUrl ending with /api/", () => {
    expect(Helpers.apiUrl).toMatch(/\/api\/$/);
  });
});
