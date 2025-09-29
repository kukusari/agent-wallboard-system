const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const messageRoutes = require('./routes/messages');

// Import socket handler
const socketHandler = require('./socket/socketHandler');

// Import database config
const { connectMongoDB, initSQLite } = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket.io handling
socketHandler(io);

// Initialize databases and start server
async function startServer() {
  try {
    // Initialize databases
    await initSQLite();
    await connectMongoDB();
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, io };