import { GoogleGenAI } from '@google/genai';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { SuiService } from '../services/sui';
import { v4 as uuidv4 } from 'uuid';

export interface Opportunity {
  id: string;
  type: 'arbitrage';
  poolA: { name: string; price: number; };
  poolB: { name: string; price: number; };
  spread: number;
  estimatedProfit: number;
}

export interface Decision {
  shouldExecute: boolean;
  confidence: number;
  reasoning: string;
  opportunity: Opportunity;
}

export class ArbitrageHunter {
  private agentId: string = '';
  private status: 'active' | 'idle' | 'error' | 'paused' = 'idle';
  private llm: any;
  private suiService: SuiService;
  private io: SocketIOServer;
  private intervalId?: NodeJS.Timeout;
  private opportunitiesFound: number = 0;
  private successfulTrades: number = 0;
  private totalProfit: number = 0;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.suiService = new SuiService();
    
    // Initialize Gemini AI
    const apiKey = process.env.GEMINI_API_KEY || process.env.EMERGENT_LLM_KEY;
    if (apiKey) {
      this.llm = new GoogleGenAI({ apiKey });
      logger.info('✅ Gemini AI initialized for Arbitrage Hunter');
    } else {
      logger.warn('⚠️  No Gemini API key found, AI decision making will be simulated');
    }
    
    this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      // Create or find agent in database
      const existingAgent = await prisma.agent.findFirst({
        where: { type: 'arbitrage_hunter' }
      });

