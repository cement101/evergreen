// Emulator for ESP device
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000/api/readings';

function generateFakeReading() {
  return {
    temperature: (20 + Math.random() * 10).toFixed(2),
    humidity: (40 + Math.random() * 20).toFixed(2),
    status: 'ok',
    timestamp: new Date().toISOString()
  };
}

async function sendReading() {
  const data = generateFakeReading();
  try {
    const res = await axios.post(BACKEND_URL, data);
    console.log('Emulator sent reading:', res.data);
  } catch (err) {
    console.error('Emulator failed to send reading:', err.message);
  }
}

// Send a reading every 5 seconds
setInterval(sendReading, 5000);

console.log('ESP Emulator started. Sending readings to', BACKEND_URL);
