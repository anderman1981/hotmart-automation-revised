# 🤖 SUB-AGENTES ESPECIALIZADOS - Hotmart Automation

**Parent**: ANTIGRAVITY  
**Purpose**: Delegar responsabilidades específicas a agentes expertos en dominios técnicos

---

## 🏗️ ARQUITECTURA DE AGENTES

```
                    ANTIGRAVITY (Maestro)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐      ┌────▼────┐
   │ Backend │      │ Frontend  │      │ DevOps  │
   │ Agent   │      │ Agent     │      │ Agent   │
   └────┬────┘      └─────┬─────┘      └────┬────┘
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐      ┌────▼────┐
   │Database │      │ Security  │      │ Testing │
   │ Agent   │      │ Agent     │      │ Agent   │
   └─────────┘      └───────────┘      └─────────┘
```

---

## 1. 🔧 BACKEND AGENT

### Activation Triggers
- User mentions: `motor/`, `API`, `backend`, `server`, `endpoints`
- Files affected: `motor/**/*.ts`, `motor/**/*.js`
- Keywords: `database`, `routes`, `controllers`, `services`, `middleware`

### Primary Responsibilities

#### A. API Development
```typescript
// Pattern: Controller -> Service -> Repository

// ✅ CORRECT Implementation
// File: motor/src/controllers/product.controller.ts
import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { validateProduct } from '../middleware/validation';

export class ProductController {
  constructor(private productService: ProductService) {}

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await this.productService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    // Centralized error handling
    logger.error('Controller error', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// File: motor/src/services/product.service.ts
export class ProductService {
  constructor(
    private productRepo: ProductRepository,
    private metricsService: MetricsService
  ) {}

  async create(data: CreateProductDTO): Promise<Product> {
    // Validation
    this.validateData(data);
    
    // Business logic
    const product = await this.productRepo.save(data);
    
    // Side effects
    await this.metricsService.trackProductCreation(product.id);
    
    return product;
  }
}
```

#### B. Bayesian Engine Implementation
```typescript
// File: motor/src/services/bayesian-engine.ts

interface PriorDistribution {
  alpha: number; // Success count
  beta: number;  // Failure count
}

interface ProductSignals {
  sales: number;
  clickouts: number;
  engagement: number;
  refunds: number;
}

export class BayesianEngine {
  private readonly logger: Logger;

  constructor(
    private readonly db: Database,
    private readonly cache: RedisClient
  ) {
    this.logger = new Logger('BayesianEngine');
  }

  /**
   * Calculate posterior probability for a product
   * 
   * @param productId - Hotmart product ID
   * @returns Posterior score (0-1)
   */
  async calculatePosterior(productId: string): Promise<number> {
    // 1. Fetch prior from cache or DB
    const prior = await this.getPrior(productId);
    
    // 2. Fetch latest signals
    const signals = await this.getSignals(productId);
    
    // 3. Update posterior using Beta distribution
    const posterior = this.updateBeta(prior, signals);
    
    // 4. Cache result
    await this.cache.set(`posterior:${productId}`, posterior, 3600);
    
    return posterior.mean;
  }

  private updateBeta(
    prior: PriorDistribution, 
    signals: ProductSignals
  ): PriorDistribution {
    // Beta-Binomial conjugate prior
    return {
      alpha: prior.alpha + signals.sales + signals.clickouts,
      beta: prior.beta + signals.refunds + (100 - signals.engagement)
    };
  }

  private async getPrior(productId: string): Promise<PriorDistribution> {
    const cached = await this.cache.get(`prior:${productId}`);
    if (cached) return JSON.parse(cached);

    // Default uninformative prior
    return { alpha: 1, beta: 1 };
  }
}
```

#### C. Error Handling Standards
```typescript
// File: motor/src/utils/errors.ts

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

// Global error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  logger.error('Unhandled error', { error: err });
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

### Checklist Before Committing Backend Code
- [ ] All endpoints have input validation
- [ ] Error handling implemented at controller level
- [ ] Business logic separated from controllers
- [ ] Database operations use parameterized queries
- [ ] Async operations have proper error handling
- [ ] Logging includes contextual information
- [ ] API responses follow consistent format
- [ ] Environment variables used for configuration
- [ ] TypeScript types defined for all DTOs
- [ ] Unit tests cover core business logic

---

## 2. 🎨 FRONTEND AGENT

### Activation Triggers
- User mentions: `dashboard/`, `UI`, `frontend`, `React`, `components`
- Files affected: `dashboard/**/*.tsx`, `dashboard/**/*.ts`
- Keywords: `component`, `state`, `hook`, `styling`, `form`

### Primary Responsibilities

#### A. Component Architecture
```tsx
// File: dashboard/src/components/ProductCard.tsx

