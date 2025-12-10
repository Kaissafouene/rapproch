import React, { useState, useEffect } from 'react';
import { Server, Database, Bot, Clock } from 'lucide-react';

interface SystemStatus {
  api: 'healthy' | 'degraded' | 'down';
  database: 'connected' | 'disconnected';
  ai: 'available' | 'unavailable' | 'limited';
}

const StatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>({
    api: 'healthy',
    database: 'connected',
    ai: 'available'
  });
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        // Check API health
        const apiResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`);
        const apiHealthy = apiResponse.ok;

        // Check AI health
        const aiResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai/health`);
        const aiData = await aiResponse.json();

        setStatus({
          api: apiHealthy ? 'healthy' : 'degraded',
          database: apiHealthy ? 'connected' : 'disconnected',
          ai: aiData.aiEnabled ? 'available' : 'unavailable'
        });
        setLastCheck(new Date());
      } catch (error) {
        setStatus({
          api: 'down',
          database: 'disconnected',
          ai: 'unavailable'
        });
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'available':
        return 'text-green-600';
      case 'degraded':
      case 'limited':
        return 'text-yellow-600';
      case 'down':
      case 'disconnected':
      case 'unavailable':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'available':
        return 'bg-green-400';
      case 'degraded':
      case 'limited':
        return 'bg-yellow-400';
      case 'down':
      case 'disconnected':
      case 'unavailable':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 flex items-center gap-3 lg:gap-4 flex-wrap lg:flex-nowrap">
      {/* API Status */}
      <div className="flex items-center gap-1.5">
        <Server className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white/70" />
        <div className={`w-2 h-2 rounded-full ${getStatusDot(status.api)}`} />
        <span className="text-xs text-white/90 font-medium">{status.api}</span>
      </div>
      
      {/* Database Status */}
      <div className="flex items-center gap-1.5">
        <Database className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white/70" />
        <div className={`w-2 h-2 rounded-full ${getStatusDot(status.database)}`} />
        <span className="text-xs text-white/90 font-medium">{status.database}</span>
      </div>
      
      {/* AI Status */}
      <div className="flex items-center gap-1.5">
        <Bot className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white/70" />
        <div className={`w-2 h-2 rounded-full ${getStatusDot(status.ai)}`} />
        <span className="text-xs text-white/90 font-medium">{status.ai}</span>
      </div>
      
      {/* Last Check */}
      <div className="flex items-center gap-1.5 ml-auto lg:ml-2 pl-2 border-l border-white/20">
        <Clock className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-white/50" />
        <span className="text-xs text-white/70">
          {lastCheck.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default StatusIndicator;