# 🚀 GUÍA DE IMPLEMENTACIÓN PRÁCTICA - ANTIGRAVITY

**Project**: Hotmart Automation  
**Version**: 2.0  
**Date**: 2026-01-20

---

## 🎯 OBJETIVO DE ESTE DOCUMENTO

Esta guía te llevará desde cero hasta tener ANTIGRAVITY completamente configurado y operativo en tu proyecto. Incluye:

1. ✅ Checklist de configuración inicial
2. 🔧 Comandos exactos a ejecutar
3. 📝 Templates listos para usar
4. ⚠️ Problemas comunes y soluciones
5. 🎓 Primeros pasos después de la configuración

---

## 📋 CHECKLIST DE CONFIGURACIÓN INICIAL

### Fase 1: Preparación del Entorno (15 min)

- [ ] **1.1** Docker Desktop instalado y corriendo
  ```bash
  docker --version
  # Debe mostrar: Docker version 24.x.x o superior
  ```

- [ ] **1.2** Node.js 20+ instalado
  ```bash
  node --version
  # Debe mostrar: v20.x.x o superior
  ```

- [ ] **1.3** Git configurado
  ```bash
  git --version
  git config --global user.name "Tu Nombre"
  git config --global user.email "tu@email.com"
  ```

- [ ] **1.4** GitHub CLI instalado (opcional pero recomendado)
  ```bash
  gh --version
  gh auth login
  ```

### Fase 2: Configuración del Proyecto (30 min)

- [ ] **2.1** Clonar/inicializar repositorio
  ```bash
  # Si ya existe:
  cd /path/to/hotmart-automation
  
  # Si es nuevo:
  mkdir hotmart-automation && cd hotmart-automation
  git init
  ```

- [ ] **2.2** Crear estructura de carpetas
  ```bash
  mkdir -p motor/src/{controllers,services,repositories,models,middleware,utils,types,config}
  mkdir -p motor/tests/{unit,integration}
  mkdir -p dashboard/src/{components,pages,hooks,services,stores,types,utils}
  mkdir -p dashboard/public
  mkdir -p data/{postgres,redis,logs}
  mkdir -p models/ollama
  mkdir -p .github/workflows
  mkdir -p docs
  ```

- [ ] **2.3** Copiar archivos de configuración ANTIGRAVITY
  ```bash
  # Coloca los siguientes archivos en docs/:
  # - ANTIGRAVITY_SYSTEM_PROMPT.md
  # - SUB_AGENTS_GUIDE.md
  # - LEARNING_PATHS.md
  # - IMPLEMENTATION_GUIDE.md (este archivo)
  ```

- [ ] **2.4** Crear .gitignore
  ```bash
  cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json

# Environment variables
.env
.env.local
.env.*.local

# Data directories (persistencia local)
data/
models/ollama/

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
*.temp
EOF
  ```

- [ ] **2.5** Crear archivo .env
  ```bash
  cat > .env << 'EOF'
# Database
DB_HOST=db
DB_PORT=5432
DB_USER=hotmart_user
DB_PASSWORD=SecureP@ssw0rd2026
DB_NAME=hotmart

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=RedisSecure2026

# N8N
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=Admin2026!

# Ollama
OLLAMA_URL=http://ollama:11434

# API
API_PORT=4000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:4000
EOF
  ```

- [ ] **2.6** Crear docker-compose.yml
  ```bash
  # Ver template completo en sección "Templates" abajo
  ```

### Fase 3: Inicialización de Servicios (20 min)

- [ ] **3.1** Backend (Motor)
  ```bash
  cd motor
  npm init -y
  npm install express pg redis typescript ts-node @types/node @types/express dotenv
  npm install -D nodemon @types/pg @types/redis eslint prettier
  
  # Crear tsconfig.json
  npx tsc --init
  ```

- [ ] **3.2** Frontend (Dashboard)
  ```bash
  cd ../dashboard
  npm create vite@latest . -- --template react-ts
  npm install
  npm install @tanstack/react-query zustand axios tailwindcss lucide-react
  npx tailwindcss init -p
  ```

- [ ] **3.3** Levantar servicios Docker
  ```bash
  cd ..
  docker-compose up -d
  ```

- [ ] **3.4** Verificar que todos los servicios estén corriendo
  ```bash
  docker-compose ps
  # Todos deben estar "Up" (healthy)
  ```

