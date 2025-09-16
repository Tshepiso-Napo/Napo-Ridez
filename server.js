const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // serve your frontend

let rides = [];
let rideIdCounter = 1;

// Passenger requests ride
app.post('/request-ride', (req, res) => {
  const { passengerName, pickup, dropoff } = req.body;
  if (!passengerName || !pickup || !dropoff) return res.status(400).json({ error: 'Missing info' });

  const ride = {
    id: rideIdCounter++,
    passengerName,
    pickup,
    dropoff,
    status: 'pending',
    driver: null,
    location: pickup
  };
  rides.push(ride);
  io.emit('new-ride', ride);
  res.json({ message: 'Ride requested', ride });
});

// Driver accepts ride
app.post('/accept-ride', (req, res) => {
  const { driverName, rideId } = req.body;
  const ride = rides.find(r => r.id === rideId);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  if (ride.status !== 'pending') return res.status(400).json({ error: 'Ride already taken' });

  ride.driver = driverName;
  ride.status = 'accepted';
  io.emit('ride-updated', ride);
  res.json({ message: 'Ride accepted', ride });
});

// Get all rides
app.get('/get-rides', (req, res) => res.json(rides));

// Update driver location
app.post('/update-location', (req, res) => {
  const { rideId, lat, lng } = req.body;
  const ride = rides.find(r => r.id === rideId);
  if (ride) {
    ride.location = { lat, lng };
    io.emit('ride-updated', ride);
  }
  res.json({ ok: true });
});

// Complete ride
app.post('/complete-ride', (req, res) => {
  const { rideId } = req.body;
  const ride = rides.find(r => r.id === rideId);
  if (ride) {
    ride.status = 'completed';
    io.emit('ride-updated', ride);
  }
  res.json({ ok: true });
});

io.on('connection', socket => {
  console.log('Socket connected');
});

http.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
