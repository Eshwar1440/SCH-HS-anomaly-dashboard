import { useRef, useState, useCallback, useEffect } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws";
const ws = new WebSocket(WS_URL);

export function useWebSocket({ onMeta, onFrame, onInjected, onReset }) {
  const wsRef       = useRef(null);
  const handlersRef = useRef({});
  const pingRef     = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    handlersRef.current = { onMeta, onFrame, onInjected, onReset };
  });

  const stopPing = useCallback(() => {
    if (pingRef.current) {
      clearInterval(pingRef.current);
      pingRef.current = null;
    }
  }, []);

  const startPing = useCallback((ws) => {
    stopPing();
    pingRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ cmd: 'ping' }));
      }
    }, 10000);
  }, [stopPing]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setConnected(true);
      startPing(ws);
    };

    ws.onclose = () => {
      setConnected(false);
      stopPing();
    };

    ws.onerror = () => {
      setConnected(false);
      stopPing();
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      const h = handlersRef.current;
      if      (msg.type === 'meta')     h.onMeta?.(msg);
      else if (msg.type === 'frame')    h.onFrame?.(msg);
      else if (msg.type === 'injected') h.onInjected?.(msg);
      else if (msg.type === 'reset')    h.onReset?.(msg);
    };

    wsRef.current = ws;
  }, [startPing, stopPing]);

  const disconnect = useCallback(() => {
    stopPing();
    wsRef.current?.close();
    wsRef.current = null;
  }, [stopPing]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPing();
      wsRef.current?.close();
    };
  }, [stopPing]);

  return { connected, connect, disconnect, send };
}