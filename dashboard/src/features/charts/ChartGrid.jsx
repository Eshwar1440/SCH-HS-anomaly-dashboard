import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useChart } from './useChart';
import ChartPanel from './ChartPanel';

const ATTACK_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#06b6d4'];

const ChartGrid = forwardRef(function ChartGrid({ alertType }, ref) {
  const schVal   = useChart({ label: 'SCH', color: '#00daf3', yLabel: 'ms',     hasThreshold: false });
  const hsVal    = useChart({ label: 'HS',  color: '#34d399', yLabel: 'counts', hasThreshold: false });
  const schCusum = useChart({ label: 'S',   color: '#f472b6', yLabel: 'S',      hasThreshold: true  });
  const hsCusum  = useChart({ label: 'S',   color: '#a78bfa', yLabel: 'S',      hasThreshold: true  });

  // Keep latest chart refs accessible
  const chartsRef = useRef({});
  chartsRef.current = { schVal, hsVal, schCusum, hsCusum };

  useImperativeHandle(ref, () => ({
    pushFrame(frame) {
      const { schVal, hsVal, schCusum, hsCusum } = chartsRef.current;
      const color = frame.attack_index != null ? ATTACK_COLORS[frame.attack_index] : null;
      schVal.setColor(color  || '#00daf3');
      hsVal.setColor(color   || '#34d399');
      schVal.push(frame.index,  frame.sch_value, null);
      hsVal.push(frame.index,   frame.hs_value,  null);
      schCusum.push(frame.index, frame.sch_S_up, frame.sch_h);
      hsCusum.push(frame.index,  frame.hs_S_up,  frame.hs_h);
    },
    clearAll() {
      const { schVal, hsVal, schCusum, hsCusum } = chartsRef.current;
      schVal.clear(); hsVal.clear(); schCusum.clear(); hsCusum.clear();
      schVal.setColor('#00daf3');
      hsVal.setColor('#34d399');
    },
  }), []); // eslint-disable-line

  const schAlarm = alertType === 'SCH_ONLY' || alertType === 'DUAL';
  const hsAlarm  = alertType === 'HS_ONLY'  || alertType === 'DUAL';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 2, flex: 1, minHeight: 0,
    }}>
      <ChartPanel title="SCH — SCHEDULER_SLIP"   statusText={schAlarm ? 'ANOMALY_DETECTED' : 'NOMINAL'} statusColor={schAlarm ? '#ef4444' : '#00daf3'} canvasRef={schVal.canvasRef}   alarmActive={schAlarm} />
      <ChartPanel title="HS — EXECUTION_COUNTER"  statusText={hsAlarm  ? 'ANOMALY_DETECTED' : 'NOMINAL'} statusColor={hsAlarm  ? '#ef4444' : '#34d399'} canvasRef={hsVal.canvasRef}    alarmActive={hsAlarm}  />
      <ChartPanel title="SCH — CUSUM_S_STATISTIC" statusText="H_THRESHOLD_REF"                            statusColor="#3a4a49"                           canvasRef={schCusum.canvasRef} alarmActive={schAlarm} />
      <ChartPanel title="HS — CUSUM_S_STATISTIC"  statusText="H_THRESHOLD_REF"                            statusColor="#3a4a49"                           canvasRef={hsCusum.canvasRef}  alarmActive={hsAlarm}  />
    </div>
  );
});

export default ChartGrid;