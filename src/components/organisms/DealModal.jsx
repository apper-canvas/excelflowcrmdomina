import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { companyService } from "@/services/api/companyService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const DealModal = ({ isOpen, onClose, onSubmit, deal = null }) => {
const [formData, setFormData] = useState({
    company: "",
    contactId: "",
    contactName: "",
    dealValue: "",
    stage: "Lead",
    expectedCloseDate: "",
    description: ""
  });
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  const STAGES = ["Lead", "Qualified", "Proposal", "Closed Won"];

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (deal) {
setFormData({
          company: deal.company || "",
          contactId: deal.contactId || "",
          contactName: deal.contactName || "",
          dealValue: deal.dealValue?.toString() || "",
          stage: deal.stage || "Lead",
          expectedCloseDate: deal.expectedCloseDate || "",
          description: deal.description || ""
        });
      } else {
setFormData({
          company: "",
          contactId: "",
          contactName: "",
          dealValue: "",
          stage: "Lead",
          expectedCloseDate: "",
          description: ""
        });
      }
      setErrors({});
    }
  }, [isOpen, deal]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [companiesData, contactsData] = await Promise.all([
        companyService.getAll(),
        contactService.getAll()
      ]);
      setCompanies(companiesData);
      setContacts(contactsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load companies and contacts");
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }
    
    if (!formData.dealValue || isNaN(parseFloat(formData.dealValue)) || parseFloat(formData.dealValue) <= 0) {
      newErrors.dealValue = "Please enter a valid deal value";
    }
    
    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = "Expected close date is required";
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
const selectedContact = contacts.find(c => c.Id === parseInt(formData.contactId));
      const dealData = {
        company: formData.company.trim(),
        contactId: formData.contactId ? parseInt(formData.contactId) : null,
        contactName: selectedContact ? selectedContact.name : "N/A",
        dealValue: parseFloat(formData.dealValue),
        stage: formData.stage,
        expectedCloseDate: formData.expectedCloseDate,
        description: formData.description.trim()
      };
      
      await onSubmit(dealData);
      toast.success(`Deal ${deal ? 'updated' : 'created'} successfully!`);
      onClose();
    } catch (error) {
      console.error("Failed to save deal:", error);
      toast.error(`Failed to ${deal ? 'update' : 'create'} deal. Please try again.`);
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

  const handleClose = () => {
setFormData({
      company: "",
      contactId: "",
      contactName: "",
      dealValue: "",
      stage: "Lead",
      expectedCloseDate: "",
      description: ""
    });
    setErrors({});
    onClose();
  };

if (!isOpen) return null;

return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
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
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {deal ? "Edit Deal" : "Add New Deal"}
          </h3>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <ApperIcon name="X" className="h-5 w-5" />
          </Button>
        </div>
        
        {loadingData ? (
          <div className="py-8 text-center">
            <ApperIcon name="Loader2" className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading companies and contacts...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label required>Company</Label>
              <select
                value={formData.company}
                onChange={e => handleChange("company", e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                  errors.company && "border-red-300 focus:ring-red-500"
                )}
              >
                <option value="">Select a company</option>
                {companies.map(company => (
                  <option key={company.Id} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.company && <p className="text-sm text-red-600">{errors.company}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Contact</Label>
              <select
                value={formData.contactId}
                onChange={e => handleChange("contactId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a contact (optional)</option>
                {contacts.map(contact => (
                  <option key={contact.Id} value={contact.Id}>
                    {contact.name} - {contact.company}
                  </option>
                ))}
              </select>
            </div>
            
            <FormField label="Deal Value" error={errors.dealValue} required>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <Input
                  type="number"
                  value={formData.dealValue}
                  onChange={e => handleChange("dealValue", e.target.value)}
                  placeholder="0"
                  className={cn("pl-8", errors.dealValue && "border-red-300")}
                  min="0"
                  step="0.01"
                />
              </div>
            </FormField>
            
            <div className="space-y-2">
              <Label required>Stage</Label>
              <select
                value={formData.stage}
                onChange={e => handleChange("stage", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {STAGES.map(stage => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            
            <FormField label="Expected Close Date" error={errors.expectedCloseDate} required>
              <Input
                type="date"
                value={formData.expectedCloseDate}
                onChange={e => handleChange("expectedCloseDate", e.target.value)}
                className={errors.expectedCloseDate ? "border-red-300" : ""}
              />
            </FormField>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={formData.description}
                onChange={e => handleChange("description", e.target.value)}
                placeholder="Enter deal description (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    {deal ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <ApperIcon name="Check" className="h-4 w-4 mr-2" />
                    {deal ? "Update Deal" : "Create Deal"}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default DealModal;