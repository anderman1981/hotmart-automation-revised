import { jest } from '@jest/globals';
import ManagerAgent from '../../../motor/src/agents/ManagerAgent.js';

describe('ManagerAgent', () => {
  let managerAgent;
  let mockPool;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    };
    managerAgent = new ManagerAgent(mockPool);
  });

  describe('init', () => {
    it('should initialize successfully', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      await expect(managerAgent.init()).resolves.not.toThrow();
      expect(managerAgent.status).toBe('active');
    });

    it('should handle initialization errors', async () => {
      mockPool.query.mockRejectedValue(new Error('DB Error'));
      
      await expect(managerAgent.init()).rejects.toThrow('DB Error');
    });
  });

  describe('wakeAgent', () => {
    it('should wake up a valid agent', async () => {
      const result = await managerAgent.wakeAgent('InstagramAgent');
      expect(result).toBe(true);
    });

    it('should return false for invalid agent', async () => {
      const result = await managerAgent.wakeAgent('InvalidAgent');
      expect(result).toBe(false);
    });
  });

  describe('assignTask', () => {
    it('should assign task to appropriate agent', async () => {
      const task = {
        type: 'content_generation',
        payload: { productName: 'Test Product' }
      };

      mockPool.query.mockResolvedValue({ rows: [] });
      
      const result = await managerAgent.assignTask(task.type, task.payload);
      expect(result.status).toBe('assigned');
    });

    it('should handle unknown task types', async () => {
      const result = await managerAgent.assignTask('unknown_task', {});
      expect(result.status).toBe('failed');
      expect(result.error).toContain('Unknown task type');
    });
  });

  describe('summarizeLatestKnowledge', () => {
    it('should generate knowledge summary', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ agent_name: 'LearningAgent', knowledge_count: 10 }] })
        .mockResolvedValueOnce({ rows: [{ content: 'Test knowledge' }] });

      const summary = await managerAgent.summarizeLatestKnowledge();
      
      expect(summary).toHaveProperty('total_agents');
      expect(summary).toHaveProperty('knowledge_summary');
      expect(summary.total_agents).toBeGreaterThan(0);
    });
  });

  describe('monitorSystemHealth', () => {
    it('should check system health metrics', async () => {
      mockPool.query.mockResolvedValue({
        rows: [
          { agent_name: 'InstagramAgent', status: 'active' },
          { agent_name: 'LearningAgent', status: 'active' }
        ]
      });

      const health = await managerAgent.monitorSystemHealth();
      
      expect(health).toHaveProperty('overall_status');
      expect(health).toHaveProperty('active_agents');
      expect(health).toHaveProperty('issues');
      expect(health.overall_status).toBe('healthy');
    });

    it('should detect system issues', async () => {
      mockPool.query.mockResolvedValue({
        rows: [
          { agent_name: 'InstagramAgent', status: 'error' },
          { agent_name: 'LearningAgent', status: 'active' }
        ]
      });

      const health = await managerAgent.monitorSystemHealth();
      
      expect(health.overall_status).toBe('warning');
      expect(health.issues.length).toBeGreaterThan(0);
    });
  });
});