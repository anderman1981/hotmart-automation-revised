import crypto from 'crypto';

export class AuthManager {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.maxFailedAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.sessions = new Map();
        this.failedAttempts = new Map();
    }

    // Hash password with salt
    hashPassword(password, salt = null) {
        if (!salt) {
            salt = crypto.randomBytes(32).toString('hex');
        }
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return { hash, salt };
    }

    // Verify password
    verifyPassword(password, hash, salt) {
        const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return hash === hashVerify;
    }

    // Check if IP is locked out
    isLockedOut(ip) {
        const attempts = this.failedAttempts.get(ip);
        if (!attempts) return false;

        if (attempts.count >= this.maxFailedAttempts) {
            const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
            if (timeSinceLastAttempt < this.lockoutDuration) {
                return true;
            } else {
                // Reset after lockout period
                this.failedAttempts.delete(ip);
                return false;
            }
        }
        return false;
    }

    // Record failed attempt
    recordFailedAttempt(ip) {
        const attempts = this.failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
        attempts.count++;
        attempts.lastAttempt = Date.now();
        this.failedAttempts.set(ip, attempts);
    }

    // Create session
    createSession(userId, ip) {
        const sessionId = crypto.randomBytes(32).toString('hex');
        const session = {
            id: sessionId,
            userId,
            ip,
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        
        this.sessions.set(sessionId, session);
        return sessionId;
    }

    // Validate session
    validateSession(sessionId, ip) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        // Check timeout
        const timeSinceLastActivity = Date.now() - session.lastActivity;
        if (timeSinceLastActivity > this.sessionTimeout) {
            this.sessions.delete(sessionId);
            return null;
        }

        // Check IP match
        if (session.ip !== ip) {
            this.sessions.delete(sessionId);
            return null;
        }

        // Update last activity
        session.lastActivity = Date.now();
        return session;
    }

    // Destroy session
    destroySession(sessionId) {
        this.sessions.delete(sessionId);
    }

    // Clean expired sessions
    cleanExpiredSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastActivity > this.sessionTimeout) {
                this.sessions.delete(sessionId);
            }
        }
    }
}

// Authentication middleware factory
export const createAuthMiddleware = (authManager) => {
    return (req, res, next) => {
        const authHeader = req.get('Authorization');
        const clientIp = req.ip || req.connection.remoteAddress;

        // Check for lockout
        if (authManager.isLockedOut(clientIp)) {
            return res.status(429).json({ 
                error: 'Too many failed attempts. Please try again later.' 
            });
        }

        // Check for session token
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const session = authManager.validateSession(token, clientIp);
            
            if (session) {
                req.user = { id: session.userId, sessionId: session.id };
                return next();
            }
        }

        // Check for basic auth (admin credentials)
        const basicAuth = req.get('Authorization');
        if (basicAuth && basicAuth.startsWith('Basic ')) {
            try {
                const credentials = Buffer.from(basicAuth.substring(6), 'base64').toString();
                const [username, password] = credentials.split(':');
                
                // Validate against environment variables
                const adminUsername = process.env.ADMIN_USERNAME || 'admin';
                const adminPassword = process.env.ADMIN_PASSWORD;
                
                if (username === adminUsername && adminPassword) {
                    const { hash, salt } = authManager.hashPassword(adminPassword);
                    
                    if (authManager.verifyPassword(password, hash, salt)) {
                        // Create session
                        const sessionId = authManager.createSession(username, clientIp);
                        req.user = { id: username, sessionId };
                        
                        // Return token in response header
                        res.set('X-Session-Token', sessionId);
                        return next();
                    }
                }
            } catch (error) {
                // Invalid basic auth format
            }
        }

        // Record failed attempt
        authManager.recordFailedAttempt(clientIp);
        
        res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please provide valid credentials'
        });
    };
};

// Login endpoint
export const loginHandler = (authManager) => async (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Check for lockout
    if (authManager.isLockedOut(clientIp)) {
        return res.status(429).json({ 
            error: 'Too many failed attempts. Please try again later.' 
        });
    }

    // Validate inputs
    if (!username || !password) {
        authManager.recordFailedAttempt(clientIp);
        return res.status(400).json({ error: 'Username and password required' });
    }

    // Check credentials against environment
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (username !== adminUsername || !adminPassword) {
        authManager.recordFailedAttempt(clientIp);
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { hash, salt } = authManager.hashPassword(adminPassword);
    
    if (!authManager.verifyPassword(password, hash, salt)) {
        authManager.recordFailedAttempt(clientIp);
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const sessionId = authManager.createSession(username, clientIp);
    
    res.json({
        success: true,
        message: 'Login successful',
        token: sessionId,
        expiresIn: authManager.sessionTimeout
    });
};

// Logout endpoint
export const logoutHandler = (authManager) => (req, res) => {
    if (req.user && req.user.sessionId) {
        authManager.destroySession(req.user.sessionId);
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
};

// Initialize global auth manager
const globalAuthManager = new AuthManager();

// Clean expired sessions every 5 minutes
setInterval(() => {
    globalAuthManager.cleanExpiredSessions();
}, 5 * 60 * 1000);

export {
    globalAuthManager,
    createAuthMiddleware,
    loginHandler,
    logoutHandler
};