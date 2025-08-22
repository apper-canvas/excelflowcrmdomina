import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const QuoteDetailModal = ({ 
  quote, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  className 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!quote || !isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-800",
      Sent: "bg-blue-100 text-blue-800",
      Accepted: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Expired: "bg-yellow-100 text-yellow-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleEdit = () => {
    onEdit(quote);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(quote.Id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-600 bg-opacity-75"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quote Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" className="h-5 w-5" />
            </Button>
</div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
            <div className="space-y-6">
              {/* Quote Header */}
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                  <ApperIcon name="FileText" className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-gray-900">Quote #{quote.Id}</h3>
                <div className="mt-2">
                  <span className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    getStatusColor(quote.status)
                  )}>
                    {quote.status}
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-green-600">
                    {formatCurrency(quote.amount)}
                  </span>
                </div>
              </div>

              {/* Quote Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Quote Information
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <ApperIcon name="Building2" className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{quote.company}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <ApperIcon name="User" className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{quote.contactName}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deal</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <ApperIcon name="Handshake" className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{quote.dealTitle}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <ApperIcon name="Truck" className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{quote.deliveryMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Important Dates
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quote Date</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <ApperIcon name="Calendar" className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{formatDate(quote.quoteDate)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expires On</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <ApperIcon name="AlertCircle" className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{formatDate(quote.expiresOn)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing and Shipping Address */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Billing Address
                  </h4>
                  
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="font-medium text-gray-900">{quote.billToName}</div>
                    <div className="text-sm text-gray-600">{quote.billStreet}</div>
                    <div className="text-sm text-gray-600">
                      {quote.billCity}{quote.billState && `, ${quote.billState}`} {quote.billPincode}
                    </div>
                    {quote.billCountry && (
                      <div className="text-sm text-gray-600">{quote.billCountry}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Shipping Address
                  </h4>
                  
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="font-medium text-gray-900">{quote.shipToName}</div>
                    <div className="text-sm text-gray-600">{quote.shipStreet}</div>
                    <div className="text-sm text-gray-600">
                      {quote.shipCity}{quote.shipState && `, ${quote.shipState}`} {quote.shipPincode}
                    </div>
                    {quote.shipCountry && (
                      <div className="text-sm text-gray-600">{quote.shipCountry}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="primary"
                  className="flex-1"
                  onClick={handleEdit}
                >
                  <ApperIcon name="Edit2" className="h-4 w-4 mr-2" />
                  Edit Quote
                </Button>
                <Button 
                  variant="danger"
                  className="flex-1"
                  onClick={handleDeleteConfirm}
                >
                  <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
                  Delete Quote
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <ApperIcon name="AlertTriangle" className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Quote</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete <strong>Quote #{quote.Id}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default QuoteDetailModal;