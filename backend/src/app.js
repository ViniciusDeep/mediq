import cors from '@fastify/cors';
import Fastify from 'fastify';
import { issuePatientToken, verifyPatientToken } from './auth.js';
import { cpfFingerprint, digitsOnly, parseBirthDate, validateCpf, validateFullName, validatePreferences } from './domain/patient.js';
import { PatientAlreadyExistsError } from './repositories/patient-repository.js';

export async function buildApp({ repository, authSecret, cpfPepper, webOrigin = 'http://localhost:3000', logger = true }) {
  const app = Fastify({ logger });
  await app.register(cors, {
    origin: webOrigin.split(',').map((origin) => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'OPTIONS']
  });

  app.get('/', async () => ({ name: 'Mediq API', status: 'online', health: '/health' }));
  app.get('/health', async () => ({ status: 'ok', service: 'mediq-api' }));
  app.get('/v1/roles', async () => ({ roles: ['patient', 'doctor', 'organization'] }));

  app.post('/v1/patients/onboarding/personal', async (request, reply) => {
    const { fullName, birthDate, cpf } = request.body ?? {};
    const normalizedBirthDate = parseBirthDate(birthDate);
    const errors = {};
    if (!validateFullName(fullName)) errors.fullName = 'Informe o nome completo.';
    if (!normalizedBirthDate) errors.birthDate = 'Informe uma data de nascimento válida.';
    if (!validateCpf(cpf)) errors.cpf = 'Informe um CPF válido.';
    if (Object.keys(errors).length) return reply.code(422).send({ error: 'validation_error', fields: errors });

    const cpfDigits = digitsOnly(cpf);
    let patient;
    try {
      patient = await repository.createPersonalData({
        fullName: fullName.trim().replace(/\s+/g, ' '),
        birthDate: normalizedBirthDate,
        cpfHash: cpfFingerprint(cpfDigits, cpfPepper),
        cpfLastFour: cpfDigits.slice(-4)
      });
    } catch (error) {
      if (error instanceof PatientAlreadyExistsError) {
        return reply.code(409).send({ error: 'patient_already_exists' });
      }
      throw error;
    }

    return reply.code(201).send({ patient, token: issuePatientToken(patient.id, authSecret) });
  });

  async function authenticate(request, reply) {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    const claims = verifyPatientToken(token, authSecret);
    if (!claims) return reply.code(401).send({ error: 'unauthorized' });
    request.patientId = claims.sub;
  }

  app.get('/v1/patients/me', { preHandler: authenticate }, async (request, reply) => {
    const patient = await repository.findById(request.patientId);
    return patient ? { patient } : reply.code(404).send({ error: 'patient_not_found' });
  });

  app.put('/v1/patients/me/preferences', { preHandler: authenticate }, async (request, reply) => {
    const preferences = validatePreferences(request.body);
    if (!preferences) {
      return reply.code(422).send({
        error: 'validation_error',
        fields: { preferences: 'Informe ao menos uma especialidade e o período preferido.' }
      });
    }
    const patient = await repository.updatePreferences(request.patientId, preferences);
    return patient ? { patient } : reply.code(404).send({ error: 'patient_not_found' });
  });

  app.addHook('onClose', async () => repository.close());
  return app;
}
