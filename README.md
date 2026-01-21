# Hotmart Automation System v1.1

Sistema autónomo de gestión de afiliados, creación de contenido y automatización de marketing para Hotmart.

## 🚀 Módulos Principales

### 1. Motor (`/motor`)
El núcleo del sistema. Ejecuta 7 agentes inteligentes:

*   **DetectorAgent:** Escanea el mercado de Hotmart, identifica productos rentables y se afilia automáticamente.
*   **AssetsAgent:** Extrae imágenes y recursos de ventas desde Google Drive/Dropbox.
*   **ContentAgent (Ollama):** Genera copy persuasivo y prompts para imágenes usando IA local (TinyLlama).
*   **InstagramAgent:** Gestiona login y publicación en Instagram (Headless).
*   **GitAgent (Nuevo):** "Smart Git". Gestiona el versionado del código, crea ramas (feature/fix) y clasifica commits usando IA.
*   **LearningAgent (Nuevo):** Escanea Hotmart Academy (Spain) para aprender estrategias de marketing.
*   **ManagerAgent (Nuevo):** El CEO del sistema. Recibe tareas, orquesta a los otros agentes y envía eventos a N8N.

### 2. Dashboard (`/dashboard`)
Panel de control visual construido con React + Vite + TailwindCSS.
*   Monitorización de agentes.
*   Visualización de productos escaneados.
*   Estado del sistema (Rama Git, Versión).

### 3. Automatización (`/n8n`)
Integración con N8N para flujos de trabajo visuales.
*   **Webhook:** `http://localhost:5679/webhook/manager-event`
*   **Puerto N8N de proyecto:** 5679 (Usuario: admin / Pass: admin)

## 🛠 Instalación y Despliegue

### Requisitos
*   Docker y Docker Compose.
*   Node.js 18+.
*   Cuenta de Hotmart e Instagram.

### Configuración
1.  Clonar repositorio:
    ```bash
    git clone https://github.com/andersonmares81/hotmart-automation.git
    cd hotmart-automation
    ```
2.  Crear archivo `.env` (guíate del ejemplo en la documentación interna).
3.  Iniciar servicios:
    ```bash
    docker-compose up -d --build
    ```

## 🤖 Uso de Agentes Nuevos

### Git Manager
Envía una petición para crear una rama o commit inteligente:
```bash
curl -X POST http://localhost:4000/api/agents/git/commit \
-H "Content-Type: application/json" \
-d '{"message": "fix login validation"}'
```
*(La IA clasificará si es un 'fix' o 'feature' y creará la rama adecuada)*

### Manager & N8N
Simula una tarea generada por el Manager:
```bash
curl -X POST http://localhost:4000/api/agents/manager/task \
-H "Content-Type: application/json" \
-d '{"type": "daily_report", "payload": {}}'
```
*Esto enviará un evento al workflow de N8N.*

## 📂 Estructura del Proyecto
```
.
├── dashboard/      # Frontend React
├── motor/          # Backend Node.js + Puppeteer + Ollama Agents
├── n8n/            # Workflows de automatización
└── data/           # Persistencia de BD y Redis
```

## 📝 Changelog v1.1
*   Implementación de GitAgent, LearningAgent y ManagerAgent.
*   Integración de Webhooks con N8N.
*   Corrección de conflictos de volumen en Docker.
*   Mejoras en UI del Dashboard (Glassmorphism).

---
Desarrollado con ❤️ para automatización total.
