import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

// Get dashboard overview stats
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const agents = await prisma.agent.findMany();
    const trades = await prisma.trade.findMany({
      where: { status: 'success' },
      orderBy: { executedAt: 'desc' },
      take: 100
    });

    const totalProfit = trades.reduce((sum, trade) => sum + trade.profitAmount, 0);
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const tradesExecuted = trades.length;
    const successRate = trades.length > 0
      ? (trades.filter(t => t.status === 'success').length / trades.length) * 100
      : 0;

    res.json({
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      activeAgents,
      tradesExecuted,
      successRate: parseFloat(successRate.toFixed(1)),
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        statistics: agent.statistics
      }))
    });
  } catch (error) {
    logger.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get activity feed
router.get('/activity-feed', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    const activities = await prisma.activityLog.findMany({
      include: {
        agent: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json(activities);
  } catch (error) {
    logger.error('Error fetching activity feed:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

// Get profit chart data
router.get('/profit-chart', async (req: Request, res: Response) => {
  try {
    const timeRange = req.query.range as string || '7d';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const trades = await prisma.trade.findMany({
      where: {
        status: 'success',
        executedAt: {
          gte: startDate
        }
      },
      include: {
        agent: true
      },
      orderBy: { executedAt: 'asc' }
    });

    // Aggregate by hour or day depending on range
    const chartData = trades.map(trade => ({
      timestamp: trade.executedAt,
      profit: trade.profitAmount,
      agent: trade.agent.name
    }));

    res.json(chartData);
  } catch (error) {
    logger.error('Error fetching profit chart:', error);
    res.status(500).json({ error: 'Failed to fetch profit chart data' });
  }
});

export default router;