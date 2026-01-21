# 📚 RUTAS DE APRENDIZAJE Y DOCUMENTACIÓN - Hotmart Automation

**Purpose**: Biblioteca de conocimiento contextualizada para ANTIGRAVITY y sub-agentes  
**Maintenance**: Actualizar cuando se adopten nuevas tecnologías o patrones

---

## 🎯 CÓMO USAR ESTA GUÍA

### Para Agentes AI
1. **Identifica el contexto** de la tarea actual
2. **Consulta la sección relevante** antes de implementar
3. **Aplica los patrones** documentados aquí
4. **Referencia las fuentes** oficiales cuando sea necesario
5. **Actualiza esta guía** si encuentras mejores prácticas

### Para Desarrolladores Humanos
Esta guía sirve como:
- Onboarding para nuevos desarrolladores
- Referencia rápida de patrones del proyecto
- Estándares de código a seguir
- Recursos de aprendizaje curados

---

## 🗺️ RUTAS DE APRENDIZAJE POR ROL

### 1. 🔧 Backend Developer (Motor)

#### Nivel 1: Fundamentos (Semana 1-2)
**Objetivo**: Entender la arquitectura base y poder contribuir con endpoints simples

**Temas Esenciales:**
- [x] Node.js + Express basics
- [x] TypeScript fundamentals
- [x] Async/await patterns
- [x] PostgreSQL basics
- [x] Redis caching

**Recursos:**
1. **Node.js Best Practices** (CRÍTICO)
   - URL: https://github.com/goldbergyoni/nodebestpractices
   - Qué leer: Sections 1-3 (Project Architecture, Error Handling, Code Patterns)
   - Aplicación: Todos los archivos en `motor/src/`
   - Tiempo estimado: 4-6 horas

2. **TypeScript Deep Dive**
   - URL: https://basarat.gitbook.io/typescript/
   - Qué leer: Chapters 1-5, 10 (Types, Interfaces, Classes, Generics)
   - Aplicación: Type definitions en `motor/src/types/`
   - Tiempo estimado: 8-10 horas

3. **Express.js Security Best Practices**
   - URL: https://expressjs.com/en/advanced/best-practice-security.html
   - Qué leer: Todo el documento
   - Aplicación: `motor/src/middleware/`, `motor/src/app.ts`
   - Tiempo estimado: 2-3 horas

**Ejercicio Práctico:**
```typescript
// Implementa este endpoint siguiendo los estándares

// File: motor/src/controllers/metrics.controller.ts

/**
 * TODO: Implementar endpoint para obtener métricas de un producto
 * 
 * Requirements:
 * 1. Validar que el productId existe
 * 2. Obtener métricas de los últimos 30 días
 * 3. Calcular promedio de CTR y engagement
 * 4. Retornar respuesta estructurada
 * 5. Manejar errores apropiadamente
 * 
 * Expected response:
 * {
 *   success: true,
 *   data: {
 *     productId: string,
 *     period: { start: Date, end: Date },
 *     metrics: {
 *       avgCTR: number,
 *       avgEngagement: number,
 *       totalSales: number,
 *       trend: 'up' | 'down' | 'stable'
 *     }
 *   }
 * }
 */

import { Request, Response } from 'express';
import { MetricsService } from '../services/metrics.service';

export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  async getProductMetrics(req: Request, res: Response): Promise<void> {
    // Tu implementación aquí
  }
}
```

#### Nivel 2: Intermedio (Semana 3-4)
**Objetivo**: Implementar lógica de negocio compleja y optimizar performance

**Temas:**
- [ ] Advanced TypeScript patterns
- [ ] Database query optimization
- [ ] Redis advanced patterns
- [ ] Bayesian statistics basics
- [ ] Testing strategies

**Recursos:**
1. **PostgreSQL Performance Tips**
   - URL: https://www.postgresql.org/docs/current/performance-tips.html
   - Qué leer: Query Planning, Indexes, Optimization
   - Aplicación: `motor/src/repositories/`
   - Enfoque: Queries lentos, optimización de joins

