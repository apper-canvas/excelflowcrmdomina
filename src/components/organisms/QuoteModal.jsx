import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";
import { companyService } from "@/services/api/companyService";
import { dealService } from "@/services/api/dealService";

const QuoteModal = ({ isOpen, onClose, onSave, quote, isSubmitting, className }) => {
  const [formData, setFormData] = useState({
    company: "",
    contactName: "",
    dealTitle: "",
    quoteDate: "",
    status: "Draft",
    deliveryMethod: "Email",
    expiresOn: "",
    amount: "",
    // Billing Address
    billToName: "",
    billStreet: "",
    billCity: "",
    billState: "",
    billCountry: "",
    billPincode: "",
    // Shipping Address
    shipToName: "",
    shipStreet: "",
    shipCity: "",
    shipState: "",
    shipCountry: "",
    shipPincode: "",
    sameAsBilling: false
  });

  const [errors, setErrors] = useState({});
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    "Draft", "Sent", "Accepted", "Rejected", "Expired"
  ];

  const deliveryMethods = [
    "Email", "Mail", "Hand Delivery", "Courier", "Digital Download"
  ];

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (quote) {
        setFormData({
          company: quote.company || "",
          contactName: quote.contactName || "",
          dealTitle: quote.dealTitle || "",
          quoteDate: quote.quoteDate || "",
          status: quote.status || "Draft",
          deliveryMethod: quote.deliveryMethod || "Email",
          expiresOn: quote.expiresOn || "",
          amount: quote.amount?.toString() || "",
          billToName: quote.billToName || "",
          billStreet: quote.billStreet || "",
          billCity: quote.billCity || "",
          billState: quote.billState || "",
          billCountry: quote.billCountry || "",
          billPincode: quote.billPincode || "",
          shipToName: quote.shipToName || "",
          shipStreet: quote.shipStreet || "",
          shipCity: quote.shipCity || "",
          shipState: quote.shipState || "",
          shipCountry: quote.shipCountry || "",
          shipPincode: quote.shipPincode || "",
          sameAsBilling: false
        });
      } else {
        // Set default dates for new quotes
        const today = new Date().toISOString().split('T')[0];
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        const expiryDate = expiry.toISOString().split('T')[0];
        
        setFormData(prev => ({
          ...prev,
          quoteDate: today,
          expiresOn: expiryDate
        }));
      }
    }
  }, [isOpen, quote]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contactsData, companiesData, dealsData] = await Promise.all([
        contactService.getAll(),
        companyService.getAll(),
        dealService.getAll()
      ]);
      setContacts(contactsData);
      setCompanies(companiesData);
      setDeals(dealsData);
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Handle same as billing checkbox
    if (field === "sameAsBilling" && value) {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        shipToName: prev.billToName,
        shipStreet: prev.billStreet,
        shipCity: prev.billCity,
        shipState: prev.billState,
        shipCountry: prev.billCountry,
        shipPincode: prev.billPincode
      }));
    }

    // Update shipping address when billing changes if sameAsBilling is true
    if (formData.sameAsBilling && field.startsWith('bill')) {
      const shipField = field.replace('bill', 'ship');
      setFormData(prev => ({ ...prev, [shipField]: value }));
    }
  };

  const handleCompanyChange = (companyName) => {
    setFormData(prev => ({ ...prev, company: companyName, contactName: "", dealTitle: "" }));
    
    // Filter contacts and deals by selected company
    const companyContacts = contacts.filter(contact => 
      contact.company.toLowerCase() === companyName.toLowerCase()
    );
    const companyDeals = deals.filter(deal => 
      deal.company.toLowerCase() === companyName.toLowerCase()
    );
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }
    
    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact is required";
    }
    
    if (!formData.dealTitle.trim()) {
      newErrors.dealTitle = "Deal is required";
    }
    
    if (!formData.quoteDate) {
      newErrors.quoteDate = "Quote date is required";
    }
    
    if (!formData.expiresOn) {
      newErrors.expiresOn = "Expiry date is required";
    }
    
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      newErrors.amount = "Valid amount is required";
    }
    
    // Billing address validation
    if (!formData.billToName.trim()) {
      newErrors.billToName = "Bill to name is required";
    }
    
    if (!formData.billStreet.trim()) {
      newErrors.billStreet = "Bill street is required";
    }
    
    if (!formData.billCity.trim()) {
      newErrors.billCity = "Bill city is required";
    }
    
    // Shipping address validation
    if (!formData.shipToName.trim()) {
      newErrors.shipToName = "Ship to name is required";
    }
    
    if (!formData.shipStreet.trim()) {
      newErrors.shipStreet = "Ship street is required";
    }
    
    if (!formData.shipCity.trim()) {
      newErrors.shipCity = "Ship city is required";
    }
    
    // Date validation
    if (formData.quoteDate && formData.expiresOn) {
      const quoteDate = new Date(formData.quoteDate);
      const expiryDate = new Date(formData.expiresOn);
      if (expiryDate <= quoteDate) {
        newErrors.expiresOn = "Expiry date must be after quote date";
      }
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

    try {
      const quoteData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      await onSave(quoteData);
      handleClose();
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const handleClose = () => {
    setFormData({
      company: "",
      contactName: "",
      dealTitle: "",
      quoteDate: "",
      status: "Draft",
      deliveryMethod: "Email",
      expiresOn: "",
      amount: "",
      billToName: "",
      billStreet: "",
      billCity: "",
      billState: "",
      billCountry: "",
      billPincode: "",
      shipToName: "",
      shipStreet: "",
      shipCity: "",
      shipState: "",
      shipCountry: "",
      shipPincode: "",
      sameAsBilling: false
    });
    setErrors({});
    onClose();
  };

  const copyBillingToShipping = () => {
    setFormData(prev => ({
      ...prev,
      shipToName: prev.billToName,
      shipStreet: prev.billStreet,
      shipCity: prev.billCity,
      shipState: prev.billState,
      shipCountry: prev.billCountry,
      shipPincode: prev.billPincode,
      sameAsBilling: true
    }));
  };

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(contact => 
    !formData.company || contact.company.toLowerCase() === formData.company.toLowerCase()
  );

  const filteredDeals = deals.filter(deal => 
    !formData.company || deal.company.toLowerCase() === formData.company.toLowerCase()
  );

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
          "relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {quote ? "Edit Quote" : "Create New Quote"}
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <ApperIcon name="X" className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Company <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.company}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
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
              {errors.company && (
                <p className="text-sm text-red-600">{errors.company}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Contact <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.contactName}
                onChange={(e) => handleChange("contactName", e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                  errors.contactName && "border-red-300 focus:ring-red-500"
                )}
              >
                <option value="">Select a contact</option>
                {filteredContacts.map(contact => (
                  <option key={contact.Id} value={contact.name}>
                    {contact.name}
                  </option>
                ))}
              </select>
              {errors.contactName && (
                <p className="text-sm text-red-600">{errors.contactName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Deal <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.dealTitle}
                onChange={(e) => handleChange("dealTitle", e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                  errors.dealTitle && "border-red-300 focus:ring-red-500"
                )}
              >
                <option value="">Select a deal</option>
                {filteredDeals.map(deal => (
                  <option key={deal.Id} value={deal.title}>
                    {deal.title}
                  </option>
                ))}
              </select>
              {errors.dealTitle && (
                <p className="text-sm text-red-600">{errors.dealTitle}</p>
              )}
            </div>

            <FormField
              label="Amount"
              required
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              error={errors.amount}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Quote Date"
              required
              type="date"
              value={formData.quoteDate}
              onChange={(e) => handleChange("quoteDate", e.target.value)}
              error={errors.quoteDate}
            />

            <FormField
              label="Expires On"
              required
              type="date"
              value={formData.expiresOn}
              onChange={(e) => handleChange("expiresOn", e.target.value)}
              error={errors.expiresOn}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Delivery Method
            </label>
            <select
              value={formData.deliveryMethod}
              onChange={(e) => handleChange("deliveryMethod", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {deliveryMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Billing Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Billing Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Bill To Name"
                required
                value={formData.billToName}
                onChange={(e) => handleChange("billToName", e.target.value)}
                error={errors.billToName}
                placeholder="Enter bill to name"
              />
              <FormField
                label="Street"
                required
                value={formData.billStreet}
                onChange={(e) => handleChange("billStreet", e.target.value)}
                error={errors.billStreet}
                placeholder="Enter street address"
              />
              <FormField
                label="City"
                required
                value={formData.billCity}
                onChange={(e) => handleChange("billCity", e.target.value)}
                error={errors.billCity}
                placeholder="Enter city"
              />
              <FormField
                label="State"
                value={formData.billState}
                onChange={(e) => handleChange("billState", e.target.value)}
                error={errors.billState}
                placeholder="Enter state"
              />
              <FormField
                label="Country"
                value={formData.billCountry}
                onChange={(e) => handleChange("billCountry", e.target.value)}
                error={errors.billCountry}
                placeholder="Enter country"
              />
              <FormField
                label="Pincode"
                value={formData.billPincode}
                onChange={(e) => handleChange("billPincode", e.target.value)}
                error={errors.billPincode}
                placeholder="Enter pincode"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex-1">
                Shipping Address
              </h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={copyBillingToShipping}
                className="ml-4"
              >
                <ApperIcon name="Copy" className="h-4 w-4 mr-2" />
                Copy from Billing
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sameAsBilling"
                checked={formData.sameAsBilling}
                onChange={(e) => handleChange("sameAsBilling", e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="sameAsBilling" className="text-sm text-gray-700">
                Same as billing address
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Ship To Name"
                required
                value={formData.shipToName}
                onChange={(e) => handleChange("shipToName", e.target.value)}
                error={errors.shipToName}
                placeholder="Enter ship to name"
              />
              <FormField
                label="Street"
                required
                value={formData.shipStreet}
                onChange={(e) => handleChange("shipStreet", e.target.value)}
                error={errors.shipStreet}
                placeholder="Enter street address"
              />
              <FormField
                label="City"
                required
                value={formData.shipCity}
                onChange={(e) => handleChange("shipCity", e.target.value)}
                error={errors.shipCity}
                placeholder="Enter city"
              />
              <FormField
                label="State"
                value={formData.shipState}
                onChange={(e) => handleChange("shipState", e.target.value)}
                error={errors.shipState}
                placeholder="Enter state"
              />
              <FormField
                label="Country"
                value={formData.shipCountry}
                onChange={(e) => handleChange("shipCountry", e.target.value)}
                error={errors.shipCountry}
                placeholder="Enter country"
              />
              <FormField
                label="Pincode"
                value={formData.shipPincode}
                onChange={(e) => handleChange("shipPincode", e.target.value)}
                error={errors.shipPincode}
                placeholder="Enter pincode"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  {quote ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <ApperIcon name={quote ? "Save" : "Plus"} className="h-4 w-4 mr-2" />
                  {quote ? "Update Quote" : "Create Quote"}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default QuoteModal;