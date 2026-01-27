#!/usr/bin/env node

import fetch from 'node-fetch';

async function simulateN8nWorkflow() {
    console.log('🔄 Simulating N8N Workflow Execution...\n');
    
    // Paso 1: RUN_MANAGER_AGENT (simular llamada ollama + análisis)
    console.log('1️⃣ Running Manager Agent Analysis...');
    try {
        const analysisPrompt = `
        Analiza los siguientes datos de productos hotmart y genera insights:
        
        PRODUCTOS ACTUALES (basado en análisis del sistema):
        - Total productos: 7
        - Fuentes: Hotmart API
        - Estado: Carga completa
        
        GENERAR:
        1. Top 3 productos más rentables
        2. Tendencias de mercado detectadas  
        3. Recomendaciones de marketing
        4. Oportunidades de mejora
        
        Responde en formato JSON estructurado.
        `;
        
        const ollamaResponse = await fetch('http://localhost:4126/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-r1',
                prompt: analysisPrompt,
                stream: false
            })
        });
        
        if (ollamaResponse.ok) {
            const analysisResult = await ollamaResponse.json();
            console.log('✅ Manager Agent Analysis Complete');
            console.log('📊 Insights:', analysisResult.response.slice(0, 200) + '...');
            
            // Paso 2: Simular Instagram Publish (preparar contenido)
            console.log('\n2️⃣ Preparing Instagram Content...');
            
            const contentPrompt = `
            Basado en este análisis: ${analysisResult.response.slice(0, 500)}
            
            Genera un post de Instagram atractivo para promocionar productos hotmart:
            - Título llamativo
            - 3-5 hashtags relevantes
            - Call to action claro
            - Emojis apropiados
            `;
            
            const contentResponse = await fetch('http://localhost:4126/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.2',
                    prompt: contentPrompt,
                    stream: false
                })
            });
            
            if (contentResponse.ok) {
                const contentResult = await contentResponse.json();
                console.log('✅ Instagram Content Ready');
                console.log('📱 Post Preview:', contentResult.response.slice(0, 150) + '...');
                
                // Paso 3: Collect Metrics (simular)
                console.log('\n3️⃣ Collecting Performance Metrics...');
                const metrics = {
                    timestamp: new Date().toISOString(),
                    ollama_models_used: ['deepseek-r1', 'llama3.2'],
                    analysis_tokens: analysisResult.response.length,
                    content_tokens: contentResult.response.length,
                    processing_time: Date.now(),
                    status: 'success'
                };
                console.log('✅ Metrics Collected:', metrics);
                
                // Paso 4: Feedback Loop (preparar próximo análisis)
                console.log('\n4️⃣ Preparing Feedback Loop...');
                
                const feedbackPrompt = `
                Basado en el rendimiento actual:
                - Análisis completado exitosamente
                - Contenido generado
                - Métricas: ${JSON.stringify(metrics)}
                
                Genera recomendaciones para optimizar el próximo ciclo:
                - Mejoras en prompts
                - Modelos a usar
                - Frecuencia sugerida
                `;
                
                const feedbackResponse = await fetch('http://localhost:4126/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llama3.2',
                        prompt: feedbackPrompt,
                        stream: false
                    })
                });
                
                if (feedbackResponse.ok) {
                    const feedbackResult = await feedbackResponse.json();
                    console.log('✅ Feedback Loop Complete');
                    console.log('💡 Recommendations:', feedbackResult.response.slice(0, 200) + '...');
                    
                    // Guardar resultados en el motor para persistencia
                    console.log('\n5️⃣ Storing Results...');
                    
                    const storeResponse = await fetch('http://localhost:4123/api/agents/manager/task', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'store_results',
                            payload: {
                                workflow_results: {
                                    analysis: analysisResult.response,
                                    content: contentResult.response,
                                    metrics: metrics,
                                    feedback: feedbackResult.response,
                                    timestamp: new Date().toISOString(),
                                    next_run: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 horas
                                }
                            }
                        })
                    });
                    
                    if (storeResponse.ok) {
                        const storeResult = await storeResponse.json();
                        console.log('✅ Results Stored:', storeResult);
                    }
                }
            }
        }
        
        console.log('\n🎉 Workflow Simulation Complete!');
        console.log('📋 Next Steps:');
        console.log('1. Activate N8N workflows manually via http://localhost:5678');
        console.log('2. Configure cron trigger for every 6 hours');
        console.log('3. Test webhook endpoints');
        console.log('4. Monitor automated execution');
        
    } catch (error) {
        console.error('❌ Workflow Error:', error.message);
    }
}

simulateN8nWorkflow().catch(console.error);