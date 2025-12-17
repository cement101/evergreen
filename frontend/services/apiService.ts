// API utility for backend communication
const API_BASE = 'http://localhost:4000/api';

export async function fetchReadings() {
  const res = await fetch(`${API_BASE}/readings`);
  if (!res.ok) throw new Error('Failed to fetch readings');
  return res.json();
}

export async function postReading(data) {
  const res = await fetch(`${API_BASE}/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to post reading');
  return res.json();
}

export async function postCommand(command) {
  const res = await fetch(`${API_BASE}/commands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error('Failed to post command');
  return res.json();
}