### Fase 4: Configuración de ANTIGRAVITY (10 min)

- [ ] **4.1** Leer el System Prompt completo
  ```bash
  cat docs/ANTIGRAVITY_SYSTEM_PROMPT.md
  # Familiarízate con las reglas y principios
  ```

- [ ] **4.2** Configurar tu AI Assistant
  ```
  1. Abre tu herramienta de AI (Claude, ChatGPT, etc.)
  2. Crea un nuevo proyecto/thread
  3. Nombre: "Hotmart Automation - ANTIGRAVITY"
  4. System Prompt: Copia el contenido de ANTIGRAVITY_SYSTEM_PROMPT.md
  5. Adjunta los otros documentos como contexto
  ```

- [ ] **4.3** Primera interacción con ANTIGRAVITY
  ```
  Prompt de prueba:
  "Hi ANTIGRAVITY. I need you to help me implement the first API endpoint 
  for creating products. Please review the system prompt and guide me through 
  the implementation following all standards."
  ```

### Fase 5: Primer Desarrollo (45 min)

- [ ] **5.1** Implementar schema de base de datos
  ```bash
  # ANTIGRAVITY te guiará en crear:
  # motor/src/migrations/001_initial_schema.sql
  ```

- [ ] **5.2** Implementar modelo Product
  ```bash
  # motor/src/models/product.model.ts
  ```

- [ ] **5.3** Implementar ProductRepository
  ```bash
  # motor/src/repositories/product.repository.ts
  ```

- [ ] **5.4** Implementar ProductService
  ```bash
  # motor/src/services/product.service.ts
  ```

- [ ] **5.5** Implementar ProductController
  ```bash
  # motor/src/controllers/product.controller.ts
  ```

- [ ] **5.6** Crear tests unitarios
  ```bash
  # motor/src/services/__tests__/product.service.test.ts
  ```

- [ ] **5.7** Crear primer componente React
  ```bash
  # dashboard/src/components/ProductCard.tsx
  ```

### Fase 6: Git Workflow (15 min)

- [ ] **6.1** Configurar ramas base
  ```bash
  git checkout -b dev
  git push -u origin dev
  
  git checkout -b main
  git push -u origin main
  ```

- [ ] **6.2** Proteger rama main (GitHub)
  ```
  1. Ve a Settings → Branches
  2. Add rule para "main"
  3. Require pull request reviews
  4. Require status checks to pass
  ```

- [ ] **6.3** Primer feature branch
  ```bash
  git checkout dev
  git checkout -b feature/1-initial-setup
  
  # Hacer commits
  git add .
  git commit -m "feat(setup): initial project structure"
  
  # Push y crear PR
  git push origin feature/1-initial-setup
  gh pr create --base dev --title "Initial Setup" --body "Sets up project structure"
  ```

---

## 📝 TEMPLATES LISTOS PARA USAR

### Template: docker-compose.yml

```yaml
version: '3.9'

services:
  db:
    image: postgres:15-alpine
    container_name: hotmart_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    networks:
      - hotmart_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: hotmart_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - ./data/redis:/data
    networks:
      - hotmart_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    ports:
      - "6379:6379"

  ollama:
    image: ollama/ollama:latest
    container_name: hotmart_ollama
    restart: unless-stopped
    volumes:
      - ./models/ollama:/root/.ollama
    networks:
      - hotmart_network
    ports:
      - "11434:11434"

  n8n:
    image: n8nio/n8n
    container_name: hotmart_n8n
    restart: unless-stopped
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${DB_NAME}
      - DB_POSTGRESDB_USER=${DB_USER}
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - hotmart_network
    ports:
      - "5679:5678"
    volumes:
      - ./data/n8n:/home/node/.n8n

  motor:
    build:
      context: ./motor
      dockerfile: Dockerfile
    container_name: hotmart_motor
    restart: unless-stopped
    environment:
      - NODE_ENV=${NODE_ENV}
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - OLLAMA_URL=${OLLAMA_URL}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - hotmart_network
    ports:
      - "${API_PORT}:4000"
    volumes:
      - ./motor:/app
      - /app/node_modules

  dashboard:
    build:
      context: ./dashboard
      dockerfile: Dockerfile
    container_name: hotmart_dashboard
    restart: unless-stopped
    environment:
      - VITE_API_URL=${VITE_API_URL}
    depends_on:
      - motor
    networks:
      - hotmart_network
    ports:
      - "3000:3000"
    volumes:
      - ./dashboard:/app
      - /app/node_modules

networks:
  hotmart_network:
    driver: bridge
```

