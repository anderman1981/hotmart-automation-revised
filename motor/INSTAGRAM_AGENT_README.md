# Instagram Agent - Sistema de Publicación Automática

## 🚀 Funcionalidades Activadas

El Instagram Agent ha sido completamente activado con las siguientes capacidades:

### ✅ Características Principales

1. **Publicación Automática de Posts**
   - Publicación de contenido textual
   - Soporte para imágenes y medios
   - Manejo de errores y reintentos automáticos
   - Sistema de colas para múltiples publicaciones

2. **Publicación de Stories**
   - Creación automática de stories
   - Soporte para texto e imágenes
   - Integración con estrategia de marketing

3. **Sistema de Autenticación**
   - Login automático con credenciales
   - Persistencia de cookies (sesiones)
   - Manejo de 2FA/desafíos
   - Reconexión automática

4. **Control y Monitoreo**
   - CLI para control manual
   - Sistema de colas prioritarias
   - Estados en tiempo real
   - Notificaciones a N8N

## 🛠️ Configuración

### 1. Variables de Entorno

Asegúrate de tener configuradas las siguientes variables en `motor/.env`:

```env
# Instagram Credentials - IMPORTANT: Replace with actual credentials
INSTAGRAM_USER=your_instagram_username
INSTAGRAM_PASSWORD=your_instagram_password

# Chrome para Puppeteer (ya configurado)
PUPPETEER_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome

# N8N Integration (ya configurado)
N8N_WEBHOOK_URL=http://localhost:4125/webhook/manager-event
```

### 2. Instalación de Dependencias

```bash
cd motor
npm install puppeteer-core
```

## 📋 Uso

### CLI Interactivo

```bash
# Activar el agente (login automático)
node instagram-cli.js activate

# Ver estado actual
node instagram-cli.js status

# Publicar contenido personalizado
node instagram-cli.js post "¡Nuevo producto disponible! #HotMart #Marketing"

# Publicar post de prueba
node instagram-cli.js test-post

# Desactivar el agente
node instagram-cli.js deactivate
```

### Integración con Manager Agent

El Instagram Agent está integrado automáticamente en el sistema principal:

```javascript
// Publicar a través del Manager
await managerAgent.assignTask('instagram_post', {
    content: "Contenido personalizado",
    mediaPath: "/ruta/a/imagen.jpg"
});

// Publicar Story
await managerAgent.assignTask('instagram_story', {
    content: "Story content",
    mediaPath: null
});
```

### Automatización Diaria

El sistema ejecuta automáticamente:

1. **Market Scan** - DetectorAgent
2. **Learning** - LearningAgent  
3. **Strategy Generation** - ContentAgent
4. **Instagram Publishing** - InstagramAgent ⭐ (NUEVO)

## 🧪 Testing

### Ejecutar Pruebas Completas

```bash
cd motor
node test_instagram.js
```

### Pruebas Unitarias

```javascript
import instagramAgent from './src/agents/InstagramAgent.js';

// Test login
const login = await instagramAgent.login();
console.log(login);

// Test post
const result = await instagramAgent.publishContent("Test content");
console.log(result);
```

## 📊 Sistema de Colas

El InstagramController maneja automáticamente:

- **Prioridad**: Alta > Normal > Baja
- **Rate Limiting**: 30 segundos entre posts
- **Reintentos**: Hasta 3 intentos con backoff
- **Notificaciones**: Enviadas a N8N

## 🔥 Integración con Workflow Principal

### Publicación Automática en Daily Routine

El sistema ahora incluye publicación automática en la rutina diaria:

```javascript
// En ManagerAgent.runDailyRoutine()
// Step 4: Instagram Automation
await this.wakeAgent('instagram');
const postResult = await instagramAgent.publishContent(strategy.strategy.content);
```

### Notificaciones a N8N

Cuando se publica contenido, se notifica automáticamente:

```json
{
  "event": "instagram_post_completed",
  "data": {
    "postId": "1234567890",
    "content": "Post content...",
    "timestamp": "2026-01-28T..."
  }
}
```

## ⚠️ Consideraciones Importantes

### Seguridad
- **Nunca commits credenciales** al repositorio
- Usa variables de entorno para credenciales
- El sistema guarda cookies localmente (`instagram_cookies.json`)

### Rate Limiting
- Instagram detecta actividad automatizada
- El sistema incluye delays automáticos
- Siendo suspendido es posible si se abusa

### Manejo de Errores
- Reconexión automática
- Sistema de reintentos con backoff
- Logging detallado para debugging

## 🚨 Estado Actual: **ACTIVADO** ✅

El Instagram Agent está completamente funcional y listo para:

- ✅ Publicación automática
- ✅ Integración con sistema principal
- ✅ Manejo de errores
- ✅ Sistema de colas
- ✅ CLI interactiva
- ✅ Testing automatizado

**Próximo paso**: Configurar credenciales reales y comenzar a usar!