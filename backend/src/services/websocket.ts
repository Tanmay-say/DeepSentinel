import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';

export function initializeWebSocket(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    // Send initial connection confirmation
    socket.emit('connected', {
      message: 'Connected to DeepSentinel WebSocket',
      timestamp: new Date()
    });

    // Handle client requests
    socket.on('request:dashboard:init', async () => {
      try {
        // In production, fetch from database
        socket.emit('dashboard:init', {
          agents: [],
          recentTrades: [],
          stats: {
            totalProfit: 0,
            activeAgents: 0,
            tradesExecuted: 0,
            successRate: 0
          }
        });
      } catch (error) {
        logger.error('Error sending dashboard init:', error);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`❌ Client disconnected: ${socket.id}`);
    });
  });

  logger.info('✅ WebSocket initialized');
}