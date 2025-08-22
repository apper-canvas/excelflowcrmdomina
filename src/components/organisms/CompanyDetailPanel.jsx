import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const CompanyDetailPanel = ({ 
  company, 
  metrics, 
  isOpen, 
  onClose, 
  onContactClick,
  onDealClick,
  className 
}) => {
  if (!company) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      {/* Desktop Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className={cn(
          "hidden lg:block fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl z-40",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Company Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Company Header */}
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{company.name}</h3>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {company.industry}
                </span>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                {company.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <ApperIcon name="Globe" className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{company.website}</span>
                    </div>
                  </div>
                )}

                {company.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <ApperIcon name="MapPin" className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                      <span className="text-sm text-gray-900">{company.address}</span>
                    </div>
                  </div>
                )}

                {company.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{company.notes}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <ApperIcon name="Users" className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics?.contactCount || 0}
                  </div>
                  <div className="text-sm text-blue-600">Contacts</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <ApperIcon name="DollarSign" className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600">
                    {metrics?.totalDealValue ? formatCurrency(metrics.totalDealValue) : '$0'}
                  </div>
                  <div className="text-sm text-green-600">Total Deals</div>
                </div>
              </div>

              {/* Contacts Section */}
              {metrics?.contacts && metrics.contacts.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Contacts ({metrics.contacts.length})</h4>
                  <div className="space-y-2">
                    {metrics.contacts.slice(0, 5).map((contact) => (
                      <div
                        key={contact.Id}
                        onClick={() => onContactClick?.(contact)}
                        className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-sm">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {contact.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {contact.email}
                          </div>
                        </div>
                      </div>
                    ))}
                    {metrics.contacts.length > 5 && (
                      <div className="text-center text-sm text-gray-500">
                        +{metrics.contacts.length - 5} more contacts
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Deals Section */}
              {metrics?.deals && metrics.deals.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Active Deals ({metrics.deals.length})</h4>
                  <div className="space-y-2">
                    {metrics.deals.slice(0, 3).map((deal) => (
                      <div
                        key={deal.Id}
                        onClick={() => onDealClick?.(deal)}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {deal.contactName}
                          </span>
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(deal.dealValue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {deal.description}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {deal.stage}
                          </span>
                        </div>
                      </div>
                    ))}
                    {metrics.deals.length > 3 && (
                      <div className="text-center text-sm text-gray-500">
                        +{metrics.deals.length - 3} more deals
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full" variant="primary">
                  <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                  Edit Company
                </Button>
                <Button className="w-full" variant="secondary">
                  <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Panel */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="ml-auto relative max-w-sm w-full bg-white shadow-xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Company Details</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ApperIcon name="X" className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Company Header */}
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-gray-900">{company.name}</h3>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {company.industry}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {metrics?.contactCount || 0}
                      </div>
                      <div className="text-xs text-blue-600">Contacts</div>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {metrics?.totalDealValue ? formatCurrency(metrics.totalDealValue) : '$0'}
                      </div>
                      <div className="text-xs text-green-600">Deals</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button className="w-full" variant="primary" size="sm">
                      <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button className="w-full" variant="secondary" size="sm">
                      <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default CompanyDetailPanel;