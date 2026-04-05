import { useState, useCallback, useRef } from 'react';

export function useStreamState() {
  const [alertType,    setAlertType]    = useState('NONE');
  const [frameIndex,   setFrameIndex]   = useState(0);
  const [activeAttack, setActiveAttack] = useState(null);
  const [profiles,     setProfiles]     = useState([]);
  const [log,          setLog]          = useState([]);
  const prevAlertRef = useRef('NONE');

  const addLog = useCallback((msg, color = '#839493') => {
    setLog(prev => [{ msg, color, id: Date.now() + Math.random() }, ...prev].slice(0, 40));
  }, []);

  const handleMeta = useCallback((msg) => {
    setProfiles(msg.profiles || []);
    addLog('STREAM_INIT >> BASELINE_LOADED', '#00daf3');
  }, [addLog]);

  const handleFrame = useCallback((frame) => {
    setFrameIndex(frame.index);
    setAlertType(frame.alert_type);

    // Log only on state transitions, not every alarm frame
    if (frame.alert_type !== prevAlertRef.current) {
      if (frame.alert_type !== 'NONE') {
        const deriv = (frame.sch_deriv_alarm || frame.hs_deriv_alarm)
          && !frame.sch_abs_alarm && !frame.hs_abs_alarm;
        addLog(
          `ALARM_${frame.alert_type}${deriv ? '_DERIV' : ''} >> FR_${String(frame.index).padStart(6,'0')}`,
          frame.alert_type === 'DUAL' ? '#ef4444' : '#f97316'
        );
      } else {
        addLog(`ALARM_CLEARED >> FR_${String(frame.index).padStart(6,'0')}`, '#00daf3');
      }
      prevAlertRef.current = frame.alert_type;
    }
  }, [addLog]);

  const handleInjected = useCallback((msg) => {
    setActiveAttack(msg.index);
    const slug = msg.label.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    addLog(`INJECT >> ${slug}`, '#eab308');
  }, [addLog]);

  const handleReset = useCallback(() => {
    setActiveAttack(null);
    setAlertType('NONE');
    setFrameIndex(0);
    prevAlertRef.current = 'NONE';
    addLog('SYSTEM_RESET >> BASELINE_RESTORED', '#00daf3');
  }, [addLog]);

  return {
    alertType, frameIndex, activeAttack, profiles, log,
    handleMeta, handleFrame, handleInjected, handleReset,
  };
}