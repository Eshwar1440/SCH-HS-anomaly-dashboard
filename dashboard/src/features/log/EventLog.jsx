export default function EventLog({ log }) {
  return (
    <div style={{
      width: 260, flexShrink: 0,
      background: '#0b0e14',
      borderLeft: '1px solid rgba(58,74,73,0.3)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        height: 28, flexShrink: 0,
        background: '#181c22',
        borderBottom: '1px solid rgba(58,74,73,0.3)',
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
      }}>
        <span style={{ width: 5, height: 5, background: '#ef4444', borderRadius: '50%' }} />
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', color: '#839493' }}>
          EVENT_LOG
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {log.length === 0 && (
          <div style={{ fontSize: 8, color: '#2a3340', padding: '8px 12px', letterSpacing: '0.1em' }}>
            AWAITING_STREAM...
          </div>
        )}
        {log.map((entry) => (
          <div key={entry.id} style={{
            padding: '3px 12px 3px 10px',
            borderLeft: `2px solid ${entry.color}50`,
            marginLeft: 8, marginBottom: 4,
          }}>
            <div style={{ fontSize: 8, color: entry.color, fontWeight: 600, letterSpacing: '0.06em', lineHeight: 1.5 }}>
              {entry.msg}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}