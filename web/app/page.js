'use client';

import { useState } from 'react';

const onlyDigits = (value) => value.replace(/\D/g, '');

function formatBirthDate(value) {
  const digits = onlyDigits(value).slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join(' / ');
}

function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function isValidBirthDate(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 8) return false;
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4));
  const date = new Date(year, month - 1, day);
  return year >= 1900 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= new Date();
}

function isValidCpf(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const digit = (length) => {
    const sum = cpf.slice(0, length).split('').reduce((total, number, index) => total + Number(number) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export default function PatientOnboarding() {
  const [form, setForm] = useState({ name: '', birthDate: '', cpf: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function updateField(field, value) {
    const formatter = field === 'birthDate' ? formatBirthDate : field === 'cpf' ? formatCpf : (text) => text;
    setForm((current) => ({ ...current, [field]: formatter(value) }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitted(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().split(/\s+/).length < 2) nextErrors.name = 'Informe seu nome completo.';
    if (!isValidBirthDate(form.birthDate)) nextErrors.birthDate = 'Informe uma data válida.';
    if (!isValidCpf(form.cpf)) nextErrors.cpf = 'Informe um CPF válido.';
    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#main-content" aria-label="Mediq, ir para o conteúdo">mediq</a>
        <div className="topbar-actions">
          <a className="help-link" href="mailto:ajuda@mediq.com">Central de ajuda</a>
          <span className="user-pill" aria-label="Usuário Vinicius"><b>VM</b><span>Vinicius</span></span>
        </div>
      </header>

      <aside className="sidebar" aria-label="Configuração da conta">
        <p className="nav-heading">Configuração</p>
        <a href="#account">Minha conta</a>
        <a className="active" href="#personal" aria-current="page">Dados pessoais</a>
        <a href="#preferences">Preferências</a>
      </aside>

      <main id="main-content" className="content">
        <div className="content-inner">
          <p className="step-label">Etapa 1 de 2</p>
          <div className="progress" role="progressbar" aria-valuemin="1" aria-valuemax="2" aria-valuenow="1" aria-label="Progresso do cadastro"><span /><span /></div>
          <section className="intro-block">
            <h1>Vamos conhecer você</h1>
            <p>Leva menos de dois minutos. Usaremos essas informações para facilitar seus agendamentos.</p>
          </section>

          <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
            <div className="form-heading"><h2>Dados pessoais</h2><p>Informações básicas para a sua conta.</p></div>
            <div className="field field-full">
              <label htmlFor="name">Nome completo</label>
              <input id="name" name="name" autoComplete="name" placeholder="Como está no seu documento" value={form.name} onChange={(event) => updateField('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
              {errors.name && <span className="error" id="name-error">{errors.name}</span>}
            </div>
            <div className="field">
              <label htmlFor="birth-date">Data de nascimento</label>
              <input id="birth-date" name="birthDate" inputMode="numeric" autoComplete="bday" placeholder="DD / MM / AAAA" value={form.birthDate} onChange={(event) => updateField('birthDate', event.target.value)} aria-invalid={Boolean(errors.birthDate)} aria-describedby={errors.birthDate ? 'birth-date-error' : undefined} />
              {errors.birthDate && <span className="error" id="birth-date-error">{errors.birthDate}</span>}
            </div>
            <div className="field">
              <label htmlFor="cpf">CPF</label>
              <input id="cpf" name="cpf" inputMode="numeric" placeholder="000.000.000-00" value={form.cpf} onChange={(event) => updateField('cpf', event.target.value)} aria-invalid={Boolean(errors.cpf)} aria-describedby={errors.cpf ? 'cpf-error' : undefined} />
              {errors.cpf && <span className="error" id="cpf-error">{errors.cpf}</span>}
            </div>
            <button type="submit">Continuar</button>
            {submitted && <p className="success" role="status">Dados validados. Você pode seguir para Preferências.</p>}
          </form>
        </div>
      </main>
    </div>
  );
}
