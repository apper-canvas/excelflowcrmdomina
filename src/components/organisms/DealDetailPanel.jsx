import React, { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import ActivityTimeline from "@/components/molecules/ActivityTimeline";
import DealModal from "@/components/organisms/DealModal";
import TaskModal from "@/components/organisms/TaskModal";
import { dealService } from "@/services/api/dealService";
import { taskService } from "@/services/api/taskService";

const DealDetailPanel = ({ deal, isOpen, onClose, className, centered = false }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  
  if (!deal) return null;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStageColor = (stage) => {
    const colors = {
      'Lead': 'bg-gray-100 text-gray-800',
      'Qualified': 'bg-blue-100 text-blue-800',
      'Proposal': 'bg-yellow-100 text-yellow-800',
      'Closed Won': 'bg-green-100 text-green-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
};

  const handleEditDeal = async (dealData) => {
    try {
      await dealService.update(deal.Id, dealData);
      toast.success("Deal updated successfully!");
      setEditModalOpen(false);
      // Close main modal after successful edit
      setTimeout(() => onClose(), 100);
    } catch (error) {
      console.error("Failed to update deal:", error);
      toast.error("Failed to update deal. Please try again.");
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await taskService.create(taskData);
      toast.success("Task created successfully!");
      setTaskModalOpen(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task. Please try again.");
    }
  };

  // Render centered modal if centered prop is true
  if (centered) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Deal Details</h2>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <ApperIcon name="X" className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Deal Header */}
                    <div className="text-center">
                      <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                        <ApperIcon name="DollarSign" className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold text-gray-900">{deal.company}</h3>
                      <div className="mt-2">
                        <span className={cn(
                          "inline-block px-4 py-2 rounded-full text-sm font-medium",
                          getStageColor(deal.stage)
                        )}>
                          {deal.stage}
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className="text-3xl font-bold text-green-600">
                          {formatCurrency(deal.dealValue)}
                        </span>
                      </div>
                    </div>

                    {/* Deal Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <ApperIcon name="User" className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-900">{deal.contactName}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <ApperIcon name="Calendar" className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-900">
                            {format(new Date(deal.expectedCloseDate), "MMMM d, yyyy")}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <ApperIcon name="Clock" className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-900">
                            {format(new Date(deal.createdAt), "MMMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {deal.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-900">{deal.description}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button 
                        className="flex-1" 
                        variant="primary"
                        onClick={() => setEditModalOpen(true)}
                      >
                        <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                        Edit Deal
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="secondary"
                        onClick={() => setTaskModalOpen(true)}
                      >
                        <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>

                    {/* Activity Timeline */}
                    <ActivityTimeline 
                      dealId={deal.Id} 
                      contactId={deal.contactId} 
                      className="border-t border-gray-200 pt-6" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Deal Modal */}
        <DealModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditDeal}
          deal={deal}
        />

        {/* Add Task Modal */}
        <TaskModal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          onSubmit={handleCreateTask}
          prefilledDealId={deal.Id}
        />
      </>
    );
  }
  return (
    <>
      {/* Desktop Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className={cn(
          "hidden lg:block fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl z-40",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Deal Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Deal Header */}
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                  <ApperIcon name="DollarSign" className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{deal.company}</h3>
                <div className="mt-2">
                  <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-sm font-medium",
                    getStageColor(deal.stage)
                  )}>
                    {deal.stage}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(deal.dealValue)}
                  </span>
                </div>
              </div>

              {/* Deal Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="User" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{deal.contactName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="Calendar" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">
                      {format(new Date(deal.expectedCloseDate), "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>

                {deal.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{deal.description}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="Clock" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">
                      {format(new Date(deal.createdAt), "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>

{/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  variant="primary"
                  onClick={() => setEditModalOpen(true)}
                >
                  <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                  Edit Deal
                </Button>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => setTaskModalOpen(true)}
                >
                  <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>

              {/* Activity Timeline */}
              <ActivityTimeline 
                dealId={deal.Id} 
                contactId={deal.contactId} 
                className="border-t border-gray-200 pt-6" 
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Panel */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="ml-auto relative max-w-xs w-full bg-white shadow-xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Deal Details</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ApperIcon name="X" className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Deal Header */}
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                      <ApperIcon name="DollarSign" className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-gray-900">{deal.company}</h3>
                    <div className="mt-2">
                      <span className={cn(
                        "inline-block px-3 py-1 rounded-full text-sm font-medium",
                        getStageColor(deal.stage)
                      )}>
                        {deal.stage}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(deal.dealValue)}
                      </span>
                    </div>
                  </div>

{/* Action Buttons */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      variant="primary" 
                      size="sm"
                      onClick={() => setEditModalOpen(true)}
                    >
                      <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setTaskModalOpen(true)}
                    >
                      <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>

                  {/* Activity Timeline */}
                  <ActivityTimeline 
                    dealId={deal.Id} 
                    contactId={deal.contactId} 
                    className="border-t border-gray-200 pt-4" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
)}

      {/* Edit Deal Modal */}
      <DealModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditDeal}
        deal={deal}
      />

      {/* Add Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        prefilledDealId={deal.Id}
      />
    </>
  );
};

export default DealDetailPanel;