# 🚀 Hotmart Automation System

**Versión:** 1.2.0 (Stable)  
**Última Actualización:** 2026-01-21  
**Estado:** ✅ Producción

---

## 📋 Descripción

Sistema multi-agente autónomo para automatización de marketing de afiliados en Hotmart. Detecta productos rentables, genera contenido con IA, publica en redes sociales y aprende continuamente de los resultados.

---

## 🎯 Características Principales (v1.2)

### ✅ **Sistema Multi-Agente Completo**
- **Manager Agent**: Orquestador maestro con capacidad de análisis de conocimiento
- **Detector Agent**: Scraping inteligente de productos Hotmart con scoring Bayesiano
- **Content Agent**: Generación de contenido con LLM local (Ollama)
- **Instagram Agent**: Publicación automatizada en Instagram
- **Assets Agent**: Gestión de multimedia y materiales de afiliado
- **Git Agent**: DevOps automatizado con commits inteligentes
- **Learning Agent**: Aprendizaje continuo y optimización de patrones

### 🆕 **Nuevas Funcionalidades (v1.2)**
- ✅ **Persistencia en Base de Datos**: PostgreSQL para productos, métricas y conocimiento
- ✅ **Soporte de PDFs**: Ingesta y procesamiento de documentos PDF para RAG
- ✅ **n8n Workflows**: 7 flujos automatizados (Auto-Loop, Metrics, Feedback, etc.)
- ✅ **Dashboard Settings UI**: Gestión de agentes, menú y fuentes de datos
- ✅ **Manager Agent Knowledge**: Resumen inteligente de material ingerido con LLM
- ✅ **System Wiki**: Registro automático de actividades del sistema

### 🔧 **Infraestructura**
- **Backend**: Node.js + Express (Puerto 4123)
- **Frontend**: React + Vite (Puerto 4124)
- **Base de Datos**: PostgreSQL (Puerto 5432)
- **Cache/Queue**: Redis (Puerto 6379)
- **LLM Local**: Ollama (Puerto 11434) - llama3:latest
- **Automation**: n8n (Puerto 5679)
- **Containerización**: Docker Compose

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    MANAGER AGENT (Orquestador)              │
│  • Asignación de tareas                                     │
│  • Análisis de conocimiento con LLM                         │
│  • Coordinación de agentes                                  │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│Detector │─────▶│Content  │─────▶│Instagram│─────▶│Learning │
│ Agent   │      │ Agent   │      │ Agent   │      │ Agent   │
└─────────┘      └─────────┘      └─────────┘      └─────────┘
    │                 │                 │                 │
    └─────────────────┴─────────────────┴─────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   PostgreSQL + Redis   │
              │   Knowledge Base       │
              └───────────────────────┘
```

---

## � Inicio Rápido

### **Prerequisitos**
- Docker & Docker Compose
- Node.js 20+ (para desarrollo local)
- Git

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/anderman1981/hotmart-automation-revised.git
cd hotmart-automation-revised
```

### **2. Configurar Variables de Entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

**Variables Críticas:**
```env
# Hotmart
HOTMART_EMAIL=tu_email@ejemplo.com
HOTMART_PASSWORD=tu_password

# n8n
N8N_EMAIL=admin@localhost.com
N8N_PASSWORD=admin12345678A1

# Base de Datos
DB_USER=hotmart_user
DB_PASSWORD=securepassword
DB_NAME=hotmart
```

### **3. Levantar el Sistema**
```bash
docker-compose up -d
```

### **4. Verificar Servicios**
- **Dashboard**: http://localhost:4124
- **Backend API**: http://localhost:4123
- **n8n**: http://localhost:5679
- **Ollama**: http://localhost:11434

---

## 📚 Documentación Completa

### **Guías Principales**
- [📖 Guía de Configuración de Agentes (JSON)](./documents/AGENTS_JSON_GUIDE.md)
- [📊 Modelo de Negocio Estratégico](./documents/STRATEGIC_BUSINESS_MODEL.md)
- [📝 System Wiki (Registro de Actividades)](./documents/SYSTEM_WIKI.md)
- [🔧 Análisis y Plan de Correcciones](./documents/SYSTEM_ANALYSIS_AND_FIX_PLAN.md)

### **Configuración de Agentes**
Cada agente tiene su archivo JSON de configuración en `/documents/`:
- `manager_agent.json`
- `detector_agent.json`
- `content_agent.json`
- `instagram_agent.json`
- `assets_agent.json`
- `git_agent.json`
- `learning_agent.json`

---

## 🔌 API Endpoints Principales

### **Sistema**
- `GET /health` - Estado del sistema
- `POST /api/system/start` - Iniciar sistema
- `POST /api/system/stop` - Detener sistema

