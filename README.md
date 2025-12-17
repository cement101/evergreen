# evergreen

## System Overview

evergreen is a plant monitoring dashboard system consisting of four main components:

- **ESP32 Firmware**: Collects sensor data and controls pumps for each basin.
- **Backend Server (Node.js)**: Acts as a bridge between the ESP32 devices, the frontend dashboard, and the MongoDB database. Handles authentication, user management, and data routing.
- **MongoDB Database**: Stores all sensor readings, user data, and basin information.
- **Frontend (React)**: Provides a dashboard for users to monitor and control basins, export data, and manage users.

## Component Interactions

- The **ESP32** collects sensor readings and POSTs them to the backend, which stores them in MongoDB. It also receives pump control commands from the backend via HTTP.
- The **Backend** POSTs commands to the ESP32 (to control pumps), GETs sensor readings from the ESP32, POSTs readings to MongoDB, and GETs readings from MongoDB for the frontend (e.g., for export or charting).
- The **Frontend** POSTs pump statuses to the backend and GETs all required data (sensor readings, user info, etc.) from the backend. Users only see basins they have access to (as defined by the superadmin).

## Frontend Functionalities

1. **Basin Overview Page**
   - Landing page displaying all basins in a grid.
   - Shows: online status, pump on/off, name, last update time.
   - Clicking a basin opens its details page.
2. **Basin Details Page**
   - Shows: status, IP, last update, latest sensor readings (grid), 4 pump on/off controls.
   - Historical chart with 1h, 12h, 24h options.
   - Back button returns to overview.
3. **Export Component**
   - Export CSV data from backend.
   - Controls: basin selection dropdown, from/to date+time pickers.
   - Exports with Unix timestamps, includes entry count per basin.
4. **Users Page** (Superadmin only)
   - Add/remove users, assign accessible basins.
5. **Chart Component**
   - Like Export, but displays a chart instead of exporting CSV.
   - Users only see basins they have access to.
6. **Header**
   - Simple login controls, navigation between components, back button (usually to overview), dark/light theme toggle (with green accents).

## Data Format Example

Sensor readings in the backend look like:
```json
{"telemetry":{"basin-04":{"co2Level":419,"airTemp":21.9,"humidity":57,"soilTemp":17.45,"soilMoisture":44,"soilEC":129,"soilPH":649,"soilN":21,"soilP":16,"soilK":18,"lux":358,"lastSeen":1765873149542},"basin-03":{"co2Level":409,"airTemp":20.9,"humidity":59,"soilTemp":18.45,"soilMoisture":39,"soilEC":109,"soilPH":659,"soilN":19,"soilP":14,"soilK":17,"lux":290,"lastSeen":1765873149542}},"commands":{"basin-04":{"pump":false},"basin-03":{"pump":false}},"history":{}}
```

## How to Start and Test Each Component

### 1. ESP32 Firmware
- Flash `esp32-firmware/main/main.ino` to your ESP32 device using the Arduino IDE or similar tools.
- Ensure the `serverBase` variable in the sketch points to your backend server's IP address.
- The ESP32 should POST sensor data to the backend and accept pump control commands via HTTP.

### 2. Backend Server (Node.js)
- Navigate to `esp32-firmware/main/esp-backend`.
- Run `npm install` to install dependencies.
- Start the server with `npm start`.
- Ensure the backend can connect to your MongoDB instance (configure connection string as needed).
- The backend should be accessible to both the ESP32 and the frontend.

### 3. MongoDB
- Start your MongoDB server (local or cloud).
- Ensure the backend is configured to connect to the correct MongoDB URI.
- Test by checking if sensor data from the ESP32 is being stored.

### 4. Frontend (React)
- Navigate to `frontend`.
- Run `npm install` to install dependencies.
- Start the frontend with `npm run dev`.
- Access the dashboard in your browser (default: http://localhost:5173 or as shown in the terminal).
- Log in and verify you can:
  - View basin overview and details
  - Control pumps
  - Export data
  - View charts
  - (Superadmin) Manage users

## Testing Each Element
- **ESP32**: Check serial output for successful POSTs and command responses.
- **Backend**: Use logs or Postman to verify endpoints, check MongoDB for data.
- **MongoDB**: Use MongoDB Compass or CLI to inspect data.
- **Frontend**: Interact with all components, verify data updates, and test user permissions.

## Notes
- Do not run backend code on the ESP32.
- All components must be network-accessible to each other.
- For production, secure all endpoints and use environment variables for sensitive data.