import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const SearchInput = React.forwardRef(({ 
  className, 
  placeholder = "Search...",
  ...props 
}, ref) => {
  return (
    <div className="relative">
      <ApperIcon 
        name="Search" 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" 
      />
      <input
        ref={ref}
        type="text"
        className={cn(
          "block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
          className
        )}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
});

SearchInput.displayName = "SearchInput";

export default SearchInput;