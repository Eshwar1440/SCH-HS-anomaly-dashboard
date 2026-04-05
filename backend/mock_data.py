import numpy as np

# Tier 0 baselines
SCH_MU    = 12.0
SCH_SIGMA = 0.5
HS_MU     = 847.0
HS_SIGMA  = 15.0

# Per-frame attack signal functions
# Each takes (frame_i) and returns (sch_offset, hs_offset)
def attack_0_fast_aggressive(i):
    return 5 * SCH_SIGMA, 4 * HS_SIGMA

def attack_1_single_channel_spoof(i):
    return 3 * SCH_SIGMA, 0.0

def attack_2_slow_dual_drift(i):
    return (3 * SCH_SIGMA / 3000) * i, (3 * HS_SIGMA / 3000) * i

def attack_3_patient_attacker(i):
    return (2 * SCH_SIGMA / 3000) * i, (2 * HS_SIGMA / 3000) * i

def attack_4_derivative_only(i):
    phase = (i % 150) / 150
    return 0.8 * SCH_SIGMA * phase, 0.8 * HS_SIGMA * phase

ATTACK_PROFILES = [
    {
        "fn":          attack_0_fast_aggressive,
        "label":       "Attack 1 — Fast Aggressive",
        "description": "Large sudden dual-channel spike. Caught within tens of frames.",
        "expected":    "upper",
        "color":       "#ef4444",
    },
    {
        "fn":          attack_1_single_channel_spoof,
        "label":       "Attack 2 — Single Channel Spoof",
        "description": "SCH drifts, HS stays clean. Cross-channel disagreement flags supervisor compromise.",
        "expected":    "upper",
        "color":       "#f97316",
    },
    {
        "fn":          attack_2_slow_dual_drift,
        "label":       "Attack 3 — Slow Dual-Channel Drift",
        "description": "Both channels drift monotonically. CUSUM detects; static threshold stays silent.",
        "expected":    "upper",
        "color":       "#eab308",
    },
    {
        "fn":          attack_3_patient_attacker,
        "label":       "Attack 4 — Patient Attacker",
        "description": "Slow linear drift, 2 sigma total. Barely visible to analyst; CUSUM accumulates.",
        "expected":    "upper",
        "color":       "#8b5cf6",
    },
    {
        "fn":          attack_4_derivative_only,
        "label":       "Attack 5 — Derivative-Only Drift",
        "description": "Sawtooth pattern. Amplitude below k. Absolute CUSUM blind. Derivative CUSUM fires.",
        "expected":    "derivative",
        "color":       "#06b6d4",
    },
]