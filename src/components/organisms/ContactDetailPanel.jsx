import React, { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import ActivityTimeline from "@/components/molecules/ActivityTimeline";
import FormField from "@/components/molecules/FormField";
import MessageModal from "@/components/molecules/MessageModal";
import { contactService } from "@/services/api/contactService";

const ContactDetailPanel = ({ contact, isOpen, onClose, onContactUpdated, className }) => {
const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  if (!contact || !isOpen) return null;

  // Initialize form data when editing starts
  const handleEditStart = () => {
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || ''
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setFormData({});
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone is required";
    }
    
    if (!formData.company?.trim()) {
      newErrors.company = "Company is required";
    }
    
    return newErrors;
  };

  const handleEditSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const updatedContact = await contactService.update(contact.Id, formData);
      setIsEditing(false);
      setFormData({});
      setErrors({});
      toast.success("Contact updated successfully!");
      
      // Notify parent component of the update
      if (onContactUpdated) {
        onContactUpdated(updatedContact);
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
      toast.error("Failed to update contact. Please try again.");
    }
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
      await contactService.delete(contact.Id);
      toast.success("Contact deleted successfully!");
      setShowDeleteConfirm(false);
      
      // Notify parent and close modal
      if (onContactUpdated) {
        onContactUpdated(null, 'deleted');
      }
      onClose();
    } catch (error) {
      console.error('Failed to delete contact:', error);
      toast.error("Failed to delete contact. Please try again.");
    } finally {
      setIsDeleting(false);
}
  };

  const handleSendMessage = () => {
    setMessageModalOpen(true);
  };

  const handleMessageSent = (newActivity) => {
    // Force ActivityTimeline to refresh by triggering a re-render
    // The ActivityTimeline component will automatically fetch new activities
    console.log('Message sent, activity logged:', newActivity);
  };
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
              {isEditing ? (
                <div className="space-y-4">
                  <FormField
                    label="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    error={errors.name}
                    placeholder="Enter full name"
                  />
                  
                  <FormField
                    label="Email Address"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                    placeholder="Enter email address"
                  />
                  
                  <FormField
                    label="Phone Number"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    error={errors.phone}
                    placeholder="Enter phone number"
                  />
                  
                  <FormField
                    label="Company"
                    required
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    error={errors.company}
                    placeholder="Enter company name"
                  />
                </div>
              ) : (
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
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {isEditing ? (
                  <>
                    <Button variant="primary" className="flex-1 min-w-0" onClick={handleEditSave}>
                      <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="secondary" className="flex-1 min-w-0" onClick={handleEditCancel}>
                      <ApperIcon name="X" className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="primary" className="flex-1 min-w-0" onClick={handleEditStart}>
                      <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                      Edit Contact
                    </Button>
<Button variant="secondary" className="flex-1 min-w-0" onClick={handleSendMessage}>
                      <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="danger" className="flex-1 min-w-0" onClick={handleDeleteConfirm}>
                      <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
                      Delete Contact
                    </Button>
                  </>
                )}
              </div>

              {/* Activity Timeline */}
              {!isEditing && (
                <div className="border-t border-gray-200 pt-6">
                  <ActivityTimeline contactId={contact.Id} />
                </div>
              )}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Contact</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete <strong>{contact.name}</strong>? This action cannot be undone.
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

        {/* Message Modal */}
        <MessageModal
          isOpen={messageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          contact={contact}
          onMessageSent={handleMessageSent}
        />
      </motion.div>
    </div>
  );
};

export default ContactDetailPanel;