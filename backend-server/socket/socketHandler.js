const Message = require('../models/Message');

// Store active connections
const activeConnections = new Map();

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('👤 New client connected:', socket.id);

    // Agent joins their room
    socket.on('join_agent_room', (agentCode) => {
      socket.join(agentCode);
      activeConnections.set(agentCode, socket.id);
      console.log(`👤 Agent ${agentCode} joined room`);
      
      // Broadcast agent online status
      socket.broadcast.emit('agent_status_change', {
        agentCode,
        status: 'online',
        timestamp: new Date()
      });
    });

    // Handle status updates
    socket.on('update_agent_status', (data) => {
      const { agentCode, status } = data;
      
      // Broadcast status change to all supervisors
      io.emit('agent_status_change', {
        agentCode,
        status,
        timestamp: new Date()
      });

      console.log(`📊 Status update: ${agentCode} -> ${status}`);
    });

    // Handle supervisor joining team room
    socket.on('join_supervisor_room', (supervisorCode) => {
      socket.join(`supervisor_${supervisorCode}`);
      console.log(`👔 Supervisor ${supervisorCode} joined`);
    });

    // Handle direct messages
    socket.on('send_direct_message', async (data) => {
      try {
        const { fromCode, toCode, message } = data;
        
        // Save to database
        const newMessage = new Message({
          fromCode,
          toCode,
          message,
          type: 'direct',
          timestamp: new Date(),
          isRead: false
        });
        
        await newMessage.save();
        
        // Send to target agent
        io.to(toCode).emit('new_direct_message', newMessage);
        
        console.log(`💬 Message sent: ${fromCode} -> ${toCode}`);
      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('👋 Client disconnected:', socket.id);
      
      // Find and remove from active connections
      for (const [agentCode, socketId] of activeConnections.entries()) {
        if (socketId === socket.id) {
          activeConnections.delete(agentCode);
          
          // Broadcast agent offline status
          socket.broadcast.emit('agent_status_change', {
            agentCode,
            status: 'offline',
            timestamp: new Date()
          });
          break;
        }
      }
    });
  });
}

module.exports = socketHandler;