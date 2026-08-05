import { jest } from '@jest/globals';
import InstagramAgent from '../../../motor/src/agents/InstagramAgent.js';

describe('InstagramAgent', () => {
  let instagramAgent;
  let mockPool;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    };
    instagramAgent = new InstagramAgent(mockPool);
  });

  describe('init', () => {
    it('should initialize with credentials', async () => {
      process.env.INSTAGRAM_USERNAME = 'test_user';
      process.env.INSTAGRAM_PASSWORD = 'test_pass';

      mockPool.query.mockResolvedValue({ rows: [] });
      
      await expect(instagramAgent.init()).resolves.not.toThrow();
      expect(instagramAgent.status).toBe('active');
    });

    it('should fail initialization without credentials', async () => {
      delete process.env.INSTAGRAM_USERNAME;
      
      await expect(instagramAgent.init()).rejects.toThrow();
    });
  });

  describe('generatePost', () => {
    it('should generate Instagram post content', async () => {
      const product = {
        name: 'Test Course',
        niche: 'Technology',
        description: 'Learn programming'
      };

      const post = await instagramAgent.generatePost(product);
      
      expect(post).toHaveProperty('caption');
      expect(post).toHaveProperty('hashtags');
      expect(post).toHaveProperty('call_to_action');
      expect(post.caption).toContain(product.name);
      expect(post.hashtags.length).toBeGreaterThan(0);
    });

    it('should adapt content for different niches', async () => {
      const techProduct = { name: 'Tech Course', niche: 'Technology' };
      const fitnessProduct = { name: 'Fitness Course', niche: 'Health & Fitness' };

      const techPost = await instagramAgent.generatePost(techProduct);
      const fitnessPost = await instagramAgent.generatePost(fitnessProduct);

      expect(techPost.caption).not.toBe(fitnessPost.caption);
      expect(techPost.hashtags).not.toEqual(fitnessPost.hashtags);
    });
  });

  describe('schedulePost', () => {
    it('should schedule post for optimal time', async () => {
      const post = {
        caption: 'Test caption',
        hashtags: ['#test', '#post'],
        media_url: 'https://example.com/image.jpg'
      };

      const scheduledTime = await instagramAgent.schedulePost(post);
      
      expect(scheduledTime).toBeInstanceOf(Date);
      expect(scheduledTime.getTime()).toBeGreaterThan(Date.now());
    });

    it('should calculate optimal posting time', () => {
      const optimalTime = instagramAgent.calculateOptimalPostingTime();
      
      expect(optimalTime).toHaveProperty('hour');
      expect(optimalTime).toHaveProperty('day');
      expect(optimalTime.hour).toBeGreaterThanOrEqual(6);
      expect(optimalTime.hour).toBeLessThanOrEqual(22);
    });
  });

  describe('analyzeEngagement', () => {
    it('should analyze post engagement metrics', async () => {
      const postId = 'test_post_123';
      
      mockPool.query.mockResolvedValue({
        rows: [{
          likes: 150,
          comments: 25,
          shares: 10,
          saves: 30,
          reach: 1000,
          impressions: 2000
        }]
      });

      const analysis = await instagramAgent.analyzeEngagement(postId);
      
      expect(analysis).toHaveProperty('engagement_rate');
      expect(analysis).toHaveProperty('performance_score');
      expect(analysis.engagement_rate).toBeGreaterThan(0);
      expect(analysis.performance_score).toBeGreaterThanOrEqual(0);
      expect(analysis.performance_score).toBeLessThanOrEqual(100);
    });

    it('should handle missing engagement data', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const analysis = await instagramAgent.analyzeEngagement('nonexistent_post');
      
      expect(analysis).toHaveProperty('engagement_rate', 0);
      expect(analysis).toHaveProperty('performance_score', 0);
    });
  });

  describe('getContentStrategy', () => {
    it('should generate content strategy based on niche', async () => {
      const niche = 'Technology';
      const strategy = await instagramAgent.getContentStrategy(niche);
      
      expect(strategy).toHaveProperty('content_pillars');
      expect(strategy).toHaveProperty('posting_frequency');
      expect(strategy).toHaveProperty('best_times');
      expect(strategy).toHaveProperty('hashtag_groups');
      expect(strategy.content_pillars.length).toBeGreaterThan(0);
    });

    it('should customize strategy for different niches', async () => {
      const techStrategy = await instagramAgent.getContentStrategy('Technology');
      const fitnessStrategy = await instagramAgent.getContentStrategy('Health & Fitness');
      
      expect(techStrategy.content_pillars).not.toEqual(fitnessStrategy.content_pillars);
      expect(techStrategy.hashtag_groups).not.toEqual(fitnessStrategy.hashtag_groups);
    });
  });

  describe('stop', () => {
    it('should stop agent gracefully', async () => {
      await expect(instagramAgent.stop()).resolves.not.toThrow();
      expect(instagramAgent.status).toBe('inactive');
    });
  });
});