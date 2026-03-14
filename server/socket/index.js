import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const onlineUsers = new Map();

export const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`🟢 User connected: ${userId}`);

    // Join personal room
    socket.join(`user_${userId}`);
    onlineUsers.set(userId, socket.id);

    // Set online
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit('user_online', { userId });

    // Join match rooms
    socket.on('join_match', (matchId) => {
      socket.join(`match_${matchId}`);
    });

    socket.on('leave_match', (matchId) => {
      socket.leave(`match_${matchId}`);
    });

    // Typing
    socket.on('typing', ({ matchId, isTyping }) => {
      socket.to(`match_${matchId}`).emit('user_typing', { userId, isTyping });
    });

    // Message read
    socket.on('message_read', ({ messageId, matchId }) => {
      socket.to(`match_${matchId}`).emit('message_read', { messageId, userId });
    });

    // --- WEBRTC SIGNALING ---
    // Initiate call
    socket.on('call_user', async ({ to, offer, type, matchId }) => {
      console.log(`📞 Call from ${userId} to ${to} (${type}) (match: ${matchId})`);
      socket.to(`user_${to}`).emit('incoming_call', {
        from: userId,
        fromUser: socket.user,
        offer,
        type,
        matchId
      });
      
      // Store initial log (status: dialing/initiated - we'll update it later or create it on end)
      // Actually, standard practice is to create it when it fails to connect or when it ends.
    });

    // Accept call
    socket.on('accept_call', ({ to, answer }) => {
      console.log(`✅ Call accepted by ${userId} for ${to}`);
      socket.to(`user_${to}`).emit('call_accepted', {
        from: userId,
        answer
      });
    });

    // Reject call
    socket.on('reject_call', async ({ to, matchId, type }) => {
      console.log(`❌ Call rejected by ${userId} for ${to}`);
      socket.to(`user_${to}`).emit('call_rejected', {
        from: userId
      });

      // Create missed/rejected call log
      try {
        const Message = (await import('../models/Message.js')).default;
        const callMsg = await Message.create({
          match: matchId,
          sender: to, // The one who started it (the logs usually show who started it)
          type: 'call',
          callData: {
            type,
            status: 'missed',
            duration: 0
          }
        });
        io.to(`match_${matchId}`).emit('new_message', callMsg);
      } catch (err) {
        console.error('Failed to create call log:', err);
      }
    });

    // ICE Candidates
    socket.on('ice_candidate', ({ to, candidate }) => {
      socket.to(`user_${to}`).emit('ice_candidate', {
        from: userId,
        candidate
      });
    });

    // End call
    socket.on('end_call', async ({ to, matchId, type, status, duration }) => {
      console.log(`📵 Call ended by ${userId}. Status: ${status}, Duration: ${duration}`);
      socket.to(`user_${to}`).emit('call_ended', {
        from: userId
      });

      // Create call log message
      if (matchId && status) {
        try {
          const Message = (await import('../models/Message.js')).default;
          const callMsg = await Message.create({
            match: matchId,
            sender: userId, // We keep the sender as the person who initiated/ended? 
                            // Let's stick to system-like log but with a 'sender' for room logic
            type: 'call',
            callData: {
              type,
              status,
              duration: duration || 0
            }
          });
          io.to(`match_${matchId}`).emit('new_message', callMsg);
        } catch (err) {
          console.error('Failed to create call log:', err);
        }
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`🔴 User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user_offline', { userId });
      // Clean up any active calls if necessary (optional improvement)
    });
  });
};

export const getOnlineUsers = () => onlineUsers;
