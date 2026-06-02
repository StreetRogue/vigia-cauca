const CACHE_KEY = 'novedades_cache';
const CACHE_TIMESTAMP_KEY = 'novedades_cache_timestamp';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

interface CacheData {
  data: any;
  timestamp: number;
}

export const cacheManager = {
  // Guardar datos en caché
  set(data: any): void {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Error guardando en caché:', e);
    }
  },

  // Obtener datos del caché
  get(): any | null {
    try {
      const data = sessionStorage.getItem(CACHE_KEY);
      const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (!data || !timestamp) return null;

      const cachedTime = parseInt(timestamp, 10);
      const now = Date.now();
      const age = now - cachedTime;

      // Si el caché tiene menos de 5 minutos, devolverlo
      if (age < CACHE_DURATION_MS) {
        return JSON.parse(data);
      }

      // Si está vencido, limpiarlo
      this.clear();
      return null;
    } catch (e) {
      console.warn('Error leyendo caché:', e);
      return null;
    }
  },

  // Verificar si el caché está fresco
  isFresh(): boolean {
    try {
      const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (!timestamp) return false;

      const cachedTime = parseInt(timestamp, 10);
      const now = Date.now();
      const age = now - cachedTime;

      return age < CACHE_DURATION_MS;
    } catch (e) {
      return false;
    }
  },

  // Limpiar caché
  clear(): void {
    try {
      sessionStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch (e) {
      console.warn('Error limpiando caché:', e);
    }
  },

  // Obtener edad del caché en segundos
  getAge(): number {
    try {
      const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (!timestamp) return 0;

      const cachedTime = parseInt(timestamp, 10);
      const now = Date.now();
      return Math.floor((now - cachedTime) / 1000);
    } catch (e) {
      return 0;
    }
  },
};
