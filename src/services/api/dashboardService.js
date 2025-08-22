import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { taskService } from "@/services/api/taskService";
import { activityService } from "@/services/api/activityService";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class DashboardService {
  async getPipelineMetrics(dateRange = 'thisMonth') {
    await delay(300);
    
    try {
      const deals = await dealService.getAll();
      const contacts = await contactService.getAll();
      
      // Filter deals by date range
      const filteredDeals = this.filterByDateRange(deals, dateRange);
      
      // Calculate pipeline metrics
      const pipelineData = this.calculatePipelineData(filteredDeals);
      const conversionRates = this.calculateConversionRates(filteredDeals);
      const totalPipelineValue = filteredDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
      const averageDealSize = filteredDeals.length > 0 ? totalPipelineValue / filteredDeals.length : 0;
      
      return {
        pipelineData,
        conversionRates,
        totalPipelineValue,
        averageDealSize,
        totalDeals: filteredDeals.length,
        totalContacts: contacts.length
      };
    } catch (error) {
      console.error('Failed to get pipeline metrics:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(dateRange = 'thisMonth') {
    await delay(250);
    
    try {
      const tasks = await taskService.getAll();
      const activities = await activityService.getAll();
      
      // Filter by date range
      const filteredTasks = this.filterByDateRange(tasks, dateRange);
      const filteredActivities = this.filterByDateRange(activities, dateRange, 'timestamp');
      
      // Calculate performance metrics
      const completedTasks = filteredTasks.filter(task => task.status === 'completed');
      const taskCompletionRate = filteredTasks.length > 0 ? (completedTasks.length / filteredTasks.length) * 100 : 0;
      
      const monthlyTarget = 100000; // Example monthly target
      const currentMonthDeals = await dealService.getAll();
      const closedWonDeals = currentMonthDeals.filter(deal => deal.stage === 'Closed Won');
      const monthlyRevenue = closedWonDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
      const targetProgress = (monthlyRevenue / monthlyTarget) * 100;
      
      return {
        taskCompletionRate,
        completedTasks: completedTasks.length,
        totalTasks: filteredTasks.length,
        monthlyTarget,
        monthlyRevenue,
        targetProgress,
        activitiesCount: filteredActivities.length
      };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  async getTopContacts(dateRange = 'thisMonth', limit = 5) {
    await delay(200);
    
    try {
      const contacts = await contactService.getAll();
      const deals = await dealService.getAll();
      
      // Calculate contact values based on their deals
      const contactMetrics = contacts.map(contact => {
        const contactDeals = deals.filter(deal => 
          deal.contactName === contact.name || deal.contactId === contact.Id
        );
        
        const totalValue = contactDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
        const activeDeals = contactDeals.filter(deal => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost').length;
        const wonDeals = contactDeals.filter(deal => deal.stage === 'Closed Won').length;
        
        return {
          ...contact,
          totalValue,
          activeDeals,
          wonDeals,
          totalDeals: contactDeals.length
        };
      });
      
      // Sort by total value and return top contacts
      return contactMetrics
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get top contacts:', error);
      throw error;
    }
  }

  async getRecentActivity(limit = 10) {
    await delay(150);
    
    try {
      const activities = await activityService.getAll();
      return activities.slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent activity:', error);
      throw error;
    }
  }

  async getUpcomingTasks(limit = 10) {
    await delay(150);
    
    try {
      const tasks = await taskService.getAll();
      const upcomingTasks = tasks
        .filter(task => task.status === 'pending' && task.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, limit);
      
      return upcomingTasks;
    } catch (error) {
      console.error('Failed to get upcoming tasks:', error);
      throw error;
    }
  }

  // Helper methods
  filterByDateRange(data, dateRange, dateField = 'createdAt') {
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'thisQuarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return data;
    }
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate;
    });
  }

  calculatePipelineData(deals) {
    const stages = ['Lead', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'];
    
    return stages.map(stage => {
      const stageDeals = deals.filter(deal => deal.stage === stage);
      const stageValue = stageDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
      
      return {
        stage,
        count: stageDeals.length,
        value: stageValue
      };
    });
  }

  calculateConversionRates(deals) {
    const stages = ['Lead', 'Qualified', 'Proposal', 'Closed Won'];
    const rates = {};
    
    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i];
      const nextStage = stages[i + 1];
      
      const currentCount = deals.filter(deal => deal.stage === currentStage).length;
      const nextCount = deals.filter(deal => deal.stage === nextStage).length;
      
      const conversionRate = currentCount > 0 ? (nextCount / currentCount) * 100 : 0;
      rates[`${currentStage}_to_${nextStage}`] = Math.round(conversionRate);
    }
    
    // Overall conversion rate (Lead to Closed Won)
    const totalLeads = deals.filter(deal => ['Lead', 'Qualified', 'Proposal', 'Closed Won'].includes(deal.stage)).length;
    const closedWon = deals.filter(deal => deal.stage === 'Closed Won').length;
    rates.overall = totalLeads > 0 ? Math.round((closedWon / totalLeads) * 100) : 0;
    
    return rates;
  }
}

export const dashboardService = new DashboardService();