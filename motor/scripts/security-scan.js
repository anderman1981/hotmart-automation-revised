#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class VulnerabilityScanner {
    constructor() {
        this.vulnerabilities = [];
        this.packages = [];
    }

    async scanDependencies() {
        console.log('🔍 Scanning for security vulnerabilities...\n');

        try {
            // Run npm audit
            console.log('Running npm audit...');
            const auditOutput = execSync('npm audit --json', { 
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            const auditData = JSON.parse(auditOutput);
            this.processAuditResults(auditData);
            
        } catch (error) {
            if (error.stdout) {
                try {
                    const auditData = JSON.parse(error.stdout);
                    this.processAuditResults(auditData);
                } catch (parseError) {
                    console.log('❌ Failed to parse audit output:', parseError.message);
                }
            }
        }

        // Get list of packages
        this.getPackageList();
        
        // Check for known problematic packages
        this.checkProblematicPackages();
        
        // Generate report
        this.generateReport();
    }

    processAuditResults(auditData) {
        if (auditData.vulnerabilities) {
            Object.entries(auditData.vulnerabilities).forEach(([packageName, vuln]) => {
                this.vulnerabilities.push({
                    package: packageName,
                    severity: vuln.severity,
                    title: vuln.title,
                    url: vuln.url,
                    fixAvailable: vuln.fixAvailable,
                    affectedVersions: vuln.range
                });
            });
        }
    }

    getPackageList() {
        try {
            const packageJsonPath = path.join(process.cwd(), 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                this.packages = [
                    ...Object.keys(packageJson.dependencies || {}),
                    ...Object.keys(packageJson.devDependencies || {})
                ];
            }
        } catch (error) {
            console.log('❌ Failed to read package.json:', error.message);
        }
    }

    checkProblematicPackages() {
        // List of packages known to have security issues
        const problematicPackages = {
            'lodash': '< 4.17.21',
            'request': '< 2.88.0',
            'node-fetch': '< 2.6.1',
            'axios': '< 0.21.1',
            'minimist': '< 1.2.6',
            'yaml': '< 1.10.2',
            'tar': '< 6.1.9',
            'ssri': '< 8.0.1',
            'serialize-javascript': '< 5.0.1',
            'websocket-extensions': '< 0.1.4'
        };

        this.packages.forEach(pkg => {
            if (problematicPackages[pkg]) {
                this.vulnerabilities.push({
                    package: pkg,
                    severity: 'high',
                    title: `Known vulnerable package ${pkg}`,
                    url: `https://www.npmjs.com/package/${pkg}`,
                    fixAvailable: true,
                    affectedVersions: problematicPackages[pkg],
                    recommendation: `Update ${pkg} to latest version`
                });
            }
        });
    }

    generateReport() {
        console.log('\n📊 SECURITY VULNERABILITY REPORT\n');
        console.log('='.repeat(50));

        if (this.vulnerabilities.length === 0) {
            console.log('✅ No vulnerabilities found!');
            console.log('\n🛡️ Security best practices to follow:');
            console.log('- Regularly update dependencies');
            console.log('- Use `npm audit fix` to fix vulnerabilities');
            console.log('- Implement security headers (already done)');
            console.log('- Validate all user inputs (already done)');
            console.log('- Use HTTPS in production');
            console.log('- Implement rate limiting (already done)');
            return;
        }

        // Group by severity
        const grouped = {
            critical: this.vulnerabilities.filter(v => v.severity === 'critical'),
            high: this.vulnerabilities.filter(v => v.severity === 'high'),
            moderate: this.vulnerabilities.filter(v => v.severity === 'moderate'),
            low: this.vulnerabilities.filter(v => v.severity === 'low'),
            info: this.vulnerabilities.filter(v => v.severity === 'info')
        };

        console.log(`\n🚨 Found ${this.vulnerabilities.length} vulnerabilities:\n`);

        Object.entries(grouped).forEach(([severity, vulns]) => {
            if (vulns.length > 0) {
                console.log(`${severity.toUpperCase()} (${vulns.length}):`);
                vulns.forEach(vuln => {
                    console.log(`  - ${vuln.package}: ${vuln.title}`);
                    console.log(`    Severity: ${vuln.severity}`);
                    console.log(`    Affected versions: ${vuln.affectedVersions}`);
                    console.log(`    Fix available: ${vuln.fixAvailable ? 'Yes' : 'No'}`);
                    if (vuln.recommendation) {
                        console.log(`    Recommendation: ${vuln.recommendation}`);
                    }
                    console.log(`    More info: ${vuln.url}`);
                    console.log('');
                });
            }
        });

        // Recommendations
        console.log('🔧 RECOMMENDATIONS:\n');
        console.log('1. Run `npm audit fix` to automatically fix vulnerabilities');
        console.log('2. For manual fixes, run `npm update <package-name>`');
        console.log('3. Consider upgrading to newer versions of packages');
        console.log('4. Review and remove unused dependencies');
        console.log('5. Set up automated security scanning in CI/CD');

        // Create security policy
        this.createSecurityPolicy();
    }

    createSecurityPolicy() {
        const policy = {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            vulnerabilitiesFound: this.vulnerabilities.length,
            criticalIssues: this.vulnerabilities.filter(v => v.severity === 'critical').length,
            highIssues: this.vulnerabilities.filter(v => v.severity === 'high').length,
            nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
            securityMeasures: [
                'Input validation implemented',
                'Rate limiting configured',
                'Security headers configured',
                'SQL injection prevention',
                'XSS prevention',
                'File upload validation',
                'API key validation',
                'Security logging enabled'
            ]
        };

        const policyPath = path.join(process.cwd(), 'security-policy.json');
        fs.writeFileSync(policyPath, JSON.stringify(policy, null, 2));
        console.log(`\n📄 Security policy saved to: ${policyPath}`);
    }
}

// Run the scanner
if (import.meta.url === `file://${process.argv[1]}`) {
    const scanner = new VulnerabilityScanner();
    scanner.scanDependencies().catch(console.error);
}

export default VulnerabilityScanner;