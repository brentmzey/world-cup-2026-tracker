import PocketBase from 'pocketbase';

export interface TenantConfig {
  tenantId: string;
  appName: string;
  theme: {
    primaryRgb: string;     // e.g. "212, 175, 55"
    secondaryRgb: string;   // e.g. "30, 41, 59"
    accentRgb: string;      // e.g. "236, 72, 153"
    bgRgb: string;          // e.g. "10, 15, 26"
    cardBgRgb: string;      // e.g. "22, 28, 45"
  };
  features: {
    enablePredictions: boolean;
    enableLiveScores: boolean;
    enableChat: boolean;
    enableStadiumGuide: boolean;
  };
  eventInfo: {
    title: string;
    description: string;
  };
  pocketbaseUrl?: string;
  configSource: string;
}

export interface SystemConfig {
  tenantId: string | null;
  pocketbaseUrl: string | null;
  configSource: string;
  isTauri: boolean;
}

// Pre-defined Mock Database Tenants (representing data stored in PocketBase / ConfigMaps)
export const MOCK_DB_TENANTS: Record<string, Omit<TenantConfig, 'configSource'>> = {
  'world-cup-classic': {
    tenantId: 'world-cup-classic',
    appName: 'World Cup 2026 Tracker',
    theme: {
      primaryRgb: '212, 175, 55',    // Classic Gold
      secondaryRgb: '30, 41, 59',    // Deep Slate
      accentRgb: '236, 72, 153',     // Pink
      bgRgb: '10, 15, 26',           // Dark Blue/Black
      cardBgRgb: '22, 28, 45'        // Card Navy
    },
    features: {
      enablePredictions: true,
      enableLiveScores: true,
      enableChat: false,
      enableStadiumGuide: true
    },
    eventInfo: {
      title: 'United 2026',
      description: 'The 23rd FIFA World Cup across Canada, Mexico, and the United States.'
    }
  },
  'usa-pride': {
    tenantId: 'usa-pride',
    appName: 'US Soccer Fans 2026',
    theme: {
      primaryRgb: '10, 49, 97',      // US Navy Blue
      secondaryRgb: '190, 10, 40',   // Red
      accentRgb: '212, 175, 55',     // Gold
      bgRgb: '8, 12, 24',            // Dark blue bg
      cardBgRgb: '20, 30, 60'        // Blue card
    },
    features: {
      enablePredictions: true,
      enableLiveScores: true,
      enableChat: true,
      enableStadiumGuide: true
    },
    eventInfo: {
      title: 'USA Soccer Tracker',
      description: 'Host cities guide & Live tracker curated for US Soccer Fans.'
    }
  },
  'mexico-lindo': {
    tenantId: 'mexico-lindo',
    appName: 'El Tri - Mundial 2026',
    theme: {
      primaryRgb: '0, 104, 71',      // Mexican Green
      secondaryRgb: '206, 17, 38',   // Mexican Red
      accentRgb: '212, 175, 55',     // Gold
      bgRgb: '10, 20, 15',            // Forest dark bg
      cardBgRgb: '18, 38, 28'        // Green card
    },
    features: {
      enablePredictions: false,
      enableLiveScores: true,
      enableChat: true,
      enableStadiumGuide: true
    },
    eventInfo: {
      title: '¡Bienvenidos al Mundial!',
      description: 'Sigue a la Selección Mexicana y las sedes históricas como el Estadio Azteca.'
    }
  },
  'vancouver-breeze': {
    tenantId: 'vancouver-breeze',
    appName: 'Canada Soccer Central',
    theme: {
      primaryRgb: '206, 17, 38',     // Canadian Maple Red
      secondaryRgb: '31, 41, 55',    // Dark grey
      accentRgb: '56, 189, 248',     // Ice blue
      bgRgb: '17, 17, 17',           // Pitch black bg
      cardBgRgb: '31, 31, 31'        // Charcoal card
    },
    features: {
      enablePredictions: true,
      enableLiveScores: false,
      enableChat: false,
      enableStadiumGuide: true
    },
    eventInfo: {
      title: 'Canada World Cup Guide',
      description: 'Spotlighting BMO Field Toronto & BC Place Vancouver.'
    }
  }
};

