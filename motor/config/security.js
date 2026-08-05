import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Environment validation
export const validateEnvironment = () => {
    const requiredVars = [
        'DB_USER',
        'DB_HOST', 
        'DB_NAME',
        'DB_PASSWORD',
        'PORT'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Validate password strength
    if (process.env.DB_PASSWORD === 'securepassword') {
        console.warn('⚠️ Using default database password. Please change it in production.');
    }
    
    return true;
};

// Secret management
export class SecretManager {
    static encrypt(text, key = process.env.ENCRYPTION_KEY) {
        if (!key) {
            throw new Error('ENCRYPTION_KEY environment variable not set');
        }
        
        const algorithm = 'aes-256-gcm';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(algorithm, key);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }
    
    static decrypt(encryptedData, key = process.env.ENCRYPTION_KEY) {
        if (!key) {
            throw new Error('ENCRYPTION_KEY environment variable not set');
        }
        
        const algorithm = 'aes-256-gcm';
        const decipher = crypto.createDecipher(algorithm, key);
        
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
    
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

// Secure configuration
export const secureConfig = {
    // Generate encryption key if not exists
    ensureEncryptionKey: () => {
        if (!process.env.ENCRYPTION_KEY) {
            const key = SecretManager.generateKey();
            console.warn('⚠️ No ENCRYPTION_KEY found. Generated key:', key);
            console.warn('Please add this to your .env file: ENCRYPTION_KEY=' + key);
            process.env.ENCRYPTION_KEY = key;
        }
    },
    
    // Validate secure settings
    validate: () => {
        const issues = [];
        
        // Check for development defaults
        if (process.env.NODE_ENV === 'production') {
            if (process.env.DB_PASSWORD === 'securepassword') {
                issues.push('Using default database password in production');
            }
            
            if (process.env.PORT === '4123') {
                issues.push('Using default port in production');
            }
            
            if (!process.env.ENCRYPTION_KEY) {
                issues.push('Missing encryption key in production');
            }
        }
        
        // Check for exposed credentials
        const sensitiveVars = ['HOTMART_PASSWORD', 'INSTAGRAM_PASSWORD', 'DB_PASSWORD'];
        sensitiveVars.forEach(varName => {
            if (process.env[varName] && process.env[varName].length < 8) {
                issues.push(`Password for ${varName} is too short`);
            }
        });
        
        return issues;
    }
};

// Security audit helper
export const auditSecurity = () => {
    console.log('🔒 Running security audit...\n');
    
    // Environment validation
    try {
        validateEnvironment();
        console.log('✅ Environment variables validated');
    } catch (error) {
        console.log('❌ Environment validation failed:', error.message);
    }
    
    // Configuration validation
    const issues = secureConfig.validate();
    if (issues.length === 0) {
        console.log('✅ Security configuration validated');
    } else {
        console.log('⚠️ Security issues found:');
        issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    // File permissions check
    const sensitiveFiles = ['.env', 'package.json'];
    sensitiveFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const mode = (stats.mode & parseInt('777', 8)).toString(8);
            
            if (mode !== '600' && mode !== '644') {
                console.log(`⚠️ File ${file} has permissive permissions: ${mode}`);
            } else {
                console.log(`✅ File ${file} permissions OK: ${mode}`);
            }
        }
    });
    
    // Check for required security packages
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const securityPackages = ['helmet', 'express-rate-limit', 'express-validator'];
        
        securityPackages.forEach(pkg => {
            if (packageJson.dependencies && packageJson.dependencies[pkg]) {
                console.log(`✅ Security package ${pkg} installed`);
            } else {
                console.log(`⚠️ Security package ${pkg} not installed`);
            }
        });
    }
    
    console.log('\n🔍 Security audit completed');
};