'use client';

import { useEffect, useState } from 'react';
import { loadPatient, savePatientPreferences, savePersonalData } from '../lib/patient-api';

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
  const [preferences, setPreferences] = useState({ specialties: '', appointmentPeriod: 'any' });
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedToken = window.localStorage.getItem('mediq.patientToken');
    if (!savedToken) return;
    loadPatient(savedToken)
      .then(({ patient }) => {
        setToken(savedToken);
        setStep(patient.onboardingCompleted ? 3 : 2);
        if (patient.preferences) {
          setPreferences({
            specialties: patient.preferences.specialties.join(', '),
            appointmentPeriod: patient.preferences.appointmentPeriod
          });
        }
      })
      .catch(() => window.localStorage.removeItem('mediq.patientToken'));
  }, []);

  function updateField(field, value) {
    const formatter = field === 'birthDate' ? formatBirthDate : field === 'cpf' ? formatCpf : (text) => text;
    setForm((current) => ({ ...current, [field]: formatter(value) }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().split(/\s+/).length < 2) nextErrors.name = 'Informe seu nome completo.';
    if (!isValidBirthDate(form.birthDate)) nextErrors.birthDate = 'Informe uma data válida.';
    if (!isValidCpf(form.cpf)) nextErrors.cpf = 'Informe um CPF válido.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    setMessage('');
    try {
      const result = await savePersonalData({ fullName: form.name, birthDate: form.birthDate, cpf: form.cpf });
      window.localStorage.setItem('mediq.patientToken', result.token);
      setToken(result.token);
      setForm((current) => ({ ...current, cpf: '' }));
      setStep(2);
    } catch (error) {
      if (error.status === 409) {
        setMessage('Este CPF já possui cadastro. Entre com a sessão existente para continuar.');
      } else if (error.fields) {
        setErrors({ name: error.fields.fullName, birthDate: error.fields.birthDate, cpf: error.fields.cpf });
      } else {
        setMessage('Não foi possível conectar à Mediq. Tente novamente em instantes.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePreferencesSubmit(event) {
    event.preventDefault();
    const specialties = preferences.specialties.split(',').map((item) => item.trim()).filter(Boolean);
    if (!specialties.length) {
      setMessage('Informe ao menos uma especialidade de interesse.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    try {
      await savePatientPreferences(token, { specialties, appointmentPeriod: preferences.appointmentPeriod });
      setStep(3);
      setMessage('Onboarding concluído. Suas preferências foram salvas.');
    } catch {
      setMessage('Não foi possível salvar suas preferências. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
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
        <button className={step === 1 ? 'active' : ''} type="button" onClick={() => setStep(1)} aria-current={step === 1 ? 'page' : undefined}>Dados pessoais</button>
        <button className={step >= 2 ? 'active' : ''} type="button" onClick={() => token && setStep(2)} disabled={!token} aria-current={step >= 2 ? 'page' : undefined}>Preferências</button>
      </aside>

      <main id="main-content" className="content">
        <div className="content-inner">
          <p className="step-label">Etapa {step === 1 ? 1 : 2} de 2</p>
          <div className={`progress step-${step}`} role="progressbar" aria-valuemin="1" aria-valuemax="2" aria-valuenow={step === 1 ? 1 : 2} aria-label="Progresso do cadastro"><span /><span /></div>
          <section className="intro-block">
            <h1>{step === 1 ? 'Vamos conhecer você' : step === 2 ? 'Conte suas preferências' : 'Tudo pronto'}</h1>
            <p>{step === 1 ? 'Leva menos de dois minutos. Usaremos essas informações para facilitar seus agendamentos.' : step === 2 ? 'Essas escolhas ajudam a Mediq a encontrar opções mais relevantes para você.' : 'Seu perfil está pronto para encontrar médicos e horários compatíveis.'}</p>
          </section>

          {step === 1 && <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
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
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Continuar'}</button>
            {message && <p className="form-message error-message" role="alert">{message}</p>}
          </form>}

          {step === 2 && <form className="preferences-form" onSubmit={handlePreferencesSubmit}>
            <div className="form-heading"><h2>Preferências</h2><p>Personalize suas próximas buscas e agendamentos.</p></div>
            <div className="field field-full">
              <label htmlFor="specialties">Especialidades de interesse</label>
              <input id="specialties" placeholder="Ex.: Cardiologia, Dermatologia" value={preferences.specialties} onChange={(event) => { setPreferences((current) => ({ ...current, specialties: event.target.value })); setMessage(''); }} />
              <span className="hint">Separe mais de uma especialidade por vírgulas.</span>
            </div>
            <div className="field field-full final-field">
              <label htmlFor="period">Período preferido</label>
              <select id="period" value={preferences.appointmentPeriod} onChange={(event) => setPreferences((current) => ({ ...current, appointmentPeriod: event.target.value }))}>
                <option value="any">Qualquer período</option>
                <option value="morning">Manhã</option>
                <option value="afternoon">Tarde</option>
                <option value="evening">Noite</option>
              </select>
            </div>
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Concluir'}</button>
            {message && <p className="form-message error-message" role="alert">{message}</p>}
          </form>}

          {step === 3 && <section className="completion-card" role="status">
            <div className="completion-icon" aria-hidden="true">✓</div>
            <h2>Cadastro concluído</h2>
            <p>{message || 'Seus dados e preferências estão salvos com segurança.'}</p>
            <button type="button" onClick={() => setStep(2)}>Editar preferências</button>
          </section>}
        </div>
      </main>
    </div>
  );
}
