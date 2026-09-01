import { buildApp } from './app.js';
import { createMemoryPatientRepository, createPostgresPatientRepository } from './repositories/patient-repository.js';

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

if (isProduction && !connectionString) {
  throw new Error('DATABASE_URL is required in production.');
}
if (isProduction && (!process.env.AUTH_SECRET || !process.env.CPF_PEPPER)) {
  throw new Error('AUTH_SECRET and CPF_PEPPER are required in production.');
}

const repository = connectionString
  ? createPostgresPatientRepository(connectionString)
  : createMemoryPatientRepository();

await repository.migrate();

const app = await buildApp({
  repository,
  authSecret: process.env.AUTH_SECRET ?? 'local-development-secret-change-me',
  cpfPepper: process.env.CPF_PEPPER ?? 'local-development-pepper-change-me',
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:3000,http://localhost:3001'
});

const port = Number(process.env.PORT ?? 3333);
await app.listen({ host: '0.0.0.0', port });
