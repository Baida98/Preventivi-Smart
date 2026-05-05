import { test, expect } from '@playwright/test';

test.describe('Wizard Flow', () => {
  test('completes the wizard successfully', async ({ page }) => {
    await page.goto('/');
    
    // Inizia analisi
    await page.click('button:has-text("Analizza Preventivo")');
    
    // Step 1: Categoria
    await expect(page.locator('text=Seleziona Categoria')).toBeVisible();
    await page.click('text=Edilizia');
    await page.click('button:has-text("Continua")');
    
    // Step 2: Configurazione (assumendo che ci siano campi da compilare)
    // Qui andrebbero aggiunti i campi specifici del wizard
    
    // Verifica risultati (placeholder)
    // await expect(page.locator('text=Benchmark di Mercato')).toBeVisible();
  });

  test('Modal body scroll lock on iOS', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.click('button:has-text("Analizza Preventivo")');
    
    const bodyOverflow = await page.evaluate(() => {
      return window.getComputedStyle(document.body).overflow;
    });
    expect(bodyOverflow).toBe('hidden');
  });
});
