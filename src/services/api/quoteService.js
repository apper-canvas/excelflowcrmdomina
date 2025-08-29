import { toast } from "react-toastify";

class QuoteService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "QuoteNumber_c"}},
          {"field": {"Name": "Company_c"}},
          {"field": {"Name": "ContactName_c"}},
          {"field": {"Name": "DealTitle_c"}},
          {"field": {"Name": "Amount_c"}},
          {"field": {"Name": "Status_c"}},
          {"field": {"Name": "QuoteDate_c"}},
          {"field": {"Name": "ExpiryDate_c"}},
          {"field": {"Name": "DeliveryMethod_c"}},
          {"field": {"Name": "CreatedTime"}},
          {"field": {"Name": "ModifiedTime"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('quote_c', params);
      
      if (!response?.success) {
        console.error('Failed to fetch quotes:', response?.message);
        toast.error(response?.message || 'Failed to fetch quotes');
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching quotes:', error?.response?.data?.message || error);
      toast.error('Failed to fetch quotes');
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "QuoteNumber_c"}},
          {"field": {"Name": "Company_c"}},
          {"field": {"Name": "ContactName_c"}},
          {"field": {"Name": "DealTitle_c"}},
          {"field": {"Name": "Amount_c"}},
          {"field": {"Name": "Status_c"}},
          {"field": {"Name": "QuoteDate_c"}},
          {"field": {"Name": "ExpiryDate_c"}},
          {"field": {"Name": "DeliveryMethod_c"}},
          {"field": {"Name": "CreatedTime"}},
          {"field": {"Name": "ModifiedTime"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('quote_c', parseInt(id), params);
      
      if (!response?.data) {
        throw new Error("Quote not found");
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error?.response?.data?.message || error);
      throw new Error("Quote not found");
    }
  }

  async create(quoteData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: quoteData.Name || `Quote-${Date.now()}`,
          QuoteNumber_c: quoteData.QuoteNumber_c,
          Company_c: quoteData.Company_c,
          ContactName_c: quoteData.ContactName_c,
          DealTitle_c: quoteData.DealTitle_c,
          Amount_c: parseFloat(quoteData.Amount_c) || 0,
          Status_c: quoteData.Status_c || 'Draft',
          QuoteDate_c: quoteData.QuoteDate_c,
          ExpiryDate_c: quoteData.ExpiryDate_c,
          DeliveryMethod_c: quoteData.DeliveryMethod_c
        }]
      };
      
      const response = await this.apperClient.createRecord('quote_c', params);
      
      if (!response.success) {
        console.error('Failed to create quote:', response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} quotes:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Quote created successfully');
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating quote:', error?.response?.data?.message || error);
      toast.error('Failed to create quote');
      return null;
    }
  }

  async update(id, updateData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: updateData.Name,
          QuoteNumber_c: updateData.QuoteNumber_c,
          Company_c: updateData.Company_c,
          ContactName_c: updateData.ContactName_c,
          DealTitle_c: updateData.DealTitle_c,
          Amount_c: parseFloat(updateData.Amount_c) || 0,
          Status_c: updateData.Status_c,
          QuoteDate_c: updateData.QuoteDate_c,
          ExpiryDate_c: updateData.ExpiryDate_c,
          DeliveryMethod_c: updateData.DeliveryMethod_c
        }]
      };
      
      const response = await this.apperClient.updateRecord('quote_c', params);
      
      if (!response.success) {
        console.error('Failed to update quote:', response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} quotes:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Quote updated successfully');
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating quote:', error?.response?.data?.message || error);
      toast.error('Failed to update quote');
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('quote_c', params);
      
      if (!response.success) {
        console.error('Failed to delete quote:', response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} quotes:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Quote deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting quote:', error?.response?.data?.message || error);
      toast.error('Failed to delete quote');
      return false;
    }
  }

  async updateStatus(id, status) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          Status_c: status
        }]
      };
      
      const response = await this.apperClient.updateRecord('quote_c', params);
      
      if (!response.success) {
        console.error('Failed to update quote status:', response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} quote statuses:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success(`Quote status updated to ${status}`);
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating quote status:', error?.response?.data?.message || error);
      toast.error('Failed to update quote status');
      return null;
    }
  }
}

export const quoteService = new QuoteService();