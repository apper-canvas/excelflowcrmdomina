import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { companyService } from "@/services/api/companyService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { cn } from "@/utils/cn";
const ContactModal = ({ isOpen, onClose, onSave, className }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const companiesData = await companyService.getAll();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearch.toLowerCase())
  );
const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleCompanySearch = (value) => {
    setCompanySearch(value);
    setFormData(prev => ({ ...prev, company: value }));
    setShowCompanyDropdown(true);
    if (errors.company) {
      setErrors(prev => ({ ...prev, company: "" }));
    }
  };

  const selectCompany = (company) => {
    setFormData(prev => ({ ...prev, company: company.name }));
    setCompanySearch(company.name);
    setShowCompanyDropdown(false);
    if (errors.company) {
      setErrors(prev => ({ ...prev, company: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }
    
    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
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
      setFormData({ name: "", email: "", phone: "", company: "" });
      setErrors({});
      toast.success("Contact added successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to add contact. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

const handleClose = () => {
    setFormData({ name: "", email: "", phone: "", company: "" });
    setErrors({});
    setCompanySearch("");
    setShowCompanyDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

return (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
          "relative bg-white rounded-lg shadow-xl w-full max-w-md",
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Contact</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <ApperIcon name="X" className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
<div className="space-y-2 relative">
            <label className="block text-sm font-medium text-gray-700">
              Company <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={companySearch}
                onChange={(e) => handleCompanySearch(e.target.value)}
                onFocus={() => setShowCompanyDropdown(true)}
                className={cn(
                  "w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                  errors.company && "border-red-300 focus:ring-red-500"
                )}
                placeholder="Search and select company"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {loadingCompanies ? (
                  <ApperIcon name="Loader2" className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <ApperIcon name="ChevronDown" className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              {showCompanyDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <button
                        key={company.Id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        onClick={() => selectCompany(company)}
                      >
                        <div className="font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.industry}</div>
                      </button>
                    ))
                  ) : companySearch.trim() ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No companies found matching "{companySearch}"
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Start typing to search companies
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.company && (
              <p className="text-sm text-red-600">{errors.company}</p>
            )}
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
                  Add Contact
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ContactModal;