import { useRef, useCallback, useState, useEffect } from 'react';
import Header         from './components/Header';
import ChartGrid      from './features/charts/ChartGrid';
import EventLog       from './features/log/EventLog';
import StreamControls from './features/controls/StreamControls';
import AttackPanel    from './features/controls/AttackPanel';
import { useWebSocket }   from './features/stream/useWebSocket';
import { useStreamState } from './features/stream/useStreamState';

export default function App() {
  const chartGridRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const {
    alertType, frameIndex, activeAttack, profiles, log,
    handleMeta, handleFrame, handleInjected, handleReset,
  } = useStreamState();

  const onFrame = useCallback((frame) => {
    handleFrame(frame);
    chartGridRef.current?.pushFrame(frame);
  }, [handleFrame]);

  const onServerReset = useCallback(() => {
    handleReset();
    chartGridRef.current?.clearAll();
  }, [handleReset]);

  const { connected, connect, disconnect, send } = useWebSocket({
    onMeta:     handleMeta,
    onFrame,
    onInjected: handleInjected,
    onReset:    onServerReset,
  });

  const sendInject = useCallback((index) => send({ cmd: 'inject', index }), [send]);
  const sendReset  = useCallback(()        => send({ cmd: 'reset' }),        [send]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#101419' }}>
      <Header alertType={alertType} frameIndex={frameIndex} connected={connected} />

      <div style={{ display: 'flex', flex: 1, minHeight: 0, flexDirection: isMobile ? 'column' : 'row' }}>
        <ChartGrid ref={chartGridRef} alertType={alertType} />
        {!isMobile && <EventLog log={log} />}
      </div>

      <footer style={{
        flexShrink: 0,
        background: '#0b0e14',
        borderTop: '1px solid rgba(58,74,73,0.3)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        padding: isMobile ? '10px 12px' : '0 16px',
        gap: isMobile ? 8 : 12,
        minHeight: isMobile ? 'auto' : 52,
      }}>
        <StreamControls
          connected={connected}
          onConnect={connect}
          onDisconnect={disconnect}
          onReset={sendReset}
          isMobile={isMobile}
        />
        <div style={{
          width: isMobile ? '100%' : 1,
          height: isMobile ? 1 : 20,
          background: 'rgba(58,74,73,0.5)',
        }} />
        <AttackPanel
          profiles={profiles}
          activeAttack={activeAttack}
          onInject={sendInject}
          disabled={!connected}
          isMobile={isMobile}
        />
      </footer>
    </div>
  );
}