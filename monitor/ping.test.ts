import { describe, expect, test } from "vitest";
import { ping } from "./ping";

describe("ping API", () => {
  test.each([
    ["https://example.com", true],
    ["http://example.com", true],
    ["https://httpstat.us/500", false],
    ["https://httpstat.us/404", false],
    ["ftp://example.com", false],
    ["invalid://example.com", false],
  ])(`should verify "%s"`, async (site, expectedUp) => {
    const resp = await ping({ url: site });
    expect(resp.up).toBe(expectedUp);
  });
});
