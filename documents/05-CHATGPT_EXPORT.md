# 🧠 Exportación de Chat: Generación Ingresos Hotmart IA

**Fuente**: ChatGPT (Proxy Extraction)
**Fecha**: 2026-01-19

## Resumen del Proyecto
Sistema automatizado para generar ingresos en Hotmart usando un motor Bayesian y agentes de IA (Ollama) para crear y publicar contenido orgánico.

## Arquitectura (Extraída)
- **Motor**: Node.js + Python (Bayesian Logic).
- **IA Generativa**: Ollama (Llama3/Mistral) corriendo localmente.
- **Automatización**: N8N para orquestación de workflows.
- **Base de Datos**: PostgreSQL 15.
- **Cache**: Redis 7.
- **Frontend**: Dashboard en React/Vue.

## Reglas de Negocio
1. **Priorización**: Volumen (ventas + clicks) + Señales sociales.
2. **Ciclo de Vida**: Testing -> Active -> Promoted -> Killed/Cooldown.
3. **Trigger**: On-demand spike detection.

## Estructura de Carpetas Confirmada
```text
hotmart-automation/
├─ docker-compose.yml
├─ .env
├─ motor/
│   ├─ app.py / index.js
│   ├─ BayesianEngine/
│   ├─ utils/
│   └─ package.json
├─ dashboard/
├─ data/
└─ models/
```
