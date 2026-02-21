/**
 * Unit API types — align with backend Units API.
 */

export const UNIT_TYPES = [
  "studio",
  "one_bedroom",
  "two_bedroom",
  "three_bedroom",
  "four_plus_bedroom",
  "commercial",
] as const;

export type UnitType = (typeof UNIT_TYPES)[number];

export interface Unit {
  _id: string;
  propertyId: string;
  unitNumber: string;
  type?: UnitType;
  rentAmount?: number;
  depositAmount?: number;
  status?: string;
  [key: string]: unknown;
}

export interface BulkCreateUnitsBody {
  count: number;
  unitNumberPrefix?: string;
  unitNumberStart?: number;
  defaultType?: UnitType;
  defaultRent?: number;
  defaultDeposit?: number;
}

export interface BulkCreateUnitsResponse {
  unitNumbers: string[];
  [key: string]: unknown;
}

export interface CreateUnitBody {
  unitNumber: string;
  type?: UnitType;
  rentAmount?: number;
  depositAmount?: number;
  [key: string]: unknown;
}
