import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

const ProfitChart = ({ data }) => {
  // Transform data for chart
  const chartData = data.map(item => ({
    timestamp: item.timestamp,
    profit: item.profit,
    agent: item.agent
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 rounded-lg border border-border-highlight">
          <p className="text-sm text-text-muted mb-1">
            {format(parseISO(payload[0].payload.timestamp), 'MMM dd, HH:mm')}
          </p>
          <p className="text-lg font-heading font-bold text-success">
            +{payload[0].value.toFixed(2)} SUI
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {payload[0].payload.agent}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="glass p-12 rounded-xl text-center" data-testid="profit-chart">
        <p className="text-text-secondary">No profit data yet. Complete trades to see chart.</p>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-xl" data-testid="profit-chart">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
            stroke="#9CA3AF"
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            tickFormatter={(value) => `${value.toFixed(1)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#profitGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitChart;