import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const FloatingActionButton = ({ 
  onClick, 
  icon = "Plus", 
  label = "Add",
  className,
  variant = "primary",
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "fixed bottom-6 right-6 z-40",
        className
      )}
    >
      <Button
        onClick={onClick}
        variant={variant}
        size="lg"
        className="rounded-full shadow-lg hover:shadow-xl transition-shadow min-w-[3.5rem] h-14"
        {...props}
      >
        <ApperIcon name={icon} className="h-5 w-5 mr-0 sm:mr-2" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    </motion.div>
  );
};

export default FloatingActionButton;