// Check if running in Tauri
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// Invoke the Tauri Rust command safely
export async function getSystemConfig(): Promise<SystemConfig> {
  if (isTauriEnvironment()) {
    try {
      // Dynamically import Tauri core to prevent issues in standard browser environments
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<SystemConfig>('get_system_config');
    } catch (e) {
      console.warn('Failed to invoke tauri command `get_system_config`:', e);
    }
  }
  
  // Browser fallback
  return {
    tenantId: null,
    pocketbaseUrl: null,
    configSource: 'Browser LocalStorage / Defaults',
    isTauri: false
  };
}

// Load configurations by resolving priorities:
// 1. LocalStorage overrides (user selection in UI)
// 2. Tauri Host Config (Environment or ConfigMap files)
// 3. Fallback default tenant ('world-cup-classic')
export async function loadTenantConfig(): Promise<TenantConfig> {
  let tenantId = 'world-cup-classic';
  let pocketbaseUrl: string | undefined = undefined;
  let source = 'Default Client Fallback';

  // 1. Query Tauri host if available
  const systemConfig = await getSystemConfig();
  if (systemConfig.tenantId) {
    tenantId = systemConfig.tenantId;
    source = `Host Config (${systemConfig.configSource})`;
  }
  if (systemConfig.pocketbaseUrl) {
    pocketbaseUrl = systemConfig.pocketbaseUrl;
  }

  // 2. Query LocalStorage (takes priority for user session overrides in developer UI)
  if (typeof window !== 'undefined') {
    const localTenant = localStorage.getItem('tenant_id');
    const localPb = localStorage.getItem('pocketbase_url');
    if (localTenant) {
      tenantId = localTenant;
      source = 'User Local Override';
    }
    if (localPb) {
      pocketbaseUrl = localPb;
    }
  }

  // 3. Resolve Tenant Configuration from DB (PocketBase) or fall back to Mock DB
  let tenantConfig: TenantConfig;

  if (pocketbaseUrl) {
    try {
      const pb = new PocketBase(pocketbaseUrl);
      // Attempt to query tenant record from a 'tenants' collection
      // e.g. pb.collection('tenants').getFirstListItem(`tenantId="${tenantId}"`)
      // For fallback safety, if connection/fetch fails, we will catch and use local mock data
      const record = await pb.collection('tenants').getFirstListItem(`tenantId="${tenantId}"`);
      
      tenantConfig = {
        tenantId: record.tenantId,
        appName: record.appName,
        theme: record.theme,
        features: record.features,
        eventInfo: record.eventInfo,
        pocketbaseUrl,
        configSource: `${source} + Live PocketBase (${pocketbaseUrl})`
      };
    } catch (err) {
      // Database not reachable, mock data fallback
      const mock = MOCK_DB_TENANTS[tenantId] || MOCK_DB_TENANTS['world-cup-classic'];
      tenantConfig = {
        ...mock,
        pocketbaseUrl,
        configSource: `${source} (PocketBase fetch failed, fallback to local DB records)`
      };
    }
  } else {
    // No PocketBase URL configured, load directly from local mock records
    const mock = MOCK_DB_TENANTS[tenantId] || MOCK_DB_TENANTS['world-cup-classic'];
    tenantConfig = {
      ...mock,
      configSource: `${source} (Mock DB Record)`
    };
  }

  return tenantConfig;
}

// Apply theme CSS variables dynamically
export function applyTheme(config: TenantConfig) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const theme = config.theme;
  
  root.style.setProperty('--primary-rgb', theme.primaryRgb);
  root.style.setProperty('--secondary-rgb', theme.secondaryRgb);
  root.style.setProperty('--accent-rgb', theme.accentRgb);
  root.style.setProperty('--bg-rgb', theme.bgRgb);
  root.style.setProperty('--card-bg-rgb', theme.cardBgRgb);
  
  // Force title update
  document.title = config.appName;
}
