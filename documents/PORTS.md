
To ensure consistency and allow for parallel development and stable testing, we have defined two environments:

| Service | Environment | Port | Description |
| :--- | :--- | :--- | :--- |
| **Backend (Dev)** | Development | **4123** | Hot-reload, local code volume |
| **Dashboard (Dev)** | Development | **4124** | Vite Dev Server |
| **N8N (Dev)** | Development | **4125** | Workflow Automation |
| **Ollama (Dev)** | Development | **4126** | Local AI Model |
| | | | |
| **Backend (Main)** | Production | **4223** | Stable Docker Image |
| **Dashboard (Main)** | Production | **4224** | Nginx/Served Build |
| **N8N (Main)** | Production | **4225** | Stable Automation |
| **Ollama (Main)** | Production | **4226** | AI Model for Production |

## 🚀 How to Run

### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Main (Production-like)
```bash
docker-compose -f docker-compose.prod.yml up -d
```


## 🚀 How to Run with These Ports

### 1. Backend (Motor)
The backend reads the `PORT` from `motor/.env`.
```bash
# motor/.env
PORT=4123
```

### 2. Dashboard
The dashboard uses `vite.config.js` for its server port and `.env` to connect to the backend.
```bash
# dashboard/.env
VITE_API_URL=http://localhost:4123
```

### 3. N8N (Specific to this Project)
Run N8N on its dedicated port to avoid conflicts with other projects.
```bash
npx -y n8n start --port 4125
```

### 4. Ollama (AI Models)
Standard Ollama runs on `11434`. To use port `4126`, you must start the server with the host variable:
```bash
OLLAMA_HOST=0.0.0.0:4126 ollama serve
```
*Note: If using the default system-wide Ollama, you can leave it at 11434 and just update the code configuration.*

---

## ❓ FAQ: Are N8N and Ollama shared?

*   **N8N:** Can be run **per project**. By using `npx n8n start --port 4125`, you create an isolated instance for this project (though it shares the `~/.n8n` config folder by default unless specified otherwise). This is great for keeping workflows organized by project port.
*   **Ollama:** Usually runs as a **global system service** (one instance for all projects). However, you **can** force it to run on a specific port per project if you need strict isolation (e.g., different network constraints), but typically it is more efficient to share the one running instance (`11434`) unless you have a specific need to change it. We have configured it to `4126` in this project's settings to follow your requirement.