import { FC, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '@/types/product';
import { productApi } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToast';

interface ProductCardProps {
  product: Product;
  onUpdate?: (product: Product) => void;
}

/**
 * ProductCard - Displays product information with actions
 * 
 * @example
 * <ProductCard 
 *   product={product} 
 *   onUpdate={handleUpdate} 
 * />
 */
export const ProductCard: FC<ProductCardProps> = ({ 
  product, 
  onUpdate 
}) => {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  const updateMutation = useMutation({
    mutationFn: productApi.update,
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
      onUpdate?.(updatedProduct);
    },
    onError: (error) => {
      toast.error('Failed to update product');
      console.error('Update error:', error);
    }
  });

  const getStatusColor = (status: Product['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      testing: 'bg-yellow-100 text-yellow-800',
      paused: 'bg-gray-100 text-gray-800',
      killed: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.paused;
  };

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500">
            ID: {product.hotmart_id}
          </p>
        </div>
        <Badge className={getStatusColor(product.status)}>
          {product.status}
        </Badge>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricItem 
          label="Score" 
          value={product.bayesian_score.toFixed(2)} 
          trend={product.trend}
        />
        <MetricItem 
          label="Sales" 
          value={product.metrics.sales} 
        />
        <MetricItem 
          label="CTR" 
          value={`${product.metrics.ctr}%`} 
        />
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'Show'} Details
        </Button>
        <Button
          size="sm"
          variant="primary"
          loading={updateMutation.isPending}
          onClick={() => updateMutation.mutate(product.id)}
        >
          Refresh
        </Button>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="mt-4 border-t pt-4">
          <ProductDetails product={product} />
        </div>
      )}
    </div>
  );
};

// Supporting component
const MetricItem: FC<{
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
}> = ({ label, value, trend }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <div className="flex items-center gap-1">
      <p className="text-lg font-semibold">{value}</p>
      {trend && <TrendIcon trend={trend} />}
    </div>
  </div>
);
```

#### B. State Management Pattern
```typescript
// File: dashboard/src/stores/useProductStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Product } from '@/types/product';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  filters: {
    status: string[];
    niche: string[];
  };
  
  // Actions
  setProducts: (products: Product[]) => void;
  selectProduct: (product: Product | null) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  setFilters: (filters: Partial<ProductState['filters']>) => void;
  clearFilters: () => void;
}

export const useProductStore = create<ProductState>()(
  devtools(
    persist(
      (set, get) => ({
        products: [],
        selectedProduct: null,
        filters: {
          status: [],
          niche: []
        },

        setProducts: (products) => set({ products }),

        selectProduct: (product) => set({ selectedProduct: product }),

        updateProduct: (id, updates) => set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          )
        })),

        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),

        clearFilters: () => set({
          filters: { status: [], niche: [] }
        })
      }),
      { name: 'product-store' }
    )
  )
);
```

#### C. API Integration
```typescript
// File: dashboard/src/services/api.ts

import axios, { AxiosInstance } from 'axios';
import { Product, CreateProductDTO } from '@/types/product';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    const { data } = await this.client.get<{ data: Product[] }>('/api/products');
    return data.data;
  }

  async getProduct(id: string): Promise<Product> {
    const { data } = await this.client.get<{ data: Product }>(`/api/products/${id}`);
    return data.data;
  }

  async createProduct(dto: CreateProductDTO): Promise<Product> {
    const { data } = await this.client.post<{ data: Product }>('/api/products', dto);
    return data.data;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data } = await this.client.patch<{ data: Product }>(
      `/api/products/${id}`, 
      updates
    );
    return data.data;
  }
}

