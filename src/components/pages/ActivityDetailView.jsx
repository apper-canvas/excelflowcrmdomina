import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchInput from "@/components/atoms/SearchInput";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Pagination from "@/components/organisms/Pagination";
import { activityService } from "@/services/api/activityService";
import { cn } from "@/utils/cn";

const ActivityDetailView = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 15;

  const activityTypes = [
    'deal_stage_changed',
    'task_completed',
    'contact_updated',
    'deal_created',
    'task_created',
    'call_logged',
    'email_sent'
  ];

  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' }
  ];

  const loadActivityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const activitiesData = await activityService.getAll();
      setActivities(activitiesData);
    } catch (err) {
      console.error('Failed to load activity data:', err);
      setError('Failed to load activity data');
      toast.error('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivityData();
  }, []);

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

  const getActivityColor = (type) => {
    const colorMap = {
      'deal_stage_changed': 'bg-blue-100 text-blue-800',
      'task_completed': 'bg-green-100 text-green-800',
      'contact_updated': 'bg-purple-100 text-purple-800',
      'deal_created': 'bg-indigo-100 text-indigo-800',
      'task_created': 'bg-yellow-100 text-yellow-800',
      'call_logged': 'bg-orange-100 text-orange-800',
      'email_sent': 'bg-cyan-100 text-cyan-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  const formatActivityType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filterByDate = (activities, filter) => {
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return activities.filter(activity => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= startOfDay(now) && activityDate <= endOfDay(now);
        });
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return activities.filter(activity => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= startOfDay(yesterday) && activityDate <= endOfDay(yesterday);
        });
      case 'last7days':
        const sevenDaysAgo = subDays(now, 7);
        return activities.filter(activity => new Date(activity.timestamp) >= sevenDaysAgo);
      case 'last30days':
        const thirtyDaysAgo = subDays(now, 30);
        return activities.filter(activity => new Date(activity.timestamp) >= thirtyDaysAgo);
      default:
        return activities;
    }
  };

  const filteredActivities = filterByDate(activities, dateFilter).filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'timestamp':
        return multiplier * (new Date(a.timestamp) - new Date(b.timestamp));
      case 'type':
        return multiplier * a.type.localeCompare(b.type);
      case 'description':
        return multiplier * a.description.localeCompare(b.description);
      default:
        return 0;
    }
  });

  const paginatedActivities = sortedActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return "ArrowUpDown";
    return sortOrder === 'asc' ? "ArrowUp" : "ArrowDown";
  };

  // Calculate metrics
  const todayActivities = filterByDate(activities, 'today').length;
  const weekActivities = filterByDate(activities, 'last7days').length;
  const activityTypeCounts = activityTypes.reduce((acc, type) => {
    acc[type] = activities.filter(a => a.type === type).length;
    return acc;
  }, {});

  const mostActiveType = Object.entries(activityTypeCounts).reduce((a, b) => 
    activityTypeCounts[a[0]] > activityTypeCounts[b[0]] ? a : b
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        <Error message={error} onRetry={loadActivityData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Log Analysis</h1>
            <p className="text-gray-600">Detailed view of all system activities and user actions</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Activity" className="h-5 w-5 text-primary-600" />
            <div className="text-sm text-gray-600">Total Activities</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Clock" className="h-5 w-5 text-green-600" />
            <div className="text-sm text-gray-600">Today</div>
          </div>
          <div className="text-2xl font-bold text-green-600">{todayActivities}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="TrendingUp" className="h-5 w-5 text-blue-600" />
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{weekActivities}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Star" className="h-5 w-5 text-purple-600" />
            <div className="text-sm text-gray-600">Most Active</div>
          </div>
          <div className="text-sm font-bold text-purple-600">
            {formatActivityType(mostActiveType[0])}
          </div>
          <div className="text-xs text-gray-500">{mostActiveType[1]} times</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search activities by description..."
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            {activityTypes.map(type => (
              <option key={type} value={type}>
                {formatActivityType(type)}
              </option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {dateFilters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Activity Feed</h3>
            <div className="text-sm text-gray-500">
              Showing {paginatedActivities.length} of {sortedActivities.length} activities
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {paginatedActivities.map((activity) => (
            <div key={activity.Id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  getActivityColor(activity.type)
                )}>
                  <ApperIcon 
                    name={getActivityIcon(activity.type)} 
                    className="h-5 w-5" 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                        getActivityColor(activity.type)
                      )}>
                        {formatActivityType(activity.type)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                  
                  {activity.contactId && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                        <ApperIcon name="User" className="h-3 w-3 mr-1" />
                        Contact ID: {activity.contactId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {paginatedActivities.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <ApperIcon name="Activity" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityDetailView;