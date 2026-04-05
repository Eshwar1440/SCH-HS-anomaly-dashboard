const COLORS      = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#06b6d4'];
const SHORT_LABELS = ['FAST_AGG', 'SCH_SPOOF', 'SLOW_DRIFT', 'PATIENT', 'DERIV_ONLY'];

export default function AttackPanel({ profiles, activeAttack, onInject, disabled }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
      <span style={{ fontSize: 8, color: '#ffffff', letterSpacing: '0.15em', marginRight: 6 }}>
        INJECT_ATTACK
      </span>
      {profiles.map((p) => {
        const color    = COLORS[p.index];
        const isActive = activeAttack === p.index;
        return (
          <button key={p.index} onClick={() => onInject(p.index)} disabled={disabled} style={{
            background: isActive ? `${color}18` : 'transparent',
            border: `1px solid ${isActive ? color : `${color}35`}`,
            color: disabled ? '#2a3340' : (isActive ? color : `${color}80`),
            padding: '0 12px', height: 30,
            fontSize: 9, fontWeight: 700,
            letterSpacing: '0.12em',
            fontFamily: 'Space Grotesk, sans-serif',
            textTransform: 'uppercase',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: isActive ? `0 0 10px ${color}35` : 'none',
          }}>
            {SHORT_LABELS[p.index]}
          </button>
        );
      })}
    </div>
  );
}