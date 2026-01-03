import { AlertManager } from './alert-manager';
import { MetricsStorage } from '../collector/src/storage';

const storage = new MetricsStorage();
const alertManager = new AlertManager(storage);

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await storage.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await storage.close();
  process.exit(0);
});

console.log('Alerting system started');

// Keep process running
setInterval(() => {
  // Health check
}, 60000);
