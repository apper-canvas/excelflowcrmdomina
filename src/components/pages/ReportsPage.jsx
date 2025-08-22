import React from "react";
import Empty from "@/components/ui/Empty";

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg mb-4">
            <p className="text-gray-500">Analytics coming soon</p>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Growth</h3>
          <p className="text-gray-600">Track how your contact database grows over time</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg mb-4">
            <p className="text-gray-500">Analytics coming soon</p>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Deal Pipeline</h3>
          <p className="text-gray-600">Visualize your sales pipeline performance</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg mb-4">
            <p className="text-gray-500">Analytics coming soon</p>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Report</h3>
          <p className="text-gray-600">Monitor team activity and engagement</p>
        </div>
      </div>

      <Empty
        title="Reports coming soon"
        description="We're building powerful analytics and reporting features to help you understand your customer data better."
        actionText="Request Feature"
        onAction={() => console.log("Request feature clicked")}
        icon="BarChart3"
      />
    </div>
  );
};

export default ReportsPage;