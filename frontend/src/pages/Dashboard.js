import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import AgentStatusCard from '../components/AgentStatusCard';
import LiveActivityFeed from '../components/LiveActivityFeed';
import ProfitChart from '../components/ProfitChart';
import { ArrowLeft, Activity, TrendingUp, DollarSign, Percent } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalProfit: 0,
    activeAgents: 0,
    tradesExecuted: 0,
    successRate: 0,
    agents: []
  });
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Connect to WebSocket
  useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on('connected', (data) => {
      console.log('WebSocket connected:', data);
      fetchDashboardData();
    });

    newSocket.on('agent:stats:update', (data) => {
      console.log('Agent stats updated:', data);
      fetchDashboardData();
    });

    newSocket.on('activity:new', (activity) => {
      console.log('New activity:', activity);
      setActivities(prev => [activity, ...prev].slice(0, 50));
    });

    newSocket.on('trade:executed', (data) => {
      console.log('Trade executed:', data);
      fetchDashboardData();
      fetchChartData();
    });

    return () => newSocket.close();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const res = await fetch(`${backendUrl}/api/dashboard/overview`);
      const data = await res.json();
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchActivityFeed = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const res = await fetch(`${backendUrl}/api/dashboard/activity-feed?limit=30`);
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activity feed:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const res = await fetch(`${backendUrl}/api/dashboard/profit-chart?range=7d`);
      const data = await res.json();
      setChartData(data);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    }
  };

  useEffect(() => {
    fetchActivityFeed();
    fetchChartData();
  }, []);

  const stats = [
    {
      icon: DollarSign,
      label: 'Total Profit',
      value: `${dashboardData.totalProfit.toFixed(2)} SUI`,
      change: '+0%',
      positive: true,
      testId: 'stat-total-profit'
    },
    {
      icon: Activity,
      label: 'Active Agents',
      value: `${dashboardData.activeAgents} / 1`,
      change: dashboardData.activeAgents > 0 ? 'Operational' : 'Idle',
      positive: dashboardData.activeAgents > 0,
      testId: 'stat-active-agents'
    },
    {
      icon: TrendingUp,
      label: 'Trades Executed',
      value: dashboardData.tradesExecuted.toString(),
      change: 'All time',
      positive: true,
      testId: 'stat-trades-executed'
    },
    {
      icon: Percent,
      label: 'Success Rate',
      value: `${dashboardData.successRate.toFixed(1)}%`,
      change: dashboardData.successRate >= 90 ? 'Excellent' : 'Good',
      positive: dashboardData.successRate >= 90,
      testId: 'stat-success-rate'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-text-primary" data-testid="dashboard-page">
      {/* Header */}
      <header className="border-b border-border-subtle glass sticky top-0 z-50">
        <div className="px-6 py-4 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-heading font-bold">
              <span className="text-primary">Deep</span>
              <span>Sentinel</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-success/20 text-success text-sm font-mono">
              Testnet
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-text-muted font-heading font-bold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass p-6 rounded-xl hover:border-border-highlight transition-all"
                  data-testid={stat.testId}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`text-xs font-mono px-2 py-1 rounded ${
                      stat.positive ? 'bg-success/20 text-success' : 'bg-text-muted/20 text-text-muted'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-sm uppercase tracking-wider text-text-muted mb-1">{stat.label}</div>
                  <div className="text-3xl font-heading font-black">{stat.value}</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* AI Agents Section */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-text-muted font-heading font-bold mb-4">AI Agents</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dashboardData.agents.length > 0 ? (
              dashboardData.agents.map((agent, index) => (
                <AgentStatusCard key={agent.id} agent={agent} index={index} />
              ))
            ) : (
              <div className="col-span-2 glass p-12 rounded-xl text-center">
                <p className="text-text-secondary">No agents found. Starting Arbitrage Hunter...</p>
              </div>
            )}
          </div>
        </section>

        {/* Profit Chart */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-text-muted font-heading font-bold mb-4">Profit Over Time</h2>
          <ProfitChart data={chartData} />
        </section>

        {/* Live Activity Feed */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-text-muted font-heading font-bold mb-4">Live Activity</h2>
          <LiveActivityFeed activities={activities} />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;