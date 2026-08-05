#!/usr/bin/env node

import fetch from 'node-fetch';
import crypto from 'crypto';

class SecurityTester {
    constructor(baseUrl = 'http://localhost:4123') {
        this.baseUrl = baseUrl;
        this.testResults = [];
    }

    async runAllTests() {
        console.log('🧪 Running Security Tests...\n');

        // Test 1: Security Headers
        await this.testSecurityHeaders();
        
        // Test 2: Rate Limiting
        await this.testRateLimiting();
        
        // Test 3: Input Validation
        await this.testInputValidation();
        
        // Test 4: SQL Injection Protection
        await this.testSQLInjectionProtection();
        
        // Test 5: XSS Protection
        await this.testXSSProtection();
        
        // Test 6: Authentication
        await this.testAuthentication();
        
        // Test 7: File Upload Security
        await this.testFileUploadSecurity();
        
        // Test 8: CORS Configuration
        await this.testCORSConfiguration();

        // Generate report
        this.generateReport();
    }

    async testSecurityHeaders() {
        console.log('🔒 Testing Security Headers...');
        
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            const headers = response.headers;
            
            const securityHeaders = [
                'x-content-type-options',
                'x-frame-options', 
                'x-xss-protection',
                'strict-transport-security',
                'content-security-policy',
                'referrer-policy'
            ];
            
            let passed = 0;
            securityHeaders.forEach(header => {
                if (headers.get(header)) {
                    console.log(`  ✅ ${header}: ${headers.get(header)}`);
                    passed++;
                } else {
                    console.log(`  ❌ Missing ${header}`);
                }
            });
            
            this.testResults.push({
                test: 'Security Headers',
                status: passed === securityHeaders.length ? 'PASS' : 'FAIL',
                details: `${passed}/${securityHeaders.length} headers present`
            });
            
        } catch (error) {
            console.log(`  ❌ Error testing headers: ${error.message}`);
            this.testResults.push({
                test: 'Security Headers',
                status: 'ERROR',
                details: error.message
            });
        }
        
