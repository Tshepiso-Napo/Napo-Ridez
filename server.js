const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory storage for rides
let rides = [];
let rideIdCounter = 1;

// Passenger requests a ride
app.post('/request-ride', (req, res) => {
  const { passengerName, pickup, destination } = req.body;
  if (!passengerName || !pickup || !destination) {
    return res.status(400).json({ error: 'Missing info' });
  }
  const ride = { id: rideIdCounter++, passengerName, pickup, destination, status: 'pending', driver: null };
  rides.push(ride);
  console.log('New ride requested:', ride);
  res.json({ message: 'Ride requested', ride });
});

// Driver accepts a ride
app.post('/accept-ride', (req, res) => {
  const { driverName, rideId } = req.body;
  const ride = rides.find(r => r.id === rideId);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  if (ride.status !== 'pending') return res.status(400).json({ error: 'Ride already taken' });

  ride.driver = driverName;
  ride.status = 'accepted';
  console.log(`Driver ${driverName} accepted ride`, ride);
  res.json({ message: 'Ride accepted', ride });
});

// Get all rides (for vendor/driver dashboard)
app.get('/get-rides', (req, res) => {
  res.json(rides);
});

app.listen(PORT, () => {
  console.log(`Napo Ridez backend running on http://localhost:${PORT}`);
});
