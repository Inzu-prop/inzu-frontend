import test from "node:test";
import assert from "node:assert/strict";
import { isLocalPreviewEnabled, isLoopbackHost, isPreviewPath, isLoopbackAuthority } from "../src/lib/local-preview.mjs";

test("preview requires explicit opt-in AND development mode", () => {
  const oldMode = process.env.NODE_ENV;
  const oldFlag = process.env.NEXT_PUBLIC_LOCAL_PREVIEW;
  try {
    for (const mode of ["production", "test", "development"]) {
      for (const flag of ["true", "false", "", undefined]) {
        process.env.NODE_ENV = mode;
        if (flag === undefined) delete process.env.NEXT_PUBLIC_LOCAL_PREVIEW;
        else process.env.NEXT_PUBLIC_LOCAL_PREVIEW = flag;
        assert.equal(isLocalPreviewEnabled(), mode === "development" && flag === "true");
      }
    }
  } finally {
    if (oldMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldMode;
    if (oldFlag === undefined) delete process.env.NEXT_PUBLIC_LOCAL_PREVIEW; else process.env.NEXT_PUBLIC_LOCAL_PREVIEW = oldFlag;
  }
});
test("preview route boundary does not include real app or API routes", () => {
  for (const path of ["/preview", "/preview/properties/new"]) assert.equal(isPreviewPath(path), true);
  for (const path of ["/", "/properties", "/api/payments", "/preview-other"]) assert.equal(isPreviewPath(path), false);
});
test("preview only accepts loopback hosts", () => {
  for (const host of ["localhost", "127.0.0.1", "[::1]", "::1"]) assert.equal(isLoopbackHost(host), true);
  for (const host of ["example.com", "192.168.1.2", "localhost.example.com"]) assert.equal(isLoopbackHost(host), false);
});

test("Host authority rejects remote hosts and misleading localhost names", () => {
  for (const host of ["localhost:3000", "127.0.0.1:3000", "[::1]:3000"]) assert.equal(isLoopbackAuthority(host), true);
  for (const host of [null, "example.com:3000", "localhost.example.com:3000", "localhost@evil.com", "127.0.0.1.evil.com"]) assert.equal(isLoopbackAuthority(host), false);
});
