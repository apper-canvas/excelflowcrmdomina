import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const FloatingActionButton = ({ onClick, className, icon = "Plus", ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 bg-accent-500 text-white rounded-full shadow-lg hover:bg-accent-600 focus:outline-none focus:ring-4 focus:ring-accent-500/30 transition-colors z-50",
        className
      )}
      {...props}
    >
      <ApperIcon name={icon} className="h-6 w-6 mx-auto" />
    </motion.button>
  );
};

export default FloatingActionButton;