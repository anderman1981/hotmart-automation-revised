#!/usr/bin/env node

import instagramController from './InstagramController.js';
import 'dotenv/config';

const commands = {
    activate: async () => {
        console.log('🔧 Command: Activate Instagram Agent');
        const result = await instagramController.activate();
        console.log('Result:', result);
    },
    
    deactivate: async () => {
        console.log('🔧 Command: Deactivate Instagram Agent');
        const result = await instagramController.deactivate();
        console.log('Result:', result);
    },
    
    status: async () => {
        console.log('🔧 Command: Get Instagram Agent Status');
        const status = instagramController.getStatus();
        console.log('Status:', JSON.stringify(status, null, 2));
    },
    
    post: async (content) => {
        console.log('🔧 Command: Schedule Instagram Post');
        const result = await instagramController.schedulePost(content);
        console.log('Result:', result);
    },
    
    'test-post': async () => {
        console.log('🔧 Command: Schedule Test Post');
        const testContent = `🤖 Test desde HotMart Automation - ${new Date().toLocaleString()}\n\nEsta es una publicación de prueba automatizada. #HotMart #Automation #Test`;
        const result = await instagramController.schedulePost(testContent);
        console.log('Result:', result);
    },
    
    help: () => {
        console.log(`
📸 Instagram Controller Commands:
  
  activate           - Activate Instagram Agent and login
  deactivate         - Deactivate Instagram Agent and logout
  status            - Show current status and queue
  post <content>    - Schedule a post with custom content
  test-post         - Schedule a test post
  help              - Show this help message

Usage Examples:
  node instagram-cli.js activate
  node instagram-cli.js post "Hello Instagram! #HotMart"
  node instagram-cli.js test-post
  node instagram-cli.js status
  node instagram-cli.js deactivate
        `);
    }
};

async function main() {
    const [,, command, ...args] = process.argv;
    
    if (!command || command === 'help') {
        commands.help();
        return;
    }
    
    if (!commands[command]) {
        console.error(`❌ Unknown command: ${command}`);
        commands.help();
        process.exit(1);
    }
    
    // Check Instagram credentials
    if (command !== 'help' && (!process.env.INSTAGRAM_USER || !process.env.INSTAGRAM_PASSWORD)) {
        console.error('❌ Instagram credentials not configured. Please set INSTAGRAM_USER and INSTAGRAM_PASSWORD in .env file');
        process.exit(1);
    }
    
    try {
        await commands[command](args.join(' '));
    } catch (error) {
        console.error('❌ Command failed:', error.message);
        process.exit(1);
    }
}

main();