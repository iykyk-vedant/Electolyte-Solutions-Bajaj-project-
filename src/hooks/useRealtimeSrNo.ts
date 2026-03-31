'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseRealtimeSrNoReturn {
  nextSrNo: string;
  isConnected: boolean;
}

/**
 * Custom hook that connects to the WebSocket server and receives
 * real-time SR No updates whenever any user saves a tag entry.
 */
export function useRealtimeSrNo(initialSrNo: string = '0001'): UseRealtimeSrNoReturn {
  const [nextSrNo, setNextSrNo] = useState<string>(initialSrNo);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    // Determine WebSocket URL based on current page hostname
    // This ensures it works on LAN — connects to the same host the page was loaded from
    const wsHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const wsPort = process.env.NEXT_PUBLIC_WS_PORT || '3002';
    const wsUrl = `ws://${wsHost}:${wsPort}`;

    console.log(`[SR No WS] Connecting to ${wsUrl}...`);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        console.log('[SR No WS] Connected');
        setIsConnected(true);
        reconnectAttemptRef.current = 0; // Reset backoff on successful connect
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'sr_no_update' && data.nextSrNo) {
            console.log(`[SR No WS] Received nextSrNo: ${data.nextSrNo}`);
            setNextSrNo(data.nextSrNo);
          }
        } catch (err) {
          console.error('[SR No WS] Error parsing message:', err);
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        console.log('[SR No WS] Disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Reconnect with exponential backoff (max 10 seconds)
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 10000);
        reconnectAttemptRef.current++;
        console.log(`[SR No WS] Reconnecting in ${delay}ms...`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        console.warn('[SR No WS] Connection error (will reconnect via onclose)');
        // onclose will fire after onerror, triggering reconnect
      };
    } catch (err) {
      console.error('[SR No WS] Connection error:', err);
      // Retry after delay
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 10000);
      reconnectAttemptRef.current++;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { nextSrNo, isConnected };
}
