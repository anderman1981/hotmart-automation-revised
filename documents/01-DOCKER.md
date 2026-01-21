# 🧙🏾‍♂️ Proyecto: Sistema Automatizado de Hotmart – Local Dockerizado con Ollama + N8N  

## **Objetivo**
Generar ingresos extra en Hotmart automatizando la búsqueda de productos ganadores, creación de contenido y publicación orgánica en Instagram y TikTok, usando un **motor Bayesian + agentes** completamente dockerizado en MacBook Pro M1.

---

## **1️⃣ Arquitectura General**

**Stack Local (Dockerizado)**

| Servicio | Imagen / Stack | Propósito | Notas |
|----------|----------------|-----------|-------|
| Ollama | Ollama local ARM | Generación de prompts y contenido AI | Modelo local descargado, optimizado para M1 |
| N8N | n8nio/n8n | Orquestación de workflows y publicación | Exponer puerto 5678, workflows de publicación |
| DB | postgres:15 | Persistencia de productos, scores, métricas | Volumen `/var/lib/postgresql/data` |
| Cache | redis:7 | Triggers on-demand, caching temporal | Volumen `/data/redis` |
| Motor Bayesian + Scheduler | Node.js / Python | Ejecuta scoring, reglas duales, portafolio dinámico | Ejecuta triggers y recalculos on-demand |
| Dashboard | React.js / Vue.js | Visualización en tiempo real de métricas | Exponer puerto 3000 |

---

## **2️⃣ Flujo de Datos**

1. **Motor Bayesian** recibe señales:  
   - Volumen (Ventas + Social click-out)  
   - Spike/Drop on-demand  
   - Refund rate  
   - CTR / Engagement

2. **Motor** calcula posterior Bayesian → Prioriza productos

3. **Evento → Agentes**
   - Ollama → Genera copies, hooks, guiones, thumbnails  
   - N8N → Publica contenido en IG / TikTok  
   - Feedback Agent → Recolecta métricas → alimenta posterior Bayesian  

4. **Dashboard** → Visualización de productos ganadores, métricas y alertas  

---

## **3️⃣ Reglas del Motor Bayesian**

- **Portafolio dinámico:** 6–15 productos activos  
- **Kill & Promote:** dual (temporal + métrica)  
- **Ventana adaptativa + trigger on-demand**  
- **Umbrales híbridos:** % + Bayesian posterior  
- **Cooldown adaptativo**  
- **Evolutivo:** semi-auto → full-auto según confianza  
- **Ponderación señales:** Dinámica por nicho  
- **Output:** Eventos hacia agentes (no acciones directas)  

---

## **4️⃣ Docker Compose – Concepto**

```yaml
version: '3.9'

services:

  db:
    image: postgres:15
    container_name: hotmart_db
    environment:
      POSTGRES_USER: hotmart_user
      POSTGRES_PASSWORD: securepassword
      POSTGRES_DB: hotmart
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    networks:
      - hotmart_net

  redis:
    image: redis:7
    container_name: hotmart_redis
    volumes:
      - ./data/redis:/data
    networks:
      - hotmart_net

  ollama:
    image: ollama/ollama:latest
    container_name: hotmart_ollama
    volumes:
      - ./models:/models
    ports:
      - "11434:11434"
    networks:
      - hotmart_net
    environment:
      - OLLAMA_LOCAL_MODE=true

  n8n:
    image: n8nio/n8n
    container_name: hotmart_n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=hotmart
      - DB_POSTGRESDB_USER=hotmart_user
      - DB_POSTGRESDB_PASSWORD=securepassword
    depends_on:
      - db
    networks:
      - hotmart_net

  motor:
    build: ./motor
    container_name: hotmart_motor
    volumes:
      - ./motor:/app
    depends_on:
      - db
      - redis
      - ollama
      - n8n
    networks:
      - hotmart_net
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - REDIS_HOST=redis

  dashboard:
    build: ./dashboard
    container_name: hotmart_dashboard
    ports:
      - "3000:3000"
    depends_on:
      - db
      - motor
    networks:
      - hotmart_net

networks:
  hotmart_net:
    driver: bridge
