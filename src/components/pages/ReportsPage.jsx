import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import DashboardWidget from "@/components/molecules/DashboardWidget";
import PipelineChart from "@/components/molecules/PipelineChart";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { dashboardService } from "@/services/api/dashboardService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [pipelineMetrics, setPipelineMetrics] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [topContacts, setTopContacts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dateRangeOptions = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'thisYear', label: 'This Year' }
  ];

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pipeline, performance, contacts, activity, tasks] = await Promise.all([
        dashboardService.getPipelineMetrics(dateRange),
        dashboardService.getPerformanceMetrics(dateRange),
        dashboardService.getTopContacts(dateRange, 5),
        dashboardService.getRecentActivity(8),
        dashboardService.getUpcomingTasks(8)
      ]);

      setPipelineMetrics(pipeline);
      setPerformanceMetrics(performance);
      setTopContacts(contacts);
      setRecentActivity(activity);
      setUpcomingTasks(tasks);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    toast.success(`Date range updated to ${dateRangeOptions.find(opt => opt.value === newRange)?.label}`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      'deal_stage_changed': 'ArrowRight',
      'task_completed': 'CheckCircle',
      'contact_updated': 'User',
      'deal_created': 'Plus',
      'task_created': 'Calendar',
      'call_logged': 'Phone',
      'email_sent': 'Mail'
    };
    return iconMap[type] || 'Activity';
  };

  if (loading && !pipelineMetrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Analytics and insights</p>
        </div>
        <Loading />
      </div>
    );
  }

  if (error && !pipelineMetrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Analytics and insights</p>
        </div>
        <Error message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600">Analytics and performance insights</p>
        </div>
        
        {/* Time Controls */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">Time Period:</span>
          <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
            {dateRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDateRangeChange(option.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dateRange === option.value
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Widget Grid - 2x3 Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pipeline Value */}
        <DashboardWidget
          title="Pipeline Value"
          icon="TrendingUp"
          value={formatCurrency(pipelineMetrics?.totalPipelineValue || 0)}
          subtitle={`${pipelineMetrics?.totalDeals || 0} active deals`}
          loading={loading}
        />

        {/* Deal Conversion Rate */}
        <DashboardWidget
          title="Overall Conversion Rate"
          icon="Target"
          value={`${pipelineMetrics?.conversionRates?.overall || 0}%`}
          subtitle="Lead to Closed Won"
          trend={pipelineMetrics?.conversionRates?.overall || 0}
          trendDirection={pipelineMetrics?.conversionRates?.overall >= 20 ? "up" : "neutral"}
          loading={loading}
        />

        {/* Monthly Target Progress */}
        <DashboardWidget
          title="Monthly Target"
          icon="Flag"
          value={`${Math.round(performanceMetrics?.targetProgress || 0)}%`}
          subtitle={`${formatCurrency(performanceMetrics?.monthlyRevenue || 0)} of ${formatCurrency(performanceMetrics?.monthlyTarget || 0)}`}
          trend={performanceMetrics?.targetProgress || 0}
          trendDirection={performanceMetrics?.targetProgress >= 75 ? "up" : "neutral"}
          loading={loading}
        />

        {/* Top Contacts */}
        <DashboardWidget
          title="Top Contacts"
          icon="Users"
          loading={loading}
        >
          <div className="space-y-3">
            {topContacts.slice(0, 5).map((contact, index) => (
              <div key={contact.Id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {contact.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {contact.totalDeals} deals
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(contact.totalValue)}
                </div>
              </div>
            ))}
            {topContacts.length === 0 && !loading && (
              <p className="text-sm text-gray-500 text-center py-4">
                No contact data available
              </p>
            )}
          </div>
        </DashboardWidget>

        {/* Recent Activity */}
        <DashboardWidget
          title="Recent Activity"
          icon="Clock"
          loading={loading}
        >
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.Id} className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                  <ApperIcon 
                    name={getActivityIcon(activity.type)} 
                    className="h-3 w-3 text-gray-600" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 leading-relaxed">
                    {activity.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && !loading && (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </DashboardWidget>

        {/* Upcoming Tasks */}
        <DashboardWidget
          title="Upcoming Tasks"
          icon="CheckSquare"
          loading={loading}
        >
          <div className="space-y-3">
            {upcomingTasks.slice(0, 5).map((task) => (
              <div key={task.Id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-700' 
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {task.priority || 'low'}
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && !loading && (
              <p className="text-sm text-gray-500 text-center py-4">
                No upcoming tasks
              </p>
            )}
          </div>
        </DashboardWidget>
      </div>

      {/* Pipeline Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Analysis</h3>
            <p className="text-sm text-gray-600">Deal values and conversion rates by stage</p>
          </div>
          <ApperIcon name="BarChart3" className="h-5 w-5 text-gray-400" />
        </div>
        
        <PipelineChart 
          data={pipelineMetrics?.pipelineData} 
          conversionRates={pipelineMetrics?.conversionRates}
          loading={loading}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ApperIcon name="DollarSign" className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Average Deal Size</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(pipelineMetrics?.averageDealSize || 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Task Completion Rate</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(performanceMetrics?.taskCompletionRate || 0)}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <ApperIcon name="Users" className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Contacts</div>
              <div className="text-lg font-semibold text-gray-900">
                {pipelineMetrics?.totalContacts || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;