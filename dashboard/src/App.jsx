import { useRef, useCallback } from 'react';
import Header        from './components/Header';
import ChartGrid     from './features/charts/ChartGrid';
import EventLog      from './features/log/EventLog';
import StreamControls from './features/controls/StreamControls';
import AttackPanel   from './features/controls/AttackPanel';
import { useWebSocket }   from './features/stream/useWebSocket';
import { useStreamState } from './features/stream/useStreamState';

export default function App() {
  const chartGridRef = useRef(null);

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

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ChartGrid ref={chartGridRef} alertType={alertType} />
        <EventLog log={log} />
      </div>

      <footer style={{
        height: 52, flexShrink: 0,
        background: '#0b0e14',
        borderTop: '1px solid rgba(58,74,73,0.3)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 12,
      }}>
        <StreamControls
          connected={connected}
          onConnect={connect}
          onDisconnect={disconnect}
          onReset={sendReset}
        />
        <div style={{ width: 1, height: 20, background: 'rgba(58,74,73,0.5)' }} />
        <AttackPanel
          profiles={profiles}
          activeAttack={activeAttack}
          onInject={sendInject}
          disabled={!connected}
        />
      </footer>
    </div>
  );
}