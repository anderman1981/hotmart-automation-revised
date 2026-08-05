import instagramAgent from './src/agents/InstagramAgent.js';
import 'dotenv/config';

async function testInstagramAgent() {
    console.log('🧪 Testing Instagram Agent...');
    
    try {
        // Test 1: Login
        console.log('\n📸 Test 1: Login...');
        const loginResult = await instagramAgent.login();
        console.log('Login Result:', loginResult);
        
        if (loginResult.status !== 'success') {
            console.error('❌ Login failed. Cannot continue testing.');
            await instagramAgent.close();
            return;
        }
        
        // Test 2: Get Profile Stats
        console.log('\n📸 Test 2: Get Profile Stats...');
        const stats = await instagramAgent.getProfileStats();
        console.log('Profile Stats:', stats);
        
        // Test 3: Publish Content (Simulation mode)
        console.log('\n📸 Test 3: Publishing Test Content...');
        const testContent = `🚀 Test desde HotMart Automation - ${new Date().toLocaleString()}\n\nEsta es una publicación de prueba para validar el sistema automatizado. #Automation #HotMart #Test`;
        
        const publishResult = await instagramAgent.publishContent(testContent);
        console.log('Publish Result:', publishResult);
        
        // Test 4: Cleanup
        console.log('\n📸 Test 4: Cleanup...');
        await instagramAgent.close();
        
        console.log('\n✅ Instagram Agent Tests Completed!');
        
    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        await instagramAgent.close();
    }
}

// Check if Instagram credentials are configured
if (!process.env.INSTAGRAM_USER || !process.env.INSTAGRAM_PASSWORD) {
    console.error('❌ Instagram credentials not configured. Please set INSTAGRAM_USER and INSTAGRAM_PASSWORD in .env file');
    process.exit(1);
}

// Run tests
testInstagramAgent();