import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LiveActivityFeed = ({ activities }) => {
  const feedRef = useRef(null);

  const eventConfig = {
    opportunity_detected: { icon: Target, color: 'warning', label: 'Opportunity' },
    trade_executed: { icon: CheckCircle, color: 'success', label: 'Trade Success' },
    trade_failed: { icon: XCircle, color: 'error', label: 'Trade Failed' },
    agent_started: { icon: TrendingUp, color: 'primary', label: 'Agent Started' },
    agent_stopped: { icon: AlertCircle, color: 'text-muted', label: 'Agent Stopped' }
  };

  const getLevelColor = (level) => {
    const colors = {
      success: 'text-success',
      error: 'text-error',
      warning: 'text-warning',
      info: 'text-primary'
    };
    return colors[level] || 'text-text-secondary';
  };

  return (
    <div className="glass rounded-xl overflow-hidden" data-testid="activity-feed">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <h3 className="font-heading font-bold">Activity Stream</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
          <span className="text-sm text-text-muted font-mono">Live</span>
        </div>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="h-[500px] overflow-y-auto font-mono text-sm"
        style={{ scrollbarGutter: 'stable' }}
      >
        {activities.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activities yet. Waiting for AI agents to start...</p>
          </div>
        ) : (
          <AnimatePresence>
            {activities.map((activity, index) => {
              const config = eventConfig[activity.eventType] || eventConfig.opportunity_detected;
              const Icon = config.icon;

              return (
                <motion.div
                  key={activity.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="px-6 py-4 border-b border-border-subtle/50 hover:bg-white/5 transition-colors"
                  data-testid={`activity-item-${index}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg bg-${config.color}/20 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 text-${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text-primary">
                          {activity.agentName || 'System'}
                        </span>
                        <span className="text-text-muted">•</span>
                        <span className="text-xs text-text-muted">
                          {activity.createdAt
                            ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                            : 'Just now'
                          }
                        </span>
                      </div>
                      <p className={`${getLevelColor(activity.level)} leading-relaxed`}>
                        {activity.message}
                      </p>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <pre className="mt-2 text-xs text-text-muted bg-black/20 p-2 rounded overflow-x-auto">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default LiveActivityFeed;