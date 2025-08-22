import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";

const DashboardWidget = ({
  title,
  icon,
  value,
  subtitle,
  trend,
  trendDirection = "up",
  loading = false,
  className = "",
  onClick,
  children,
  size = "md"
}) => {
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  const getTrendColor = () => {
    if (trendDirection === "up") return "text-green-600";
    if (trendDirection === "down") return "text-red-600";
    return "text-gray-600";
  };

  const getTrendIcon = () => {
    if (trendDirection === "up") return "TrendingUp";
    if (trendDirection === "down") return "TrendingDown";
    return "Minus";
  };

return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-lg transform hover:scale-[1.02]" : ""
      } ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <Loading />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {icon && (
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <ApperIcon name={icon} className="h-4 w-4 text-primary-600" />
                </div>
              )}
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            </div>
            {trend !== undefined && (
              <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                <ApperIcon name={getTrendIcon()} className="h-3 w-3" />
                <span className="text-xs font-medium">{trend}%</span>
              </div>
            )}
          </div>

          {/* Content */}
          {children ? (
            <div className="flex-1">{children}</div>
          ) : (
            <>
              {/* Main Value */}
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
              </div>

              {/* Subtitle */}
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </>
          )}
        </>
      )}
    </motion.div>
  );
};

export default DashboardWidget;