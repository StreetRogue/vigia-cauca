/**
 * Sistema de caché en memoria con TTL (Time To Live).
 *
 * Estrategia por tipo de dato:
 *  - Municipios:      24h  → datos estáticos, casi nunca cambian
 *  - Dashboard/Stats: 3min → se actualiza con frecuencia
 *  - Novedades list:  NO cachear → datos dinámicos que el usuario modifica
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class CacheService {
  private store = new Map<string, CacheEntry<unknown>>();

  /** Guarda un valor con TTL en segundos */
  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /** Obtiene un valor si está vivo, o null si expiró */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /** Invalida una clave o todas las claves que empiecen con un prefijo */
  invalidate(keyOrPrefix: string): void {
    for (const key of this.store.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.store.delete(key);
      }
    }
  }

  /** Limpia todo el caché */
  clear(): void {
    this.store.clear();
  }

  /** Construye una key a partir de un objeto de parámetros */
  buildKey(base: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) return base;
    const sorted = Object.entries(params)
      .filter(([, v]) => v != null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return `${base}?${sorted}`;
  }

  /**
   * Helper: ejecuta fn si no hay caché, o devuelve el caché si existe.
   * Uso: cache.remember('key', 180, () => service.getData())
   */
  async remember<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const data = await fn();
    this.set(key, data, ttlSeconds);
    return data;
  }
}

export const cacheService = new CacheService();

// TTLs predefinidos (en segundos)
export const TTL = {
  MUNICIPIOS:   60 * 60 * 24,   // 24 horas
  ESTADISTICAS: 60 * 3,         // 3 minutos
  DASHBOARD:    60 * 3,         // 3 minutos
  USUARIOS:     60 * 5,         // 5 minutos
} as const;
