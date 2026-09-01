import { randomUUID } from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;

export class PatientAlreadyExistsError extends Error {}

const schema = `
  CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    cpf_hash CHAR(64) NOT NULL UNIQUE,
    cpf_last_four CHAR(4) NOT NULL,
    preferences JSONB,
    onboarding_step SMALLINT NOT NULL DEFAULT 1 CHECK (onboarding_step BETWEEN 1 AND 2),
    onboarding_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

function present(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    birthDate: row.birth_date instanceof Date ? row.birth_date.toISOString().slice(0, 10) : String(row.birth_date).slice(0, 10),
    cpfLastFour: row.cpf_last_four,
    preferences: row.preferences,
    onboardingStep: row.onboarding_step,
    onboardingCompleted: Boolean(row.onboarding_completed_at)
  };
}

export function createPostgresPatientRepository(connectionString) {
  const pool = new Pool({ connectionString });
  return {
    async migrate() {
      await pool.query(schema);
    },
    async createPersonalData({ fullName, birthDate, cpfHash, cpfLastFour }) {
      const result = await pool.query(
        `INSERT INTO patients (id, full_name, birth_date, cpf_hash, cpf_last_four)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (cpf_hash) DO NOTHING
         RETURNING *`,
        [randomUUID(), fullName, birthDate, cpfHash, cpfLastFour]
      );
      if (!result.rows[0]) throw new PatientAlreadyExistsError('Patient already exists.');
      return present(result.rows[0]);
    },
    async findById(id) {
      const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
      return present(result.rows[0]);
    },
    async updatePreferences(id, preferences) {
      const result = await pool.query(
        `UPDATE patients
         SET preferences = $2, onboarding_step = 2, onboarding_completed_at = NOW(), updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [id, preferences]
      );
      return present(result.rows[0]);
    },
    async close() {
      await pool.end();
    }
  };
}

export function createMemoryPatientRepository() {
  const records = new Map();
  return {
    async migrate() {},
    async createPersonalData({ fullName, birthDate, cpfHash, cpfLastFour }) {
      const existing = [...records.values()].find((patient) => patient.cpfHash === cpfHash);
      if (existing) throw new PatientAlreadyExistsError('Patient already exists.');
      const patient = { id: randomUUID(), cpfHash, cpfLastFour, fullName, birthDate, preferences: null, onboardingStep: 1, onboardingCompleted: false };
      records.set(patient.id, patient);
      return { ...patient, cpfHash: undefined };
    },
    async findById(id) {
      const patient = records.get(id);
      return patient ? { ...patient, cpfHash: undefined } : null;
    },
    async updatePreferences(id, preferences) {
      const patient = records.get(id);
      if (!patient) return null;
      Object.assign(patient, { preferences, onboardingStep: 2, onboardingCompleted: true });
      return { ...patient, cpfHash: undefined };
    },
    async close() {}
  };
}
