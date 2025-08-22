import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion";
import { dealService } from "@/services/api/dealService";
import KanbanColumn from "@/components/molecules/KanbanColumn";
import DealCard from "@/components/molecules/DealCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const STAGES = [
  { id: 'Lead', title: 'Lead', color: 'gray' },
  { id: 'Qualified', title: 'Qualified', color: 'blue' },
  { id: 'Proposal', title: 'Proposal', color: 'yellow' },
  { id: 'Closed Won', title: 'Closed Won', color: 'green' }
];

const KanbanBoard = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dealService.getAll();
      setDeals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getTotalValueByStage = (stage) => {
    return getDealsByStage(stage).reduce((total, deal) => total + deal.dealValue, 0);
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // No destination or dropped in same position
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }

    const dealId = parseInt(draggableId);
    const newStage = destination.droppableId;

    try {
      // Optimistically update the UI
      setDeals(prevDeals => {
        const updatedDeals = prevDeals.map(deal => 
          deal.Id === dealId 
            ? { ...deal, stage: newStage }
            : deal
        );
        return updatedDeals;
      });

      // Update the deal on the server
      await dealService.updateStage(dealId, newStage);
    } catch (err) {
      // Revert the optimistic update on error
      fetchDeals();
      console.error('Failed to update deal stage:', err);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchDeals} />;

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full">
          {STAGES.map(stage => {
            const stageDeals = getDealsByStage(stage.id);
            const totalValue = getTotalValueByStage(stage.id);

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: STAGES.indexOf(stage) * 0.1 }}
              >
                <div className="bg-white rounded-lg border-2 border-gray-200 h-full flex flex-col">
                  {/* Column Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-gray-700">
                        {stage.title}
                      </h3>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                        {stageDeals.length}
                      </span>
                    </div>
                    
                    {totalValue > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          Total: {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                          }).format(totalValue)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Droppable Area */}
                  <div className="flex-1 p-4 space-y-3 min-h-[400px] overflow-y-auto">
                    {stageDeals.map((deal, index) => (
                      <Draggable 
                        key={deal.Id} 
                        draggableId={deal.Id.toString()} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <DealCard 
                              deal={deal}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    
                    {stageDeals.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                        Drop deals here
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;