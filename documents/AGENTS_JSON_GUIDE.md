# 🤖 GUÍA DE CONFIGURACIÓN DE AGENTES JSON

**Project**: Hotmart Automation  
**Version**: 1.0.0  
**Date**: 2026-01-20

---

## 📋 CONTENIDO DEL PAQUETE

Has recibido **7 archivos JSON** que definen la configuración completa de cada agente del sistema:

1. **manager_agent.json** - Orquestador maestro
2. **detector_agent.json** - Scraper de productos Hotmart
3. **content_agent.json** - Generador de contenido (LLM)
4. **instagram_agent.json** - Publicador en Instagram
5. **assets_agent.json** - Gestor de multimedia
6. **git_agent.json** - DevOps y versionamiento
7. **learning_agent.json** - Aprendizaje continuo

---

## 🎯 PARA QUÉ SIRVEN ESTOS JSON

Estos archivos JSON son **configuraciones completas** que definen:

### 1. **Identidad del Agente**
- Nombre, tipo, y descripción
- System prompt (cómo debe comportarse)
- Responsabilidades principales

### 2. **Capacidades Técnicas**
- APIs que usa
- Herramientas disponibles
- Integraciones con otros servicios

### 3. **Reglas de Operación**
- Workflows paso a paso
- Criterios de decisión
- Protocolos de comunicación

### 4. **Métricas y Monitoreo**
- KPIs a trackear
- Thresholds de alerta
- Reportes a generar

### 5. **Integración con Otros Agentes**
- Qué recibe de cada agente
- Qué provee a cada agente
- Formato de mensajes

---

## 🔧 CÓMO USAR ESTOS JSON

### Opción 1: **Alimentar tu Sistema Multi-Agente**

Si ya tienes un sistema de agentes (como el de tu captura de pantalla), estos JSON te sirven como:

#### A. **Knowledge Base para cada Agente**

```python
# Ejemplo en Python
import json

# Cargar configuración del agente
with open('agents/content_agent.json', 'r') as f:
    content_config = json.load(f)

# Usar como context/knowledge
system_prompt = content_config['system_prompt']['identity']
responsibilities = content_config['system_prompt']['core_responsibilities']

# Inyectar en tu agente
my_content_agent = Agent(
    name=content_config['agent_name'],
    system_prompt=system_prompt,
    knowledge=content_config
)
```

#### B. **Implementar los Workflows Definidos**

```javascript
// Ejemplo en Node.js
const managerConfig = require('./agents/manager_agent.json');

// Implementar workflow de feature development
async function developFeature(featureRequest) {
  const workflow = managerConfig.workflows.feature_development;
  
  for (const step of workflow.steps) {
    console.log(`Step ${step.step}: ${step.action}`);
    await executeStep(step);
  }
}
```

#### C. **Configurar Integraciones**

```yaml
# Ejemplo en configuración de N8N
nodes:
  - name: Instagram Publisher
    type: instagram-api
    credentials: 
      auth_method: {{ instagram_agent.integration.instagram_api.auth_method }}
    permissions: {{ instagram_agent.integration.instagram_api.required_permissions }}
```

---

### Opción 2: **Alimentar NotebookLM (Tu Caso)**

Basado en el link que compartiste de NotebookLM, puedes:

#### **Paso 1: Subir los JSON a tu NotebookLM**

1. Ve a tu notebook: https://notebooklm.google.com/notebook/420b0fcb-d7a7-4b37-8ec6-a9eda5410be1
2. Click en "Upload sources"
3. Sube los 7 archivos JSON

#### **Paso 2: Hacer Preguntas Específicas**

Ahora puedes preguntarle a NotebookLM:

```
📝 EJEMPLOS DE PREGUNTAS:

"¿Cuáles son las responsabilidades del Content Agent?"

"¿Cómo se comunica el Detector Agent con el Manager Agent?"

"¿Qué workflow sigue el sistema cuando se encuentra un nuevo producto?"

"¿Qué métricas debe trackear el Instagram Agent?"

"¿Cómo funciona el feedback loop del Learning Agent?"

"Dame un ejemplo de cómo el Git Agent maneja un deployment"

"¿Qué criterios usa el Detector Agent para scoring de productos?"

"¿Qué hooks recomienda el Content Agent para contenido educativo?"
```

#### **Paso 3: Generar Guías de Estudio**

NotebookLM puede generar:
- ✅ Study guides por agente
- ✅ Resúmenes de workflows completos
- ✅ FAQs sobre el sistema
- ✅ Audio overviews explicando la arquitectura

