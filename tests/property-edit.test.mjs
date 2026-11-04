import assert from "node:assert/strict";
import test from "node:test";
import { assertNotCleared, parsePropertyInteger, parsePropertyValue } from "../src/lib/property-edit.ts";

test("property valuations distinguish zero, missing and invalid values", () => {
  assert.equal(parsePropertyValue("0", "Value"), 0);
  assert.equal(parsePropertyValue("12.50", "Value"), 12.5);
  assert.equal(parsePropertyValue("", "Value"), undefined);
  for (const value of ["-1", "NaN", "Infinity", "abc"]) {
    assert.throws(() => parsePropertyValue(value, "Value"));
  }
});

test("property unit counts reject non-decimal whole-number notation", () => {
  assert.equal(parsePropertyInteger("0", "Units", 0, 1000), 0);
  assert.equal(parsePropertyInteger(" 100 ", "Units", 0, 1000), 100);
  for (const value of ["1e2", "0x10", "1.0", "-1", "1.5"]) {
    assert.throws(() => parsePropertyInteger(value, "Units", 0, 1000));
  }
});

test("existing values cannot be silently cleared when the API semantics are unknown", () => {
  assert.throws(() => assertNotCleared("", 0, "Value"));
  assert.throws(() => assertNotCleared(" ", "Nairobi", "City"));
  assert.doesNotThrow(() => assertNotCleared("", undefined, "Value"));
  assert.doesNotThrow(() => assertNotCleared("0", 2, "Value"));
});
