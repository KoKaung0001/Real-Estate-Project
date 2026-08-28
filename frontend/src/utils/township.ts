import { YANGON_TOWNSHIPS } from '../data/myanmarProperties';
import type { Property, YangonTownship } from '../types';

function normalizeTownshipText(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/[(),.]/g, ' ')
    .replace(/\s+/g, ' ');
}

function aliasesFor(township: YangonTownship): string[] {
  return [township.id, township.nameEn, township.nameMy, ...(township.aliases ?? [])]
    .map(normalizeTownshipText)
    .filter(Boolean);
}

const TOWNSHIPS_BY_SPECIFICITY = [...YANGON_TOWNSHIPS].sort((left, right) => {
  const longestAlias = (township: YangonTownship) =>
    Math.max(...aliasesFor(township).map((alias) => alias.length));
  return longestAlias(right) - longestAlias(left);
});

export function findTownship(value?: string | null): YangonTownship | undefined {
  if (!value?.trim()) return undefined;
  const normalized = normalizeTownshipText(value);
  return YANGON_TOWNSHIPS.find((township) => aliasesFor(township).includes(normalized));
}

export function findTownshipFromLegacyLocation(location?: string | null): YangonTownship | undefined {
  if (!location?.trim()) return undefined;
  const normalizedLocation = normalizeTownshipText(location);
  return TOWNSHIPS_BY_SPECIFICITY.find((township) =>
    aliasesFor(township).some((alias) => normalizedLocation.includes(alias)),
  );
}

export function resolvePropertyTownship(property: Pick<Property, 'township' | 'location'>): YangonTownship | undefined {
  if (property.township?.trim()) {
    return findTownship(property.township);
  }
  return findTownshipFromLegacyLocation(property.location);
}

export function resolvePropertyTownshipId(property: Pick<Property, 'township' | 'location'>): string | undefined {
  return resolvePropertyTownship(property)?.id;
}
