require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const setupSockets = require('./sockets');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

setupSockets(io);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`\n🚀 MediQueue Backend running on port ${PORT}`);
    console.log(`📡 Socket.IO ready for real-time queue updates`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`\n📋 API Endpoints:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/hospitals`);
    console.log(`   GET    /api/hospitals/:id`);
    console.log(`   GET    /api/queues/hospital/:id`);
    console.log(`   PATCH  /api/queues/department/:id/update`);
    console.log(`   POST   /api/bookings`);
    console.log(`   GET    /api/bookings/my-bookings`);
  });
};

start();
