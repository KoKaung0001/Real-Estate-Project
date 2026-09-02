import type { Property, PropertyType } from '../types';
import { resolvePropertyTownship } from './township';

export type BedroomFilter = 1 | 2 | 3 | 4 | '5plus';

export interface PropertyFilters {
  listing: 'buy' | 'rent';
  town: string;
  propertyType: PropertyType | '';
  bedrooms?: BedroomFilter;
  minPrice?: number;
  maxPrice?: number;
}

export function parseOptionalPrice(value: string | null): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function filterProperties(properties: Property[], filters: PropertyFilters): Property[] {
  const expectedStatus = filters.listing === 'rent' ? 'FOR_RENT' : 'FOR_SALE';

  return properties.filter((property) => {
    const resolvedTownship = resolvePropertyTownship(property);
    const matchesStatus = property.status === expectedStatus;
    const matchesTown = !filters.town || resolvedTownship?.id === filters.town;
    const matchesType = !filters.propertyType || property.propertyType === filters.propertyType;
    const matchesBedrooms = filters.bedrooms === undefined
      || (filters.bedrooms === '5plus'
        ? property.bedrooms >= 5
        : property.bedrooms === filters.bedrooms);
    const matchesMinPrice = filters.minPrice === undefined || property.price >= filters.minPrice;
    const matchesMaxPrice = filters.maxPrice === undefined || property.price <= filters.maxPrice;

    return matchesStatus
      && matchesTown
      && matchesType
      && matchesBedrooms
      && matchesMinPrice
      && matchesMaxPrice;
  });
}
