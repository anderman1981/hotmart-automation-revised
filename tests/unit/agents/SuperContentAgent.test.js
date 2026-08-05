import { jest } from '@jest/globals';
import SuperContentAgent from '../../../motor/src/agents/SuperContentAgent.js';

describe('SuperContentAgent', () => {
  let superContentAgent;
  let mockPool;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    };
    superContentAgent = new SuperContentAgent(mockPool);
  });

  describe('init', () => {
    it('should initialize all content generation modules', async () => {
      await expect(superContentAgent.init()).resolves.not.toThrow();
      expect(superContentAgent.status).toBe('ready');
      expect(superContentAgent.modules).toHaveProperty('instagram');
      expect(superContentAgent.modules).toHaveProperty('tiktok');
      expect(superContentAgent.modules).toHaveProperty('email');
    });

    it('should load content templates', async () => {
      await superContentAgent.init();
      
      expect(superContentAgent.templates.size).toBeGreaterThan(0);
      expect(Array.from(superContentAgent.templates.keys())).toContain('instagram_post');
      expect(Array.from(superContentAgent.templates.keys())).toContain('tiktok_script');
    });
  });

  describe('generateContent', () => {
    it('should generate content for Instagram platform', async () => {
      const request = {
        platform: 'instagram',
        product: {
          name: 'AI Masterclass',
          niche: 'Technology',
          description: 'Learn artificial intelligence'
        },
        contentType: 'post'
      };

      const content = await superContentAgent.generateContent(request);
      
      expect(content).toHaveProperty('platform', 'instagram');
      expect(content).toHaveProperty('content');
      expect(content).toHaveProperty('hashtags');
      expect(content).toHaveProperty('callToAction');
      expect(content.content).toContain(request.product.name);
      expect(content.hashtags.length).toBeGreaterThan(0);
    });

    it('should generate content for TikTok platform', async () => {
      const request = {
        platform: 'tiktok',
        product: {
          name: 'Fitness Revolution',
          niche: 'Health & Fitness'
        },
        contentType: 'video'
      };

      const content = await superContentAgent.generateContent(request);
      
      expect(content).toHaveProperty('platform', 'tiktok');
      expect(content).toHaveProperty('script');
      expect(content).toHaveProperty('duration');
      expect(content).toHaveProperty('visual_effects');
      expect(content.duration).toBeGreaterThan(0);
      expect(content.script.split(' ').length).toBeGreaterThan(10); // Minimum script length
    });

    it('should generate email campaigns', async () => {
      const request = {
        platform: 'email',
        product: {
          name: 'Trading Course',
          niche: 'Finance'
        },
        contentType: 'campaign'
      };

      const content = await superContentAgent.generateContent(request);
      
      expect(content).toHaveProperty('platform', 'email');
      expect(content).toHaveProperty('subject');
      expect(content).toHaveProperty('body');
      expect(content).toHaveProperty('cta_button');
      expect(content.subject.length).toBeGreaterThan(0);
      expect(content.body.length).toBeGreaterThan(50);
      expect(content.cta_button).toBeDefined();
    });

    it('should adapt content tone based on niche', async () => {
      const techRequest = {
        platform: 'instagram',
        product: { name: 'Tech Course', niche: 'Technology' },
        contentType: 'post'
      };

      const fitnessRequest = {
        platform: 'instagram',
        product: { name: 'Fitness Course', niche: 'Health & Fitness' },
        contentType: 'post'
      };

      const techContent = await superContentAgent.generateContent(techRequest);
      const fitnessContent = await superContentAgent.generateContent(fitnessRequest);

      expect(techContent.tone).not.toBe(fitnessContent.tone);
      expect(techContent.hashtags).not.toEqual(fitnessContent.hashtags);
    });
  });

  describe('optimizeContent', () => {
    it('should optimize content for better engagement', async () => {
      const originalContent = {
        platform: 'instagram',
        content: 'Simple post caption',
        hashtags: ['#general'],
        engagement_score: 0.3
      };

      const optimized = await superContentAgent.optimizeContent(originalContent);
      
      expect(optimized).toHaveProperty('content');
      expect(optimized).toHaveProperty('hashtags');
      expect(optimized).toHaveProperty('engagement_score');
      expect(optimized.engagement_score).toBeGreaterThan(originalContent.engagement_score);
      expect(optimized.optimization_suggestions).toBeDefined();
    });

    it('should provide A/B testing suggestions', async () => {
      const content = {
        platform: 'instagram',
        content: 'Test caption',
        hashtags: ['#test']
      };

      const abTest = await superContentAgent.generateABTest(content);
      
      expect(abTest).toHaveProperty('variant_a');
      expect(abTest).toHaveProperty('variant_b');
      expect(abTest).toHaveProperty('test_duration');
      expect(abTest.variant_a).not.toBe(abTest.variant_b);
    });
  });

  describe('scheduleContent', () => {
    it('should determine optimal posting times', async () => {
      const platform = 'instagram';
      const timezone = 'America/New_York';

      const schedule = await superContentAgent.getOptimalSchedule(platform, timezone);
      
      expect(schedule).toHaveProperty('best_times');
      expect(schedule).toHaveProperty('frequency');
      expect(schedule.best_times).toBeInstanceOf(Array);
      expect(schedule.best_times.length).toBeGreaterThan(0);
      expect(schedule.frequency).toBeGreaterThan(0);
    });

    it('should create content calendar', async () => {
      const products = [
        { name: 'Course 1', niche: 'Technology' },
        { name: 'Course 2', niche: 'Health & Fitness' }
      ];
      const duration = 7; // days

      const calendar = await superContentAgent.createContentCalendar(products, duration);
      
      expect(calendar).toHaveProperty('posts');
      expect(calendar.posts).toBeInstanceOf(Array);
      expect(calendar.posts.length).toBeGreaterThan(0);
      expect(calendar.posts[0]).toHaveProperty('date');
      expect(calendar.posts[0]).toHaveProperty('platform');
      expect(calendar.posts[0]).toHaveProperty('content');
    });
  });

  describe('analyzePerformance', () => {
    it('should analyze content performance metrics', async () => {
      const contentId = 'content_123';
      
      mockPool.query.mockResolvedValue({
        rows: [{
          views: 1000,
          likes: 50,
          shares: 10,
          comments: 5,
          clicks: 25,
          conversions: 2
        }]
      });

      const analysis = await superContentAgent.analyzePerformance(contentId);
      
      expect(analysis).toHaveProperty('engagement_rate');
      expect(analysis).toHaveProperty('conversion_rate');
      expect(analysis).toHaveProperty('performance_score');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis.engagement_rate).toBeGreaterThan(0);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    it('should compare performance across platforms', async () => {
      const contentIds = ['ig_123', 'tiktok_456', 'email_789'];
      
      mockPool.query.mockResolvedValue({
        rows: [
          { content_id: 'ig_123', platform: 'instagram', performance_score: 75 },
          { content_id: 'tiktok_456', platform: 'tiktok', performance_score: 82 },
          { content_id: 'email_789', platform: 'email', performance_score: 68 }
        ]
      });

      const comparison = await superContentAgent.comparePlatformPerformance(contentIds);
      
      expect(comparison).toHaveProperty('platform_ranking');
      expect(comparison).toHaveProperty('best_performing');
      expect(comparison).toHaveProperty('insights');
      expect(comparison.platform_ranking.length).toBe(3);
      expect(comparison.best_performing.platform).toBe('tiktok');
    });
  });

  describe('batchGeneration', () => {
    it('should generate content for multiple platforms simultaneously', async () => {
      const request = {
        product: {
          name: 'Marketing Masterclass',
          niche: 'Marketing',
          description: 'Complete marketing course'
        },
        platforms: ['instagram', 'tiktok', 'email'],
        contentTypes: ['post', 'video', 'campaign']
      };

      const batch = await superContentAgent.batchGenerate(request);
      
      expect(batch).toHaveProperty('generated_content');
      expect(batch.generated_content).toBeInstanceOf(Array);
      expect(batch.generated_content.length).toBe(3); // One for each platform
      
      batch.generated_content.forEach(content => {
        expect(['instagram', 'tiktok', 'email']).toContain(content.platform);
      });
    });

    it('should maintain brand consistency across platforms', async () => {
      const request = {
        product: {
          name: 'Brand Academy',
          niche: 'Business',
          brandVoice: 'professional'
        },
        platforms: ['instagram', 'email'],
        contentTypes: ['post', 'campaign']
      };

      const batch = await superContentAgent.batchGenerate(request);
      
      const instagramContent = batch.generated_content.find(c => c.platform === 'instagram');
      const emailContent = batch.generated_content.find(c => c.platform === 'email');
      
      expect(instagramContent.brandVoice).toBe(emailContent.brandVoice);
      expect(instagramContent.messaging_consistency).toBeGreaterThan(0.8);
    });
  });

  describe('errorHandling', () => {
    it('should handle unsupported platforms gracefully', async () => {
      const request = {
        platform: 'unsupported_platform',
        product: { name: 'Test Product' },
        contentType: 'post'
      };

      const result = await superContentAgent.generateContent(request);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('unsupported platform');
    });

    it('should handle invalid product data', async () => {
      const request = {
        platform: 'instagram',
        product: {}, // Empty product data
        contentType: 'post'
      };

      const result = await superContentAgent.generateContent(request);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('product data required');
    });
  });

  describe('stop', () => {
    it('should stop gracefully and save state', async () => {
      const saveStateSpy = jest.spyOn(superContentAgent, 'saveState');
      
      await superContentAgent.stop();
      
      expect(saveStateSpy).toHaveBeenCalled();
      expect(superContentAgent.status).toBe('inactive');
    });
  });
});