### **Agentes**
- `POST /api/agents/detector/start` - Iniciar escaneo de mercado
- `POST /api/agents/content/generate` - Generar contenido
- `GET /api/agents/manager/summarize` - Resumen de conocimiento

### **Ingesta de Conocimiento**
- `POST /api/ingest` - Subir texto, URL o PDF

### **Configuración**
- `GET /api/settings/menu` - Obtener menú del dashboard
- `GET /api/settings/api-keys` - Gestionar API keys
- `GET /api/settings/data-sources` - Fuentes de datos

---

## 🔄 Workflows de n8n

El sistema incluye 7 workflows automatizados:

1. **ANTIGRAVITY_FULL_AUTO_LOOP**: Bucle maestro de automatización (cada 6h)
2. **ANTIGRAVITY_COLLECT_METRICS**: Recolección de métricas
3. **ANTIGRAVITY_FEEDBACK_LOOP**: Análisis de feedback y ajustes
4. **ANTIGRAVITY_KILL_SWITCH**: Sistema de emergencia
5. **ANTIGRAVITY_PUBLISH_ONLY**: Publicación directa
6. **ANTIGRAVITY_SCALE_WINNERS**: Escalado de contenido exitoso
7. **Hotmart Publication Flow**: Flujo completo de publicación

---

## 🧪 Testing

### **Verificar Backend**
```bash
curl http://localhost:4123/health
```

### **Probar Resumen de Conocimiento**
```bash
curl http://localhost:4123/api/agents/manager/summarize
```

### **Iniciar Escaneo**
```bash
curl -X POST http://localhost:4123/api/agents/detector/start
```

---

## 📊 Monitoreo

### **Logs de Servicios**
```bash
# Backend
docker logs hotmart_motor -f

# n8n
docker logs hotmart_n8n -f

# Base de Datos
docker logs hotmart_db -f
```

### **Métricas en Dashboard**
El dashboard muestra en tiempo real:
- Productos rastreados
- Contenido generado
- Agentes activos
- Learning Agent mastery

---

## 🔐 Seguridad

- Las API keys se almacenan en PostgreSQL (⚠️ Pendiente: Encriptación)
- Autenticación básica en n8n
- Variables de entorno para credenciales sensibles
- CORS configurado para desarrollo local

---

## �️ Desarrollo

### **Estructura del Proyecto**
```
hotmart/
├── motor/              # Backend (Node.js)
│   ├── src/agents/     # Agentes del sistema
│   ├── db/             # Esquema de base de datos
│   └── index.js        # Servidor principal
├── dashboard/          # Frontend (React)
│   └── src/pages/      # Páginas del dashboard
├── documents/          # Documentación y configuraciones
├── n8n/workflows/      # Workflows de n8n
└── docker-compose.yml  # Orquestación de servicios
```

### **Agregar un Nuevo Agente**
1. Crear archivo en `motor/src/agents/NuevoAgent.js`
2. Definir configuración JSON en `documents/nuevo_agent.json`
3. Importar en `motor/index.js`
4. Actualizar `ManagerAgent.js` para orquestación

---

## 🐛 Troubleshooting

### **Motor no inicia**
```bash
docker-compose restart motor
docker logs hotmart_motor --tail 50
```

### **Ollama no responde**
```bash
docker exec hotmart_ollama ollama list
docker exec hotmart_ollama ollama pull llama3:latest
```

### **n8n no carga workflows**
- Verificar que los archivos JSON estén en `/n8n/workflows/`
- Importar manualmente desde la UI de n8n

---

## 📈 Roadmap

### **v1.3 (Próximo)**
- [ ] Encriptación de API keys
- [ ] RAG completo con ChromaDB
- [ ] TikTok Agent
- [ ] Dashboard de métricas avanzado

### **v2.0 (Futuro)**
- [ ] Multi-tenant support
- [ ] A/B testing automatizado
- [ ] Integración con más plataformas (YouTube, Twitter)

---

## 🤝 Contribuciones

Este proyecto sigue el [Git Workflow](./GIT_WORKFLOW_RULES.md) definido.

1. Crear issue
2. Crear rama desde `dev`
3. Implementar cambios
4. Pull Request a `dev`
5. Merge a `main` tras aprobación

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.

---

## 👥 Equipo

- **Desarrollador Principal**: Anderson Martinez
- **AI Assistant**: ANTIGRAVITY System

---

## 📞 Soporte

Para reportar bugs o solicitar features:
- Crear un issue en GitHub
- Seguir el formato definido en `CONTRIBUTING.md`

---

**Última Actualización**: 2026-01-21  
**Versión Estable**: 1.2.0  
**Estado**: ✅ Producción Ready
