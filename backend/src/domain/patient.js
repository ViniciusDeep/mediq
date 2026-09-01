import { createHash } from 'node:crypto';

export const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

export function validateFullName(value) {
  return typeof value === 'string' && value.trim().split(/\s+/).length >= 2;
}

export function parseBirthDate(value) {
  if (typeof value !== 'string') return null;
  const digits = digitsOnly(value);
  if (digits.length !== 8) return null;
  const dayText = digits.slice(0, 2);
  const monthText = digits.slice(2, 4);
  const yearText = digits.slice(4);
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(Date.UTC(year, month - 1, day));
  const today = new Date();

  if (
    year < 1900 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date > today
  ) return null;

  return `${yearText}-${monthText}-${dayText}`;
}

export function validateCpf(value) {
  const cpf = digitsOnly(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const checkDigit = (length) => {
    const sum = cpf
      .slice(0, length)
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return checkDigit(9) === Number(cpf[9]) && checkDigit(10) === Number(cpf[10]);
}

export function cpfFingerprint(value, pepper) {
  return createHash('sha256').update(`${digitsOnly(value)}:${pepper}`).digest('hex');
}

export function validatePreferences(value) {
  if (!value || typeof value !== 'object') return null;
  const specialties = Array.isArray(value.specialties)
    ? [...new Set(value.specialties.map((item) => String(item).trim()).filter(Boolean))].slice(0, 10)
    : [];
  const appointmentPeriod = ['morning', 'afternoon', 'evening', 'any'].includes(value.appointmentPeriod)
    ? value.appointmentPeriod
    : null;

  if (specialties.length === 0 || !appointmentPeriod) return null;
  return { specialties, appointmentPeriod };
}
