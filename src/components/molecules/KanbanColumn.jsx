import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import DealCard from "@/components/molecules/DealCard";

const KanbanColumn = ({ 
  stage = "", 
  title = "", 
  deals = [], 
  totalValue = 0,
  isDragOver = false,
  renderDeal = null
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getColumnColor = (stage) => {
    const colors = {
      'Lead': 'border-gray-300 bg-gray-50',
      'Qualified': 'border-blue-300 bg-blue-50',
      'Proposal': 'border-yellow-300 bg-yellow-50',
      'Closed Won': 'border-green-300 bg-green-50'
    };
    return colors[stage] || 'border-gray-300 bg-gray-50';
  };

  const getHeaderColor = (stage) => {
    const colors = {
      'Lead': 'text-gray-700',
      'Qualified': 'text-blue-700',
      'Proposal': 'text-yellow-700',
      'Closed Won': 'text-green-700'
    };
    return colors[stage] || 'text-gray-700';
  };

  return (
    <div className={cn(
      "flex flex-col bg-white rounded-lg border-2 transition-all duration-200",
      getColumnColor(stage),
      isDragOver && "border-primary-400 bg-primary-50"
    )}>
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className={cn(
            "font-semibold text-sm",
            getHeaderColor(stage)
          )}>
            {title}
          </h3>
          <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
            {deals.length}
          </span>
        </div>
        
        {totalValue > 0 && (
          <div className="mt-2">
            <span className="text-xs text-gray-500">
              Total: {formatCurrency(totalValue)}
            </span>
          </div>
        )}
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 p-4 space-y-3 min-h-[400px] transition-colors duration-200",
              snapshot.isDraggingOver && "bg-primary-25"
)}
          >
            {deals.map((deal, index) => 
              renderDeal ? renderDeal(deal, index) : (
                <motion.div
                  key={deal.Id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <DealCard 
                    deal={deal}
                    isDragging={snapshot.isDraggingOver}
                  />
                </motion.div>
              )
            )}
            {provided.placeholder}
            
            {deals.length === 0 && (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Drop deals here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;