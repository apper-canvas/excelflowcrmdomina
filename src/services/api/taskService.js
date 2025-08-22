import tasksData from "@/services/mockData/tasks.json";
import { toast } from "react-toastify";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class TaskService {
  constructor() {
    this.tasks = [...tasksData];
  }

  async getAll() {
    await delay(300);
    return [...this.tasks];
  }

  async getById(id) {
    await delay(200);
    const task = this.tasks.find(t => t.Id === parseInt(id));
    if (!task) {
      throw new Error("Task not found");
    }
    return { ...task };
  }

  async create(taskData) {
    await delay(400);
    
    const maxId = this.tasks.length > 0 
      ? Math.max(...this.tasks.map(t => t.Id)) 
      : 0;
    
    const newTask = {
      Id: maxId + 1,
      ...taskData,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.tasks.unshift(newTask);
    return { ...newTask };
  }

  async update(id, updateData) {
    await delay(350);
    
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    
    this.tasks[index] = {
      ...this.tasks[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.tasks[index] };
  }

  async updateStatus(id, newStatus) {
    await delay(200);
    
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    
    const oldStatus = this.tasks[index].status;
    this.tasks[index] = {
      ...this.tasks[index],
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    toast.success(`Task marked as ${newStatus}`);
    return { ...this.tasks[index] };
  }

  async delete(id) {
    await delay(250);
    
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    
    const deletedTask = this.tasks.splice(index, 1)[0];
    return { ...deletedTask };
  }

  async getTasksByContact(contactId) {
    await delay(200);
    return this.tasks.filter(task => task.contactId === parseInt(contactId));
  }

  async getTasksByDeal(dealId) {
    await delay(200);
    return this.tasks.filter(task => task.dealId === parseInt(dealId));
  }

  async getTasksByStatus(status) {
    await delay(200);
    return this.tasks.filter(task => task.status === status);
  }
}

export const taskService = new TaskService();