### Template: motor/Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start application
CMD ["npm", "run", "start"]
```

### Template: motor/src/index.ts

```typescript
import express, { Application } from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import Redis from 'redis';

// Load environment variables
dotenv.config();

// Initialize Express
const app: Application = express();
const PORT = process.env.API_PORT || 4000;

// Middleware
app.use(express.json());

// Database connection
const db = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Redis connection
const redis = Redis.createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redis.on('error', (err) => console.error('Redis error:', err));
redis.connect();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    await redis.ping();
    res.json({ status: 'healthy', timestamp: new Date() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error });
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hotmart Automation API',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Motor API running on port ${PORT}`);
});

export { app, db, redis };
```

### Template: dashboard/src/App.tsx

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Hotmart Automation Dashboard
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-gray-600">
            Dashboard en construcción...
          </p>
        </main>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: Docker no levanta servicios

**Síntoma:**
```bash
docker-compose up -d
# Error: Cannot connect to the Docker daemon
```

**Solución:**
```bash
# Iniciar Docker Desktop
open -a Docker

# Verificar que Docker esté corriendo
docker info

# Reintentar
docker-compose up -d
```

### Problema 2: Puerto ya en uso

**Síntoma:**
```bash
Error: bind: address already in use
```

**Solución:**
```bash
# Encontrar qué proceso usa el puerto
lsof -i :5679

# Matar el proceso
kill -9 [PID]

# O cambiar el puerto en docker-compose.yml
ports:
  - "5680:5678"  # Cambiar 5679 a 5680
```

### Problema 3: Error de permisos en npm

**Síntoma:**
```bash
npm ERR! EACCES: permission denied
```

**Solución:**
```bash
# Arreglar permisos de la carpeta npm
sudo chown -R $(whoami) ~/.npm

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Problema 4: TypeScript errors en desarrollo

**Síntoma:**
```
Error: Cannot find module '@/types/product'
```

**Solución:**
```json
// Actualizar tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Problema 5: CORS errors en dashboard

**Síntoma:**
```
Access to fetch at 'http://localhost:4000' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solución:**
```typescript
// motor/src/index.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## 🎓 PRIMEROS PASOS CON ANTIGRAVITY

### Día 1: Familiarización (2-3 horas)

1. **Lee el System Prompt completo**
   - Tiempo: 30 min
   - Archivo: `docs/ANTIGRAVITY_SYSTEM_PROMPT.md`
   - Objetivo: Entender roles, reglas, y principios

2. **Revisa la guía de Sub-Agentes**
   - Tiempo: 30 min
   - Archivo: `docs/SUB_AGENTS_GUIDE.md`
   - Objetivo: Conocer especialistas disponibles

3. **Explora las Rutas de Aprendizaje**
   - Tiempo: 30 min
   - Archivo: `docs/LEARNING_PATHS.md`
   - Objetivo: Identificar recursos para tu rol

4. **Primer ejercicio práctico**
   - Tiempo: 60 min
   - Tarea: Implementar endpoint `/health` con ANTIGRAVITY
   - Objetivo: Practicar el workflow

### Semana 1: Desarrollo Guiado

**Lunes**: Setup + Backend básico
- [ ] Configurar proyecto según checklist
- [ ] Implementar primer endpoint con ANTIGRAVITY
- [ ] Escribir tests unitarios

**Martes-Miércoles**: Backend intermedio
- [ ] Implementar Bayesian Engine básico
- [ ] Crear repositorios y servicios
- [ ] Configurar Redis caching

**Jueves-Viernes**: Frontend básico
- [ ] Crear componentes React
- [ ] Integrar con API
- [ ] Implementar state management

### Mes 1: Autonomía Progresiva

**Semana 1-2**: Desarrollo guiado con ANTIGRAVITY
- ANTIGRAVITY propone soluciones completas
- Tú revisas y aprendes los patrones
- Preguntas frecuentes a ANTIGRAVITY

**Semana 3**: Semi-autónomo
- Tú propones implementaciones
- ANTIGRAVITY revisa y sugiere mejoras
- Comienzas a internalizar estándares

**Semana 4**: Autónomo con validación
- Implementas features completas
- ANTIGRAVITY valida antes de merge
- Usas sub-agentes según necesidad

---

## 📚 COMANDOS DE REFERENCIA RÁPIDA

### Docker
```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f [service]

