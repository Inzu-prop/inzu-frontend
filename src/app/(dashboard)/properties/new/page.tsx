"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { RequireOrganization } from "@/components/require-organization";
import { useInzuApi } from "@/hooks/use-inzu-api";
import type { PropertyStatus, PropertyType } from "@/lib/api";
import { ApiError } from "@/lib/api";

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed_use", label: "Mixed use" },
  { value: "land", label: "Land" },
];

const PROPERTY_STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "under_construction", label: "Under construction" },
  { value: "for_sale", label: "For sale" },
];

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function NewPropertyPage() {
  const api = useInzuApi();
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<PropertyType>("apartment");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [status, setStatus] = useState<PropertyStatus>("active");
  const [yearBuilt, setYearBuilt] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cityTrim = city.trim();
    const countryTrim = country.trim();
    if (!cityTrim || !countryTrim) {
      setError("City and country are required.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    const body = {
      name: name.trim(),
      type,
      address: {
        ...(street.trim() && { street: street.trim() }),
        city: cityTrim,
        ...(state.trim() && { state: state.trim() }),
        country: countryTrim,
        ...(postalCode.trim() && { postalCode: postalCode.trim() }),
      },
      status,
      ...(yearBuilt.trim() && { yearBuilt: parseInt(yearBuilt, 10) }),
      ...(totalUnits.trim() && { totalUnits: parseInt(totalUnits, 10) }),
      ...(totalFloors.trim() && { totalFloors: parseInt(totalFloors, 10) }),
      ...(purchasePrice.trim() && { purchasePrice: parseFloat(purchasePrice) }),
      ...(currentValue.trim() && { currentValue: parseFloat(currentValue) }),
      ...(notes.trim() && { notes: notes.trim() }),
    };
    api.properties
      .create(body)
      .then((res) => {
        const id = res?.property?._id;
        if (id) {
          router.push(`/properties/${id}/units`);
        } else {
          router.push("/properties");
        }
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : String(err));
        setSubmitting(false);
      });
  };

  return (
    <RequireOrganization>
      <Container className="py-6">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/properties">← Back</Link>
          </Button>
        </div>
        <h2 className="mb-4 text-lg font-semibold">Add property</h2>
        <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName}
              placeholder="e.g. Sunset Apartments"
              required
            />
          </div>
          <div>
            <label htmlFor="type" className="mb-1 block text-sm font-medium">
              Type <span className="text-destructive">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as PropertyType)}
              className={inputClassName}
            >
              {PROPERTY_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">
              Address <span className="text-destructive">*</span> (city and country required)
            </legend>
            <div>
              <label htmlFor="street" className="mb-1 block text-xs text-muted-foreground">
                Street
              </label>
              <input
                id="street"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className={inputClassName}
                placeholder="e.g. 123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="city" className="mb-1 block text-xs text-muted-foreground">
                  City <span className="text-destructive">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClassName}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label htmlFor="state" className="mb-1 block text-xs text-muted-foreground">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={inputClassName}
                  placeholder="State"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="country" className="mb-1 block text-xs text-muted-foreground">
                  Country <span className="text-destructive">*</span>
                </label>
                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputClassName}
                  placeholder="Country"
                  required
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="mb-1 block text-xs text-muted-foreground">
                  Postal code
                </label>
                <input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={inputClassName}
                  placeholder="Postal code"
                />
              </div>
            </div>
          </fieldset>
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PropertyStatus)}
              className={inputClassName}
            >
              {PROPERTY_STATUSES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="yearBuilt" className="mb-1 block text-sm font-medium">
                Year built
              </label>
              <input
                id="yearBuilt"
                type="number"
                min={1800}
                max={new Date().getFullYear() + 2}
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
                className={inputClassName}
                placeholder="e.g. 2020"
              />
            </div>
            <div>
              <label htmlFor="totalUnits" className="mb-1 block text-sm font-medium">
                Total units (capacity only)
              </label>
              <p className="mb-1 text-xs text-muted-foreground">
                For display and reports. Add actual units on the property&apos;s Units page after saving.
              </p>
              <input
                id="totalUnits"
                type="number"
                min={0}
                value={totalUnits}
                onChange={(e) => setTotalUnits(e.target.value)}
                className={inputClassName}
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label htmlFor="totalFloors" className="mb-1 block text-sm font-medium">
              Total floors
            </label>
            <input
              id="totalFloors"
              type="number"
              min={0}
              value={totalFloors}
              onChange={(e) => setTotalFloors(e.target.value)}
              className={inputClassName}
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="purchasePrice" className="mb-1 block text-sm font-medium">
                Purchase price
              </label>
              <input
                id="purchasePrice"
                type="number"
                min={0}
                step="any"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className={inputClassName}
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="currentValue" className="mb-1 block text-sm font-medium">
                Current value
              </label>
              <input
                id="currentValue"
                type="number"
                min={0}
                step="any"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className={inputClassName}
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClassName}
              rows={3}
              placeholder="Optional notes"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Saving…" : "Add property"}
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/properties">Cancel</Link>
            </Button>
          </div>
        </form>
      </Container>
    </RequireOrganization>
  );
}
