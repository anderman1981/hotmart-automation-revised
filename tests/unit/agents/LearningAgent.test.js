import { jest } from '@jest/globals';
import LearningAgent from '../../../motor/src/agents/LearningAgent.js';

describe('LearningAgent', () => {
  let learningAgent;
  let mockPool;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    };
    learningAgent = new LearningAgent(mockPool);
  });

  describe('init', () => {
    it('should initialize successfully', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      await expect(learningAgent.init()).resolves.not.toThrow();
      expect(learningAgent.status).toBe('active');
    });

    it('should set up learning parameters', async () => {
      await learningAgent.init();
      
      expect(learningAgent.learningRate).toBeGreaterThan(0);
      expect(learningAgent.modelType).toBeDefined();
    });
  });

  describe('ingest', () => {
    it('should ingest and process content', async () => {
      const content = 'This is test content for learning';
      const source = 'Test Source';

      const result = await learningAgent.ingest(content, source);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('knowledge_id');
      expect(result).toHaveProperty('processed_at');
      expect(result.source).toBe(source);
    });

    it('should extract key concepts from content', async () => {
      const content = 'Machine learning is a subset of artificial intelligence';
      
      const result = await learningAgent.ingest(content, 'AI Tutorial');
      
      expect(result.extracted_concepts).toContain('machine learning');
      expect(result.extracted_concepts).toContain('artificial intelligence');
    });

    it('should handle empty content gracefully', async () => {
      const result = await learningAgent.ingest('', 'Empty Test');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });
  });

  describe('scrapeAndLearn', () => {
    it('should scrape content from URL and learn from it', async () => {
      const testUrl = 'https://example.com/learn';
      
      // Mock fetch for URL content
      global.fetch = jest.fn(() =>
        Promise.resolve({
          text: () => Promise.resolve('<html><body>Machine learning tutorial content</body></html>')
        })
      );

      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await learningAgent.scrapeAndLearn(testUrl);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('source', testUrl);
      expect(result).toHaveProperty('content');
      expect(result.content.length).toBeGreaterThan(0);
    });

    it('should handle invalid URLs', async () => {
      const invalidUrl = 'not-a-valid-url';
      
      const result = await learningAgent.scrapeAndLearn(invalidUrl);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('invalid URL');
    });
  });

  describe('learnFromAcademy', () => {
    it('should search and learn from academic sources', async () => {
      const topic = 'neural networks';
      
      const results = await learningAgent.learnFromAcademy(topic);
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('summary');
      expect(results[0]).toHaveProperty('relevance_score');
    });

    it('should prioritize relevant sources', async () => {
      const topic = 'blockchain technology';
      
      const results = await learningAgent.learnFromAcademy(topic);
      
      results.forEach(result => {
        expect(result.relevance_score).toBeGreaterThanOrEqual(0);
        expect(result.relevance_score).toBeLessThanOrEqual(1);
      });

      // Results should be sorted by relevance
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].relevance_score).toBeGreaterThanOrEqual(results[i].relevance_score);
      }
    });
  });

  describe('digestNotebook', () => {
    it('should process Jupyter notebook content', async () => {
      const notebookUrl = 'https://example.com/notebook.ipynb';
      
      const result = await learningAgent.digestNotebook(notebookUrl);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('cells_processed');
      expect(result).toHaveProperty('extracted_code');
      expect(result).toHaveProperty('extracted_text');
      expect(result.cells_processed).toBeGreaterThan(0);
    });

    it('should extract code and markdown separately', async () => {
      const notebookUrl = 'https://example.com/analysis.ipynb';
      
      const result = await learningAgent.digestNotebook(notebookUrl);
      
      expect(result.extracted_code).toBeInstanceOf(Array);
      expect(result.extracted_text).toBeInstanceOf(Array);
      
      if (result.extracted_code.length > 0) {
        expect(typeof result.extracted_code[0]).toBe('string');
      }
    });
  });

  describe('updateKnowledge', () => {
    it('should update existing knowledge with new information', async () => {
      const knowledgeId = 'knowledge_123';
      const newInfo = 'Updated information about the topic';

      mockPool.query.mockResolvedValue({ rows: [{ id: knowledgeId }] });

      const result = await learningAgent.updateKnowledge(knowledgeId, newInfo);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('updated_at');
    });

    it('should handle knowledge conflicts gracefully', async () => {
      const knowledgeId = 'knowledge_conflict';
      const conflictingInfo = 'This contradicts existing knowledge';

      const result = await learningAgent.updateKnowledge(knowledgeId, conflictingInfo);
      
      expect(result).toHaveProperty('conflict_detected', true);
      expect(result).toHaveProperty('resolution_strategy');
    });
  });

  describe('queryKnowledge', () => {
    it('should retrieve relevant knowledge for queries', async () => {
      const query = 'machine learning algorithms';
      
      mockPool.query.mockResolvedValue({
        rows: [
          { content: 'Supervised learning algorithms', relevance: 0.9 },
          { content: 'Unsupervised learning methods', relevance: 0.8 }
        ]
      });

      const results = await learningAgent.queryKnowledge(query);
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('content');
      expect(results[0]).toHaveProperty('relevance');
    });

    it('should handle empty results gracefully', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const results = await learningAgent.queryKnowledge('unknown topic');
      
      expect(results).toEqual([]);
    });
  });

  describe('stop', () => {
    it('should save learning state before stopping', async () => {
      const saveStateSpy = jest.spyOn(learningAgent, 'saveState');
      
      await learningAgent.stop();
      
      expect(saveStateSpy).toHaveBeenCalled();
      expect(learningAgent.status).toBe('inactive');
    });
  });
});