# Reiniciar servicio
docker-compose restart [service]

# Detener todo
docker-compose down

# Limpiar volúmenes (CUIDADO: Borra datos)
docker-compose down -v

# Rebuild después de cambios en Dockerfile
docker-compose up -d --build
```

### Git con ANTIGRAVITY
```bash
# Crear feature branch
git checkout dev
git pull origin dev
git checkout -b feature/[ID]-[description]

# Commits siguiendo Conventional Commits
git add .
git commit -m "feat(scope): description"

# Push y crear PR
git push origin feature/[ID]-[description]
gh pr create --base dev --fill

# Merge después de aprobación
gh pr merge [PR_NUMBER] --squash
```

### NPM Scripts (definir en package.json)
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🎯 PRÓXIMOS PASOS

Después de completar esta guía, deberías:

1. **Tener el entorno completamente funcional**
   - ✅ Docker corriendo con todos los servicios
   - ✅ Backend respondiendo en puerto 4000
   - ✅ Dashboard corriendo en puerto 3000
   - ✅ Base de datos accesible

2. **Conocer el sistema ANTIGRAVITY**
   - ✅ System prompt configurado
   - ✅ Sub-agentes identificados
   - ✅ Recursos de aprendizaje conocidos

3. **Haber implementado tu primer feature**
   - ✅ Endpoint de backend funcional
   - ✅ Tests pasando
   - ✅ PR creado y mergeado

**Siguiente milestone**: Implementar el motor Bayesian completo
- Consultar `LEARNING_PATHS.md` → Backend → Nivel 2
- Usar ANTIGRAVITY para guiar la implementación
- Referirse a `SUB_AGENTS_GUIDE.md` para patrones específicos

---

## 📞 SOPORTE

### Si te atascas:

1. **Consulta la documentación ANTIGRAVITY**
   - `ANTIGRAVITY_SYSTEM_PROMPT.md` para reglas generales
   - `SUB_AGENTS_GUIDE.md` para patrones específicos
   - `LEARNING_PATHS.md` para recursos de aprendizaje

2. **Pregunta a ANTIGRAVITY**
   - Describe el problema con contexto
   - Incluye mensajes de error completos
   - Menciona qué ya intentaste

3. **Revisa issues similares**
   ```bash
   gh issue list --search "label:bug"
   ```

4. **Crea un nuevo issue**
   ```bash
   gh issue create --title "Bug: [description]" --body "Details..."
   ```

---

## ✅ VALIDACIÓN FINAL

Antes de considerar el setup completo, verifica:

```bash
# 1. Todos los servicios corriendo
docker-compose ps
# Esperado: 6 servicios "Up (healthy)"

# 2. Backend responde
curl http://localhost:4000/health
# Esperado: {"status":"healthy"}

# 3. Dashboard accesible
open http://localhost:3000
# Esperado: Dashboard carga sin errores

# 4. Database accesible
docker exec -it hotmart_db psql -U hotmart_user -d hotmart -c "SELECT 1"
# Esperado: 1 row returned

# 5. Redis accesible
docker exec -it hotmart_redis redis-cli -a RedisSecure2026 PING
# Esperado: PONG

# 6. N8N accesible
open http://localhost:5679
# Esperado: Login screen

# 7. Git workflow configurado
git branch -a
# Esperado: main, dev, origin/main, origin/dev
```

Si todos estos checks pasan: **¡Felicidades! 🎉**

Tu entorno está listo y ANTIGRAVITY está configurado para ayudarte a construir el sistema completo.

---

**ÚLTIMA ACTUALIZACIÓN:** 2026-01-20  
**VERSIÓN:** 2.0  
**AUTOR:** ANTIGRAVITY System

---

**FIN DE GUÍA DE IMPLEMENTACIÓN**

Recuerda: ANTIGRAVITY es tu copiloto, no tu piloto automático. Trabaja junto a él, aprende de las decisiones que toma, y eventualmente internalizarás estos estándares.

¡Éxito en tu proyecto! 🚀
