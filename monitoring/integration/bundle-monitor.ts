/**
 * Bundle size monitoring utility
 * Tracks JavaScript bundle sizes and detects regressions
 */

export interface BundleMetric {
  name: string;
  size: number;
  gzippedSize: number;
  timestamp: Date;
}

export class BundleSizeMonitor {
  private metrics: Map<string, BundleMetric[]> = new Map();
  private baselines: Map<string, number> = new Map();
  private collectorUrl: string;

  constructor(collectorUrl: string = 'http://localhost:3000') {
    this.collectorUrl = collectorUrl;
    this.loadBaselines();
  }

  /**
   * Record bundle size
   */
  recordBundle(name: string, size: number, gzippedSize: number): void {
    const metric: BundleMetric = {
      name,
      size,
      gzippedSize,
      timestamp: new Date()
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(metric);

    // Check for regression
    this.checkForRegression(name, size);

    // Send to collector
    this.sendMetric(metric);
  }

  /**
   * Check for size regression
   */
  private checkForRegression(name: string, size: number): boolean {
    const baseline = this.baselines.get(name);

    if (!baseline) {
      // Set as baseline if we don't have one
      this.setBaseline(name, size);
      return false;
    }

    const threshold = 0.1; // 10% increase threshold
    const regression = size > baseline * (1 + threshold);

    if (regression) {
      console.warn(
        `Bundle size regression detected: ${name} ` +
        `(current: ${size}, baseline: ${baseline}, increase: ${((size - baseline) / baseline * 100).toFixed(1)}%)`
      );
    }

    return regression;
  }

  /**
   * Set baseline for bundle
   */
  setBaseline(name: string, size: number): void {
    this.baselines.set(name, size);
    this.saveBaselines();
  }

  /**
   * Get bundle history
   */
  getHistory(name: string): BundleMetric[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Get all bundle metrics
   */
  getAllMetrics(): Map<string, BundleMetric[]> {
    return this.metrics;
  }

  /**
   * Calculate total bundle size
   */
  calculateTotalSize(): number {
    let total = 0;
    const latestMetrics = this.getLatestMetrics();

    for (const metric of latestMetrics.values()) {
      total += metric.size;
    }

    return total;
  }

  /**
   * Get latest metrics for all bundles
   */
  getLatestMetrics(): Map<string, BundleMetric> {
    const latest = new Map<string, BundleMetric>();

    for (const [name, metrics] of this.metrics.entries()) {
      if (metrics.length > 0) {
        latest.set(name, metrics[metrics.length - 1]);
      }
    }

    return latest;
  }

  /**
   * Send metric to collector
   */
  private async sendMetric(metric: BundleMetric): Promise<void> {
    try {
      await fetch(`${this.collectorUrl}/api/v1/metrics/bundle-size`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      console.error('Failed to send bundle size metric:', error);
    }
  }

  /**
   * Load baselines from storage
   */
  private loadBaselines(): void {
    try {
      const stored = localStorage.getItem('bundle_baselines');
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [name, size] of Object.entries(parsed)) {
          this.baselines.set(name, size as number);
        }
      }
    } catch (error) {
      console.error('Failed to load baselines:', error);
    }
  }

  /**
   * Save baselines to storage
   */
  private saveBaselines(): void {
    try {
      const obj = Object.fromEntries(this.baselines);
      localStorage.setItem('bundle_baselines', JSON.stringify(obj));
    } catch (error) {
      console.error('Failed to save baselines:', error);
    }
  }
}

/**
 * Create bundle analyzer from webpack stats
 */
export function analyzeWebpackStats(stats: any): BundleMetric[] {
  const metrics: BundleMetric[] = [];

  if (stats.assets) {
    for (const asset of stats.assets) {
      if (asset.name.endsWith('.js')) {
        metrics.push({
          name: asset.name,
          size: asset.size,
          gzippedSize: Math.round(asset.size * 0.3), // Estimate
          timestamp: new Date()
        });
      }
    }
  }

  return metrics;
}
