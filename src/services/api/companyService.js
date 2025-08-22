import companiesData from "@/services/mockData/companies.json";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CompanyService {
  constructor() {
    this.companies = [...companiesData];
  }

  async getAll() {
    await delay(300);
    return [...this.companies];
  }

  async getById(id) {
    await delay(200);
    const company = this.companies.find(c => c.Id === parseInt(id));
    if (!company) {
      throw new Error("Company not found");
    }
    return { ...company };
  }

  async create(companyData) {
    await delay(400);
    
    const maxId = this.companies.length > 0 
      ? Math.max(...this.companies.map(c => c.Id)) 
      : 0;
    
    const newCompany = {
      Id: maxId + 1,
      ...companyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.companies.unshift(newCompany);
    return { ...newCompany };
  }

  async update(id, updateData) {
    await delay(350);
    
    const index = this.companies.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Company not found");
    }
    
    this.companies[index] = {
      ...this.companies[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.companies[index] };
  }

  async delete(id) {
    await delay(250);
    
    const index = this.companies.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Company not found");
    }
    
    const deletedCompany = this.companies.splice(index, 1)[0];
    return { ...deletedCompany };
  }

  async getCompanyMetrics(companyId) {
    await delay(150);
    
    const [allContacts, allDeals] = await Promise.all([
      contactService.getAll(),
      dealService.getAll()
    ]);
    
    const company = await this.getById(companyId);
    const companyContacts = allContacts.filter(contact => 
      contact.company.toLowerCase() === company.name.toLowerCase()
    );
    const companyDeals = allDeals.filter(deal => 
      deal.company.toLowerCase() === company.name.toLowerCase()
    );
    
    const totalDealValue = companyDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
    
    return {
      contactCount: companyContacts.length,
      dealCount: companyDeals.length,
      totalDealValue,
      contacts: companyContacts,
      deals: companyDeals
    };
  }
}

export const companyService = new CompanyService();