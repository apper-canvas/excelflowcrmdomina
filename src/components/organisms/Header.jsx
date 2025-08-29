import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuToggle, title, className }) => {
  return (
    <header className={cn(
      "bg-white border-b border-gray-200 px-4 py-4 lg:px-6",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden mr-2"
          >
            <ApperIcon name="Menu" className="h-5 w-5" />
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        
<div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <ApperIcon name="Bell" className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <ApperIcon name="Settings" className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              const { AuthContext } = React.createContext();
              // Access auth methods from context if available
              if (window.ApperSDK?.ApperUI?.logout) {
                window.ApperSDK.ApperUI.logout().then(() => {
                  window.location.href = '/login';
                }).catch(console.error);
              }
            }}
          >
            <ApperIcon name="LogOut" className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;