export const api = new ApiClient();
export const productApi = {
  getAll: () => api.getProducts(),
  getOne: (id: string) => api.getProduct(id),
  create: (dto: CreateProductDTO) => api.createProduct(dto),
  update: (id: string, updates: Partial<Product>) => api.updateProduct(id, updates)
};
```

### Checklist Before Committing Frontend Code
- [ ] All components have TypeScript types
- [ ] Props interface exported for reusability
- [ ] Accessibility attributes (ARIA) included
- [ ] Error boundaries implemented
- [ ] Loading states handled
- [ ] Tailwind classes used (no inline styles)
- [ ] Responsive design implemented
- [ ] API calls have error handling
- [ ] Forms have validation
- [ ] Performance optimized (lazy loading, memoization)

---

## 3. 🐳 DEVOPS AGENT

### Activation Triggers
- User mentions: `Docker`, `deployment`, `CI/CD`, `containers`, `infrastructure`
- Files affected: `docker-compose.yml`, `Dockerfile`, `.github/workflows/`
- Keywords: `build`, `deploy`, `environment`, `secrets`

### Primary Responsibilities

#### A. Docker Optimization
```dockerfile
# File: motor/Dockerfile (Multi-stage build)

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 motoruser

# Copy only necessary files
COPY --from=deps --chown=motoruser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=motoruser:nodejs /app/dist ./dist
COPY --from=builder --chown=motoruser:nodejs /app/package.json ./

# Switch to non-root user
USER motoruser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 4000

CMD ["node", "dist/index.js"]
```

#### B. Docker Compose Production
```yaml
# File: docker-compose.prod.yml

version: '3.9'

services:
  db:
    image: postgres:15-alpine
    container_name: hotmart_db_prod
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - hotmart_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  redis:
    image: redis:7-alpine
    container_name: hotmart_redis_prod
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - hotmart_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  motor:
    build:
      context: ./motor
      dockerfile: Dockerfile
      target: runner
    container_name: hotmart_motor_prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      OLLAMA_URL: http://ollama:11434
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - hotmart_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  dashboard:
    build:
      context: ./dashboard
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${API_URL}
    container_name: hotmart_dashboard_prod
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - motor
    networks:
      - hotmart_network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  hotmart_network:
    driver: bridge
```

#### C. CI/CD Pipeline
```yaml
# File: .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

env:
  NODE_VERSION: '20'

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: motor/package-lock.json

      - name: Install dependencies
        working-directory: ./motor
        run: npm ci

      - name: Lint
        working-directory: ./motor
        run: npm run lint

      - name: Type check
        working-directory: ./motor
        run: npm run type-check

      - name: Run tests
        working-directory: ./motor
        run: npm test
        env:
          DB_HOST: localhost
          DB_PASSWORD: test

      - name: Check coverage
        working-directory: ./motor
        run: npm run test:coverage

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: dashboard/package-lock.json

      - name: Install dependencies
        working-directory: ./dashboard
        run: npm ci

      - name: Lint
        working-directory: ./dashboard
        run: npm run lint

      - name: Type check
        working-directory: ./dashboard
        run: npm run type-check

      - name: Build
        working-directory: ./dashboard
        run: npm run build

      - name: Run tests
        working-directory: ./dashboard
        run: npm test

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'

      - name: NPM Audit Backend
        working-directory: ./motor
        run: npm audit --audit-level=moderate

      - name: NPM Audit Frontend
        working-directory: ./dashboard
        run: npm audit --audit-level=moderate

  build-images:
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend, security-audit]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Motor
        uses: docker/build-push-action@v5
        with:
          context: ./motor
          push: false
          tags: hotmart-motor:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build Dashboard
        uses: docker/build-push-action@v5
        with:
          context: ./dashboard
          push: false
          tags: hotmart-dashboard:latest
```

### Checklist Before Deploying
- [ ] All environment variables documented in `.env.example`
- [ ] Health checks configured for all services
- [ ] Resource limits defined
- [ ] Volumes configured for persistence
- [ ] Secrets not committed to Git
- [ ] Multi-stage builds used for optimization
- [ ] Security scan passed
- [ ] Backup strategy documented
- [ ] Rollback plan documented
- [ ] Monitoring configured

---

## 4. 💾 DATABASE AGENT

### Activation Triggers
- User mentions: `schema`, `migration`, `query`, `database`, `SQL`
- Files affected: `motor/src/migrations/`, `motor/src/models/`
- Keywords: `table`, `index`, `foreign key`, `constraint`

### Primary Responsibilities

#### A. Schema Design
```sql
-- File: motor/src/migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotmart_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  niche VARCHAR(100) NOT NULL,
  url_sales_page TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'testing',
  bayesian_score DECIMAL(5,4) DEFAULT 0.5,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('testing', 'active', 'promoted', 'paused', 'killed')),
  CONSTRAINT valid_score CHECK (bayesian_score BETWEEN 0 AND 1)
);