2. **Redis University: Caching**
   - URL: https://university.redis.com/courses/ru101/
   - Qué hacer: Módulos 1-3
   - Aplicación: `motor/src/services/cache.service.ts`
   - Patrones: Cache-aside, write-through

3. **Bayesian Methods for Hackers**
   - URL: https://github.com/CamDavidsonPilon/Probabilistic-Programming-and-Bayesian-Methods-for-Hackers
   - Qué leer: Chapter 1-2
   - Aplicación: `motor/src/services/bayesian-engine.ts`
   - Enfoque: Beta distribution, posterior updates

**Ejercicio Práctico:**
```typescript
// File: motor/src/services/bayesian-engine.ts

/**
 * TODO: Implementar algoritmo de actualización Bayesiana
 * 
 * Contexto:
 * - Usamos Beta-Binomial conjugate prior
 * - Prior: Beta(α, β) donde α = successes, β = failures
 * - Likelihood: Binomial(n, p)
 * - Posterior: Beta(α + k, β + n - k)
 * 
 * Requirements:
 * 1. Recibir prior (alpha, beta) del cache o usar uninformative prior (1,1)
 * 2. Actualizar con nuevas observaciones (sales, refunds)
 * 3. Calcular mean, variance, y credible interval del posterior
 * 4. Guardar resultado en cache con TTL de 1 hora
 * 
 * Formula:
 * mean = α / (α + β)
 * variance = (α * β) / ((α + β)² * (α + β + 1))
 */

interface BayesianPrior {
  alpha: number;
  beta: number;
}

interface BayesianPosterior extends BayesianPrior {
  mean: number;
  variance: number;
  credibleInterval: [number, number];
}

export class BayesianEngine {
  updatePosterior(
    prior: BayesianPrior,
    observations: { successes: number; failures: number }
  ): BayesianPosterior {
    // Tu implementación aquí
    // Usar mathjs para cálculos estadísticos
  }
}
```

#### Nivel 3: Avanzado (Semana 5-6)
**Objetivo**: Arquitectura de sistemas, escalabilidad, y optimización avanzada

**Temas:**
- [ ] Microservices patterns
- [ ] Event-driven architecture
- [ ] Load balancing strategies
- [ ] Monitoring and observability
- [ ] Advanced security patterns

**Recursos:**
1. **Microservices Patterns**
   - URL: https://microservices.io/patterns/index.html
   - Qué leer: Data patterns, Communication patterns
   - Aplicación: Futura migración a microservicios
   - Patrones relevantes: API Gateway, Event Sourcing

2. **Observability Engineering** (Book summary)
   - Conceptos: Metrics, Logs, Traces (MELTs)
   - Aplicación: `motor/src/utils/logger.ts`, `motor/src/utils/metrics.ts`
   - Herramientas: Prometheus, Grafana (futuro)

---

### 2. 🎨 Frontend Developer (Dashboard)

#### Nivel 1: Fundamentos (Semana 1-2)
**Objetivo**: Crear componentes React funcionales con TypeScript y Tailwind

**Temas Esenciales:**
- [x] React Hooks (useState, useEffect, useContext)
- [x] TypeScript with React
- [x] Tailwind CSS utility classes
- [x] Basic state management
- [x] API integration with fetch/axios

**Recursos:**
1. **React Official Documentation**
   - URL: https://react.dev/learn
   - Qué leer: Quick Start → Thinking in React
   - Aplicación: Todos los componentes en `dashboard/src/components/`
   - Tiempo: 6-8 horas

2. **TypeScript + React Cheatsheet**
   - URL: https://react-typescript-cheatsheet.netlify.app/
   - Qué leer: Secciones: Basic, Advanced, HOC/Render Props
   - Aplicación: Type definitions para props e interfaces
   - Tiempo: 3-4 horas

