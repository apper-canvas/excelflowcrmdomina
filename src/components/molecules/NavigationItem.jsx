import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const NavigationItem = ({ to, icon, children, className }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
        isActive 
          ? "bg-primary-50 text-primary-700 border-l-4 border-primary-500 ml-0 pl-[11px]" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        className
      )}
    >
      <ApperIcon name={icon} className="mr-3 h-5 w-5 flex-shrink-0" />
      {children}
    </NavLink>
  );
};

export default NavigationItem;