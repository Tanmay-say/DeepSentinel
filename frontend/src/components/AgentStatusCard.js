import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AgentStatusCard = ({ agent, index }) => {
  const stats = agent.statistics || {};
  const status = agent.status || 'idle';
  
  const statusConfig = {
    active: { color: 'success', label: 'Active', icon: CheckCircle },
    idle: { color: 'text-muted', label: 'Idle', icon: Clock },
    error: { color: 'error', label: 'Error', icon: Target },
    paused: { color: 'warning', label: 'Paused', icon: Clock }
  };

  const config = statusConfig[status] || statusConfig.idle;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
      className="glass p-6 rounded-xl hover:border-border-highlight transition-all"
      data-testid={`agent-card-${agent.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold">{agent.name}</h3>
            <p className="text-sm text-text-secondary capitalize">{agent.type.replace('_', ' ')}</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-${config.color}/20 text-${config.color}`}>
          {status === 'active' && (
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
          )}
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-mono font-semibold">{config.label}</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm text-text-muted uppercase tracking-wider mb-1">Opportunities</div>
          <div className="text-2xl font-heading font-bold font-mono">{stats.opportunitiesFound || 0}</div>
        </div>
        <div>
          <div className="text-sm text-text-muted uppercase tracking-wider mb-1">Trades</div>
          <div className="text-2xl font-heading font-bold font-mono">{stats.successfulTrades || 0}</div>
        </div>
        <div>
          <div className="text-sm text-text-muted uppercase tracking-wider mb-1">Total Profit</div>
          <div className="text-2xl font-heading font-bold font-mono text-success">
            {(stats.totalProfit || 0).toFixed(2)} <span className="text-sm">SUI</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-text-muted uppercase tracking-wider mb-1">Success Rate</div>
          <div className="text-2xl font-heading font-bold font-mono">
            {(stats.successRate || 0).toFixed(1)}<span className="text-sm">%</span>
          </div>
        </div>
      </div>

      {/* Last Action */}
      <div className="border-t border-border-subtle pt-4">
        <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Last Action</div>
        <p className="text-sm text-text-secondary mb-1">
          {status === 'active' ? 'Monitoring pools for opportunities...' : 'Agent is idle'}
        </p>
        <p className="text-xs text-text-muted font-mono">
          {agent.updatedAt ? formatDistanceToNow(new Date(agent.updatedAt), { addSuffix: true }) : 'Just now'}
        </p>
      </div>
    </motion.div>
  );
};

export default AgentStatusCard;