3. **Tailwind CSS Documentation**
   - URL: https://tailwindcss.com/docs
   - Qué leer: Core Concepts, Customization
   - Aplicación: Todo el styling del dashboard
   - Tiempo: 4-5 horas
   - **Importante**: Solo usar utility classes, nunca CSS inline

**Ejercicio Práctico:**
```tsx
// File: dashboard/src/components/MetricsCard.tsx

/**
 * TODO: Crear componente de tarjeta de métricas
 * 
 * Requirements:
 * 1. Recibir title, value, trend ('up'|'down'|'stable'), icon
 * 2. Usar Tailwind para styling (NO inline CSS)
 * 3. Mostrar ícono de tendencia con color apropiado
 * 4. Animación suave al cambiar valor
 * 5. Responsive design (mobile-first)
 * 6. Accessible (ARIA labels)
 * 
 * Design specs:
 * - Border radius: 8px
 * - Padding: 16px
 * - Shadow on hover
 * - Green para 'up', Red para 'down', Gray para 'stable'
 */

import { FC } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
}

export const MetricsCard: FC<MetricsCardProps> = ({
  title,
  value,
  trend,
  icon
}) => {
  // Tu implementación aquí
  return (
    <div>
      {/* Implementar usando solo Tailwind classes */}
    </div>
  );
};
```

#### Nivel 2: Intermedio (Semana 3-4)
**Objetivo**: State management avanzado, performance optimization, y testing

**Temas:**
- [ ] Zustand/Context API para state global
- [ ] React Query para server state
- [ ] Custom Hooks
- [ ] Performance optimization (memo, useMemo, useCallback)
- [ ] Component testing con Vitest

**Recursos:**
1. **Zustand Documentation**
   - URL: https://docs.pmnd.rs/zustand/getting-started/introduction
   - Qué leer: Todo el Getting Started + Recipes
   - Aplicación: `dashboard/src/stores/`
   - Tiempo: 2-3 horas

2. **TanStack Query (React Query) Docs**
   - URL: https://tanstack.com/query/latest/docs/react/overview
   - Qué leer: Overview, Queries, Mutations, Caching
   - Aplicación: `dashboard/src/hooks/useProducts.ts`
   - Tiempo: 4-5 horas

3. **React Performance Optimization**
   - URL: https://react.dev/learn/render-and-commit
   - Qué leer: Preserving and Resetting State, Choosing the State Structure
   - Aplicación: Optimización de re-renders en listas de productos
   - Tiempo: 3-4 horas

**Ejercicio Práctico:**
```tsx
// File: dashboard/src/hooks/useProducts.ts

/**
 * TODO: Crear custom hook para gestión de productos
 * 
 * Requirements:
 * 1. Usar React Query para fetching
 * 2. Implementar cache de 5 minutos
 * 3. Refetch on window focus
 * 4. Manejo de loading y error states
 * 5. Mutations para create/update/delete
 * 6. Optimistic updates
 * 
 * Features:
 * - Prefetch siguiente página en paginación
 * - Invalidate cache después de mutations
 * - Retry automático (3 intentos con backoff exponencial)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/services/api';

export const useProducts = (filters?: ProductFilters) => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    // Tu implementación aquí
  });

  const createMutation = useMutation({
    // Tu implementación aquí
  });

  return {
    products: productsQuery.data,
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    createProduct: createMutation.mutate,
    // ...otros métodos
  };
};
```

#### Nivel 3: Avanzado (Semana 5-6)
**Objetivo**: Arquitectura de aplicaciones, accesibilidad avanzada, y optimización de bundle

**Temas:**
- [ ] Code splitting y lazy loading
- [ ] Advanced accessibility (WCAG 2.1 AA)
- [ ] Web Vitals optimization
- [ ] Advanced animation con Framer Motion
- [ ] Micro-frontends concepts

