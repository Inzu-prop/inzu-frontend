type MaintenanceRecord = Record<string, unknown>;

function asRecord(value: unknown): MaintenanceRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as MaintenanceRecord)
    : {};
}

export function maintenanceDetailForRoute(
  value: unknown,
  id: string,
): MaintenanceRecord {
  const envelope = asRecord(value);
  const ticket = asRecord(envelope.ticket ?? envelope.maintenance ?? envelope);
  const returnedId = typeof ticket._id === "string" ? ticket._id : ticket.id;
  if (typeof returnedId !== "string" || !returnedId || returnedId !== id) {
    throw new Error(
      "The maintenance response could not be verified for this ticket.",
    );
  }
  return ticket;
}
