export default function ChartPanel({ title, statusText, statusColor, canvasRef, alarmActive }) {
  return (
    <section style={{
      background: '#181c22',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      borderLeft: `2px solid ${alarmActive ? '#ef4444' : 'transparent'}`,
      transition: 'border-color 0.4s',
    }}>
      <div style={{
        background: '#262a31', height: 22, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 10px',
      }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.16em', color: '#839493', textTransform: 'uppercase' }}>
          {title}
        </span>
        <span style={{ fontSize: 8, letterSpacing: '0.1em', color: statusColor || '#00daf3' }}>
          {statusText}
        </span>
      </div>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <canvas ref={canvasRef} />
      </div>
    </section>
  );
}