---

### Opción 3: **Usar como Documentación de Referencia**

Simplemente ábrelos cuando necesites:

#### **Para Implementar un Agente:**
```bash
# Quiero implementar el Detector Agent
cat agents/detector_agent.json | jq '.scraping_targets'
# Output: URLs, frecuencias, data points a scrapear
```

#### **Para Entender un Proceso:**
```bash
# ¿Cómo funciona el workflow de content generation?
cat agents/content_agent.json | jq '.content_generation_workflow'
# Output: Inputs required, generation process, output formats
```

#### **Para Configurar Integraciones:**
```bash
# ¿Qué permisos necesita Instagram Agent?
cat agents/instagram_agent.json | jq '.integration.instagram_api.required_permissions'
# Output: ["instagram_basic", "instagram_content_publish", ...]
```

---

## 📖 ESTRUCTURA DE CADA JSON

Todos los JSON siguen esta estructura consistente:

```json
{
  "agent_id": "unique_identifier",
  "agent_name": "Human Readable Name",
  "agent_type": "ORCHESTRATOR | SCRAPER | LLM | SOCIAL | UTILITY",
  "status": "ACTIVE | RUNNING | STOPPED | IDLE",
  "version": "1.0.0",
  "description": "One-line description of agent's purpose",
  
  "system_prompt": {
    "identity": "Who this agent is",
    "core_responsibilities": ["What", "it", "does"]
  },
  
  "workflows": {
    "workflow_name": {
      "steps": [/* detailed process */]
    }
  },
  
  "integration": {
    "from_agent_x": "What it receives",
    "to_agent_y": "What it provides"
  },
  
  "configuration": {
    /* Agent-specific settings */
  }
}
```

---

## 🔄 FLUJOS DE TRABAJO CLAVE

### Flujo 1: **Descubrimiento → Contenido → Publicación**

```
┌──────────────┐
│ User Request │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Manager Agent    │──┐
│ Receives request │  │
└──────────────────┘  │
                      │
       ┌──────────────┘
       │
       ▼
┌──────────────────┐
│ Detector Agent   │
│ Finds products   │
│ Scores them      │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Manager Agent    │
│ Selects product  │
│ Requests content │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Content Agent    │
│ Generates copy   │
│ Requests assets  │
└──────┬───────────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│ Assets Agent     │  │ Manager Agent    │
│ Processes media  │  │ Reviews content  │
└──────┬───────────┘  └──────┬───────────┘
       │                      │
       └──────────┬───────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Instagram Agent  │
         │ Publishes        │
         └──────┬───────────┘
                │
                ▼
         ┌──────────────────┐
         │ Learning Agent   │
         │ Tracks metrics   │
         │ Learns patterns  │
         └──────────────────┘
```

### Flujo 2: **Deployment de Código**

```
┌──────────────────┐
│ Developer Push   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Git Agent        │
│ Triggers CI/CD   │
└──────┬───────────┘
       │
       ├─────── Tests Pass? ───────┐
       │                           │
       ▼ YES                       ▼ NO
┌──────────────────┐       ┌──────────────────┐
│ Deploy Staging   │       │ Notify Developer │
└──────┬───────────┘       └──────────────────┘
       │
       ▼
┌──────────────────┐
│ Health Check     │
└──────┬───────────┘
       │
       ├─── Healthy? ──────────────┐
       │                           │
       ▼ YES                       ▼ NO
┌──────────────────┐       ┌──────────────────┐
│ Manager Agent    │       │ Auto Rollback    │
│ Approves Prod    │       │ Alert Team       │
└──────┬───────────┘       └──────────────────┘
       │
       ▼
┌──────────────────┐
│ Deploy Production│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Learning Agent   │
│ Documents        │
└──────────────────┘
```

---

## 💡 CASOS DE USO PRÁCTICOS

### Caso 1: **Implementando el Content Agent**

**Problema**: Necesito que mi sistema genere contenido para Instagram

**Solución usando el JSON**:

