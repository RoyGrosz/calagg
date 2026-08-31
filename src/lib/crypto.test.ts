import { afterEach, describe, expect, it } from "vitest";
import { decryptToken, encryptToken } from "./crypto";

describe("token encryption", () => {
  afterEach(() => {
    delete process.env.TOKEN_ENCRYPTION_KEY;
  });

  it("round-trips with a 64-char hex key", () => {
    process.env.TOKEN_ENCRYPTION_KEY = "a".repeat(64);
    const token = "1//0refresh-token-value";
    const enc = encryptToken(token);
    expect(enc).not.toContain(token);
    expect(enc.split(".").length).toBe(3);
    expect(decryptToken(enc)).toBe(token);
  });

  it("produces different ciphertexts (random IV)", () => {
    process.env.TOKEN_ENCRYPTION_KEY = "b".repeat(64);
    const a = encryptToken("same");
    const b = encryptToken("same");
    expect(a).not.toBe(b);
    expect(decryptToken(a)).toBe("same");
    expect(decryptToken(b)).toBe("same");
  });

  it("rejects tampered payloads", () => {
    process.env.TOKEN_ENCRYPTION_KEY = "c".repeat(64);
    const enc = encryptToken("secret");
    const parts = enc.split(".");
    parts[2] = parts[2].slice(0, -2) + "aa";
    expect(() => decryptToken(parts.join("."))).toThrow();
  });
});
