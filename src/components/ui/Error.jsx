import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message, onRetry, className }) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4",
      className
    )}>
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ApperIcon name="AlertCircle" className="h-8 w-8 text-red-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message || "We encountered an error while loading your data. Please try again."}
        </p>
        
        {onRetry && (
          <Button onClick={onRetry} variant="primary">
            <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default Error;