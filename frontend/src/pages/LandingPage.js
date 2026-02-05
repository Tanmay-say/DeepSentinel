import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, BarChart3, Shield, TrendingUp } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: 'Arbitrage Hunter',
      description: 'Automatically detects and executes profitable arbitrage opportunities across DEX pools'
    },
    {
      icon: BarChart3,
      title: 'Market Maker',
      description: 'Provides liquidity and captures spreads on high-volume trading pairs'
    },
    {
      icon: Shield,
      title: 'MEV Guardian',
      description: 'Protects your transactions from MEV attacks and front-running'
    },
    {
      icon: TrendingUp,
      title: 'Yield Optimizer',
      description: 'Maximizes returns by automatically rebalancing across yield opportunities'
    }
  ];

  return (
    <div className="min-h-screen bg-page text-text-primary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-hero-glow" />
        
        {/* Header */}
        <header className="relative z-10 px-6 py-8 max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-heading font-bold tracking-tight"
          >
            <span className="text-primary">Deep</span>
            <span className="text-text-primary">Sentinel</span>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 font-body font-medium transition-all hover:scale-105"
            data-testid="launch-app-btn"
          >
            Launch App
          </motion.button>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-7xl font-heading font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Autonomous AI Agents
              </span>
              <br />
              <span className="text-text-primary">for Sui DeFi</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-2xl mx-auto font-body">
              24/7 arbitrage, market making, and MEV protection powered by AI on Sui blockchain
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 rounded-lg bg-primary hover:bg-primary/90 font-heading font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                data-testid="hero-cta-btn"
              >
                Launch Dashboard
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-lg border border-border-subtle hover:bg-white/5 font-heading font-bold text-lg transition-all glass"
                data-testid="learn-more-btn"
              >
                Learn More
              </motion.button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-4xl font-heading font-black text-success">$0</div>
                <div className="text-sm text-text-secondary uppercase tracking-wider mt-2">Total Profit</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-heading font-black text-primary">1</div>
                <div className="text-sm text-text-secondary uppercase tracking-wider mt-2">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-heading font-black text-secondary">0</div>
                <div className="text-sm text-text-secondary uppercase tracking-wider mt-2">Trades Executed</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-4">AI-Powered Trading Agents</h2>
          <p className="text-xl text-text-secondary">Four specialized agents working 24/7 to maximize your DeFi returns</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass p-8 rounded-xl hover:border-border-highlight transition-all"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-black mb-4">How It Works</h2>
            <p className="text-xl text-text-secondary">Three simple steps to start earning</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Monitor', desc: 'AI agents continuously scan DeepBook pools for opportunities' },
              { step: '02', title: 'Analyze', desc: 'Gemini AI evaluates profitability and risk in real-time' },
              { step: '03', title: 'Execute', desc: 'Programmable Transaction Blocks execute trades atomically' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="text-6xl font-mono font-bold text-primary/30 mb-4">{item.step}</div>
                <h3 className="text-2xl font-heading font-bold mb-3">{item.title}</h3>
                <p className="text-text-secondary">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto text-center text-text-secondary">
          <p className="mb-2">Built on <span className="text-sui font-semibold">Sui</span> blockchain</p>
          <p className="text-sm">Powered by Programmable Transaction Blocks & DeepBook</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;