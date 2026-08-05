#!/usr/bin/env node

/**
 * Production Smoke Test Script
 * Tests critical functionality after deployment
 */

const http = require('http');
const https = require('https');

const tests = [
  {
    name: 'API Health Check',
    url: process.env.API_URL || 'https://api.hotmart.com/health',
    timeout: 10000
  },
  {
    name: 'Dashboard Health Check',
    url: process.env.DASHBOARD_URL || 'https://dashboard.hotmart.com',
    timeout: 10000
  },
  {
    name: 'API Endpoint Test',
    url: process.env.API_URL || 'https://api.hotmart.com/api/status',
    timeout: 15000
  }
];

function makeRequest(url, timeout) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        resolve({
          statusCode: res.statusCode,
          responseTime: endTime - startTime,
          data: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
  });
}

async function runSmokeTests() {
  console.log('🚀 Running production smoke tests...');
  
  const results = [];
  let allPassed = true;
  
  for (const test of tests) {
    try {
      console.log(`\n📍 Testing: ${test.name}`);
      const result = await makeRequest(test.url, test.timeout);
      
      if (result.statusCode >= 200 && result.statusCode < 300) {
        console.log(`✅ ${test.name} - OK (${result.responseTime}ms)`);
        results.push({
          name: test.name,
          status: 'PASS',
          statusCode: result.statusCode,
          responseTime: result.responseTime
        });
      } else {
        console.log(`❌ ${test.name} - FAILED (Status: ${result.statusCode})`);
        results.push({
          name: test.name,
          status: 'FAIL',
          statusCode: result.statusCode,
          responseTime: result.responseTime
        });
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
      results.push({
        name: test.name,
        status: 'ERROR',
        error: error.message
      });
      allPassed = false;
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  results.forEach(result => {
    console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.name}: ${result.status} ${result.statusCode ? `(${result.statusCode})` : ''} ${result.responseTime ? `(${result.responseTime}ms)` : ''}`);
  });
  
  if (allPassed) {
    console.log('\n🎉 All smoke tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some smoke tests failed!');
    process.exit(1);
  }
}

runSmokeTests().catch(error => {
  console.error('Smoke test execution failed:', error);
  process.exit(1);
});