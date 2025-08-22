import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems,
  itemsPerPage,
  className 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);
    
    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn(
      "flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200",
      className
    )}>
      <div className="flex-1 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ApperIcon name="ChevronLeft" className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="hidden sm:flex space-x-1">
            {getPageNumbers().map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "primary" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="min-w-[36px]"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ApperIcon name="ChevronRight" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;