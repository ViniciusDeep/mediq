import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApp } from '../src/app.js';
import { createMemoryPatientRepository } from '../src/repositories/patient-repository.js';

async function createTestApp() {
  const repository = createMemoryPatientRepository();
  await repository.migrate();
  return buildApp({ repository, authSecret: 'test-auth-secret', cpfPepper: 'test-cpf-pepper', logger: false });
}

test('rejects invalid personal data', async (context) => {
  const app = await createTestApp();
  context.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/v1/patients/onboarding/personal',
    payload: { fullName: 'Maria', birthDate: '31/02/2030', cpf: '111.111.111-11' }
  });

  assert.equal(response.statusCode, 422);
  assert.deepEqual(Object.keys(response.json().fields).sort(), ['birthDate', 'cpf', 'fullName']);
});

test('persists personal data and completes preferences with an authenticated session', async (context) => {
  const app = await createTestApp();
  context.after(() => app.close());

  const personalResponse = await app.inject({
    method: 'POST',
    url: '/v1/patients/onboarding/personal',
    payload: { fullName: 'Maria da Silva', birthDate: '01 / 01 / 1990', cpf: '529.982.247-25' }
  });

  assert.equal(personalResponse.statusCode, 201);
  const { patient, token } = personalResponse.json();
  assert.equal(patient.cpfLastFour, '4725');
  assert.equal(patient.onboardingCompleted, false);
  assert.ok(token);

  const preferencesResponse = await app.inject({
    method: 'PUT',
    url: '/v1/patients/me/preferences',
    headers: { authorization: `Bearer ${token}` },
    payload: { specialties: ['Cardiologia', 'Dermatologia'], appointmentPeriod: 'morning' }
  });

  assert.equal(preferencesResponse.statusCode, 200);
  assert.equal(preferencesResponse.json().patient.onboardingCompleted, true);

  const profileResponse = await app.inject({
    method: 'GET',
    url: '/v1/patients/me',
    headers: { authorization: `Bearer ${token}` }
  });

  assert.equal(profileResponse.statusCode, 200);
  assert.deepEqual(profileResponse.json().patient.preferences.specialties, ['Cardiologia', 'Dermatologia']);
});

test('protects patient routes from unauthenticated access', async (context) => {
  const app = await createTestApp();
  context.after(() => app.close());

  const response = await app.inject({ method: 'GET', url: '/v1/patients/me' });
  assert.equal(response.statusCode, 401);
});

test('does not issue a new session for an existing CPF', async (context) => {
  const app = await createTestApp();
  context.after(() => app.close());
  const payload = { fullName: 'Maria da Silva', birthDate: '01/01/1990', cpf: '529.982.247-25' };

  const firstResponse = await app.inject({ method: 'POST', url: '/v1/patients/onboarding/personal', payload });
  const duplicateResponse = await app.inject({ method: 'POST', url: '/v1/patients/onboarding/personal', payload });

  assert.equal(firstResponse.statusCode, 201);
  assert.equal(duplicateResponse.statusCode, 409);
  assert.equal(duplicateResponse.json().error, 'patient_already_exists');
});
