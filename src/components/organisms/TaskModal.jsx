import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";

const TaskModal = ({ isOpen, onClose, onSubmit, task = null, prefilledContactId = null, prefilledDealId = null }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "call",
    dueDate: "",
    priority: "medium",
    contactId: prefilledContactId || "",
    dealId: prefilledDealId || ""
  });
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadContacts();
      loadDeals();
      if (task) {
        setFormData({
          title: task.title || "",
          description: task.description || "",
          type: task.type || "call",
          dueDate: task.dueDate || "",
          priority: task.priority || "medium",
          contactId: task.contactId || "",
          dealId: task.dealId || ""
        });
      } else {
        setFormData({
          title: "",
          description: "",
          type: "call",
          dueDate: "",
          priority: "medium",
          contactId: prefilledContactId || "",
          dealId: prefilledDealId || ""
        });
      }
      setErrors({});
    }
  }, [isOpen, task, prefilledContactId, prefilledDealId]);

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    }
  };

  const loadDeals = async () => {
    try {
      const dealsData = await dealService.getAll();
      setDeals(dealsData);
    } catch (error) {
      console.error("Failed to load deals:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    if (!formData.contactId && !formData.dealId) {
      newErrors.link = "Please link to at least one contact or deal";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const taskData = {
        ...formData,
        contactId: formData.contactId ? parseInt(formData.contactId) : null,
        dealId: formData.dealId ? parseInt(formData.dealId) : null
      };
      
      await onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {task ? "Edit Task" : "Create Task"}
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Title" error={errors.title} required>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter task title"
                className={errors.title ? "border-red-300" : ""}
              />
            </FormField>

            <FormField label="Description">
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter task description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Type" required>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </select>
              </FormField>

              <FormField label="Priority" required>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </FormField>
            </div>

            <FormField label="Due Date" error={errors.dueDate} required>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className={errors.dueDate ? "border-red-300" : ""}
              />
            </FormField>

            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Link to Contact/Deal {errors.link && <span className="text-red-500 text-xs ml-1">{errors.link}</span>}
              </Label>
              
              <FormField label="Contact">
                <select
                  value={formData.contactId}
                  onChange={(e) => handleChange("contactId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a contact</option>
                  {contacts.map(contact => (
                    <option key={contact.Id} value={contact.Id}>
                      {contact.name} - {contact.company}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Deal">
                <select
                  value={formData.dealId}
                  onChange={(e) => handleChange("dealId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a deal</option>
                  {deals.map(deal => (
                    <option key={deal.Id} value={deal.Id}>
                      {deal.company} - ${deal.dealValue?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    {task ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <ApperIcon name="Check" className="h-4 w-4 mr-2" />
                    {task ? "Update Task" : "Create Task"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default TaskModal;