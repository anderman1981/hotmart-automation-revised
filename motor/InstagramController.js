import instagramAgent from './src/agents/InstagramAgent.js';
import managerAgent from './src/agents/ManagerAgent.js';
import 'dotenv/config';

class InstagramController {
    constructor() {
        this.isActive = false;
        this.postingQueue = [];
        this.processing = false;
    }

    async activate() {
        console.log('🚀 Activating Instagram Agent...');
        
        try {
            // Login to Instagram
            const loginResult = await instagramAgent.login();
            if (loginResult.status !== 'success') {
                throw new Error(`Login failed: ${loginResult.message}`);
            }
            
            this.isActive = true;
            console.log('✅ Instagram Agent Activated Successfully!');
            
            return { status: 'success', message: 'Instagram Agent is now active' };
            
        } catch (error) {
            console.error('❌ Failed to activate Instagram Agent:', error.message);
            return { status: 'failed', message: error.message };
        }
    }

    async deactivate() {
        console.log('🛑 Deactivating Instagram Agent...');
        
        try {
            await instagramAgent.close();
            this.isActive = false;
            this.postingQueue = [];
            
            console.log('✅ Instagram Agent Deactivated!');
            return { status: 'success', message: 'Instagram Agent is now inactive' };
            
        } catch (error) {
            console.error('❌ Failed to deactivate Instagram Agent:', error.message);
            return { status: 'failed', message: error.message };
        }
    }

    async schedulePost(content, mediaPath = null, priority = 'normal') {
        const post = {
            id: Date.now() + Math.random(),
            content,
            mediaPath,
            priority,
            scheduledAt: new Date(),
            status: 'queued'
        };
        
        this.postingQueue.push(post);
        
        // Sort by priority (high first)
        this.postingQueue.sort((a, b) => {
            const priorityOrder = { high: 0, normal: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        console.log(`📝 Post scheduled (Queue: ${this.postingQueue.length})`);
        
        if (!this.processing) {
            this.processQueue();
        }
        
        return { status: 'scheduled', postId: post.id };
    }

    async processQueue() {
        if (this.processing || this.postingQueue.length === 0 || !this.isActive) {
            return;
        }
        
        this.processing = true;
        console.log('🔄 Processing Instagram posting queue...');
        
        try {
            while (this.postingQueue.length > 0) {
                const post = this.postingQueue.shift();
                post.status = 'processing';
                
                console.log(`📸 Publishing post ${post.id}...`);
                
                try {
                    const result = await instagramAgent.publishContent(post.content, post.mediaPath);
                    
                    if (result.status === 'success') {
                        post.status = 'completed';
                        post.completedAt = new Date();
                        console.log(`✅ Post ${post.id} published successfully!`);
                        
                        // Notify manager
                        await managerAgent.notifyN8N('instagram_post_completed', {
                            postId: post.id,
                            content: post.content,
                            timestamp: post.completedAt
                        });
                    } else {
                        post.status = 'failed';
                        post.error = result.message;
                        console.error(`❌ Post ${post.id} failed: ${result.message}`);
                    }
                    
                } catch (error) {
                    post.status = 'failed';
                    post.error = error.message;
                    console.error(`❌ Post ${post.id} error: ${error.message}`);
                }
                
                // Wait between posts to avoid rate limiting
                if (this.postingQueue.length > 0) {
                    console.log('⏳ Waiting 30 seconds before next post...');
                    await new Promise(r => setTimeout(r, 30000));
                }
            }
            
        } catch (error) {
            console.error('❌ Queue processing error:', error.message);
        } finally {
            this.processing = false;
        }
    }

    getStatus() {
        return {
            active: this.isActive,
            processing: this.processing,
            queueLength: this.postingQueue.length,
            queuedPosts: this.postingQueue.filter(p => p.status === 'queued'),
            processingPosts: this.postingQueue.filter(p => p.status === 'processing'),
            completedPosts: this.postingQueue.filter(p => p.status === 'completed'),
            failedPosts: this.postingQueue.filter(p => p.status === 'failed')
        };
    }
}

export default new InstagramController();