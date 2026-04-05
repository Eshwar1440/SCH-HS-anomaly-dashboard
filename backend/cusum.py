# cusum.py
# ==============================================================================
# Stateful CUSUM Engine
# Frame-by-frame processing — designed for WebSocket streaming from day one.
# Handles absolute CUSUM (both sides) + derivative CUSUM for Attack 5.
# ==============================================================================

from mock_data import SCH_MU, SCH_SIGMA, HS_MU, HS_SIGMA

# ------------------------------------------------------------------------------
# Tier 0 calibration constants (would be loaded from hardened file in production)
# ------------------------------------------------------------------------------
import numpy as np

# Absolute CUSUM constants
K_MULTIPLIER = 1.0
H_MULTIPLIER = 5.0

SCH_K = K_MULTIPLIER * SCH_SIGMA
SCH_H = H_MULTIPLIER * SCH_SIGMA
HS_K  = K_MULTIPLIER * HS_SIGMA
HS_H  = H_MULTIPLIER * HS_SIGMA

# Derivative CUSUM constants
# Derivative of Gaussian noise has std = sqrt(2) * sigma
# k must exceed that distribution to avoid accumulating on clean noise
DERIV_NOISE_FACTOR = np.sqrt(2)
DERIV_K_MULTIPLIER = 2.0    # 2 * sqrt(2) * sigma — comfortably above noise derivative std
DERIV_H_MULTIPLIER = 8.0

SCH_DERIV_K = DERIV_K_MULTIPLIER * DERIV_NOISE_FACTOR * SCH_SIGMA
SCH_DERIV_H = DERIV_H_MULTIPLIER * DERIV_NOISE_FACTOR * SCH_SIGMA

HS_DERIV_K  = DERIV_K_MULTIPLIER * DERIV_NOISE_FACTOR * HS_SIGMA
HS_DERIV_H  = DERIV_H_MULTIPLIER * DERIV_NOISE_FACTOR * HS_SIGMA


# ==============================================================================
# CUSUMChannel — stateful single channel detector
# One instance per channel, lives for the duration of the stream.
# ==============================================================================
class CUSUMChannel:
    def __init__(self, mu, k, h, deriv_k, deriv_h, name):
        self.mu      = mu
        self.k       = k
        self.h       = h
        self.deriv_k = deriv_k
        self.deriv_h = deriv_h
        self.name    = name

        # Absolute CUSUM state
        self.S_up  = 0.0
        self.S_lo  = 0.0

        # Derivative CUSUM state
        self.S_deriv_up = 0.0
        self.S_deriv_lo = 0.0
        self.prev_x     = None   # previous frame value for derivative

    def update(self, x):
        """
        Process one incoming frame.
        Returns a result dict with all state and alert flags.
        """
        # --- Absolute CUSUM ---
        self.S_up = max(0.0, self.S_up + (x - self.mu) - self.k)
        self.S_lo = max(0.0, self.S_lo + (self.mu - x) - self.k)

        abs_alarm    = self.S_up > self.h or self.S_lo > self.h
        abs_side     = None
        if self.S_up > self.h:
            abs_side = 'upper'
        elif self.S_lo > self.h:
            abs_side = 'lower'

        # --- Derivative CUSUM ---
        deriv_alarm = False
        deriv_side  = None
        deriv_val   = 0.0

        if self.prev_x is not None:
            deriv_val = x - self.prev_x   # raw rate of change

            self.S_deriv_up = max(0.0, self.S_deriv_up + deriv_val - self.deriv_k)
            self.S_deriv_lo = max(0.0, self.S_deriv_lo - deriv_val - self.deriv_k)

            deriv_alarm = self.S_deriv_up > self.deriv_h or self.S_deriv_lo > self.deriv_h
            if self.S_deriv_up > self.deriv_h:
                deriv_side = 'upper'
            elif self.S_deriv_lo > self.deriv_h:
                deriv_side = 'lower'

        self.prev_x = x

        return {
            'channel':    self.name,
            'value':      x,
            'S_up':       self.S_up,
            'S_lo':       self.S_lo,
            'S_deriv_up': self.S_deriv_up,
            'S_deriv_lo': self.S_deriv_lo,
            'deriv_val':  deriv_val,
            'abs_alarm':  abs_alarm,
            'abs_side':   abs_side,
            'deriv_alarm': deriv_alarm,
            'deriv_side':  deriv_side,
            'alarm':      abs_alarm or deriv_alarm,   # combined alert
        }

    def reset(self):
        """Reset all state — used between attack profile replays."""
        self.S_up = self.S_lo = 0.0
        self.S_deriv_up = self.S_deriv_lo = 0.0
        self.prev_x = None


