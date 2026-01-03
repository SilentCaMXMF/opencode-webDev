import { MetricsCollector } from './collector';

const collector = new MetricsCollector(parseInt(process.env.PORT || '3000'));

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  collector.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  collector.stop();
  process.exit(0);
});

// Start the collector
collector.start();
