import React from "react";
import Empty from "@/components/ui/Empty";

const CompaniesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <p className="text-gray-600">Manage your business relationships</p>
      </div>

      <Empty
        title="Add your first company"
        description="Start organizing your business relationships by adding companies to your database."
        actionText="Add Company"
        onAction={() => console.log("Add company clicked")}
        icon="Building2"
      />
    </div>
  );
};

export default CompaniesPage;