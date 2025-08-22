import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import ActivityTimeline from "@/components/molecules/ActivityTimeline";

const ContactDetailPanel = ({ contact, isOpen, onClose, className }) => {
  if (!contact || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
          "relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Contact Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Contact Avatar and Name */}
              <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">
                    {contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-gray-900">{contact.name}</h3>
                <p className="text-base text-gray-600">{contact.company}</p>
              </div>

              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="Mail" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900 break-all">{contact.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="Phone" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{contact.phone}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <ApperIcon name="Building2" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{contact.company}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Contact</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="Calendar" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">
                      {contact.lastContactDate ? format(new Date(contact.lastContactDate), "MMMM d, yyyy") : "Never"}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="Clock" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">
                      {format(new Date(contact.createdAt), "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" className="flex-1 min-w-0">
                  <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                  Edit Contact
                </Button>
                <Button variant="secondary" className="flex-1 min-w-0">
                  <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="ghost" className="flex-1 min-w-0">
                  <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
                  Delete Contact
                </Button>
              </div>

              {/* Activity Timeline */}
              <div className="border-t border-gray-200 pt-6">
                <ActivityTimeline contactId={contact.Id} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactDetailPanel;