import { expect, test } from '@playwright/test';

test('public simulator and local admin journey work without exposing a token', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('MPL Indonesia Local Season')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Probabilitas playoff' })).toBeVisible();
  await expect(page.getByText('Fixture C')).toBeVisible();
  await page.getByRole('button', { name: '2-0' }).first().click();
  await expect(page.getByRole('button', { name: '2-0' }).first()).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/admin');
  await page.getByLabel('Email').fill('local-admin@example.test');
  await page.getByLabel('Password').fill('local-admin-password');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page.getByRole('heading', { name: 'API key PandaScore' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Status sinkronisasi' })).toBeVisible();
  await expect(page.getByText('Belum ada riwayat sinkronisasi.')).toBeVisible();
  await page.getByLabel('Token baru').fill('fixture-token-not-exposed');
  await page.getByRole('button', { name: 'Simpan token' }).click();
  await expect(page.getByText('Terkonfigurasi')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('fixture-token-not-exposed');
  await page.getByRole('button', { name: 'Sinkronkan sekarang' }).click();
  await expect(page.getByText(/Sinkronisasi selesai/)).toBeVisible();
  await expect(page.getByRole('table', { name: 'Riwayat sinkronisasi' })).toBeVisible();
});
