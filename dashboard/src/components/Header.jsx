import StatusBadge from './StatusBadge';

export default function Header({ alertType, frameIndex, connected }) {
  return (
    <header style={{
      height: 52, flexShrink: 0,
      background: '#101419',
      borderBottom: '1px solid rgba(58,74,73,0.35)',
      boxShadow: '0 0 24px rgba(0,218,243,0.07)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px', zIndex: 10,
    }}>
      <div>
        <div style={{ fontSize: 8, color: '#00daf3', letterSpacing: '0.22em', opacity: 0.65, marginTop: 1 }}>
          SCH / HS CUSUM MONITOR
        </div>
      </div>

      <StatusBadge alertType={alertType} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 8, color: '#475569', letterSpacing: '0.15em' }}>FRAME INDEX</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#b9cac9', fontVariantNumeric: 'tabular-nums' }}>
            {String(frameIndex).padStart(6, '0')}
          </div>
        </div>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connected ? '#00daf3' : '#3a4a49',
          boxShadow: connected ? '0 0 8px #00daf3' : 'none',
          transition: 'all 0.3s',
        }} />
      </div>
    </header>
  );
}