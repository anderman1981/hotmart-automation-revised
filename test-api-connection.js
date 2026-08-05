// Test script to verify API connection
const API_BASE = 'http://localhost:4123';

async function testConnection() {
    console.log('🚀 Testing API Connection...\n');
    
    // Test 1: Health check
    try {
        console.log('1. Testing /health endpoint...');
        const health = await fetch(`${API_BASE}/health`);
        const healthData = await health.json();
        console.log('✅ Health:', healthData);
    } catch (error) {
        console.log('❌ Health failed:', error.message);
        return;
    }
    
    // Test 2: Stats
    try {
        console.log('\n2. Testing /api/stats endpoint...');
        const stats = await fetch(`${API_BASE}/api/stats`);
        const statsData = await stats.json();
        console.log('✅ Stats:', statsData);
    } catch (error) {
        console.log('❌ Stats failed:', error.message);
    }
    
    // Test 3: Super-Agents Status
    try {
        console.log('\n3. Testing /api/super-agents/status endpoint...');
        const agents = await fetch(`${API_BASE}/api/super-agents/status`);
        const agentsData = await agents.json();
        console.log('✅ Super-Agents:', agentsData);
        
        console.log('\n📊 Super-Agents Details:');
        agentsData.super_agents?.forEach((agent, index) => {
            console.log(`  ${index + 1}. ${agent.name}: ${agent.status}`);
            console.log(`     Description: ${agent.description}`);
            console.log(`     Capabilities: ${agent.capabilities?.join(', ')}`);
        });
        
        console.log(`\n🤖 LLM Status: ${agentsData.llm_status}`);
        console.log(`📦 Available Models: ${agentsData.llm_models?.join(', ') || 'None'}`);
        
    } catch (error) {
        console.log('❌ Super-Agents failed:', error.message);
    }
    
    // Test 4: Products
    try {
        console.log('\n4. Testing /api/products endpoint...');
        const products = await fetch(`${API_BASE}/api/products`);
        const productsData = await products.json();
        const productCount = Array.isArray(productsData) ? productsData.length : productsData.products?.length || 0;
        console.log(`✅ Products: Found ${productCount} products`);
    } catch (error) {
        console.log('❌ Products failed:', error.message);
    }
    
    console.log('\n🎉 API Connection Test Complete!');
}

testConnection();