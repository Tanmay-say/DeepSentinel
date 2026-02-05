import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

// Get all agents
router.get('/', async (req: Request, res: Response) => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: {
            trades: true,
            opportunities: true
          }
        }
      }
    });

    res.json(agents);
  } catch (error) {
    logger.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get single agent details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        trades: {
          orderBy: { executedAt: 'desc' },
          take: 20
        },
        opportunities: {
          orderBy: { detectedAt: 'desc' },
          take: 10
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    logger.error('Error fetching agent details:', error);
    res.status(500).json({ error: 'Failed to fetch agent details' });
  }
});

// Update agent configuration
router.put('/:id/config', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { config } = req.body;

    const agent = await prisma.agent.update({
      where: { id },
      data: { config }
    });

    res.json(agent);
  } catch (error) {
    logger.error('Error updating agent config:', error);
    res.status(500).json({ error: 'Failed to update agent configuration' });
  }
});

// Start agent
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const agent = await prisma.agent.update({
      where: { id },
      data: { status: 'active' }
    });

    res.json({ success: true, agent });
  } catch (error) {
    logger.error('Error starting agent:', error);
    res.status(500).json({ error: 'Failed to start agent' });
  }
});

// Stop agent
router.post('/:id/stop', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const agent = await prisma.agent.update({
      where: { id },
      data: { status: 'paused' }
    });

    res.json({ success: true, agent });
  } catch (error) {
    logger.error('Error stopping agent:', error);
    res.status(500).json({ error: 'Failed to stop agent' });
  }
});

export default router;