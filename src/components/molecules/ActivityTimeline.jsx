import React, { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import { activityService } from "@/services/api/activityService";

const ActivityTimeline = ({ contactId, dealId, className = "" }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        let data = [];
        
        if (contactId && dealId) {
          // Get activities for both contact and deal
          const contactActivities = await activityService.getTimelineForContact(contactId);
          const dealActivities = await activityService.getTimelineForDeal(dealId);
          
          // Merge and deduplicate
          const allActivities = [...contactActivities, ...dealActivities];
          const uniqueActivities = allActivities.filter((activity, index, self) => 
            index === self.findIndex(a => a.Id === activity.Id)
          );
          data = uniqueActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else if (contactId) {
          data = await activityService.getTimelineForContact(contactId);
        } else if (dealId) {
          data = await activityService.getTimelineForDeal(dealId);
        }
        
        setActivities(data);
      } catch (error) {
        console.error("Failed to load activities:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    if (contactId || dealId) {
      loadActivities();
    }
  }, [contactId, dealId]);

  const getActivityIcon = (type) => {
    const iconMap = {
      'deal_stage_changed': 'ArrowRight',
      'task_completed': 'CheckCircle',
      'contact_updated': 'User',
      'deal_created': 'Plus',
      'task_created': 'Calendar'
    };
    return iconMap[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      'deal_stage_changed': 'text-blue-600 bg-blue-100',
      'task_completed': 'text-green-600 bg-green-100',
      'contact_updated': 'text-purple-600 bg-purple-100',
      'deal_created': 'text-indigo-600 bg-indigo-100',
      'task_created': 'text-orange-600 bg-orange-100'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <ApperIcon name="Clock" className="h-4 w-4 text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-900">Activity Timeline</h4>
        </div>
        <Loading />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <ApperIcon name="Clock" className="h-4 w-4 text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-900">Activity Timeline</h4>
        </div>
        <div className="text-center py-6">
          <ApperIcon name="Clock" className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No activities yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <ApperIcon name="Clock" className="h-4 w-4 text-gray-500" />
        <h4 className="text-sm font-semibold text-gray-900">Activity Timeline</h4>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={activity.Id} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
              <ApperIcon name={getActivityIcon(activity.type)} className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-900 leading-relaxed">
                  {activity.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatTimestamp(activity.timestamp)}
                </span>
                {activity.user && activity.user !== "System" && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">by {activity.user}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;