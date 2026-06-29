import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        landing2: resolve(__dirname, 'landing2.html'),
        marketplace: resolve(__dirname, 'marketplace.html'),
        projectDetails: resolve(__dirname, 'project-details.html'),
        quantity: resolve(__dirname, 'quantity.html'),
        impact: resolve(__dirname, 'impact.html'),
        summary: resolve(__dirname, 'summary.html'),
        confirmed: resolve(__dirname, 'confirmed.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        portfolio: resolve(__dirname, 'portfolio.html'),
        verification: resolve(__dirname, 'verification.html'),
        team: resolve(__dirname, 'team.html'),
        purchase: resolve(__dirname, 'purchase.html'),
        registry: resolve(__dirname, 'registry.html'),
        sustainability: resolve(__dirname, 'sustainability.html'),
        audit: resolve(__dirname, 'audit.html'),
        methodology: resolve(__dirname, 'methodology.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        status: resolve(__dirname, 'status.html')
      }
    }
  }
});
