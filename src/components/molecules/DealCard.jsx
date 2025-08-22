import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const DealCard = ({ deal, isDragging = false, ...props }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 cursor-move hover:shadow-md transition-all duration-200",
        isDragging && "shadow-lg rotate-2 scale-105"
      )}
      {...props}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-gray-900 text-sm leading-tight">
            {deal.company}
          </h3>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            getStageColor(deal.stage)
          )}>
            {deal.stage}
          </span>
        </div>

        {/* Deal Value */}
        <div className="flex items-center space-x-2">
          <ApperIcon name="DollarSign" className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-green-600">
            {formatCurrency(deal.dealValue)}
          </span>
        </div>

        {/* Contact */}
        <div className="flex items-center space-x-2">
          <ApperIcon name="User" className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{deal.contactName}</span>
        </div>

        {/* Expected Close Date */}
        <div className="flex items-center space-x-2">
          <ApperIcon name="Calendar" className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {formatDate(deal.expectedCloseDate)}
          </span>
        </div>

        {/* Description */}
        {deal.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {deal.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default DealCard;