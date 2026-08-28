export const BACKEND_BASE_URL = 'http://localhost:8080';

export function resolvePropertyImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return '/property-placeholder.svg';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith('/uploads/')) return `${BACKEND_BASE_URL}${imageUrl}`;
  return imageUrl;
}
