import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';

// Configuration with fallbacks and validation
const getSupabaseConfig = () => {
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  // Validate required configuration
  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('EXPO_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');

    console.error(`Missing required Supabase configuration: ${missingVars.join(', ')}`);
    throw new Error(`Supabase configuration incomplete. Missing: ${missingVars.join(', ')}`);
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error('Invalid Supabase URL format');
  }

  return { supabaseUrl, supabaseAnonKey };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

// Custom logger for development and production
const createSupabaseLogger = () => {
  const isDev = __DEV__;

  return {
    debug: (message: string, ...args: any[]) => {
      if (isDev) {
        console.log(`🔍 [Supabase Debug] ${message}`, ...args);
      }
    },
    error: (message: string, error?: any) => {
      console.error(`❌ [Supabase Error] ${message}`, error);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`⚠️ [Supabase Warn] ${message}`, ...args);
    }
  };
};

const logger = createSupabaseLogger();

// Enhanced Supabase client with additional features
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => {
        try {
          if (Platform.OS !== 'web') {
            // For React Native: SecureStore.getItemAsync(key)
          }
          return localStorage.getItem(key);
        } catch (error) {
          logger.error('Error reading from storage', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          if (Platform.OS !== 'web') {
            // For React Native: SecureStore.setItemAsync(key, value)
          }
          localStorage.setItem(key, value);
        } catch (error) {
          logger.error('Error writing to storage', error);
        }
      },
      removeItem: (key) => {
        try {
          if (Platform.OS !== 'web') {
            // For React Native: SecureStore.deleteItemAsync(key)
          }
          localStorage.removeItem(key);
        } catch (error) {
          logger.error('Error removing from storage', error);
        }
      },
    },
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': `afrimed-app/${Constants.expoConfig?.version || '1.0.0'}`,
      'X-Platform': Platform.OS,
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// App state management for Supabase
let appStateSubscription: any = null;

export const initializeSupabaseAppState = () => {
  if (appStateSubscription) return;

  appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
    logger.debug('App state changed', { nextAppState });

    if (nextAppState === 'active') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          logger.debug('App foregrounded, session refreshed');
        }
      });
    } else if (nextAppState === 'background') {
      logger.debug('App backgrounded');
    }
  });
};

// Enhanced query utilities
export class SupabaseService {
  private static instance: SupabaseService;

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  async safeQuery<T>(
    query: Promise<{ data: T | null; error: any }>,
    operation: string
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const { data, error } = await query;

      if (error) {
        logger.error(`Supabase ${operation} error`, error);
        return { data: null, error: this.formatErrorMessage(error, operation) };
      }

      logger.debug(`Supabase ${operation} successful`, { dataCount: Array.isArray(data) ? data.length : data ? 1 : 0 });
      return { data, error: null };
    } catch (error) {
      logger.error(`Unexpected error during ${operation}`, error);
      return { data: null, error: 'An unexpected error occurred' };
    }
  }

  private formatErrorMessage(error: any, operation: string): string {
    if (error.code === 'PGRST301') {
      return 'The requested resource was not found.';
    } else if (error.code === '42501') {
      return 'You do not have permission to perform this action.';
    } else if (error.code === '23505') {
      return 'This record already exists.';
    } else if (error.code === 'PGRST116') {
      return 'No data found for your request.';
    } else if (error.message?.includes('JWT')) {
      return 'Your session has expired. Please sign in again.';
    } else if (error.message) {
      return error.message;
    }

    return `Failed to ${operation}. Please try again.`;
  }

  async batchOperation<T>(
    operations: Array<Promise<{ data: T | null; error: any }>>,
    operationName: string
  ): Promise<{ results: T[]; errors: string[] }> {
    const results: T[] = [];
    const errors: string[] = [];

    const settledResults = await Promise.allSettled(operations);

    settledResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { data, error } = result.value;
        if (error) {
          errors.push(`Operation ${index + 1}: ${error}`);
        } else if (data) {
          results.push(data);
        }
      } else {
        errors.push(`Operation ${index + 1}: ${result.reason}`);
      }
    });

    if (errors.length > 0) {
      logger.warn(`Batch ${operationName} completed with errors`, { success: results.length, errors: errors.length });
    } else {
      logger.debug(`Batch ${operationName} completed successfully`, { count: results.length });
    }

    return { results, errors };
  }

  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) return { healthy: false, error: error.message };
      return { healthy: true };
    } catch (error: any) {
      return { healthy: false, error: error.message };
    }
  }
}

export const supabaseService = SupabaseService.getInstance();

export const supabaseHelpers = {
  paginate: (query: any, page: number, pageSize: number = 20) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    return query.range(from, to);
  },

  filterBy: (query: any, filters: Record<string, any>) => {
    let filteredQuery = query;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filteredQuery = filteredQuery.eq(key, value);
      }
    });
    return filteredQuery;
  },

  search: (query: any, searchTerm: string, searchColumns: string[]) => {
    if (!searchTerm) return query;
    return query.or(searchColumns.map(column => `${column}.ilike.%${searchTerm}%`).join(','));
  },
};

initializeSupabaseAppState();

/* ✅ FIXED DEV UTILITIES (no recursion) */
if (__DEV__) {
  logger.debug('Supabase initialized', {
    url: supabaseUrl.replace(/\/\/[^@]*@/, '//***@'),
    platform: Platform.OS,
    version: Constants.expoConfig?.version,
  });

  // Attach a passive listener for debug logging, without overwriting the original method
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    logger.debug('Auth state changed', { event, hasSession: !!session });
  });

  // Automatically clean up when the app closes
  if (listener?.subscription) {
    AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        listener.subscription.unsubscribe?.();
      }
    });
  }
}

export type SupabaseTables = {
  profiles: any;
  medical_scans: any;
  donation_requests: any;
  clinics: any;
};

export type Database = {
  public: {
    Tables: SupabaseTables;
  };
};