# ==============================================================================
# DualChannelDetector — wraps SCH + HS, adds cross-channel logic
# ==============================================================================
class DualChannelDetector:
    def __init__(self):
        self.sch = CUSUMChannel(
            mu=SCH_MU, k=SCH_K, h=SCH_H,
            deriv_k=SCH_DERIV_K, deriv_h=SCH_DERIV_H,
            name='SCH'
        )
        self.hs = CUSUMChannel(
            mu=HS_MU, k=HS_K, h=HS_H,
            deriv_k=HS_DERIV_K, deriv_h=HS_DERIV_H,
            name='HS'
        )

    def update(self, sch_val, hs_val):
        """
        Process one frame from both channels.
        Returns combined result with cross-channel alert classification.
        """
        sch_result = self.sch.update(sch_val)
        hs_result  = self.hs.update(hs_val)

        sch_alarm = sch_result['alarm']
        hs_alarm  = hs_result['alarm']

        # Cross-channel classification
        if sch_alarm and hs_alarm:
            alert_type = 'DUAL'           # RAT consuming real CPU — both channels affected
        elif sch_alarm and not hs_alarm:
            alert_type = 'SCH_ONLY'       # Partial spoof — scheduler manipulated, HS clean
        elif hs_alarm and not sch_alarm:
            alert_type = 'HS_ONLY'        # Partial spoof — HS manipulated, scheduler clean
        else:
            alert_type = 'NONE'

        return {
            'sch':        sch_result,
            'hs':         hs_result,
            'alert_type': alert_type,
            'any_alarm':  sch_alarm or hs_alarm,
        }

    def reset(self):
        self.sch.reset()
        self.hs.reset()


# ==============================================================================
# Validation — run all five attack profiles, report detection performance
# ==============================================================================
if __name__ == '__main__':
    from mock_data import ATTACK_PROFILES, CLEAN_FRAMES

    detector = DualChannelDetector()

    print(f"Tier 0 constants:")
    print(f"  SCH  k={SCH_K:.4f}  h={SCH_H:.4f}")
    print(f"  HS   k={HS_K:.4f}   h={HS_H:.4f}")
    print(f"  SCH deriv k={SCH_DERIV_K:.4f}  h={SCH_DERIV_H:.4f}")
    print(f"  HS  deriv k={HS_DERIV_K:.4f}   h={HS_DERIV_H:.4f}\n")

    for fn in ATTACK_PROFILES:
        sch_data, hs_data, meta = fn()
        detector.reset()

        first_alarm       = -1
        false_alarm_count = 0
        alert_type_at_detection = None

        for i in range(len(sch_data)):
            result = detector.update(sch_data[i], hs_data[i])

            if result['any_alarm']:
                if i < meta['anomaly_start']:
                    false_alarm_count += 1
                elif first_alarm == -1:
                    first_alarm = i
                    alert_type_at_detection = result['alert_type']

        print(f"{'='*60}")
        print(f"{meta['label']}")
        print(f"  Expected: {meta['expected_side']}")

        if false_alarm_count > 0:
            print(f"  ✗ False alarms in clean window: {false_alarm_count}")

        if first_alarm == -1:
            print(f"  ✗ No alarm fired in attack window")
        else:
            lag = first_alarm - meta['anomaly_start']
            print(f"  ✓ First alarm at frame {first_alarm}  "
                  f"lag={lag} frames  type={alert_type_at_detection}")

        print(f"  False alarms in clean window: {false_alarm_count}")