```typescript
// 1. Leer la configuración
import contentAgentConfig from './agents/content_agent.json';

// 2. Configurar Ollama según especificaciones
const ollamaConfig = contentAgentConfig.llm_configuration.primary_model;

const ollama = new Ollama({
  endpoint: ollamaConfig.endpoint,
  model: ollamaConfig.name,
  temperature: ollamaConfig.temperature
});

// 3. Usar los prompt templates definidos
const promptTemplate = contentAgentConfig.prompt_templates.product_post;

async function generateInstagramPost(product) {
  const prompt = promptTemplate.user_template
    .replace('{product_name}', product.name)
    .replace('{niche}', product.niche)
    .replace('{main_benefit}', product.benefits[0])
    .replace('{audience}', product.target_audience)
    .replace('{tone}', 'enthusiastic')
    .replace('{goal}', 'engagement');
  
  const response = await ollama.generate({
    prompt,
    system: promptTemplate.system
  });
  
  return response;
}
```

### Caso 2: **Configurando el Detector Agent**

**Problema**: Necesito scrapear productos de Hotmart

**Solución usando el JSON**:

```python
import json
import schedule

# Leer configuración
with open('agents/detector_agent.json') as f:
    config = json.load(f)

# Obtener targets de scraping
scraping_targets = config['scraping_targets']['primary_sources']

for target in scraping_targets:
    source = target['source']
    url = target['url']
    frequency = target['frequency']
    data_points = target['data_points']
    
    # Programar scraping
    if frequency == "Every 6 hours":
        schedule.every(6).hours.do(scrape, url, data_points)
    elif frequency == "Daily":
        schedule.every().day.do(scrape, url, data_points)
    
    print(f"Scheduled {source} scraping: {url}")
    print(f"Will collect: {', '.join(data_points)}")
```

### Caso 3: **Entrenando al Manager Agent**

**Problema**: Mi agente orquestador no sabe qué hacer

**Solución usando el JSON en NotebookLM**:

1. Sube `manager_agent.json` a NotebookLM
2. Pregunta:
   ```
   "¿Cómo debe el Manager Agent decidir qué agente asignar 
   para una tarea de creación de contenido?"
   ```
3. NotebookLM responderá con las reglas del JSON:
   ```json
   "delegation_rules": {
     "backend_tasks": "Asignar a Content Agent...",
     "frontend_tasks": "Asignar a Content Agent for UI/UX",
     ...
   }
   ```

---

## 🎓 RUTAS DE APRENDIZAJE CON LOS JSON

### Para Desarrolladores:

**Semana 1**: Entender la arquitectura
- Lee todos los JSON para ver cómo se conectan
- Identifica los workflows principales
- Mapea las integraciones entre agentes

**Semana 2**: Implementar un agente simple
- Empieza con Assets Agent (más directo)
- Sigue las especificaciones del JSON
- Implementa los workflows definidos

**Semana 3**: Integraciones
- Conecta dos agentes siguiendo el JSON
- Implementa la comunicación definida
- Valida con las métricas especificadas

**Semana 4**: Sistema completo
- Implementa el Manager Agent
- Orquesta todos los agentes
- Monitorea según los KPIs del JSON

### Para Product Managers:

**Usa los JSON para**:
- Entender capacidades del sistema
- Definir roadmap basado en workflows
- Especificar nuevas features
- Validar que se cumplan los criterios

### Para Data Scientists:

**Los JSON del Learning Agent te dan**:
- Métricas a trackear
- Modelos predictivos a entrenar
- Patrones a identificar
- Experimentos a correr

---

## 🔒 SEGURIDAD Y COMPLIANCE

Cada JSON incluye secciones de seguridad y compliance:

```json
// Ejemplo del Content Agent
"compliance_and_quality": {
  "platform_policies": {
    "instagram": {
      "prohibited": [
        "Misleading health claims",
        "Get-rich-quick schemes",
        ...
      ]
    }
  }
}
```

**Usa estas secciones para**:
- Configurar validaciones automáticas
- Entrenar modelos de detección de contenido prohibido
- Crear checklists de revisión
- Implementar guardrails en tu sistema

---

## 📊 MÉTRICAS Y MONITOREO

Cada JSON define métricas específicas:

```json
// Ejemplo del Detector Agent
"performance_metrics": {
  "targets": {
    "discovery_rate": "> 10 qualified products per day",
    "scraping_success_rate": "> 95%",
    ...
  }
}
```

**Implementa dashboards** basados en estas métricas:
- Dashboard del Manager: Métricas de todos los agentes
- Dashboard por agente: Métricas específicas
- Alertas cuando se superan thresholds

---

## 🛠️ HERRAMIENTAS RECOMENDADAS

### Para Parsear y Explorar los JSON:

**Command Line:**
```bash
# jq - JSON processor
brew install jq

# Ejemplos de uso
jq '.system_prompt.core_responsibilities' agents/manager_agent.json
jq '.workflows.discovery_workflow.steps[]' agents/detector_agent.json
jq '.configuration' agents/*_agent.json
```

