import { Ollama } from 'ollama';

class ContentAgent {
    constructor() {
        // Connect to the local Ollama container
        // Configured Project Port: 11434
        const host = process.env.OLLAMA_HOST || 'http://localhost:11434';
        this.ollama = new Ollama({ host });
        this.model = process.env.OLLAMA_MODEL || 'llama3.2:latest'; // Using active model
    }

    async generateMarketingPost(productName, niche) {
        const prompt = `
        Actúa como un experto en Marketing Digital y Copywriting persuasivo.
        Escribe un post para Instagram vendiendo este producto de Hotmart:
        - Producto: "${productName}"
        - Nicho: "${niche}"
        
        Estructura:
        1. Gancho (Hook) llamativo.
        2. Problema/Dolor del cliente.
        3. Solución (El producto).
        4. Llamado a la acción (Link en bio).
        
        Usa emojis. Sé breve y directo.
        `;

        try {
            console.log(`📝 Content Agent: Generating copy for ${productName}...`);
            const response = await this.ollama.chat({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
            });
            return response.message.content;
        } catch (error) {
            console.error('❌ Content Gen Error:', error);
            return "Error generando contenido.";
        }
    }

    async generateStrategy(productName, niche) {
        const prompt = `
        Actúa como un estratega de lanzamientos digitales (Launch Manager).
        Crea una ESTRATEGIA DE VENTAS RÁPIDA para este producto:
        - Producto: "${productName}"
        - Nicho: "${niche}"

        Salida requerida (JSON):
        {
            "channels": ["Instagram Reels", "TikTok", "Email"],
            "tone": "Inspirador y Urgente",
            "funnel_steps": ["Video de problema", "Lead Magnet", "Oferta Flash"],
            "expectation_messages": [
                "Tweet 1: ¿Cansado de [pain_point]? Algo grande viene en 3 días... 👀",
                "Story 1: Estamos preparando algo que cambiará tu forma de ver [niche]. 🔥"
            ]
        }
        Solo devuelve el JSON.
        `;

        try {
            console.log(`🧠 Content Agent: Designing strategy for ${productName}...`);
            const response = await this.ollama.chat({
                model: this.model,
                format: 'json',
                messages: [{ role: 'user', content: prompt }],
            });
            return JSON.parse(response.message.content);
        } catch (error) {
            console.error('❌ Strategy Gen Error:', error);
            return { error: "Failed to generate strategy" };
        }
    }

    async generateImagePrompt(productName, niche) {
        const prompt = `
        Crea un PROMPT detallado para generar una imagen de alta calidad con IA (como Midjourney o Flux) para publicitar este producto:
        "${productName}" del nicho "${niche}".
        
        El prompt debe ser en INGLÉS, describir la escena, iluminación, estilo (fotorealista, 3d render, etc) y atmósfera.
        Solo devuelve el prompt, nada más.
        `;

        try {
            console.log(`🎨 Content Agent: Creating image prompt for ${productName}...`);
            const response = await this.ollama.chat({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
            });
            return response.message.content;
        } catch (error) {
            console.error('❌ Prompt Gen Error:', error);
            return "Error generando prompt visual.";
        }
    }

    async classifyGitIntent(message) {
        const prompt = `
        Analyze this git commit message: "${message}".
        Classify it into one of these types: feature, fix, chore, docs, test.
        Also suggest a short, kebab-case branch name based on the message.
        
        Return ONLY a JSON object like this:
        { "type": "feature", "suggestedName": "new-login-flow" }
        `;

        try {
            const response = await this.ollama.chat({
                model: this.model,
                format: 'json', // Force JSON mode
                messages: [{ role: 'user', content: prompt }],
            });
            return JSON.parse(response.message.content);
        } catch (error) {
            console.error('❌ Git Classification Error:', error);
            return { type: 'feature', suggestedName: 'update-' + Date.now() }; // Fallback
        }
    }
}

export default new ContentAgent();