**Recursos:**
1. **Web.dev: Performance**
   - URL: https://web.dev/explore/fast
   - Qué leer: Core Web Vitals, Optimize LCP, Reduce CLS
   - Aplicación: Optimización del dashboard
   - Herramientas: Lighthouse, Chrome DevTools

2. **Vite Performance Guide**
   - URL: https://vitejs.dev/guide/performance.html
   - Qué leer: Build Performance, Chunking Strategy
   - Aplicación: `vite.config.ts` optimization
   - Objetivo: Bundle < 500KB

---

### 3. 🐳 DevOps Engineer

#### Nivel 1: Fundamentos (Semana 1-2)
**Objetivo**: Entender Docker, docker-compose, y deployment básico

**Temas Esenciales:**
- [x] Docker fundamentals
- [x] Docker Compose multi-container apps
- [x] Container networking
- [x] Volume management
- [x] Basic security practices

**Recursos:**
1. **Docker Official Tutorial**
   - URL: https://docs.docker.com/get-started/
   - Qué hacer: Todo el Get Started
   - Aplicación: `docker-compose.yml`, `Dockerfile`
   - Tiempo: 6-8 horas

2. **Docker Best Practices**
   - URL: https://docs.docker.com/develop/dev-best-practices/
   - Qué leer: Todo el documento
   - Aplicación: Multi-stage builds, .dockerignore
   - Tiempo: 2-3 horas

**Ejercicio Práctico:**
```dockerfile
# File: dashboard/Dockerfile

# TODO: Crear multi-stage build optimizado para producción
# 
# Requirements:
# 1. Stage 1 (deps): Instalar solo dependencies
# 2. Stage 2 (builder): Build del proyecto
# 3. Stage 3 (runner): Nginx para servir archivos estáticos
# 4. Usar non-root user
# 5. Minimizar tamaño de imagen final
# 6. Incluir health check
# 
# Target: < 50MB final image size

# Tu implementación aquí
```

#### Nivel 2: Intermedio (Semana 3-4)
**Objetivo**: CI/CD, monitoring, y orchestration

**Temas:**
- [ ] GitHub Actions workflows
- [ ] Container orchestration concepts
- [ ] Monitoring con Prometheus
- [ ] Log aggregation
- [ ] Backup strategies

**Recursos:**
1. **GitHub Actions Documentation**
   - URL: https://docs.github.com/en/actions
   - Qué leer: Quickstart, Core concepts, Security
   - Aplicación: `.github/workflows/`
   - Tiempo: 5-6 horas

2. **The Twelve-Factor App**
   - URL: https://12factor.net/
   - Qué leer: Todo (es corto)
   - Aplicación: Arquitectura general del proyecto
   - Tiempo: 2-3 horas

---

### 4. 💾 Database Engineer

#### Nivel 1: Fundamentos (Semana 1-2)
**Objetivo**: Diseño de schemas, queries eficientes, y migrations

**Recursos:**
1. **PostgreSQL Tutorial**
   - URL: https://www.postgresqltutorial.com/
   - Qué leer: Secciones 1-7
   - Aplicación: `motor/src/migrations/`
   - Tiempo: 10-12 horas

2. **Database Design Best Practices**
   - URL: https://www.postgresql.org/docs/current/ddl.html
   - Qué leer: Schema Design, Constraints, Indexes
   - Aplicación: Schema design en migrations
   - Tiempo: 4-5 horas

**Ejercicio Práctico:**
```sql
-- File: motor/src/migrations/002_content_history.sql

-- TODO: Diseñar schema para historial de contenido generado
-- 
-- Requirements:
-- 1. Relación con products (1:N)
-- 2. Guardar: tipo (post/reel/story), copy, media_url, platform
-- 3. Métricas: views, likes, comments, shares
-- 4. Timestamp de publicación y última actualización
-- 5. Indexes apropiados para queries frecuentes
-- 6. Constraints para data integrity
-- 
-- Queries esperados:
-- - Top content por producto
-- - Contenido publicado en últimos 7 días
-- - Engagement promedio por tipo de contenido

-- Tu implementación aquí
```

