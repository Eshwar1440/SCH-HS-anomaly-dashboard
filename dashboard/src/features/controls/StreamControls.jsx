function Btn({ label, onClick, disabled, color }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? 'transparent' : `${color}10`,
      border: `1px solid ${disabled ? '#2a3340' : color}`,
      color: disabled ? '#475569' : '#ffffff',
      padding: '0 16px', height: 30,
      fontSize: 9, fontWeight: 700,
      letterSpacing: '0.16em',
      fontFamily: 'Space Grotesk, sans-serif',
      textTransform: 'uppercase',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.15s',
    }}>
      {label}
    </button>
  );
}

export default function StreamControls({ connected, onConnect, onDisconnect, onReset }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <Btn label="START" onClick={onConnect}    disabled={connected}  color="#00daf3" />
      <Btn label="STOP"  onClick={onDisconnect} disabled={!connected} color="#ef4444" />
      <Btn label="RESET" onClick={onReset}      disabled={!connected} color="#b9cac9" />
    </div>
  );
}