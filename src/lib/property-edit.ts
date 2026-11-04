/** Parse an optional, non-negative property value without losing a recorded zero. */
export function parsePropertyValue(value: string, label: string): number | undefined {
  if (!value.trim()) return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${label} must be a non-negative number.`);
  }
  return number;
}

export function parsePropertyInteger(value: string, label: string, minimum: number, maximum: number): number | undefined {
  const normalized = value.trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  if (!/^\d+$/.test(normalized) || !Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${label} must be a whole number from ${minimum} to ${maximum}.`);
  }
  return parsed;
}

/** Unsetting existing optional properties requires a confirmed backend contract. */
export function assertNotCleared(value: string, previous: unknown, label: string): void {
  if (!value.trim() && previous !== undefined && previous !== null && previous !== "") {
    throw new Error(`${label} cannot be cleared yet. Restore its value or enter a new one.`);
  }
}
