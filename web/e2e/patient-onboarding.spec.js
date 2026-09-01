import { expect, test } from '@playwright/test';
import path from 'node:path';

const evidenceDir = path.resolve(process.env.EVIDENCE_DIR || 'test-results');

test('paciente conclui o onboarding', async ({ page }) => {
  await page.route('**/api/patients/onboarding/personal', (route) => route.fulfill({
    json: { token: 'evidence-token', patient: { id: 'patient-evidence' } },
  }));
  await page.route('**/api/patients/me/preferences', (route) => route.fulfill({
    json: { patient: { onboardingCompleted: true } },
  }));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Vamos conhecer você' })).toBeVisible();

  await page.getByLabel('Nome completo').fill('Maria da Silva');
  await page.getByLabel('Data de nascimento').fill('15061990');
  await page.getByLabel('CPF').fill('52998224725');
  await page.screenshot({ path: path.join(evidenceDir, '01-dados-pessoais.png'), fullPage: true });
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page.getByRole('heading', { name: 'Conte suas preferências' })).toBeVisible();
  await page.getByLabel('Especialidades de interesse').fill('Cardiologia, Dermatologia');
  await page.getByLabel('Período preferido').selectOption('morning');
  await page.screenshot({ path: path.join(evidenceDir, '02-preferencias.png'), fullPage: true });
  await page.getByRole('button', { name: 'Concluir' }).click();

  await expect(page.getByRole('heading', { name: 'Cadastro concluído' })).toBeVisible();
  await expect(page.getByText('Onboarding concluído. Suas preferências foram salvas.')).toBeVisible();
  await page.screenshot({ path: path.join(evidenceDir, '03-cadastro-concluido.png'), fullPage: true });
});