-- Metrics table
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Volume metrics
  sales INT DEFAULT 0,
  clickouts INT DEFAULT 0,
  impressions INT DEFAULT 0,
  
  -- Engagement metrics
  ctr DECIMAL(5,2) DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  refund_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Period
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_period CHECK (period_end > period_start),
  CONSTRAINT valid_ctr CHECK (ctr BETWEEN 0 AND 100),
  CONSTRAINT valid_engagement CHECK (engagement_rate BETWEEN 0 AND 100),
  CONSTRAINT valid_refund CHECK (refund_rate BETWEEN 0 AND 100)
);

-- Indexes for performance
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_niche ON products(niche);
CREATE INDEX idx_products_score ON products(bayesian_score DESC);
CREATE INDEX idx_metrics_product_id ON metrics(product_id);
CREATE INDEX idx_metrics_period ON metrics(period_start, period_end);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE products IS 'Hotmart products being tracked and promoted';
COMMENT ON COLUMN products.bayesian_score IS 'Posterior probability score (0-1)';
COMMENT ON TABLE metrics IS 'Time-series metrics for product performance';
```

#### B. Query Optimization
```typescript
// File: motor/src/repositories/product.repository.ts

import { Pool, QueryResult } from 'pg';
import { Product } from '../types/product';

export class ProductRepository {
  constructor(private db: Pool) {}

