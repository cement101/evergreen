// Entry point for backend server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (update URI as needed)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/evergreen';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Reading schema
const readingSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  data: mongoose.Schema.Types.Mixed
});
const Reading = mongoose.model('Reading', readingSchema);

// API: Get all readings
app.get('/api/readings', async (req, res) => {
  const readings = await Reading.find().sort({ timestamp: -1 }).limit(100);
  res.json(readings);
});

// API: Post new reading (from ESP or emulator)
app.post('/api/readings', async (req, res) => {
  // Use the timestamp from the data if present, else now
  const topLevelTimestamp = req.body.timestamp ? new Date(req.body.timestamp) : new Date();
  const reading = new Reading({ data: req.body, timestamp: topLevelTimestamp });
  await reading.save();
  res.status(201).json(reading);
});

// API: Post command to ESP (store or forward)
app.post('/api/commands', async (req, res) => {
  // Here, you would forward the command to the ESP (or emulator)
  // For now, just echo back
  res.status(200).json({ status: 'Command received', command: req.body });
});

// Placeholder for ESP communication logic (to be implemented)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
