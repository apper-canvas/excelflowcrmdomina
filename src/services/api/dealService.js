import dealsData from "@/services/mockData/deals.json";
import { toast } from "react-toastify";
import { activityService } from "@/services/api/activityService";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class DealService {
  constructor() {
    this.deals = [...dealsData];
  }

  async getAll() {
    await delay(300);
    return [...this.deals];
  }

  async getById(id) {
    await delay(200);
    const deal = this.deals.find(d => d.Id === parseInt(id));
    if (!deal) {
      throw new Error("Deal not found");
    }
    return { ...deal };
  }

  async create(dealData) {
    await delay(400);
    
    const maxId = this.deals.length > 0 
      ? Math.max(...this.deals.map(d => d.Id)) 
      : 0;
    
const newDeal = {
      Id: maxId + 1,
      ...dealData,
      contactId: dealData.contactId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.deals.unshift(newDeal);
    return { ...newDeal };
  }

  async update(id, updateData) {
    await delay(350);
    
    const index = this.deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Deal not found");
    }
    
this.deals[index] = {
      ...this.deals[index],
      ...updateData,
      contactId: updateData.contactId !== undefined ? updateData.contactId : this.deals[index].contactId,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.deals[index] };
  }

  async updateStage(id, newStage) {
    await delay(200);
    
    const index = this.deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Deal not found");
    }
    
    const oldStage = this.deals[index].stage;
    this.deals[index] = {
      ...this.deals[index],
      stage: newStage,
      updatedAt: new Date().toISOString()
};
    
    // Generate activity for deal stage change
    const deal = this.deals[index];
    activityService.createDealStageActivity(
      deal.Id,
      deal.contactId,
      oldStage,
      newStage,
      deal.company || deal.contactName
    ).catch(console.error); // Don't block on activity creation failure
    
    toast.success(`Deal moved from ${oldStage} to ${newStage}`);
    return { ...this.deals[index] };
  }

  async delete(id) {
    await delay(250);
    
    const index = this.deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Deal not found");
    }
    
    const deletedDeal = this.deals.splice(index, 1)[0];
    return { ...deletedDeal };
  }

  async getDealsByStage(stage) {
    await delay(200);
    return this.deals.filter(deal => deal.stage === stage);
  }
}

export const dealService = new DealService();