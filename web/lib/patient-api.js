async function request(path, options = {}) {
  const response = await fetch(path, {
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
  return request('/api/patients/onboarding/personal', { method: 'POST', body: JSON.stringify(payload) });
}

export function loadPatient(token) {
  return request('/api/patients/me', { headers: { authorization: `Bearer ${token}` } });
}

export function savePatientPreferences(token, payload) {
  return request('/api/patients/me/preferences', {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}
