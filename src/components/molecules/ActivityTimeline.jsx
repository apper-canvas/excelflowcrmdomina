import React, { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import ActivityLogModal from "@/components/molecules/ActivityLogModal";
import { activityService } from "@/services/api/activityService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";

const ActivityTimeline = ({ contactId, dealId, className = "" }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [modalType, setModalType] = useState(null);
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
      'task_created': 'Calendar',
      'call_logged': 'Phone',
      'email_sent': 'Mail'
    };
    return iconMap[type] || 'Activity';
  };
const getActivityColor = (type) => {
    const colorMap = {
      'deal_stage_changed': 'text-blue-600 bg-blue-100',
      'task_completed': 'text-green-600 bg-green-100',
      'contact_updated': 'text-purple-600 bg-purple-100',
      'deal_created': 'text-indigo-600 bg-indigo-100',
      'task_created': 'text-orange-600 bg-orange-100',
      'call_logged': 'text-emerald-600 bg-emerald-100',
      'email_sent': 'text-cyan-600 bg-cyan-100'
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

  const handleLogActivity = (type) => {
    setModalType(type);
    setShowLogModal(true);
  };

  const handleActivityAdded = async (newActivity) => {
    // Reload activities to get the updated list
    try {
      let data = [];
      if (contactId && dealId) {
        const contactActivities = await activityService.getTimelineForContact(contactId);
        const dealActivities = await activityService.getTimelineForDeal(dealId);
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
      console.error("Failed to reload activities:", error);
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ApperIcon name="Clock" className="h-4 w-4 text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-900">Activity Timeline</h4>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleLogActivity('call')}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-md hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-colors"
          >
            <ApperIcon name="Phone" className="h-3 w-3 mr-1" />
            Log Call
          </button>
          <button
            onClick={() => handleLogActivity('email')}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-100 border border-cyan-200 rounded-md hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1 transition-colors"
          >
            <ApperIcon name="Mail" className="h-3 w-3 mr-1" />
            Log Email
          </button>
        </div>
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

      {/* Activity Log Modal */}
      <ActivityLogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        type={modalType}
        contactId={contactId}
        dealId={dealId}
        onActivityAdded={handleActivityAdded}
      />
</div>
  );
};

export default ActivityTimeline;