# 🚀 Próximos Pasos: Lanzamiento del Sistema (Actualizado)

El sistema se ha levantado correctamente. Se ajustaron puertos para evitar conflictos.

## 1. Verificar Servicios
Accede a las siguientes URLs en tu navegador:

- **Dashboard**: [http://localhost:3000](http://localhost:3000) (Interfaz principal)
- **N8N Automation**: [http://localhost:5679](http://localhost:5679) (**Nota: Puerto cambiado a 5679**)
    - Usuario: `admin`
    - Password: `admin`
- **Motor API**: [http://localhost:4000/health](http://localhost:4000/health)

## 2. Configuración Inicial N8N
1. Entra a N8N ([http://localhost:5679](http://localhost:5679)).
2. Configura las credenciales de **Postgres**:
   - Host: `db`
   - User: `hotmart_user`
   - Pass: `securepassword`
   - DB: `hotmart`
3. Configura el nodo **Ollama**:
   - Host: `http://ollama:11434`
   - Model: `llama3` (debes descargarlo primero)

## 3. Configurar Ollama (Modelo Llama3)
Desde tu terminal, ejecuta:
```bash
docker exec -it hotmart_ollama ollama pull llama3
```

## 4. Crear Primer Producto
Usa el Dashboard o Curl:
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"hotmart_id": "H12345", "name": "Curso Yoga", "niche": "Salud", "url_sales_page": "https://go.hotmart.com/..."}'
```

## 5. Solución de Errores Comunes
- **Error DB**: Si ves `ENOTFOUND db`, asegúrate de que todos los contenedores estén corriendo (`docker ps`). El reinicio completo que acabamos de hacer debió solucionarlo.
- **Error N8N Port**: Se cambió al puerto 5679 porque el 5678 estaba ocupado.
