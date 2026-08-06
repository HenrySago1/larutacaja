import { test, expect } from '@playwright/test';

test.describe('La Ruta - Flujo de Caja, Cajeros e Impulsadoras', () => {
  test('Login como Administrador', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    
    // Formulario de login
    await page.fill('input[type="email"]', 'admin@laruta.com');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button:has-text("Ingresar")');

    // Debe ingresar al sistema
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('Apertura y Cierre de Caja', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'admin@laruta.com');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button:has-text("Ingresar")');

    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });

    // Si está en Apertura de Caja, completar dinero inicial
    if (page.url().includes('/apertura')) {
      await page.fill('input[type="number"] >> nth=0', '500');
      await page.fill('input[type="number"] >> nth=1', '50');
      await page.click('button:has-text("Confirmar y abrir caja")');
      await page.waitForURL((url) => url.pathname.includes('/pos'), { timeout: 10000 });
    }

    // Verificar que estamos en la Terminal de Ventas (POS)
    await expect(page.locator('h1')).toContainText('Terminal de Ventas');
  });
});
