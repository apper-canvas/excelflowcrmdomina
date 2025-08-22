// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ActivityService {
  constructor() {
    this.activities = [];
    this.nextId = 1;
  }

  async getAll() {
    await delay(200);
    return [...this.activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getById(id) {
    await delay(100);
    const activity = this.activities.find(a => a.Id === parseInt(id));
    if (!activity) {
      throw new Error("Activity not found");
    }
    return { ...activity };
  }

async create(activityData) {
    await delay(150);
    
    const newActivity = {
      Id: this.nextId++,
      ...activityData,
      timestamp: activityData.timestamp || new Date().toISOString(),
      user: activityData.user || "Current User" // Default user for manual activities
    };
    
    this.activities.unshift(newActivity);
    return { ...newActivity };
  }

  async getActivitiesByContact(contactId) {
    await delay(200);
    return this.activities
      .filter(activity => activity.contactId === parseInt(contactId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getActivitiesByDeal(dealId) {
    await delay(200);
    return this.activities
      .filter(activity => activity.dealId === parseInt(dealId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getActivitiesByType(type) {
    await delay(200);
    return this.activities
      .filter(activity => activity.type === type)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getTimelineForContact(contactId) {
    await delay(250);
    const contactActivities = this.activities.filter(activity => 
      activity.contactId === parseInt(contactId) || 
      (activity.dealId && activity.contactId === parseInt(contactId))
    );
    
    return contactActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getTimelineForDeal(dealId) {
    await delay(250);
    const dealActivities = this.activities.filter(activity => 
      activity.dealId === parseInt(dealId)
    );
    
    return dealActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Helper methods for creating specific activity types
  async createDealStageActivity(dealId, contactId, oldStage, newStage, dealName) {
    return this.create({
      type: "deal_stage_changed",
      dealId: parseInt(dealId),
      contactId: contactId ? parseInt(contactId) : null,
      description: `Deal stage changed from ${oldStage} to ${newStage}`,
      details: {
        dealName,
        oldStage,
        newStage
      }
    });
  }

  async createTaskCompletedActivity(taskId, contactId, dealId, taskTitle, taskType) {
    return this.create({
      type: "task_completed",
      taskId: parseInt(taskId),
      contactId: contactId ? parseInt(contactId) : null,
      dealId: dealId ? parseInt(dealId) : null,
      description: `Task completed: ${taskTitle}`,
      details: {
        taskTitle,
        taskType
      }
    });
  }

  async createContactUpdatedActivity(contactId, contactName, changes) {
    return this.create({
      type: "contact_updated",
      contactId: parseInt(contactId),
      description: `Contact updated: ${contactName}`,
      details: {
        contactName,
        changes
      }
    });
  }

  async createDealCreatedActivity(dealId, contactId, dealName, dealValue) {
    return this.create({
      type: "deal_created",
      dealId: parseInt(dealId),
      contactId: contactId ? parseInt(contactId) : null,
      description: `New deal created: ${dealName}`,
      details: {
        dealName,
        dealValue
      }
    });
  }

  async createTaskCreatedActivity(taskId, contactId, dealId, taskTitle, dueDate) {
    return this.create({
      type: "task_created",
      taskId: parseInt(taskId),
      contactId: contactId ? parseInt(contactId) : null,
      dealId: dealId ? parseInt(dealId) : null,
      description: `New task created: ${taskTitle}`,
      details: {
        taskTitle,
        dueDate
      }
    });
  }

  async delete(id) {
    await delay(100);
    const index = this.activities.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Activity not found");
    }
const deletedActivity = this.activities.splice(index, 1)[0];
    return { ...deletedActivity };
  }

  // Manual activity logging methods
  async createCallActivity(contactId, dealId, notes, duration) {
    return this.create({
      type: "call_logged",
      contactId: contactId ? parseInt(contactId) : null,
      dealId: dealId ? parseInt(dealId) : null,
      description: `Call logged${duration ? ` (${duration} minutes)` : ''}`,
      details: {
        notes: notes || '',
        duration: duration || 0
      },
      user: "Current User"
    });
  }

  async createEmailActivity(contactId, dealId, subject, notes) {
    return this.create({
      type: "email_sent",
      contactId: contactId ? parseInt(contactId) : null,
      dealId: dealId ? parseInt(dealId) : null,
      description: `Email sent${subject ? `: ${subject}` : ''}`,
      details: {
        subject: subject || '',
        notes: notes || ''
      },
      user: "Current User"
    });
}
}

export const activityService = new ActivityService();