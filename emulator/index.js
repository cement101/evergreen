const http = require('http');

// Configuration
const BACKEND_URL = 'http://localhost:4000/api/readings'; // Updated to match backend endpoint
const SEND_INTERVAL_MS = 2000; // Send data every 2 seconds

// Example data generator
function generateData() {
  return {
    basinId: 'basin-01', // Change as needed for multiple basins
    timestamp: new Date().toISOString(),
    value: Math.floor(Math.random() * 100),
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