---

## 📖 GUÍAS DE REFERENCIA RÁPIDA

### Node.js/Express Patterns

#### 1. Error Handling
```typescript
// ✅ PATRÓN CORRECTO

// Custom Error Classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async Error Wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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
});
```

#### 2. Repository Pattern
```typescript
// ✅ PATRÓN CORRECTO

// Interface
interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findMany(filters: ProductFilters): Promise<Product[]>;
  create(data: CreateProductDTO): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}

// Implementation
export class ProductRepository implements IProductRepository {
  constructor(private db: Pool) {}

  async findById(id: string): Promise<Product | null> {
    const result = await this.db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // ... other methods
}

// Dependency Injection in Controller
export class ProductController {
  constructor(private productRepo: IProductRepository) {}
  
  async getProduct(req: Request, res: Response) {
    const product = await this.productRepo.findById(req.params.id);
    if (!product) {
      throw new NotFoundError('Product');
    }
    res.json({ success: true, data: product });
  }
}
```

### React/TypeScript Patterns

#### 1. Component Composition
```tsx
// ✅ PATRÓN CORRECTO

// Compound Component Pattern
interface CardComposition {
  Header: FC<CardHeaderProps>;
  Body: FC<CardBodyProps>;
  Footer: FC<CardFooterProps>;
}

export const Card: FC<CardProps> & CardComposition = ({ children }) => {
  return <div className="rounded-lg border bg-white shadow">{children}</div>;
};

Card.Header = ({ title }) => (
  <div className="border-b px-6 py-4">
    <h3 className="text-lg font-semibold">{title}</h3>
  </div>
);

Card.Body = ({ children }) => (
  <div className="px-6 py-4">{children}</div>
);

Card.Footer = ({ children }) => (
  <div className="border-t px-6 py-4">{children}</div>
);

// Usage
<Card>
  <Card.Header title="Product Details" />
  <Card.Body>
    <ProductInfo />
  </Card.Body>
  <Card.Footer>
    <ActionButtons />
  </Card.Footer>
</Card>
```

#### 2. Custom Hooks Pattern
```tsx
// ✅ PATRÓN CORRECTO

// Generic data fetching hook
export function useResource<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  return useQuery({
    queryKey: [key],
    queryFn: fetchFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

// Specific implementation
export function useProduct(id: string) {
  return useResource(
    `product-${id}`,
    () => productApi.getOne(id),
    {
      enabled: !!id,
      retry: 3
    }
  );
}

// Usage in component
const ProductDetails: FC<{ id: string }> = ({ id }) => {
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorAlert error={error} />;
  if (!product) return <NotFound />;

  return <ProductCard product={product} />;
};
```

### SQL Optimization Patterns

#### 1. Index Strategy
```sql
-- ✅ PATRÓN CORRECTO

-- Index on frequently queried columns
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_niche ON products(niche);

-- Composite index for multi-column queries
CREATE INDEX idx_products_status_niche ON products(status, niche);

-- Partial index for specific conditions
CREATE INDEX idx_active_products ON products(status)
WHERE status = 'active';

-- Index on foreign keys
CREATE INDEX idx_metrics_product_id ON metrics(product_id);

-- EXPLAIN ANALYZE to verify index usage
EXPLAIN ANALYZE
SELECT * FROM products
WHERE status = 'active' AND niche = 'health';
```

#### 2. Query Optimization
```sql
-- ❌ INCORRECTO: N+1 query problem
SELECT * FROM products;
-- Then for each product:
SELECT * FROM metrics WHERE product_id = ?;

-- ✅ CORRECTO: JOIN to fetch all data in one query
SELECT 
  p.*,
  json_agg(
    json_build_object(
      'id', m.id,
      'sales', m.sales,
      'ctr', m.ctr
    )
  ) as metrics
FROM products p
LEFT JOIN metrics m ON p.id = m.product_id
GROUP BY p.id;
```

