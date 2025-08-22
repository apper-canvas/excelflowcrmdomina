import React from "react";
import KanbanBoard from "@/components/organisms/KanbanBoard";

const DealsPage = () => {
  return (
    <div className="space-y-6 h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
        <p className="text-gray-600">Manage your sales pipeline</p>
      </div>

      <div className="flex-1">
        <KanbanBoard />
      </div>
    </div>
  );
};

export default DealsPage;