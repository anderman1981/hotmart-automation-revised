import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, param, query, validationResult } from 'express-validator';
import createError from 'http-errors';
import crypto from 'crypto';

// Request ID middleware - adds unique ID to every request for audit trail
export const requestId = (req, res, next) => {
    req.id = crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
};

// Security headers middleware
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "https://picsum.photos"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.hotmart.com", "http://localhost:11434"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            manifestSrc: ["'self'"],
            workerSrc: ["'self'"],
            upgradeInsecureRequests: []
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// Rate limiting configurations
export const createRateLimit = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false
});

// Different rate limits for different endpoints
export const authRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts
    'Too many authentication attempts, please try again later'
);

export const generalRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests
    'Too many requests, please try again later'
);

export const uploadRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    10, // 10 uploads
    'Too many upload attempts, please try again later'
);

export const contentGenerationRateLimit = createRateLimit(
    60 * 60 * 1000, // 1 hour
    20, // 20 content generations
    'Too many content generation requests, please try again later'
);

// Input validation middleware
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));
        return res.status(400).json({
            error: 'Validation failed',
            details: errorMessages
        });
    }
    next();
};

// Sanitization helpers
export const sanitizeString = (value) => {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/[<>]/g, '');
};

export const sanitizeHtml = (value) => {
    if (typeof value !== 'string') return value;
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Security logging
export const logSecurityEvent = (event, details, req) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        details,
        endpoint: req.path,
        method: req.method
    };
    
    console.warn('🚨 SECURITY EVENT:', JSON.stringify(logEntry, null, 2));
    
    // In production, you'd send this to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
        // TODO: Send to security monitoring service
    }
};

// SQL injection prevention for PostgreSQL
export const sanitizeSqlInput = (value) => {
    if (typeof value !== 'string') return value;
    // Remove potential SQL injection patterns
    return value.replace(/[';\\-]/g, '');
};

// File upload validation
export const validateFileUpload = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const allowedTypes = ['application/pdf', 'text/plain', 'application/json'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
            error: 'Invalid file type',
            allowedTypes: allowedTypes 
        });
    }
    
    if (req.file.size > maxSize) {
        return res.status(400).json({ 
            error: 'File too large',
            maxSize: '10MB' 
        });
    }
    
    next();
};

// API key validation for sensitive endpoints
export const validateApiKey = (req, res, next) => {
    const apiKey = req.get('X-API-Key');
    const expectedKey = process.env.API_KEY;
    
    if (!expectedKey) {
        return next(); // No API key required if not configured
    }
    
    if (!apiKey || apiKey !== expectedKey) {
        logSecurityEvent('INVALID_API_KEY', { providedKey: apiKey?.substring(0, 8) + '...' }, req);
        return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    next();
};

// CORS validation - reads from environment variables
export const validateCors = (req, res, next) => {
    const envOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : [];
    
    const defaultOrigins = [
        'http://localhost:4201',
        'http://localhost:4200',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:4123',
        'http://192.168.58.116:4201',
        'http://192.168.58.116:4200',
        'https://hotmart.andersonmares.com',
        'https://hotmart-api.andersonmares.com'
    ];
    
    const allowedOrigins = [...new Set([...envOrigins, ...defaultOrigins])];
    
    const origin = req.get('Origin');
    
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
};

// Input validation rules
export const validationRules = {
    // Product validations
    createProduct: [
        body('hotmart_id')
            .isString()
            .matches(/^HM-[A-Z0-9]+$/)
            .withMessage('Hotmart ID must be in format HM-XXXXXXXX'),
        body('name')
            .isString()
            .isLength({ min: 1, max: 255 })
            .withMessage('Name must be between 1 and 255 characters'),
        body('niche')
            .optional()
            .isString()
            .isLength({ max: 100 })
            .withMessage('Niche must be max 100 characters'),
        body('url_sales_page')
            .optional()
            .isURL()
            .withMessage('Sales page URL must be valid')
    ],
    
    // Content generation validations
    generateContent: [
        body('content_type')
            .isIn(['instagram_post', 'tiktok_video', 'email_campaign', 'blog_article'])
            .withMessage('Invalid content type'),
        body('title')
            .isString()
            .isLength({ min: 1, max: 200 })
            .withMessage('Title must be between 1 and 200 characters'),
        body('platform')
            .optional()
            .isString()
            .isLength({ max: 50 })
            .withMessage('Platform must be max 50 characters')
    ],
    
    // Agent control validations
    agentControl: [
        body('type')
            .isIn(['start', 'stop', 'restart', 'task'])
            .withMessage('Invalid agent control type'),
        body('payload')
            .optional()
            .isObject()
            .withMessage('Payload must be an object')
    ],
    
    // ID parameter validation
    idParam: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID must be a positive integer')
    ],
    
    // Agent name validation
    agentName: [
        param('name')
            .isString()
            .matches(/^[a-zA-Z]+$/)
            .withMessage('Agent name must contain only letters')
    ],
    
    // URL validation for scraping
    scrapingUrl: [
        body('url')
            .isURL()
            .withMessage('URL must be valid')
            .custom(value => {
                // Only allow certain domains for security
                const allowedDomains = ['hotmart.com', 'pay.hotmart.com'];
                const url = new URL(value);
                if (!allowedDomains.includes(url.hostname)) {
                    throw new Error('URL domain not allowed');
                }
                return true;
            })
    ],
    
    // File upload validation
    fileUpload: [
        body('source')
            .optional()
            .isString()
            .isLength({ max: 100 })
            .withMessage('Source must be max 100 characters')
    ]
};

// Error handling middleware
export const securityErrorHandler = (err, req, res, next) => {
    const requestId = req.id || 'unknown';
    
    if (err.type === 'entity.parse.failed') {
        logSecurityEvent('INVALID_JSON', { error: err.message, requestId }, req);
        return res.status(400).json({ error: 'Invalid JSON format', requestId });
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
        logSecurityEvent('FILE_SIZE_EXCEEDED', { size: err.limit, requestId }, req);
        return res.status(400).json({ error: 'File size exceeded', requestId });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        logSecurityEvent('UNEXPECTED_FILE', { file: err.field, requestId }, req);
        return res.status(400).json({ error: 'Unexpected file field', requestId });
    }
    
    next(err);
};