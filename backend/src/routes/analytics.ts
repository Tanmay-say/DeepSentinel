import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

// Get analytics summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const trades = await prisma.trade.findMany({
      include: { agent: true }
    });

    const successfulTrades = trades.filter(t => t.status === 'success');
    const totalVolume = successfulTrades.reduce((sum, t) => sum + t.profitAmount, 0);
    const totalProfit = successfulTrades.reduce((sum, t) => sum + t.profitAmount, 0);
    const totalGasCost = trades.reduce((sum, t) => sum + t.gasUsed, 0);

    res.json({
      totalVolume: parseFloat(totalVolume.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalGasCost: parseFloat(totalGasCost.toFixed(4)),
      totalTrades: trades.length,
      successfulTrades: successfulTrades.length,
      successRate: trades.length > 0 ? (successfulTrades.length / trades.length) * 100 : 0
    });
  } catch (error) {
    logger.error('Error fetching analytics summary:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get profit by agent
router.get('/profit-by-agent', async (req: Request, res: Response) => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        trades: {
          where: { status: 'success' }
        }
      }
    });

    const profitByAgent = agents.map(agent => ({
      agentId: agent.id,
      agentName: agent.name,
      totalProfit: agent.trades.reduce((sum, t) => sum + t.profitAmount, 0),
      tradeCount: agent.trades.length
    }));

    res.json(profitByAgent);
  } catch (error) {
    logger.error('Error fetching profit by agent:', error);
    res.status(500).json({ error: 'Failed to fetch profit by agent' });
  }
});

export default router;