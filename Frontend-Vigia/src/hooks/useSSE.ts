import { useEffect, useRef, useCallback } from 'react';
import { BASE_URLS } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

interface UseSSEOptions {
  /** Llamado cada vez que el servidor envía un evento. */
  onMessage: (event: MessageEvent) => void;
  /** Llamado si la conexión SSE falla. */
  onError?: (event: Event) => void;
  /** Si false, no establece la conexión. Default: true. */
  enabled?: boolean;
}

/**
 * Suscribe al stream de Server-Sent Events del MicroservicioReportes.
 * Equivalente al NotificationService (WebSocket) de Barba-Negra, pero usando SSE.
 *
 * @example
 * useSSE({
 *   onMessage: (e) => console.log('Actualización:', e.data),
 *   enabled: isAuthenticated,
 * });
 */
export function useSSE({ onMessage, onError, enabled = true }: UseSSEOptions): void {
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (esRef.current) return; // Ya conectado

    const token = localStorage.getItem('kc-token');
    const url   = `${BASE_URLS.reportes}${ENDPOINTS.reportes.sseStream}${
      token ? `?token=${encodeURIComponent(token)}` : ''
    }`;

    const es = new EventSource(url, { withCredentials: false });

    es.onmessage = onMessage;
    es.onerror   = (e) => {
      onError?.(e);
      // Reconectar tras 5 s si la conexión se pierde
      es.close();
      esRef.current = null;
      setTimeout(connect, 5_000);
    };

    esRef.current = es;
  }, [onMessage, onError]);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [enabled, connect]);
}
