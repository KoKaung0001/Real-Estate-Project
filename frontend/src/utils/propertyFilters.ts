import type { Property, PropertyType } from '../types';
import { resolvePropertyTownship } from './township';

export interface PropertyFilters {
  listing: 'buy' | 'rent';
  town: string;
  propertyType: PropertyType | '';
  minPrice?: number;
  maxPrice?: number;
  query: string;
}

export function parseOptionalPrice(value: string | null): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function filterProperties(properties: Property[], filters: PropertyFilters): Property[] {
  const expectedStatus = filters.listing === 'rent' ? 'FOR_RENT' : 'FOR_SALE';
  const query = filters.query.trim().toLocaleLowerCase();

  return properties.filter((property) => {
    const resolvedTownship = resolvePropertyTownship(property);
    const searchableValues = [
      property.title,
      property.description,
      property.location,
      property.streetAddress,
      property.township,
      resolvedTownship?.id,
      resolvedTownship?.nameEn,
      resolvedTownship?.nameMy,
      property.city,
      property.stateRegion,
      property.zipCode,
      property.propertyType,
    ];
    const matchesKeyword = !query || searchableValues.some(
      (value) => typeof value === 'string' && value.toLocaleLowerCase().includes(query),
    );
    const matchesStatus = property.status === expectedStatus;
    const matchesTown = !filters.town || resolvedTownship?.id === filters.town;
    const matchesType = !filters.propertyType || property.propertyType === filters.propertyType;
    const matchesMinPrice = filters.minPrice === undefined || property.price >= filters.minPrice;
    const matchesMaxPrice = filters.maxPrice === undefined || property.price <= filters.maxPrice;

    return matchesKeyword
      && matchesStatus
      && matchesTown
      && matchesType
      && matchesMinPrice
      && matchesMaxPrice;
  });
}
