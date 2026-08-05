import 'dotenv/config';
import { jest } from '@jest/globals';

// Mock database connections
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }))
}));

// Mock Redis
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    on: jest.fn(),
    isOpen: true
  }))
}));

// Puppeteer mock
jest.mock('puppeteer-core', () => ({
  launch: jest.fn(() => ({
    newPage: jest.fn(() => ({
      goto: jest.fn(),
      screenshot: jest.fn(),
      evaluate: jest.fn(),
      close: jest.fn()
    })),
    close: jest.fn()
  }))
}));

// Ollama mock
jest.mock('ollama', () => ({
  chat: jest.fn(() => Promise.resolve({
    message: { content: 'Mocked AI response' }
  }))
}));

// Global test utilities
global.testUtils = {
  mockProduct: {
    hotmart_id: 'HM-TEST123',
    name: 'Test Product',
    niche: 'Technology',
    url_sales_page: 'https://pay.hotmart.com/RTEST123'
  },
  mockAgent: {
    name: 'TestAgent',
    status: 'active',
    last_activity: new Date().toISOString()
  },
  createMockResponse: (data = {}) => ({
    status: 'success',
    data,
    timestamp: new Date().toISOString()
  })
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'test_hotmart';
process.env.REDIS_HOST = 'localhost';
process.env.OLLAMA_HOST = 'http://localhost:11434';