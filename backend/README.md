# Evergreen Backend

## Overview
This backend communicates with an ESP device (or emulator), receives sensor readings in JSON, stores them in MongoDB, and exposes REST APIs for a frontend to get readings and post commands. Includes an emulator for testing without hardware.

## Features
- Receives JSON readings from ESP/emulator
- Stores readings in MongoDB
- REST API for readings and commands
- Emulator to simulate ESP device

## Setup
1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up MongoDB (default: mongodb://localhost:27017/evergreen)
3. Start backend:
   ```sh
   npm run dev
   ```
4. (Optional) Start emulator:
   ```sh
   npm run emulator
   ```

## API Endpoints
- `GET /api/readings` — Get recent readings
- `POST /api/readings` — Post new reading (from ESP/emulator)
- `POST /api/commands` — Post command to ESP (or emulator)

## Emulator
The emulator sends fake readings to the backend every 5 seconds. Use it to test the backend without an actual ESP device.

---

**Note:** Update MongoDB URI and backend URLs as needed for your environment.
