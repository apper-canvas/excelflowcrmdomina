import quotesData from "@/services/mockData/quotes.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class QuoteService {
  constructor() {
    this.quotes = [...quotesData];
  }

  async getAll() {
    await delay(300);
    return [...this.quotes];
  }

  async getById(id) {
    await delay(200);
    const quote = this.quotes.find(q => q.Id === parseInt(id));
    if (!quote) {
      throw new Error("Quote not found");
    }
    return { ...quote };
  }

  async create(quoteData) {
    await delay(400);
    
    const maxId = this.quotes.length > 0 
      ? Math.max(...this.quotes.map(q => q.Id)) 
      : 0;
    
    const newQuote = {
      Id: maxId + 1,
      ...quoteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.quotes.unshift(newQuote);
    return { ...newQuote };
  }

  async update(id, updateData) {
    await delay(350);
    
    const index = this.quotes.findIndex(q => q.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Quote not found");
    }
    
    this.quotes[index] = {
      ...this.quotes[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.quotes[index] };
  }

  async delete(id) {
    await delay(250);
    
    const index = this.quotes.findIndex(q => q.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Quote not found");
    }
    
    const deletedQuote = this.quotes.splice(index, 1)[0];
    return { ...deletedQuote };
  }

  async updateStatus(id, status) {
    await delay(200);
    
    const index = this.quotes.findIndex(q => q.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Quote not found");
    }
    
    this.quotes[index] = {
      ...this.quotes[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.quotes[index] };
  }
}

export const quoteService = new QuoteService();