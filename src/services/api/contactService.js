import contactsData from "@/services/mockData/contacts.json";
import { activityService } from "@/services/api/activityService";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ContactService {
  constructor() {
    this.contacts = [...contactsData];
  }

  async getAll() {
    await delay(300);
    return [...this.contacts];
  }

  async getById(id) {
    await delay(200);
    const contact = this.contacts.find(c => c.Id === parseInt(id));
    if (!contact) {
      throw new Error("Contact not found");
    }
    return { ...contact };
  }

  async create(contactData) {
    await delay(400);
    
    const maxId = this.contacts.length > 0 
      ? Math.max(...this.contacts.map(c => c.Id)) 
      : 0;
    
    const newContact = {
      Id: maxId + 1,
      ...contactData,
      lastContactDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.contacts.unshift(newContact);
    return { ...newContact };
  }

  async update(id, updateData) {
    await delay(350);
    
    const index = this.contacts.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Contact not found");
    }
    
this.contacts[index] = {
      ...this.contacts[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Generate activity for contact update
    const contact = this.contacts[index];
    const changesList = Object.keys(updateData).filter(key => key !== 'updatedAt');
    if (changesList.length > 0) {
      activityService.createContactUpdatedActivity(
        contact.Id,
        contact.name,
        changesList
      ).catch(console.error); // Don't block on activity creation failure
    }
    
    return { ...this.contacts[index] };
  }

  async delete(id) {
    await delay(250);
    
    const index = this.contacts.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Contact not found");
    }
    
    const deletedContact = this.contacts.splice(index, 1)[0];
    return { ...deletedContact };
  }
}

export const contactService = new ContactService();