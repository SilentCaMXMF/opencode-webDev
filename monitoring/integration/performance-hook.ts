/**
 * Frontend Performance Monitoring Hook
 * Integrates with any frontend application to collect Core Web Vitals
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Collect Core Web Vitals using the Web Vitals library
 */
export class PerformanceCollector {
  private sessionId: string;
  private collectorUrl: string;
  private metrics: Map<string, PerformanceMetric> = new Map();

  constructor(sessionId: string, collectorUrl: string = 'http://localhost:3000') {
    this.sessionId = sessionId;
    this.collectorUrl = collectorUrl;

    // Initialize session ID
    if (typeof window !== 'undefined') {
      this.sessionId = this.getSessionId();
    }
  }

  /**
   * Initialize performance monitoring
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Load Web Vitals library dynamically
    const webVitals = await import('web-vitals');

    // Register Core Web Vitals
    webVitals.onLCP((metric) => this.handleMetric('LCP', metric));
    webVitals.onFID((metric) => this.handleMetric('FID', metric));
    webVitals.onCLS((metric) => this.handleMetric('CLS', metric));
    webVitals.onFCP((metric) => this.handleMetric('FCP', metric));
    webVitals.onTTFB((metric) => this.handleMetric('TTFB', metric));

    // Track custom metrics
    this.trackNavigationTiming();
    this.trackResourceTiming();
  }

  /**
   * Handle incoming metric
   */
  private handleMetric(name: string, metric: any): void {
    const performanceMetric: PerformanceMetric = {
      name,
      value: metric.value,
      rating: metric.rating
    };

    this.metrics.set(name, performanceMetric);

    // Send to collector
    this.sendMetrics();
  }

  /**
   * Track Navigation Timing
   */
  private trackNavigationTiming(): void {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      this.metrics.set('first_paint', {
        name: 'first_paint',
        value: navigation.responseStart - navigation.fetchStart,
        rating: 'good'
      });

      this.metrics.set('dom_content_loaded', {
        name: 'dom_content_loaded',
        value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        rating: 'good'
      });

      this.metrics.set('load_complete', {
        name: 'load_complete',
        value: navigation.loadEventEnd - navigation.fetchStart,
        rating: 'good'
      });
    }
  }

  /**
   * Track Resource Timing
   */
  private trackResourceTiming(): void {
    if (typeof window === 'undefined') return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const scriptResources = resources.filter(r => r.initiatorType === 'script');
    const totalScriptTime = scriptResources.reduce((sum, r) => sum + r.duration, 0);

    this.metrics.set('javascript_time', {
      name: 'javascript_time',
      value: totalScriptTime,
      rating: 'good'
    });
  }

  /**
   * Send metrics to collector
   */
  private async sendMetrics(): Promise<void> {
    try {
      const url = this.collectorUrl + '/api/v1/metrics/core-web-vitals';

      const lcp = this.metrics.get('LCP');
      const fid = this.metrics.get('FID');
      const cls = this.metrics.get('CLS');
      const fcp = this.metrics.get('FCP');

      const performanceScore = this.calculatePerformanceScore();

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          url: window.location.href,
          sessionId: this.sessionId,
          metrics: {
            lcp: lcp?.value,
            fid: fid?.value,
            cls: cls?.value,
            fcp: fcp?.value
          },
          performanceScore
        })
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(): number {
    let score = 0;
    let count = 0;

    const lcp = this.metrics.get('LCP');
    const fid = this.metrics.get('FID');
    const cls = this.metrics.get('CLS');

    if (lcp) {
      if (lcp.value < 2500) score += 100;
      else if (lcp.value < 4000) score += 75;
      else score += 50;
      count++;
    }

    if (fid) {
      if (fid.value < 100) score += 100;
      else if (fid.value < 300) score += 75;
      else score += 50;
      count++;
    }

    if (cls) {
      if (cls.value < 0.1) score += 100;
      else if (cls.value < 0.25) score += 75;
      else score += 50;
      count++;
    }

    return count > 0 ? Math.round(score / count) : 0;
  }

  /**
   * Get or generate session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performance_session_id');

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('performance_session_id', sessionId);
    }

    return sessionId;
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get performance score
   */
  getPerformanceScore(): number {
    return this.calculatePerformanceScore();
  }
}

/**
 * React Hook for performance monitoring
 */
export function usePerformanceMonitoring(sessionId?: string, collectorUrl?: string) {
  const collector = new PerformanceCollector(
    sessionId || '',
    collectorUrl || 'http://localhost:3000'
  );

  return {
    initialize: () => collector.initialize(),
    getMetrics: () => collector.getMetrics(),
    getPerformanceScore: () => collector.getPerformanceScore()
  };
}

/**
 * React component wrapper for automatic performance tracking
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function TrackedComponent(props: P) {
    const collector = React.useMemo(() => new PerformanceCollector(''), []);

    React.useEffect(() => {
      collector.initialize();

      return () => {
        // Cleanup
      };
    }, [collector]);

    return React.createElement(WrappedComponent, props);
  };
}
