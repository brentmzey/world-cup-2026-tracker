import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { MOCK_DB_TENANTS, loadTenantConfig } from "./config";

describe("Dynamic Multi-Tenant Configuration Tests", () => {
  beforeAll(() => {
    // Mock the window and localStorage for the bun environment
    global.window = {} as any;
    
    let store: Record<string, string> = {
      'tenant_id': 'usa-pride'
    };
    
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { store = {} }
    } as any;
  });

  afterAll(() => {
    delete (global as any).window;
    delete (global as any).localStorage;
  });

  test("Should load user LocalStorage overrides first", async () => {
    const config = await loadTenantConfig();
    expect(config.tenantId).toBe("usa-pride");
    expect(config.appName).toBe("US Soccer Fans 2026");
    expect(config.configSource).toContain("User Local Override");
  });

  test("Should verify fallback database has required teams and themes", () => {
    expect(MOCK_DB_TENANTS['world-cup-classic']).toBeDefined();
    expect(MOCK_DB_TENANTS['usa-pride'].theme.primaryRgb).toBe('10, 49, 97');
    expect(MOCK_DB_TENANTS['mexico-lindo'].theme.primaryRgb).toBe('0, 104, 71');
  });
});
