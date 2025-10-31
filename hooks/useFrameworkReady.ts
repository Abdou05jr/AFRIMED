import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

declare global {
  interface Window {
    frameworkReady?: () => void;
    frameworkError?: (error: any) => void;
    frameworkEvent?: (event: string, data?: any) => void;
    __frameworkEventBound?: boolean;
  }
}

interface FrameworkConfig {
  onReady?: () => void;
  onError?: (error: any) => void;
  onEvent?: (event: string, data?: any) => void;
  enablePerformanceMonitoring?: boolean;
  enableErrorTracking?: boolean;
  enableAnalytics?: boolean;
}

interface FrameworkMetrics {
  readyTime?: number;
  loadTime?: number;
  componentCount?: number;
  errorCount: number;
  events: Array<{ event: string; timestamp: number; data?: any }>;
}

class FrameworkMonitor {
  private static instance: FrameworkMonitor;
  private metrics: FrameworkMetrics = {
    errorCount: 0,
    events: [],
  };
  private startTime: number;
  private readyTime: number | null = null;

  private constructor() {
    this.startTime = Date.now();
    this.initializeGlobalHandlers();
  }

  public static getInstance(): FrameworkMonitor {
    if (!FrameworkMonitor.instance) {
      FrameworkMonitor.instance = new FrameworkMonitor();
    }
    return FrameworkMonitor.instance;
  }

  private initializeGlobalHandlers() {
    // Global error handler
    if (typeof window !== 'undefined') {
      const originalErrorHandler = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        this.trackError(error || new Error(message as string));
        originalErrorHandler?.(message, source, lineno, colno, error);
      };

      // Unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError(event.reason);
      });
    }
  }

  public markReady() {
    this.readyTime = Date.now();
    this.metrics.readyTime = this.readyTime - this.startTime;
    this.trackEvent('framework_ready', {
      readyTime: this.metrics.readyTime,
      platform: Platform.OS,
    });
  }

  public trackError(error: any) {
    this.metrics.errorCount++;

    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: Date.now(),
      platform: Platform.OS,
    };

    this.metrics.events.push({
      event: 'error',
      timestamp: Date.now(),
      data: errorInfo,
    });

    // Notify global error handler
    window.frameworkError?.(errorInfo);

    // Log to console in development
    if (__DEV__) {
      console.error('Framework Error:', errorInfo);
    }
  }

  public trackEvent(event: string, data?: any) {
    // ✅ Prevent recursive tracking from window.frameworkEvent
    if (event === '__internal_trackEvent') return;

    this.metrics.events.push({
      event,
      timestamp: Date.now(),
      data,
    });

    // ✅ Avoid recursion: trigger only if handler is different from trackEvent
    const globalHandler = window.frameworkEvent;
    if (globalHandler && globalHandler !== this.safeFrameworkEvent) {
      try {
        globalHandler('__internal_trackEvent', { event, data });
      } catch (err) {
        console.warn('Global frameworkEvent handler error:', err);
      }
    }

    // Log to console in development
    if (__DEV__) {
      console.log(`Framework Event: ${event}`, data);
    }
  }

  // ✅ Safe event dispatcher (used internally)
  private safeFrameworkEvent = (event: string, data?: any) => {
    if (event === '__internal_trackEvent') return; // guard
    this.trackEvent(event, data);
  };

  public getMetrics(): FrameworkMetrics {
    return {
      ...this.metrics,
      loadTime: this.readyTime ? Date.now() - this.startTime : undefined,
    };
  }

  public reset() {
    this.metrics = {
      errorCount: 0,
      events: [],
    };
    this.startTime = Date.now();
    this.readyTime = null;
  }
}

