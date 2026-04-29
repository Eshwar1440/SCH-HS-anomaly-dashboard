import asyncio
import json
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from mock_data import SCH_MU, SCH_SIGMA, HS_MU, HS_SIGMA, ATTACK_PROFILES
from cusum import DualChannelDetector, SCH_H, HS_H

SCH_H = float(SCH_H)
HS_H  = float(HS_H)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/profiles")
def get_profiles():
    return [
        {
            "index":       i,
            "label":       p["label"],
            "description": p["description"],
            "color":       p["color"],
        }
        for i, p in enumerate(ATTACK_PROFILES)
    ]


class StreamState:
    def __init__(self):
        self.detector     = DualChannelDetector()
        self.frame_index  = 0
        self.attack_index = None
        self.attack_frame = 0
        self.rng          = np.random.default_rng(42)

    def next_frame(self):
        sch = float(self.rng.normal(SCH_MU, SCH_SIGMA))
        hs  = float(self.rng.normal(HS_MU,  HS_SIGMA))

        in_attack = self.attack_index is not None

        if in_attack:
            profile    = ATTACK_PROFILES[self.attack_index]
            sch_offset, hs_offset = profile["fn"](self.attack_frame)
            sch       += float(sch_offset)
            hs        += float(hs_offset)
            self.attack_frame += 1

        result = self.detector.update(sch, hs)

        frame = {
            "type":           "frame",
            "index":          int(self.frame_index),
            "in_attack":      bool(in_attack),
            "attack_index":   int(self.attack_index) if self.attack_index is not None else None,
            "sch_value":      float(result["sch"]["value"]),
            "hs_value":       float(result["hs"]["value"]),
            "sch_S_up":       float(result["sch"]["S_up"]),
            "sch_S_lo":       float(result["sch"]["S_lo"]),
            "hs_S_up":        float(result["hs"]["S_up"]),
            "hs_S_lo":        float(result["hs"]["S_lo"]),
            "sch_S_deriv_up": float(result["sch"]["S_deriv_up"]),
            "sch_S_deriv_lo": float(result["sch"]["S_deriv_lo"]),
            "hs_S_deriv_up":  float(result["hs"]["S_deriv_up"]),
            "hs_S_deriv_lo":  float(result["hs"]["S_deriv_lo"]),
            "sch_abs_alarm":  bool(result["sch"]["abs_alarm"]),
            "hs_abs_alarm":   bool(result["hs"]["abs_alarm"]),
            "sch_deriv_alarm":bool(result["sch"]["deriv_alarm"]),
            "hs_deriv_alarm": bool(result["hs"]["deriv_alarm"]),
            "alert_type":     str(result["alert_type"]),
            "any_alarm":      bool(result["any_alarm"]),
            "sch_h":          float(SCH_H),
            "hs_h":           float(HS_H),
        }

        self.frame_index += 1
        return frame

    def inject_attack(self, index):
        self.attack_index = index
        self.attack_frame = 0
        self.detector.reset()

    def reset(self):
        self.attack_index = None
        self.attack_frame = 0
        self.detector.reset()


@app.websocket("/ws")
async def stream(websocket: WebSocket):
    await websocket.accept()
    state    = StreamState()
    cmd_queue = asyncio.Queue()

    await websocket.send_text(json.dumps({
        "type":      "meta",
        "sch_mu":    SCH_MU,
        "sch_sigma": SCH_SIGMA,
        "hs_mu":     HS_MU,
        "hs_sigma":  HS_SIGMA,
        "sch_h":     SCH_H,
        "hs_h":      HS_H,
        "profiles": [
            {
                "index":       i,
                "label":       p["label"],
                "description": p["description"],
                "color":       p["color"],
            }
            for i, p in enumerate(ATTACK_PROFILES)
        ]
    }))

    async def command_listener():
        """Reads commands from client and puts them in queue."""
        try:
            while True:
                raw = await websocket.receive_text()
                await cmd_queue.put(json.loads(raw))
        except WebSocketDisconnect:
            await cmd_queue.put(None)  # sentinel to stop streamer
        except Exception as e:
            print(f"LISTENER ERROR: {e}")
            await cmd_queue.put(None)

    async def frame_streamer():
        """Streams frames, processes any queued commands between frames."""
        try:
            while True:
                # Drain all pending commands before next frame
                while not cmd_queue.empty():
                    msg = cmd_queue.get_nowait()

                    if msg is None:
                        return  # disconnect sentinel

                    if msg.get("cmd") == "inject":
                        idx = msg.get("index")
                        if isinstance(idx, int) and 0 <= idx < len(ATTACK_PROFILES):
                            state.inject_attack(idx)
                            await websocket.send_text(json.dumps({
                                "type":  "injected",
                                "index": idx,
                                "label": ATTACK_PROFILES[idx]["label"],
                                "color": ATTACK_PROFILES[idx]["color"],
                            }))

                    elif msg.get("cmd") == "reset":
                        state.reset()
                        await websocket.send_text(json.dumps({"type": "reset"}))

                    elif msg.get("cmd") == "ping":
                        pass

                # Send next frame
                frame = state.next_frame()
                await websocket.send_text(json.dumps(frame))
                await asyncio.sleep(0.05)

        except Exception as e:
            print(f"STREAMER ERROR: {e}")
            import traceback
            traceback.print_exc()

    listener_task = asyncio.create_task(command_listener())
    try:
        await frame_streamer()
    finally:
        listener_task.cancel()
        try:
            await listener_task
        except asyncio.CancelledError:
            pass
