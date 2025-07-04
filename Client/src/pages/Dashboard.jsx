import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  UsersIcon,
  PhotoIcon,
  CalendarIcon,
  UserPlusIcon,
  CloudArrowUpIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculate previous month's count for growth comparison
  const calculatePreviousMonthCount = (key, currentCount) => {
    // This is a placeholder - you should implement actual logic to get previous month's count
    // For now, we'll just return a random number for demonstration
    return Math.floor(currentCount * 0.75); // 75% of current count as an example
  }

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await dashboardAPI.getMetrics();
        setMetrics(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-xl text-secondary/80">Fetching dashboard metrics...</p>
        <p className="text-sm text-secondary/60">Please wait while we fetch your latest metrics</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-primary mb-8 flex items-center gap-3">
        <ChartBarIcon className="w-7 h-7 text-primary" />
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Dashboard</span>
      </h2>
      {metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(metrics).map(([key, value]) => (
            <div
              key={key}
              className="bg-gradient-to-br from-primary/10 to-success/10 backdrop-blur-lg border border-primary/20 rounded-xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                {getIconForMetric(key)}
                <div>
                  <h6 className="text-lg font-semibold text-primary capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h6>
                  <p className="text-sm text-secondary/80">Current Status</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {typeof value === 'object' ? (
                      Array.isArray(value) ? (
                        value.length
                      ) : (
                        Object.keys(value).length
                      )
                    ) : (
                      value
                    )}
                  </span>
                  <span className="text-sm text-secondary/80">Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-primary/20 text-primary rounded-full px-3 py-1 text-sm">
                    {typeof value === 'object' ? (
                      Array.isArray(value) ? (
                        calculatePreviousMonthCount(key, value.length)
                      ) : (
                        calculatePreviousMonthCount(key, Object.keys(value).length)
                      )
                    ) : (
                      calculatePreviousMonthCount(key, value)
                    )}
                  </span>
                  <span className="text-sm text-secondary/80">Last Month</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary/10 to-success/10 backdrop-blur-lg border border-primary/20 rounded-xl p-8 text-center text-success/80 flex items-center justify-center gap-3 animate-pulse">
          <InformationCircleIcon className="w-8 h-8 text-primary" />
          <span className="text-xl font-semibold">No metrics available</span>
        </div>
      )}
    </div>
  );
};

// Helper function: return Heroicons components for each metric
const getIconForMetric = (key) => {
  const iconMap = {
    totalUsers: <UsersIcon className="w-6 h-6 text-green-500" />,
    activePosters: <PhotoIcon className="w-6 h-6 text-green-500" />,
    schedules: <CalendarIcon className="w-6 h-6 text-green-500" />,
    customers: <UserPlusIcon className="w-6 h-6 text-green-500" />,
    uploads: <CloudArrowUpIcon className="w-6 h-6 text-green-500" />,
    views: <EyeIcon className="w-6 h-6 text-green-500" />,
    clicks: <CursorArrowRaysIcon className="w-6 h-6 text-green-500" />,
    impressions: <ChartBarIcon className="w-6 h-6 text-green-500" />,
  };

  // Make it case-insensitive
  const lowerKey = key.toLowerCase();
  return iconMap[lowerKey] || <InformationCircleIcon className="w-6 h-6 text-green-500" />;
};

export default Dashboard;
