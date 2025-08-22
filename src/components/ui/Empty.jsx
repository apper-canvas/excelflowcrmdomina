import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found",
  description = "Get started by adding your first item.",
  actionText = "Add Item",
  onAction,
  icon = "Database",
  className 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4",
      className
    )}>
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ApperIcon name={icon} className="h-8 w-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        
        {onAction && (
          <Button onClick={onAction} variant="primary">
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Empty;