#!/usr/bin/env node

import fetch from 'node-fetch';

async function testIntegration() {
    console.log('🧪 Testing Hotmart System Integration...\n');
    
    // 1. Test Ollama
    console.log('1. Testing Ollama...');
    try {
        const ollamaResponse = await fetch('http://localhost:4126/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2',
                prompt: 'Analiza datos de productos hotmart y devuelve insights clave en 3 puntos',
                stream: false
            })
        });
        
        if (ollamaResponse.ok) {
            const ollamaData = await ollamaResponse.json();
            console.log('✅ Ollama OK:', ollamaData.response.slice(0, 100) + '...');
        } else {
            console.log('❌ Ollama Error:', ollamaResponse.status);
        }
    } catch (err) {
        console.log('❌ Ollama Connection Error:', err.message);
    }
    
    // 2. Test Motor API
    console.log('\n2. Testing Motor API...');
    try {
        const motorResponse = await fetch('http://localhost:4123/');
        if (motorResponse.ok) {
            const motorData = await motorResponse.json();
            console.log('✅ Motor OK:', motorData);
        } else {
            console.log('❌ Motor Error:', motorResponse.status);
        }
    } catch (err) {
        console.log('❌ Motor Connection Error:', err.message);
    }
    
    // 3. Test N8N Webhook
    console.log('\n3. Testing N8N Webhook...');
    try {
        const n8nResponse = await fetch('http://localhost:5678/webhook/manager-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                test: true,
                message: 'Integration test',
                timestamp: new Date().toISOString()
            })
        });
        
        if (n8nResponse.ok) {
            console.log('✅ N8N Webhook OK');
        } else {
            const errorData = await n8nResponse.text();
            console.log('❌ N8N Webhook Error:', n8nResponse.status, errorData.slice(0, 100));
        }
    } catch (err) {
        console.log('❌ N8N Connection Error:', err.message);
    }
    
    // 4. Test Database Connection
    console.log('\n4. Testing Database...');
    try {
        const dbResponse = await fetch('http://localhost:4123/api/products');
        if (dbResponse.ok) {
            const products = await dbResponse.json();
            console.log('✅ Database OK - Found', products.length || 0, 'products');
        } else {
            console.log('❌ Database Error:', dbResponse.status);
        }
    } catch (err) {
        console.log('❌ Database Connection Error:', err.message);
    }
    
    // 5. Create Test Analysis Task
    console.log('\n5. Creating Test Analysis Task...');
    try {
        const taskResponse = await fetch('http://localhost:4123/api/agents/manager/task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'analysis',
                payload: {
                    action: 'test_full_integration',
                    use_ollama: true,
                    models: ['llama3.2', 'deepseek-r1']
                }
            })
        });
        
        if (taskResponse.ok) {
            const taskData = await taskResponse.json();
            console.log('✅ Task Created:', taskData);
        } else {
            console.log('❌ Task Creation Error:', taskResponse.status);
        }
    } catch (err) {
        console.log('❌ Task Creation Connection Error:', err.message);
    }
    
    console.log('\n🏁 Integration Test Complete!');
}

testIntegration().catch(console.error);