**Python:**
```python
import json
import pprint

with open('agents/content_agent.json') as f:
    config = json.load(f)

pprint.pprint(config['copywriting_frameworks'])
```

**Node.js:**
```javascript
const fs = require('fs');

const config = JSON.parse(
  fs.readFileSync('agents/manager_agent.json', 'utf8')
);

console.log(config.workflows.feature_development);
```

### Para Visualizar la Arquitectura:

Usa los JSON para generar diagramas:

```python
import json
import graphviz

# Crear grafo de agentes e integraciones
dot = graphviz.Digraph()

for agent_file in agent_files:
    with open(agent_file) as f:
        config = json.load(f)
    
    agent_id = config['agent_id']
    dot.node(agent_id, config['agent_name'])
    
    # Agregar edges de integración
    for integration in config.get('integration', {}).items():
        dot.edge(agent_id, integration[0])

dot.render('agent_architecture.png')
```

---

## 📞 SOPORTE Y PREGUNTAS FRECUENTES

### P: ¿Puedo modificar los JSON?
**R:** ¡Sí! Estos son templates. Adáptalos a tu necesidad específica.

### P: ¿Son obligatorios todos los campos?
**R:** No. Usa lo que necesites. Los JSON son guías comprehensivas, no requisitos rígidos.

### P: ¿Cómo actualizo un JSON?
**R:** Edita el archivo, versionalo en Git, y documenta los cambios en un CHANGELOG.

### P: ¿Puedo agregar mis propios campos?
**R:** Absolutamente. Los JSON son extensibles.

### P: ¿Necesito implementar todos los workflows?
**R:** No. Implementa por prioridad. Los workflows son roadmap, no backlog obligatorio.

### P: ¿Cómo sé si un JSON está actualizado?
**R:** Revisa el campo `version`. Usa semantic versioning para cambios.

---

## 🎯 PRÓXIMOS PASOS

### **Inmediatos (Hoy)**:
1. ✅ Lee este documento completo
2. ✅ Abre un JSON (recomiendo `manager_agent.json`)
3. ✅ Identifica las secciones principales
4. ✅ Sube a NotebookLM y haz preguntas

### **Esta Semana**:
1. ✅ Lee todos los JSON
2. ✅ Identifica los 3 workflows más importantes
3. ✅ Decide qué agente implementar primero
4. ✅ Crea un plan de implementación

### **Este Mes**:
1. ✅ Implementa tu primer agente
2. ✅ Documenta desviaciones del JSON (si las hay)
3. ✅ Integra con un segundo agente
4. ✅ Comienza a trackear métricas

### **Este Trimestre**:
1. ✅ Sistema completo de 3-4 agentes funcionando
2. ✅ Workflows automatizados end-to-end
3. ✅ Dashboard de métricas
4. ✅ Learning Agent acumulando insights

---

## 💬 FEEDBACK Y CONTRIBUCIONES

¿Encontraste algo que falta en los JSON?  
¿Implementaste un agente y aprendiste algo nuevo?  
¿Descubriste una mejor práctica?

**Compártelo**:
- Actualiza el JSON correspondiente
- Incrementa la versión
- Documenta en CHANGELOG
- Comparte con el equipo

---

## 🎉 CONCLUSIÓN

Estos 7 archivos JSON son más que configuraciones - son el **blueprint completo** de un sistema multi-agente de nivel enterprise para automatización de marketing en Hotmart.

**Úsalos como**:
- 📚 Documentación de referencia
- 🧠 Knowledge base para tus agentes
- 🗺️ Roadmap de implementación
- 📊 Fuente de métricas y KPIs
- 🎓 Material de entrenamiento

**Recuerda**:
- Los JSON son guías, no camisas de fuerza
- Adapta a tu contexto específico
- Versionalo todo
- Documenta los cambios
- Aprende y mejora continuamente

---

**¡Buena suerte construyendo tu sistema multi-agente!** 🚀

Si tienes dudas, consulta primero con NotebookLM - ¡es como tener un experto en estos JSON disponible 24/7!

---

**ÚLTIMA ACTUALIZACIÓN:** 2026-01-20  
**VERSIÓN GUÍA:** 1.0.0  
**AUTOR:** ANTIGRAVITY System  

---

**FIN DE GUÍA DE CONFIGURACIÓN DE AGENTES JSON**
