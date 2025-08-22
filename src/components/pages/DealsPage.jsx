import React, { useState } from "react";
import KanbanBoard from "@/components/organisms/KanbanBoard";
import DealModal from "@/components/organisms/DealModal";
import FloatingActionButton from "@/components/molecules/FloatingActionButton";
import { dealService } from "@/services/api/dealService";

const DealsPage = () => {
  const [showDealModal, setShowDealModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateDeal = async (dealData) => {
    await dealService.create(dealData);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6 h-full relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
        <p className="text-gray-600">Manage your sales pipeline</p>
      </div>

      <div className="flex-1">
        <KanbanBoard refreshTrigger={refreshTrigger} />
      </div>

      <FloatingActionButton
        onClick={() => setShowDealModal(true)}
        icon="Plus"
        label="Add Deal"
      />

      <DealModal
        isOpen={showDealModal}
        onClose={() => setShowDealModal(false)}
        onSubmit={handleCreateDeal}
      />
    </div>
  );
};

export default DealsPage;