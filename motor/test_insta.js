import instagramAgent from './src/agents/InstagramAgent.js';
import fs from 'fs';

(async () => {
    console.log('🧪 Testing Instagram Login...');
    try {
        console.log('ENV CHECK:', {
            USER: process.env.INSTAGRAM_USER ? 'SET' : 'MISSING',
            PASS: process.env.INSTAGRAM_PASSWORD ? 'SET' : 'MISSING',
            PUPPETEER_EXEC: process.env.PUPPETEER_EXECUTABLE_PATH
        });

        // Initialize manually to ensure browser is ready
        await instagramAgent.init();
        
        console.log('📸 Navigating...');
        await instagramAgent.page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
        
        // Take pre-login screenshot
        await instagramAgent.page.screenshot({ path: 'debug_pre_login.png' });
        console.log('📸 Screenshot saved: debug_pre_login.png');
        
        // Debug HTML
        const content = await instagramAgent.page.content();
        fs.writeFileSync('debug_page.html', content);
        console.log('📄 HTML saved: debug_page.html');

        // Try standard login logic
        const result = await instagramAgent.login();
        console.log('Result:', result);
        
        await instagramAgent.page.screenshot({ path: 'debug_post_login.png' });
        
        if (result.status === 'success') {
            console.log('✅ LOGIN SUCCESSFUL');
        } else {
            console.error('❌ LOGIN FAILED');
        }
        
        await instagramAgent.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ CRITICAL ERROR:', error);
        if (instagramAgent.page) {
             await instagramAgent.page.screenshot({ path: 'debug_error.png' });
        }
        process.exit(1);
    }
})();
