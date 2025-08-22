import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import ApperIcon from "@/components/ApperIcon";
import { activityService } from "@/services/api/activityService";

const MessageModal = ({ isOpen, onClose, contact, onMessageSent }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      
      // Create email activity in the timeline
      const newActivity = await activityService.createEmailActivity(
        contact.Id,
        null, // No deal ID for direct contact messages
        formData.subject.trim(),
        formData.message.trim()
      );

      // Reset form
      setFormData({
        subject: '',
        message: ''
      });
      setErrors({});

      // Notify parent component
      if (onMessageSent) {
        onMessageSent(newActivity);
      }

      toast.success(`Message sent to ${contact.name}`);
      onClose();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      subject: '',
      message: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen || !contact) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={handleCancel}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <ApperIcon name="Mail" className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
                  <p className="text-sm text-gray-600">
                    to {contact.name} at {contact.email}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <ApperIcon name="X" className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Enter message subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="mt-1"
                error={errors.subject}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <textarea
                id="message"
                rows={6}
                placeholder="Type your message here..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:ring-1 transition-colors ${
                  errors.message 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <ApperIcon name="Info" className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  This message will be logged in the activity timeline for {contact.name}.
                </p>
              </div>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  <ApperIcon name="Send" className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MessageModal;