import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange, 
  totalItems = 0,
  itemsPerPage = 10,
  className 
}) => {
  // Validate required props and ensure numeric values
  const safeCurrentPage = Number(currentPage) || 1;
  const safeTotalPages = Number(totalPages) || 1;
  const safeTotalItems = Number(totalItems) || 0;
  const safeItemsPerPage = Number(itemsPerPage) || 10;
  
  // Early return if essential props are missing or invalid
  if (!onPageChange || safeTotalPages <= 0 || safeItemsPerPage <= 0) {
    return null;
  }
  
  const startItem = Math.max(1, (safeCurrentPage - 1) * safeItemsPerPage + 1);
  const endItem = Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems);
const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(showPages / 2));
    let end = Math.min(safeTotalPages, start + showPages - 1);
    
    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (safeTotalPages <= 1) return null;
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
            <span className="font-medium">{safeTotalItems}</span> results
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
<Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage === 1}
          >
            <ApperIcon name="ChevronLeft" className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="hidden sm:flex space-x-1">
            {getPageNumbers().map((page) => (
              <Button
                key={page}
                variant={page === safeCurrentPage ? "primary" : "ghost"}
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
            onClick={() => onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage === safeTotalPages}
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