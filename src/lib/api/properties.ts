/**
 * Property API types — align with backend Properties API.
 */

export type PropertyType =
  | "apartment"
  | "house"
  | "commercial"
  | "mixed_use"
  | "land";

export type PropertyStatus =
  | "active"
  | "inactive"
  | "under_construction"
  | "for_sale";

export interface PropertyAddress {
  street?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: { lat: number; lng: number };
}

export interface PropertyListItem {
  _id: string;
  name: string;
  type: PropertyType;
  address: PropertyAddress;
  status: PropertyStatus;
  totalUnits?: number;
  photos: number;
  createdAt: string;
}

export interface PropertyPhoto {
  r2Key: string;
  signedUrl: string;
  publicUrl: string;
}

export interface PropertyDocument {
  type: string;
  r2Key: string;
  name: string;
  uploadedAt: string;
  signedUrl: string;
  publicUrl: string;
}

export interface Property extends PropertyListItem {
  organizationId: string;
  yearBuilt?: number;
  totalFloors?: number;
  photos: PropertyPhoto[];
  documents: PropertyDocument[];
  purchasePrice?: number;
  currentValue?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  updatedAt: string;
}

export interface PropertiesListResponse {
  properties: PropertyListItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface PropertyGetResponse {
  property: Property;
}

export interface PropertyCreateResponse {
  property: Pick<Property, "_id" | "name" | "type" | "address" | "status" | "createdAt">;
}

export interface PropertyDeleteResponse {
  success: true;
  message: string;
}

export interface PropertyUploadPhotoResponse {
  uploadUrl: string;
  r2Key: string;
  propertyId: string;
}

/** Body for creating a property (required + optional per API). */
export interface CreatePropertyBody {
  name: string;
  type: PropertyType;
  address: PropertyAddress;
  yearBuilt?: number;
  totalUnits?: number;
  totalFloors?: number;
  purchasePrice?: number;
  currentValue?: number;
  status?: PropertyStatus;
  notes?: string;
}

/** Body for updating a property (partial). */
export type UpdatePropertyBody = Partial<CreatePropertyBody>;