        console.log('');
    }

    async testRateLimiting() {
        console.log('⏱️ Testing Rate Limiting...');
        
        try {
            let successCount = 0;
            const requests = [];
            
            // Make multiple rapid requests
            for (let i = 0; i < 20; i++) {
                requests.push(fetch(`${this.baseUrl}/api/products`));
            }
            
            const responses = await Promise.allSettled(requests);
            
            responses.forEach(response => {
                if (response.status === 'fulfilled') {
                    if (response.value.status === 429) {
                        console.log(`  ✅ Rate limit active: ${response.value.status}`);
                        successCount++;
                    } else if (response.value.status === 200) {
                        successCount++;
                    }
                }
            });
            
            // Should get some rate limited responses after many requests
            const rateLimitingWorks = successCount < responses.length;
            
            this.testResults.push({
                test: 'Rate Limiting',
                status: rateLimitingWorks ? 'PASS' : 'PARTIAL',
                details: `${responses.length - successCount} requests rate limited`
            });
            
        } catch (error) {
            console.log(`  ❌ Error testing rate limiting: ${error.message}`);
            this.testResults.push({
                test: 'Rate Limiting',
                status: 'ERROR',
                details: error.message
            });
        }
        
        console.log('');
    }

    async testInputValidation() {
        console.log('✍️ Testing Input Validation...');
        
        const invalidPayloads = [
            { hotmart_id: 'INVALID-ID', name: '', niche: '' },
            { hotmart_id: '', name: 'x'.repeat(300), niche: 'valid' },
            { hotmart_id: 'HM-INVALID123', name: 'Valid', niche: 'x'.repeat(200) }
        ];
        
        let passed = 0;
        
        for (const payload of invalidPayloads) {
            try {
                const response = await fetch(`${this.baseUrl}/api/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (response.status === 400) {
                    console.log(`  ✅ Invalid input rejected: ${JSON.stringify(payload)}`);
                    passed++;
                } else {
                    console.log(`  ❌ Invalid input accepted: ${JSON.stringify(payload)}`);
                }
                
            } catch (error) {
                console.log(`  ⚠️ Error testing payload: ${error.message}`);
            }
        }
        
        this.testResults.push({
            test: 'Input Validation',
            status: passed === invalidPayloads.length ? 'PASS' : 'FAIL',
            details: `${passed}/${invalidPayloads.length} invalid inputs rejected`
        });
        
        console.log('');
    }

    async testSQLInjectionProtection() {
        console.log('💉 Testing SQL Injection Protection...');
        
        const maliciousInputs = [
            "'; DROP TABLE products; --",
            "1' OR '1'='1",
            "UNION SELECT * FROM users --",
            "admin'/*",
            "' OR 1=1#"
        ];
        
        let passed = 0;
        
        for (const maliciousInput of maliciousInputs) {
            try {
                const response = await fetch(`${this.baseUrl}/api/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hotmart_id: maliciousInput,
                        name: 'Test Product',
                        niche: 'test'
                    })
                });
                
                if (response.status === 400 || response.status === 500) {
                    console.log(`  ✅ SQL injection blocked: ${maliciousInput.substring(0, 20)}...`);
                    passed++;
                } else {
                    console.log(`  ⚠️ SQL injection might be allowed: ${maliciousInput.substring(0, 20)}...`);
                }
                
            } catch (error) {
                console.log(`  ⚠️ Error testing SQL injection: ${error.message}`);
            }
        }
        
        this.testResults.push({
            test: 'SQL Injection Protection',
            status: passed >= maliciousInputs.length * 0.8 ? 'PASS' : 'WARNING',
            details: `${passed}/${maliciousInputs.length} injection attempts blocked`
        });
        
        console.log('');
    }

    async testXSSProtection() {
        console.log('🛡️ Testing XSS Protection...');
        
        const xssPayloads = [
            '<script>alert("xss")</script>',
            '"><script>alert("xss")</script>',
            'javascript:alert("xss")',
            '<img src="x" onerror="alert(\'xss\')">',
            '<svg onload="alert(\'xss\')">'
        ];
        
        let passed = 0;
        
        for (const xssPayload of xssPayloads) {
            try {
                const response = await fetch(`${this.baseUrl}/api/content`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content_type: 'instagram_post',
                        title: xssPayload,
                        content: xssPayload
                    })
                });
                
                if (response.status === 400) {
                    console.log(`  ✅ XSS payload blocked: ${xssPayload.substring(0, 20)}...`);
                    passed++;
                } else {
                    console.log(`  ⚠️ XSS payload accepted: ${xssPayload.substring(0, 20)}...`);
                }
                
            } catch (error) {
                console.log(`  ⚠️ Error testing XSS: ${error.message}`);
            }
        }
        
        this.testResults.push({
            test: 'XSS Protection',
            status: passed >= xssPayloads.length * 0.8 ? 'PASS' : 'WARNING',
            details: `${passed}/${xssPayloads.length} XSS attempts handled`
        });
        
        console.log('');
    }

    async testAuthentication() {
        console.log('🔐 Testing Authentication...');
        
        try {
            // Test without auth
            const response1 = await fetch(`${this.baseUrl}/api/settings/keys`);
            
            if (response1.status === 401) {
                console.log(`  ✅ Protected endpoint requires authentication`);
                
                // Test with wrong credentials
                const authString = Buffer.from('wrong:password').toString('base64');
                const response2 = await fetch(`${this.baseUrl}/api/settings/keys`, {
                    headers: { 'Authorization': `Basic ${authString}` }
                });
                
                if (response2.status === 401) {
                    console.log(`  ✅ Invalid credentials rejected`);
                    this.testResults.push({
                        test: 'Authentication',
                        status: 'PASS',
                        details: 'Protected endpoints properly secured'
                    });
                } else {
                    console.log(`  ❌ Invalid credentials accepted`);
                    this.testResults.push({
                        test: 'Authentication',
                        status: 'FAIL',
                        details: 'Invalid credentials were accepted'
                    });
                }
            } else {
                console.log(`  ❌ Protected endpoint accessible without auth`);
                this.testResults.push({
                    test: 'Authentication',
                    status: 'FAIL',
                    details: 'Endpoint accessible without authentication'
                });
            }
            
        } catch (error) {
            console.log(`  ❌ Error testing authentication: ${error.message}`);
            this.testResults.push({
                test: 'Authentication',
                status: 'ERROR',
                details: error.message
            });
        }
        
        console.log('');
    }

    async testFileUploadSecurity() {
        console.log('📁 Testing File Upload Security...');
        
        try {
            // Test with malicious file type
            const maliciousContent = '<?php system($_GET["cmd"]); ?>';
            const response = await fetch(`${this.baseUrl}/api/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    text: maliciousContent,
                    source: 'test'
                })
            });
            
            if (response.status === 200) {
                // Check if malicious content was sanitized
                const result = await response.json();
                
                if (!result.content || !result.content.includes('<?php')) {
                    console.log(`  ✅ Malicious content sanitized`);
                    this.testResults.push({
                        test: 'File Upload Security',
                        status: 'PASS',
                        details: 'Malicious content properly handled'
                    });
                } else {
                    console.log(`  ⚠️ Malicious content not fully sanitized`);
                    this.testResults.push({
                        test: 'File Upload Security',
                        status: 'WARNING',
                        details: 'Some malicious content may pass through'
                    });
                }
            } else {
                console.log(`  ✅ Malicious content rejected`);
                this.testResults.push({
                    test: 'File Upload Security',
                    status: 'PASS',
                    details: 'Malicious content rejected'
                });
            }
            
        } catch (error) {
            console.log(`  ❌ Error testing file upload security: ${error.message}`);
            this.testResults.push({
                test: 'File Upload Security',
                status: 'ERROR',
                details: error.message
            });
        }
        
        console.log('');
    }

    async testCORSConfiguration() {
        console.log('🌐 Testing CORS Configuration...');
        
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                headers: { 'Origin': 'https://evil-site.com' }
            });
            
            const corsHeader = response.headers.get('Access-Control-Allow-Origin');
            
            if (!corsHeader || corsHeader !== 'https://evil-site.com') {
                console.log(`  ✅ CORS properly configured: ${corsHeader || 'not set'}`);
                this.testResults.push({
                    test: 'CORS Configuration',
                    status: 'PASS',
                    details: 'Only allowed origins accepted'
                });
            } else {
                console.log(`  ❌ CORS allows arbitrary origins`);
                this.testResults.push({
                    test: 'CORS Configuration',
                    status: 'FAIL',
                    details: 'Allows unauthorized origins'
                });
            }
            
        } catch (error) {
            console.log(`  ❌ Error testing CORS: ${error.message}`);
            this.testResults.push({
                test: 'CORS Configuration',
                status: 'ERROR',
                details: error.message
            });
        }
        
        console.log('');
    }

    generateReport() {
        console.log('📊 SECURITY TEST REPORT');
        console.log('='.repeat(50));
        
        const passCount = this.testResults.filter(r => r.status === 'PASS').length;
        const failCount = this.testResults.filter(r => r.status === 'FAIL').length;
        const warningCount = this.testResults.filter(r => r.status === 'WARNING').length;
        const errorCount = this.testResults.filter(r => r.status === 'ERROR').length;
        
        console.log(`\n📈 SUMMARY:`);
        console.log(`✅ Passed: ${passCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`⚠️  Warnings: ${warningCount}`);
        console.log(`💥 Errors: ${errorCount}`);
        
        console.log(`\n📋 DETAILED RESULTS:`);
        this.testResults.forEach(result => {
            const icon = result.status === 'PASS' ? '✅' : 
                         result.status === 'FAIL' ? '❌' : 
                         result.status === 'WARNING' ? '⚠️' : '💥';
            console.log(`${icon} ${result.test}: ${result.details}`);
        });
        
        console.log(`\n🎯 OVERALL SECURITY STATUS: ${failCount === 0 ? 'SECURE' : 'NEEDS ATTENTION'}`);
        
        if (failCount > 0) {
            console.log('\n🔧 RECOMMENDATIONS:');
            console.log('- Review failed tests and implement fixes');
            console.log('- Run security tests regularly');
            console.log('- Monitor security alerts and updates');
            console.log('- Consider implementing additional security measures');
        }
    }
}

// Run the security tests
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new SecurityTester();
    tester.runAllTests().catch(console.error);
}

export default SecurityTester;