      if (existingAgent) {
        this.agentId = existingAgent.id;
        logger.info(`🎯 Arbitrage Hunter agent loaded: ${this.agentId}`);
      } else {
        const newAgent = await prisma.agent.create({
          data: {
            name: 'Arbitrage Hunter',
            type: 'arbitrage_hunter',
            status: 'idle',
            config: {
              minSpread: 0.5,
              maxTradeSize: 1000,
              executionDelay: 0
            },
            statistics: {
              opportunitiesFound: 0,
              successfulTrades: 0,
              totalProfit: 0,
              successRate: 0
            }
          }
        });
        this.agentId = newAgent.id;
        logger.info(`✨ New Arbitrage Hunter agent created: ${this.agentId}`);
      }
    } catch (error) {
      logger.error('Failed to initialize agent:', error);
    }
  }

  async start() {
    if (this.status === 'active') {
      logger.warn('Agent is already running');
      return;
    }

    this.status = 'active';
    await this.updateAgentStatus('active');
    logger.info('🚀 Arbitrage Hunter started');

    // Log activity
    await this.logActivity('agent_started', 'Arbitrage Hunter has started monitoring pools');

    // Start scanning loop
    this.run();
  }

  async stop() {
    this.status = 'paused';
    await this.updateAgentStatus('paused');
    if (this.intervalId) {
      clearTimeout(this.intervalId);
    }
    logger.info('⏸️  Arbitrage Hunter stopped');
    await this.logActivity('agent_stopped', 'Arbitrage Hunter has been stopped');
  }

  private async run() {
    while (this.status === 'active') {
      try {
        // Scan for opportunities
        const opportunities = await this.scan();

        for (const opp of opportunities) {
          if (this.status !== 'active') break;

          // Analyze with AI
          const decision = await this.analyze(opp);

          if (decision.shouldExecute) {
            // Execute trade
            await this.execute(decision);
          } else {
            logger.debug(`Opportunity rejected: ${decision.reasoning}`);
          }
        }

        // Wait before next scan (5 seconds)
        await new Promise(resolve => {
          this.intervalId = setTimeout(resolve, 5000);
        });
      } catch (error) {
        logger.error('Error in agent run loop:', error);
        await this.logActivity('error', `Error in agent: ${error}`, 'error');
      }
    }
  }

  private async scan(): Promise<Opportunity[]> {
    // Mock DeepBook pool monitoring
    const pools = await this.suiService.getPoolPrices();
    const opportunities: Opportunity[] = [];

    // Find arbitrage opportunities (mock data)
    for (let i = 0; i < pools.length - 1; i++) {
      for (let j = i + 1; j < pools.length; j++) {
        const poolA = pools[i];
        const poolB = pools[j];

        // Check if pools are for same base/quote pair
        if (poolA.name.includes('SUI') && poolB.name.includes('SUI')) {
          const spread = Math.abs((poolB.price - poolA.price) / poolA.price) * 100;

          if (spread > 0.5) { // Min 0.5% spread
            const opportunity: Opportunity = {
              id: uuidv4(),
              type: 'arbitrage',
              poolA,
              poolB,
              spread,
              estimatedProfit: spread * 10 // Simplified calculation
            };

            opportunities.push(opportunity);

            // Log opportunity to database
            await prisma.opportunity.create({
              data: {
                agentId: this.agentId,
                type: 'arbitrage',
                poolA: poolA.name,
                poolB: poolB.name,
                spread,
                estimatedProfit: opportunity.estimatedProfit,
                status: 'analyzing'
              }
            });

            // Emit to WebSocket
            this.io.emit('opportunity:detected', {
              agentId: this.agentId,
              agentName: 'Arbitrage Hunter',
              opportunity
            });

            // Log activity
            await this.logActivity(
              'opportunity_detected',
              `Arbitrage opportunity detected: ${poolA.name} ↔ ${poolB.name} (${spread.toFixed(2)}% spread)`,
              'info'
            );

            this.opportunitiesFound++;
          }
        }
      }
    }

    return opportunities;
  }

  private async analyze(opp: Opportunity): Promise<Decision> {
    try {
      if (!this.llm) {
        // Fallback: Simple rule-based decision
        return {
          shouldExecute: opp.spread > 0.8,
          confidence: 0.7,
          reasoning: 'Rule-based decision: spread is above threshold',
          opportunity: opp
        };
      }

      const prompt = `You are an expert DeFi arbitrage trader. Analyze this opportunity:

- Pool A: ${opp.poolA.name} at $${opp.poolA.price}
- Pool B: ${opp.poolB.name} at $${opp.poolB.price}
- Spread: ${opp.spread.toFixed(2)}%
- Estimated profit: ${opp.estimatedProfit.toFixed(2)} SUI
- Gas cost: ~0.001 SUI
- Slippage tolerance: 0.5%

Should we execute this arbitrage trade? Consider profitability after all fees.

Respond ONLY with valid JSON in this exact format:
{
  "shouldExecute": true or false,
  "confidence": number between 0 and 1,
  "reasoning": "brief explanation"
}`;

      const response = await this.llm.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const text = response.text || '';
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          opportunity: opp
        };
      }

      // Fallback
      return {
        shouldExecute: opp.spread > 0.8,
        confidence: 0.5,
        reasoning: 'Could not parse AI response, using fallback logic',
        opportunity: opp
      };
    } catch (error) {
      logger.error('Error in AI analysis:', error);
      return {
        shouldExecute: false,
        confidence: 0,
        reasoning: `Analysis failed: ${error}`,
        opportunity: opp
      };
    }
  }

  private async execute(decision: Decision): Promise<void> {
    try {
      const { opportunity } = decision;
      
      logger.info(`💰 Executing arbitrage: ${opportunity.poolA.name} ↔ ${opportunity.poolB.name}`);

      // Build and execute PTB (mocked)
      const txResult = await this.suiService.executeArbitragePTB(opportunity);

      if (txResult.success) {
        this.successfulTrades++;
        this.totalProfit += opportunity.estimatedProfit;

        // Save trade to database
        await prisma.trade.create({
          data: {
            agentId: this.agentId,
            type: 'arbitrage',
            poolA: opportunity.poolA.name,
            poolB: opportunity.poolB.name,
            spread: opportunity.spread,
            profitAmount: opportunity.estimatedProfit,
            profitToken: 'SUI',
            gasUsed: 0.001,
            txHash: txResult.txHash,
            status: 'success',
            aiDecision: {
              confidence: decision.confidence,
              reasoning: decision.reasoning
            }
          }
        });

        // Update agent statistics
        await this.updateStatistics();

        // Emit to WebSocket
        this.io.emit('trade:executed', {
          agentId: this.agentId,
          agentName: 'Arbitrage Hunter',
          trade: {
            poolA: opportunity.poolA.name,
            poolB: opportunity.poolB.name,
            spread: opportunity.spread,
            profit: opportunity.estimatedProfit,
            txHash: txResult.txHash
          },
          success: true
        });

        // Log activity
        await this.logActivity(
          'trade_executed',
          `✅ Arbitrage executed successfully: +${opportunity.estimatedProfit.toFixed(2)} SUI`,
          'success'
        );

        logger.info(`✅ Trade successful: +${opportunity.estimatedProfit.toFixed(2)} SUI`);
      } else {
        throw new Error(txResult.error || 'Transaction failed');
      }
    } catch (error) {
      logger.error('Trade execution failed:', error);

      // Save failed trade
      await prisma.trade.create({
        data: {
          agentId: this.agentId,
          type: 'arbitrage',
          poolA: decision.opportunity.poolA.name,
          poolB: decision.opportunity.poolB.name,
          spread: decision.opportunity.spread,
          profitAmount: 0,
          status: 'failed',
          errorMessage: String(error)
        }
      });

      await this.logActivity(
        'trade_failed',
        `❌ Trade execution failed: ${error}`,
        'error'
      );
    }
  }

  private async updateAgentStatus(status: string) {
    try {
      await prisma.agent.update({
        where: { id: this.agentId },
        data: { status }
      });

      // Emit status update
      this.io.emit('agent:status:update', {
        agentId: this.agentId,
        status
      });
    } catch (error) {
      logger.error('Failed to update agent status:', error);
    }
  }

  private async updateStatistics() {
    try {
      const successRate = this.opportunitiesFound > 0
        ? (this.successfulTrades / this.opportunitiesFound) * 100
        : 0;

      await prisma.agent.update({
        where: { id: this.agentId },
        data: {
          statistics: {
            opportunitiesFound: this.opportunitiesFound,
            successfulTrades: this.successfulTrades,
            totalProfit: this.totalProfit,
            successRate
          }
        }
      });

      // Emit stats update
      this.io.emit('agent:stats:update', {
        agentId: this.agentId,
        statistics: {
          opportunitiesFound: this.opportunitiesFound,
          successfulTrades: this.successfulTrades,
          totalProfit: this.totalProfit,
          successRate
        }
      });
    } catch (error) {
      logger.error('Failed to update statistics:', error);
    }
  }

  private async logActivity(eventType: string, message: string, level: string = 'info') {
    try {
      await prisma.activityLog.create({
        data: {
          agentId: this.agentId,
          eventType,
          message,
          level,
          metadata: {}
        }
      });

      // Emit activity
      this.io.emit('activity:new', {
        agentId: this.agentId,
        agentName: 'Arbitrage Hunter',
        eventType,
        message,
        level,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to log activity:', error);
    }
  }
}