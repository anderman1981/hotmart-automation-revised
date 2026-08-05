# Agent System API Service

## Overview
This service provides a centralized AI Agent System capable of generating code, creating tests, and writing documentation using local LLMs (Ollama). It is designed to be consumed by other internal projects via a RESTful API.

## Base URL
**`http://localhost:12000`**

## Integration

### 1. Check Service Status
**GET** `/system/status`
Returns the current number of active agents and the system's focus (Beachhead).

**Example Response:**
```json
{
  "active_agents": 3,
  "beachhead": "Authentication Microservice",
  "hedgehog_concept": { ... }
}
```

### 2. Discover Capabilities
**GET** `/agents`
Lists all available agents and their roles (e.g., `code_generator`, `test_creator`, `documentation`).

### 3. Generate Code (Or any task)
**POST** `/agent/task`

**Header:** `Content-Type: application/json`

**Body:**
```json
{
  "agent_role": "code_generator",
  "task_data": {
    "type": "function",
    "spec": "Create a Python function to validate email addresses using regex.",
    "language": "python",
    "context": "# optional existing code context"
  }
}
```

**Response:**
```json
{
  "agent_id": "agent_codegen_001",
  "code": "import re\n...",
  "task_type": "function",
  "duration": 1.25,
  "requires_review": true
}
```

### 4. Run Complex Workflows
**POST** `/workflow/run`
Execute a sequence of tasks where the output of one can feed into the context of another.

## Client Examples

### Python (`requests`)
```python
import requests

url = "http://localhost:12000/agent/task"
payload = {
    "agent_role": "code_generator",
    "task_data": {
        "type": "function",
        "spec": "Hello World",
        "language": "python"
    }
}

response = requests.post(url, json=payload)
print(response.json()['code'])
```

### Curl
```bash
curl -X POST http://localhost:12000/agent/task \
  -H "Content-Type: application/json" \
  -d '{
    "agent_role": "code_generator",
    "task_data": {
        "type": "function",
        "spec": "Hello World",
        "language": "python"
    }
}'
```
