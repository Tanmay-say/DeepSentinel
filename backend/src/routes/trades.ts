import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

// Get all trades
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string;

    const trades = await prisma.trade.findMany({
      where: status ? { status } : undefined,
      include: {
        agent: true
      },
      orderBy: { executedAt: 'desc' },
      take: limit
    });

    res.json(trades);
  } catch (error) {
    logger.error('Error fetching trades:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// Get single trade details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        agent: true
      }
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    res.json(trade);
  } catch (error) {
    logger.error('Error fetching trade details:', error);
    res.status(500).json({ error: 'Failed to fetch trade details' });
  }
});

export default router;