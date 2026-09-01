const DEFAULT_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://mediq-prod.up.railway.app'
  : 'http://localhost:3333';

export function getApiUrl() {
  return (process.env.MEDIQ_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
}
