import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const CompanyCard = ({ company, metrics, onClick, className }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIndustryColor = (industry) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Manufacturing': 'bg-gray-100 text-gray-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Consulting': 'bg-purple-100 text-purple-800',
      'Software': 'bg-indigo-100 text-indigo-800',
      'Cloud Services': 'bg-cyan-100 text-cyan-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Logistics': 'bg-orange-100 text-orange-800',
      'Data Analytics': 'bg-teal-100 text-teal-800',
      'Research': 'bg-violet-100 text-violet-800',
      'Operations': 'bg-slate-100 text-slate-800',
      'Innovation': 'bg-emerald-100 text-emerald-800',
      'Telecommunications': 'bg-sky-100 text-sky-800',
      'Systems': 'bg-stone-100 text-stone-800',
      'Real Estate': 'bg-amber-100 text-amber-800'
    };
    return colors[industry] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary-300",
        className
      )}
      onClick={() => onClick?.(company)}
    >
      <div className="space-y-4">
        {/* Company Logo and Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {company.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {company.name}
              </h3>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                getIndustryColor(company.industry)
              )}>
                {company.industry}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <ApperIcon name="Users" className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Contacts</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {metrics?.contactCount || 0}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <ApperIcon name="DollarSign" className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Deals</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {metrics?.totalDealValue ? formatCurrency(metrics.totalDealValue) : '$0'}
            </div>
          </div>
        </div>

        {/* Website */}
        {company.website && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ApperIcon name="Globe" className="h-4 w-4" />
            <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CompanyCard;