import React from "react";
import Empty from "@/components/ui/Empty";

const DealsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
        <p className="text-gray-600">Manage your sales pipeline</p>
      </div>

      <Empty
        title="No deals yet"
        description="Start tracking your sales opportunities by creating your first deal in the pipeline."
        actionText="Create Deal"
        onAction={() => console.log("Create deal clicked")}
        icon="TrendingUp"
      />
    </div>
  );
};

export default DealsPage;