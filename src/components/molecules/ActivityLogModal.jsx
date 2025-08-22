import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import ApperIcon from "@/components/ApperIcon";
import { activityService } from "@/services/api/activityService";

const ActivityLogModal = ({ isOpen, onClose, type, contactId, dealId, onActivityAdded }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    notes: '',
    duration: '',
    subject: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      let newActivity;

      if (type === 'call') {
        if (!formData.notes.trim()) {
          toast.error("Please enter call notes");
          return;
        }
        newActivity = await activityService.createCallActivity(
          contactId,
          dealId,
          formData.notes.trim(),
          formData.duration ? parseInt(formData.duration) : null
        );
        toast.success("Call logged successfully");
      } else if (type === 'email') {
        if (!formData.subject.trim() && !formData.notes.trim()) {
          toast.error("Please enter either subject or notes");
          return;
        }
        newActivity = await activityService.createEmailActivity(
          contactId,
          dealId,
          formData.subject.trim(),
          formData.notes.trim()
        );
        toast.success("Email logged successfully");
      }

      // Reset form
      setFormData({
        notes: '',
        duration: '',
        subject: ''
      });

      // Notify parent component
      if (onActivityAdded) {
        onActivityAdded(newActivity);
      }

      onClose();
    } catch (error) {
      console.error("Failed to log activity:", error);
      toast.error("Failed to log activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      notes: '',
      duration: '',
      subject: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  const modalTitle = type === 'call' ? 'Log Call' : 'Log Email';
  const modalIcon = type === 'call' ? 'Phone' : 'Mail';

return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
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
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <ApperIcon name={modalIcon} className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{modalTitle}</h3>
                <p className="text-sm text-gray-600">
                  Add this activity to the timeline
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {type === 'email' && (
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            {type === 'call' && (
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="999"
                  placeholder="e.g., 30"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">
                {type === 'call' ? 'Call Notes *' : 'Notes'}
              </Label>
              <textarea
                id="notes"
                rows={4}
                placeholder={type === 'call' ? 'Enter call notes and discussion points...' : 'Enter additional notes about the email...'}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required={type === 'call'}
              />
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
              className="min-w-[100px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ActivityLogModal;