import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";

const CompanyModal = ({ isOpen, onClose, onSave, className }) => {
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    address: "",
    notes: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const industries = [
    "Technology", "Manufacturing", "Healthcare", "Finance", "Consulting",
    "Software", "Cloud Services", "Marketing", "Logistics", "Data Analytics",
    "Research", "Operations", "Innovation", "Telecommunications", "Systems",
    "Real Estate", "Education", "Energy", "Retail", "Agriculture"
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    }
    
    if (!formData.industry.trim()) {
      newErrors.industry = "Industry is required";
    }
    
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = "Please enter a valid website URL";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      setFormData({ name: "", industry: "", website: "", address: "", notes: "" });
      setErrors({});
      toast.success("Company added successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to add company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", industry: "", website: "", address: "", notes: "" });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-600 bg-opacity-75"
        onClick={handleClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "relative bg-white rounded-lg shadow-xl w-full max-w-lg",
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Company</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <ApperIcon name="X" className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Company Name"
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            placeholder="Enter company name"
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Industry <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                errors.industry && "border-red-300 focus:ring-red-500"
              )}
            >
              <option value="">Select an industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            {errors.industry && (
              <p className="text-sm text-red-600">{errors.industry}</p>
            )}
          </div>
          
          <FormField
            label="Website"
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
            error={errors.website}
            placeholder="https://www.company.com"
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Enter company address"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Additional notes about the company"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                  Add Company
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CompanyModal;