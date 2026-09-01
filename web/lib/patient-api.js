const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...options.headers }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error ?? 'request_failed');
    error.status = response.status;
    error.fields = data.fields;
    throw error;
  }
  return data;
}

export function savePersonalData(payload) {
  return request('/v1/patients/onboarding/personal', { method: 'POST', body: JSON.stringify(payload) });
}

export function loadPatient(token) {
  return request('/v1/patients/me', { headers: { authorization: `Bearer ${token}` } });
}

export function savePatientPreferences(token, payload) {
  return request('/v1/patients/me/preferences', {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}