export function useFrameworkReady(config: FrameworkConfig = {}) {
  const {
    onReady,
    onError,
    onEvent,
    enablePerformanceMonitoring = true,
    enableErrorTracking = true,
    enableAnalytics = true,
  } = config;

  const monitorRef = useRef<FrameworkMonitor>(FrameworkMonitor.getInstance());
  const hasFiredReady = useRef(false);

  useEffect(() => {
    const monitor = monitorRef.current;

    // Set up global handlers safely
    if (enableErrorTracking) {
      window.frameworkError = (error) => {
        onError?.(error);
        monitor.trackError(error);
      };
    }

    if (enableAnalytics && !window.__frameworkEventBound) {
      // ✅ Safe global event handler to avoid recursion
      const safeHandler = (event: string, data?: any) => {
        if (event === '__internal_trackEvent') return; // skip internal calls
        onEvent?.(event, data);
        monitor.trackEvent(event, data);
      };

      window.frameworkEvent = safeHandler;
      window.__frameworkEventBound = true;
    }

    // Mark framework as ready (only once)
    if (!hasFiredReady.current) {
      hasFiredReady.current = true;

      const readyTimer = setTimeout(() => {
        monitor.markReady();
        window.frameworkReady?.();
        onReady?.();

        // Track initial load performance
        if (enablePerformanceMonitoring) {
          monitor.trackEvent('app_initialized', {
            platform: Platform.OS,
            timestamp: Date.now(),
            readyTime: monitor.getMetrics().readyTime,
          });
        }
      }, 100);

      return () => clearTimeout(readyTimer);
    }
  }, [onReady, onError, onEvent, enablePerformanceMonitoring, enableErrorTracking, enableAnalytics]);

  // Track component mount/unmount for debugging
  useEffect(() => {
    const monitor = monitorRef.current;

    if (enableAnalytics) {
      monitor.trackEvent('component_mounted', {
        hook: 'useFrameworkReady',
        timestamp: Date.now(),
      });

      return () => {
        monitor.trackEvent('component_unmounted', {
          hook: 'useFrameworkReady',
          timestamp: Date.now(),
        });
      };
    }
  }, [enableAnalytics]);

  return {
    trackEvent: (event: string, data?: any) => monitorRef.current.trackEvent(event, data),
    trackError: (error: any) => monitorRef.current.trackError(error),
    getMetrics: () => monitorRef.current.getMetrics(),
    resetMetrics: () => monitorRef.current.reset(),
  };
}

// Additional hooks for specific use cases
export function useFrameworkMetrics() {
  const monitor = FrameworkMonitor.getInstance();

  return {
    getMetrics: () => monitor.getMetrics(),
    resetMetrics: () => monitor.reset(),
  };
}

export function useFrameworkEvents(onEvent?: (event: string, data?: any) => void) {
  useEffect(() => {
    if (onEvent) {
      const originalHandler = window.frameworkEvent;
      window.frameworkEvent = (event, data) => {
        if (event === '__internal_trackEvent') return;
        originalHandler?.(event, data);
        onEvent(event, data);
      };

      return () => {
        window.frameworkEvent = originalHandler;
      };
    }
  }, [onEvent]);
}

export function useFrameworkErrors(onError?: (error: any) => void) {
  useEffect(() => {
    if (onError) {
      const originalHandler = window.frameworkError;
      window.frameworkError = (error) => {
        originalHandler?.(error);
        onError(error);
      };

      return () => {
        window.frameworkError = originalHandler;
      };
    }
  }, [onError]);
}

// Utility function for manual framework ready triggering
export function triggerFrameworkReady() {
  const monitor = FrameworkMonitor.getInstance();
  monitor.markReady();
  window.frameworkReady?.();
}

// Utility function for tracking custom events
export function trackFrameworkEvent(event: string, data?: any) {
  const monitor = FrameworkMonitor.getInstance();
  monitor.trackEvent(event, data);
}

// Utility function for tracking errors
export function trackFrameworkError(error: any) {
  const monitor = FrameworkMonitor.getInstance();
  monitor.trackError(error);
}

// Export the monitor for direct access if needed
export const frameworkMonitor = FrameworkMonitor.getInstance();
