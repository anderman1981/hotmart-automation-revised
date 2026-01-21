# 📋 Plan de Ejecución: Sistema Automatizado Hotmart

Este documento detalla los pasos para construir la infraestructura base del proyecto, siguiendo la arquitectura definida en `01-DOCKER.md` y `02-STRUCTURE.md`.

## ✅ Fase 1: Inicialización y Estructura (Inmediato)
- [ ] Crear estructura de carpetas (`motor/`, `dashboard/`, `data/`, `models/`).
- [ ] Crear archivos de configuración base (`.env`, `docker-compose.yml`).
- [ ] Configurar `.gitignore` para excluir `data/` y `models/` y `node_modules`.

## 🐳 Fase 2: Configuración Docker
- [ ] Crear `docker-compose.yml` con los servicios:
    - `db` (PostgreSQL 15)
    - `redis` (Redis 7)
    - `ollama` (Ollama Local)
    - `n8n` (N8N Workflow Automation)
    - `motor` (Node.js Service)
    - `dashboard` (React/Vite App)
- [ ] Configurar redes y volúmenes persistentes.

## 🧠 Fase 3: Motor Bayesian (Backend)
- [ ] Inicializar proyecto Node.js en `motor/`.
- [ ] Instalar dependencias clave (`pg`, `redis`, `express`, `mathjs` para lógica Bayesiana).
- [ ] Crear estructura básica del servidor (`index.js` o `app.ts`).
- [ ] Implementar conexión a DB y Redis.
- [ ] **Tarea Clave**: Definir esquema de base de datos para `Productos` y `Métricas`.

## 📊 Fase 4: Dashboard (Frontend)
- [ ] Inicializar proyecto React + Vite en `dashboard/`.
- [ ] Configurar TailwindCSS para estilos ("Premium Aesthetics").
- [ ] Crear componentes base (Layout, Sidebar, Cards de Productos).
- [ ] Conectar Dashboard con API del Motor.

## 🔗 Fase 5: Integración y Agentes
- [ ] Configurar N8N (importar workflows base si existen).
- [ ] Probar conexión Ollama <-> Motor.
- [ ] Implementar lógica de scoring inicial (Bayesian Mock).

## 🚀 Fase 6: Despliegue Local y Pruebas
- [ ] Levantar stack con `docker-compose up -d`.
- [ ] Verificar logs y conectividad entre contenedores.
- [ ] Prueba de flujo: Trigger manual -> Motor -> Log.

---
**Notas:**
- Se priorizará Node.js para el Motor por compatibilidad con el ecosistema, pero se mantendrá modular para scripts Python si la lógica Bayesiana se complica.
- La persistencia de datos local es crítica (`./data`).
