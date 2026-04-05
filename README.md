# SCH-HS Telemetry Anomaly Detection

**Real-Time Spacecraft Telemetry Anomaly Detection Dashboard**  
Undergraduate Research · Purdue Data Mine × U.S. Space Force Space Systems Command

A live-streaming cybersecurity dashboard for spacecraft telemetry anomaly detection using CUSUM-based statistical analysis across dual SCH/HS channels, with a military SCADA aesthetic and five synthetic attack profiles.

---

## Overview

SCH-HS monitors two spacecraft telemetry channels in real time and flags anomalies using CUSUM-based statistical detection:

- **SCH (Scheduler) — `SCH_SCHEDULER_NUM`**: High-frequency scheduling tick events. Sensitive to sudden injection-style attacks.
- **HS (Housekeeping) — `HS_EXECUTION_COUNTER`**: Periodic housekeeping execution counters. Suited for detecting slow drift anomalies over time.

Running both channels in parallel enables cross-channel anomaly correlation — a spike in SCH with a flat HS curve distinguishes localized injection attacks from system-wide load events.

---

## Attack Profiles

| Profile | Description |
|---|---|
| `INJECT_ATTACK` | Sudden spike injection into telemetry stream |
| `SLOW_DRIFT` | Gradual value drift over time |
| `FAST_LOAD` | Rapid load surge event |
| `SYS_SPIKE` | System-wide spike across both channels |
| `REPLAY_ATTACK` | Repeated pattern injection mimicking normal data |

---

## Tech Stack

**Backend**
- Python 3.11
- FastAPI — REST + WebSocket server
- Uvicorn — ASGI server
- CUSUM — statistical anomaly detection algorithm

**Frontend**
- React 18
- Chart.js — live telemetry waveform rendering
- Space Grotesk font, cyan `#00daf3` on dark `#101419`

---

## Project Structure

```
HS-SCH/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   ├── server.py          # FastAPI app, WebSocket handler
│   ├── cusum.py           # CUSUM detection logic
│   ├── mock_data.py       # Synthetic telemetry + attack profile generator
│   └── check_data.py      # Data validation utility
└── dashboard/
    ├── Dockerfile
    ├── .dockerignore
    ├── package.json
    └── src/
        ├── features/
        │   ├── charts/    # ChartGrid, ChartPanel, useChart
        │   ├── controls/  # AttackPanel, StreamControls
        │   ├── log/       # EventLog
        │   └── stream/    # useStreamState, useWebSocket
        ├── components/    # Header, StatusBadge
        ├── App.jsx
        └── App.css
```

---

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) installed and running
- No Python or Node installation required — Docker handles everything

---

## Running with Docker

```bash
# Clone the repository
git clone <repo-url>
cd HS-SCH

# Build and start both services
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

```bash
# Stop all services
docker compose down
```

---

## Running Locally (Without Docker)

**Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

**Frontend**
```bash
cd dashboard
npm install
npm start
```

---

## Requirements

**Backend (`requirements.txt`)**
```
fastapi==0.135.2
uvicorn==0.42.0
websockets==16.0
```

**Frontend (`package.json`)**
```
react
react-dom
chart.js
```

---

## Research Context

This project is developed as part of the Purdue Data Mine undergraduate research program in collaboration with U.S. Space Force Space Systems Command. It explores CUSUM behavioral monitoring as a lightweight anomaly detection layer for spacecraft telemetry channels, targeting stealthy timing-based threats that evade high-level metric monitoring.

---

## Author

**Eshwar Singh Rajaputana**  
B.S. Computer Science · University of Texas at Dallas  
Purdue Data Mine · U.S. Space Force Space Systems Command Research