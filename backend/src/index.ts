import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

import dashboardRoutes from './routes/dashboard';
import agentRoutes from './routes/agents';
import tradeRoutes from './routes/trades';
import analyticsRoutes from './routes/analytics';
import { initializeWebSocket } from './services/websocket';
import { ArbitrageHunter } from './agents/ArbitrageHunter';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/analytics', analyticsRoutes);

// Initialize WebSocket
initializeWebSocket(io);

// Initialize AI Agents (example - Arbitrage Hunter)
const arbitrageHunter = new ArbitrageHunter(io);

// Start agents after a delay
setTimeout(() => {
  logger.info('Starting AI agents...');
  arbitrageHunter.start();
}, 3000);

// Start server
const PORT = process.env.PORT || 8001;
httpServer.listen(PORT, () => {
  logger.info(`🚀 DeepSentinel Backend running on port ${PORT}`);
  logger.info(`📡 WebSocket server ready`);
  logger.info(`🤖 AI Agents initialized`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  arbitrageHunter.stop();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { io };