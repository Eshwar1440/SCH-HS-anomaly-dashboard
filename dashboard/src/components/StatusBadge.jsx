const STATES = {
  NONE:     { text: 'Normal',    color: '#00daf3', bg: 'rgba(0,218,243,0.07)',  border: 'rgba(0,218,243,0.25)' },
  DUAL:     { text: 'DUAL_CH_ALERT',  color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.45)'  },
  SCH_ONLY: { text: 'SCH_ANOMALY',    color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.35)' },
  HS_ONLY:  { text: 'HS_ANOMALY',     color: '#eab308', bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.35)'  },
};

export default function StatusBadge({ alertType }) {
  const s = STATES[alertType] || STATES.NONE;
  const alarm = alertType !== 'NONE';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 14px',
      border: `1px solid ${s.border}`,
      background: s.bg,
      fontSize: 10, fontWeight: 700,
      letterSpacing: '0.18em', color: s.color,
    }}>
      <span className={alarm ? 'dot-alarm' : 'dot-nominal'} style={{ width: 6, height: 6, flexShrink: 0 }} />
      {s.text}
    </div>
  );
}