  /**
   * Get products with pagination and filtering
   * Uses prepared statements for SQL injection protection
   */
  async findMany(options: {
    status?: string[];
    niche?: string[];
    minScore?: number;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    if (options.status?.length) {
      conditions.push(`status = ANY($${paramIndex})`);
      params.push(options.status);
      paramIndex++;
    }

    if (options.niche?.length) {
      conditions.push(`niche = ANY($${paramIndex})`);
      params.push(options.niche);
      paramIndex++;
    }

    if (options.minScore !== undefined) {
      conditions.push(`bayesian_score >= $${paramIndex}`);
      params.push(options.minScore);
      paramIndex++;
    }

    const query = `
      SELECT 
        p.*,
        COUNT(m.id) as metric_count,
        MAX(m.created_at) as last_metric_at
      FROM products p
      LEFT JOIN metrics m ON p.id = m.product_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY p.id
      ORDER BY p.bayesian_score DESC, p.updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(options.limit || 50);
    params.push(options.offset || 0);

    const result = await this.db.query<Product>(query, params);
    return result.rows;
  }

  /**
   * Batch update product scores
   * Uses transaction for atomicity
   */
  async updateScores(updates: Array<{ id: string; score: number }>): Promise<void> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      for (const { id, score } of updates) {
        await client.query(
          'UPDATE products SET bayesian_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [score, id]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

### Checklist Before Running Migrations
- [ ] Backup database before migration
- [ ] Test migration on development database
- [ ] Include rollback script
- [ ] Document schema changes
- [ ] Update TypeScript types to match schema
- [ ] Verify foreign key constraints
- [ ] Check index performance impact
- [ ] Update API documentation if needed
- [ ] Test affected queries
- [ ] Plan maintenance window for production

---

## 5. 🔒 SECURITY AGENT

### Activation Triggers
- Before ANY merge to `dev` or `main`
- User mentions: `security`, `vulnerability`, `audit`, `authentication`
- Files affected: ALL (comprehensive review)

### Security Audit Checklist

#### A. Code Security
```typescript
// ✅ SECURE: Input validation
import Joi from 'joi';

const productSchema = Joi.object({
  hotmart_id: Joi.string().pattern(/^[A-Z0-9]{6,12}$/).required(),
  name: Joi.string().min(3).max(255).required(),
  niche: Joi.string().valid('health', 'finance', 'education').required(),
  url_sales_page: Joi.string().uri().required()
});

// ✅ SECURE: SQL queries
const result = await db.query(
  'SELECT * FROM products WHERE id = $1',
  [productId]  // Parameterized query prevents SQL injection
);

// ❌ INSECURE: Direct string concatenation
const result = await db.query(
  `SELECT * FROM products WHERE id = '${productId}'`  // SQL injection risk!
);

// ✅ SECURE: Environment variables
const config = {
  dbPassword: process.env.DB_PASSWORD,
  apiKey: process.env.HOTMART_API_KEY
};

// ❌ INSECURE: Hardcoded credentials
const config = {
  dbPassword: 'mypassword123',  // Never do this!
  apiKey: 'sk-1234567890'
};
```

#### B. Authentication & Authorization
```typescript
// File: motor/src/middleware/auth.ts

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Pre-Merge Security Checklist
- [ ] No credentials in code or config files
- [ ] All environment variables documented in `.env.example`
- [ ] SQL queries use parameterized statements
- [ ] User input validated and sanitized
- [ ] Error messages don't expose system details
- [ ] Authentication required on protected routes
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Dependencies have no critical vulnerabilities (`npm audit`)
- [ ] Docker images scanned for vulnerabilities

---

## 6. 🧪 TESTING AGENT

### Activation Triggers
- Before creating PR
- User mentions: `test`, `spec`, `coverage`
- Files affected: `**/*.test.ts`, `**/*.spec.ts`

### Testing Standards

#### A. Unit Tests
```typescript
// File: motor/src/services/__tests__/bayesian-engine.test.ts

import { BayesianEngine } from '../bayesian-engine';
import { mockDatabase, mockRedis } from '../../__mocks__';

describe('BayesianEngine', () => {
  let engine: BayesianEngine;
  let db: ReturnType<typeof mockDatabase>;
  let cache: ReturnType<typeof mockRedis>;

  beforeEach(() => {
    db = mockDatabase();
    cache = mockRedis();
    engine = new BayesianEngine(db, cache);
  });

  describe('calculatePosterior', () => {
    it('should calculate correct posterior for new product', async () => {
      // Arrange
      const productId = 'test-123';
      db.query.mockResolvedValue({
        rows: [{ sales: 10, clickouts: 100, refunds: 2 }]
      });
      cache.get.mockResolvedValue(null);

      // Act
      const score = await engine.calculatePosterior(productId);

      // Assert
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
      expect(cache.set).toHaveBeenCalledWith(
        `posterior:${productId}`,
        expect.any(Number),
        3600
      );
    });

    it('should use cached prior if available', async () => {
      // Arrange
      const productId = 'test-123';
      const cachedPrior = { alpha: 50, beta: 10 };
      cache.get.mockResolvedValue(JSON.stringify(cachedPrior));

      // Act
      await engine.calculatePosterior(productId);

      // Assert
      expect(cache.get).toHaveBeenCalledWith(`prior:${productId}`);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const productId = 'test-123';
      db.query.mockRejectedValue(new Error('DB connection failed'));

      // Act & Assert
      await expect(engine.calculatePosterior(productId))
        .rejects
        .toThrow('DB connection failed');
    });
  });
});
```

#### B. Integration Tests
```typescript
// File: motor/src/__tests__/integration/products.test.ts

import request from 'supertest';
import { app } from '../../app';
import { setupTestDatabase, teardownTestDatabase } from '../helpers';

describe('Products API Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          hotmart_id: 'TEST123',
          name: 'Test Product',
          niche: 'health',
          url_sales_page: 'https://example.com'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        hotmart_id: 'TEST123',
        name: 'Test Product'
      });
    });

    it('should reject invalid data', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          hotmart_id: '123',  // Too short
          name: 'Test'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
```

### Testing Checklist
- [ ] Unit tests cover all business logic
- [ ] Integration tests cover API endpoints
- [ ] Edge cases tested
- [ ] Error handling tested
- [ ] Mocks used appropriately
- [ ] Tests are deterministic (no random failures)
- [ ] Coverage > 80%
- [ ] Tests run in CI/CD
- [ ] Test data cleaned up after each test
- [ ] Performance tests for critical paths

---

## 🔄 INTER-AGENT COMMUNICATION

### Escalation Protocol

When an agent encounters an issue outside its domain:

1. **Identify the appropriate agent**
2. **Provide context**
3. **Request specific assistance**

Example:
```
🔄 Escalation: Frontend → Security Agent

Context: Implementing user authentication in ProductCard component
Question: What's the secure pattern for storing JWT tokens?

Current approach: localStorage.setItem('token', jwt)
Security concerns: XSS vulnerability?

Requesting Security Agent review.
```

### Collaborative Workflow

For features requiring multiple agents:

1. **Backend Agent**: Creates API endpoint
2. **Database Agent**: Reviews query performance
3. **Frontend Agent**: Implements UI component
4. **Testing Agent**: Creates test suite
5. **Security Agent**: Final security review
6. **DevOps Agent**: Deploys to environment

---

## 📊 AGENT PERFORMANCE METRICS

Each agent should track:
- Tasks completed
- Average response time
- Error rate
- Code quality score
- Test coverage contribution
- Security issues found/fixed

---

**END OF SUB-AGENTS DOCUMENTATION**

Remember: Specialized agents work together under ANTIGRAVITY's orchestration to build a world-class system.
