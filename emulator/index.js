const http = require('http');

// Configuration
const BACKEND_URL = 'http://localhost:4000/api/readings'; // Updated to match backend endpoint
const SEND_INTERVAL_MS = 2000; // Send data every 2 seconds

// Example data generator
function generateData() {
  return {
    basinId: 'basin-01',
    timestamp: new Date().toISOString(),
    airTemp: Math.floor(Math.random() * 10) + 20,
    humidity: Math.floor(Math.random() * 40) + 40,
    soilTemp: Math.floor(Math.random() * 10) + 15,
    soilMoisture: Math.floor(Math.random() * 100),
    soilEC: Math.round(Math.random() * 200),
    soilPH: (Math.random() * 2 + 5).toFixed(2),
    soilN: Math.floor(Math.random() * 30),
    soilP: Math.floor(Math.random() * 30),
    soilK: Math.floor(Math.random() * 30),
    co2Level: Math.floor(Math.random() * 100) + 400,
    lux: Math.floor(Math.random() * 1000),
    status: 'ok',
  };
}

function sendData() {
  const data = JSON.stringify(generateData());
  const url = new URL(BACKEND_URL);

  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  const req = http.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => {
      response += chunk;
    });
    res.on('end', () => {
      console.log(`Response: ${res.statusCode} - ${response}`);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(data);
  req.end();
}

console.log('Emulator started. Sending data every', SEND_INTERVAL_MS, 'ms');
setInterval(sendData, SEND_INTERVAL_MS);