---

## 🔍 DEBUGGING GUIDES

### Backend Debugging

#### Common Issues & Solutions

**Issue**: `ECONNREFUSED` al conectar a base de datos
```bash
# Verificar que el contenedor esté corriendo
docker ps | grep postgres

# Ver logs del contenedor
docker logs hotmart_db

# Verificar variables de entorno
docker exec hotmart_motor env | grep DB_

# Test de conexión manual
docker exec -it hotmart_db psql -U hotmart_user -d hotmart
```

**Issue**: Queries lentos
```typescript
// Habilitar query logging
import { Pool } from 'pg';

const pool = new Pool({
  // ... config
  log: (msg) => console.log('DB Query:', msg)
});

// Usar EXPLAIN ANALYZE
const result = await pool.query(`
  EXPLAIN ANALYZE
  SELECT * FROM products WHERE status = 'active'
`);
console.log(result.rows);
```

### Frontend Debugging

#### React DevTools Profiler
```tsx
// Envolver componentes sospechosos en Profiler
import { Profiler } from 'react';

<Profiler
  id="ProductList"
  onRender={(id, phase, actualDuration) => {
    console.log(`${id} ${phase} took ${actualDuration}ms`);
  }}
>
  <ProductList products={products} />
</Profiler>
```

#### Network Debugging
```typescript
// Interceptor para debug de API calls
axios.interceptors.request.use((config) => {
  console.log('API Request:', {
    method: config.method,
    url: config.url,
    data: config.data
  });
  return config;
});

axios.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
```

---

## 📊 PERFORMANCE BENCHMARKS

### Expected Performance Targets

**Backend (Motor API)**
- API Response Time: < 200ms (p95)
- Database Query Time: < 50ms (p95)
- Throughput: > 1000 req/s
- Error Rate: < 0.1%

**Frontend (Dashboard)**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Performance Score: > 90
- Bundle Size: < 500KB (gzipped)

**Database**
- Query Execution: < 50ms (p95)
- Connection Pool Utilization: < 70%
- Cache Hit Rate: > 80%

### Monitoring Commands
```bash
# Backend performance
docker stats hotmart_motor

# Database performance
docker exec hotmart_db pg_stat_statements

# Frontend bundle analysis
cd dashboard && npm run build -- --analyze
```

---

## 🎓 CERTIFICATION PATHS

### Recommended Certifications (Optional)

**For Backend:**
- AWS Certified Developer - Associate
- MongoDB Certified Developer
- Node.js Application Developer (JSNAD)

**For Frontend:**
- Meta Front-End Developer Professional Certificate
- Google UX Design Professional Certificate

**For DevOps:**
- Docker Certified Associate
- Kubernetes Administrator (CKA)
- AWS Certified Solutions Architect

---

## 📝 CONTRIBUIR A ESTA GUÍA

### Cómo Actualizar
1. Crea branch: `docs/update-learning-paths`
2. Actualiza la sección relevante
3. Añade fecha de actualización
4. Crea PR con label `documentation`

### Template para Nuevas Secciones
```markdown
### [Tecnología/Concepto]

**Cuándo Necesitas Esto:**
[Descripción del caso de uso]

**Recursos:**
1. **[Nombre del Recurso]**
   - URL: [link]
   - Qué leer/hacer: [specific sections]
   - Aplicación en el proyecto: [file paths]
   - Tiempo estimado: [hours]

**Ejercicio Práctico:**
```[language]
// Código de ejemplo con TODOs
```

**Referencias Rápidas:**
[Snippets de código comunes]
```

---

**ÚLTIMA ACTUALIZACIÓN:** 2026-01-20  
**MANTENEDOR:** ANTIGRAVITY System  
**CONTRIBUTORS:** [Lista de contribuidores]

---

**FIN DE RUTAS DE APRENDIZAJE**

Esta es una guía viva. Actualízala cuando descubras mejores recursos o patrones.
