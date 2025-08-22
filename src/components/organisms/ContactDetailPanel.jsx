import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import ActivityTimeline from "@/components/molecules/ActivityTimeline";

const ContactDetailPanel = ({ contact, isOpen, onClose, className }) => {
  if (!contact) return null;

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
            <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Contact Avatar and Name */}
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{contact.name}</h3>
                <p className="text-sm text-gray-600">{contact.company}</p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="Mail" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{contact.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="Phone" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{contact.phone}</span>
                  </div>
</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <ApperIcon name="Building2" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{contact.company}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Contact</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="Calendar" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">
                      {contact.lastContactDate ? format(new Date(contact.lastContactDate), "MMMM d, yyyy") : "Never"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="Clock" className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">
                      {format(new Date(contact.createdAt), "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full" variant="primary">
                  <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                  Edit Contact
                </Button>
                <Button className="w-full" variant="secondary">
                  <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
<Button className="w-full" variant="ghost">
                  <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
                  Delete Contact
                </Button>
              </div>

              {/* Activity Timeline */}
              <ActivityTimeline contactId={contact.Id} className="border-t border-gray-200 pt-6" />
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
            className="ml-auto relative max-w-xs w-full bg-white shadow-xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ApperIcon name="X" className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Contact Avatar and Name */}
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-gray-900">{contact.name}</h3>
                    <p className="text-sm text-gray-600">{contact.company}</p>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <ApperIcon name="Mail" className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{contact.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <ApperIcon name="Phone" className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{contact.phone}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Contact</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <ApperIcon name="Calendar" className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {contact.lastContactDate ? format(new Date(contact.lastContactDate), "MMM d, yyyy") : "Never"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button className="w-full" variant="primary" size="sm">
                      <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                      Edit
</Button>
                    <Button className="w-full" variant="secondary" size="sm">
                      <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                  {/* Activity Timeline */}
                  <ActivityTimeline contactId={contact.Id} className="border-t border-gray-200 pt-4" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ContactDetailPanel;