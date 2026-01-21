import React, { useState, useEffect } from 'react';
import { Bot, Image, PenTool, Search, Instagram, Terminal, Play, StopCircle, X, Type, Database, Save, FileJson } from 'lucide-react';
import { toast } from 'sonner';

const Agents = () => {
    const [activeTab, setActiveTab] = useState('instagram');
    const [viewMode, setViewMode] = useState('actions'); // 'actions' or 'knowledge'
    const [knowledgeData, setKnowledgeData] = useState('');
    const [productUrl, setProductUrl] = useState('');
    const [productName, setProductName] = useState('');
    const [niche, setNiche] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Fetch knowledge when entering knowledge mode
    useEffect(() => {
        if (viewMode === 'knowledge') {
            fetchKnowledge();
        }
    }, [viewMode, activeTab]);

    const fetchKnowledge = async () => {
        try {
            const agentMap = { instagram: 'instagram', content: 'content', visual: 'assets', git: 'git' };
            const agentName = agentMap[activeTab] || activeTab;

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentName}/knowledge`);
            const data = await res.json();

            if (data.status === 'empty') {
                setKnowledgeData('');
            } else {
                setKnowledgeData(JSON.stringify(data, null, 2));
            }
        } catch (e) {
            toast.error('Error fetching knowledge');
        }
    };

    const saveKnowledge = async () => {
        try {
            const agentMap = { instagram: 'instagram', content: 'content', visual: 'assets', git: 'git' };
            const agentName = agentMap[activeTab] || activeTab;

            // Validate JSON
            let parsed;
            try {
                parsed = JSON.parse(knowledgeData);
            } catch (e) {
                toast.error('Invalid JSON format');
                return;
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentName}/knowledge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed)
            });

            const result = await res.json();
            if (result.status === 'success') {
                toast.success('Knowledge Base Updated!');
                addLog(`🧠 Knowledge updated for ${agentName}`);
            } else {
                toast.error('Failed to save');
            }
        } catch (e) {
            toast.error(e.message);
        }
    };

    const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const triggerAgent = async (endpoint, payload, agentName) => {
        setLoading(true);
        addLog(`🚀 Activando ${agentName}...`);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            addLog(`✅ ${agentName} Finalizado: ${JSON.stringify(data.status || 'OK')}`);
            setResult(data);
        } catch (e) {
            addLog(`❌ Error en ${agentName}: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async (agentName) => {
        try {
            const res = await fetch(`http://localhost:4000/api/agents/${agentName}/stop`, { method: 'POST' });
            const data = await res.json();
            addLog(`🛑 Agente ${agentName}: ${data.status}`);
            toast.success(`Agente ${agentName} detenido.`);
        } catch (e) {
            addLog(`❌ Error al detener ${agentName}: ${e.message}`);
            toast.error('Error al detener: ' + e.message);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <header className="flex items-center justify-between pb-6 border-b border-white/10">
                <div>
                    <h1 className="heading-xl text-white flex items-center gap-3">
                        <Bot className="text-orange-500" /> Centro de Agentes
                    </h1>
                    <p className="text-zinc-400 mt-2">Orquesta tus IAs autónomas para marketing y ventas.</p>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Sidebar Agents List */}
                <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                        <h3 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                            <Database size={16} /> Agentes Entrenables
                        </h3>
                        <p className="text-zinc-400 text-xs">
                            Estos agentes mejoran con conocimiento externo. Los demás (Git, Detector, Manager) ya tienen sus reglas definidas.
                        </p>
                    </div>

                    <AgentCard
                        icon={<PenTool />}
                        title="Contenido IA"
                        desc="Copy, hooks, frameworks de copywriting"
                        tooltip="Pega ejemplos de copy viral, frameworks probados, hooks que funcionan"
                        active={activeTab === 'content'}
                        onClick={() => { setActiveTab('content'); setViewMode('actions'); }}
                    />
                    <AgentCard
                        icon={<Instagram />}
                        title="Redes Sociales"
                        desc="Estrategias de engagement y hashtags"
                        tooltip="Mejores horarios, hashtags efectivos, tipos de contenido que generan engagement"
                        active={activeTab === 'instagram'}
                        onClick={() => { setActiveTab('instagram'); setViewMode('actions'); }}
                    />
                    <AgentCard
                        icon={<Image />}
                        title="Espía Visual"
                        desc="Patrones de diseño y creativos"
                        tooltip="Paletas de colores, estilos visuales, tipos de imágenes que convierten"
                        active={activeTab === 'visual'}
                        onClick={() => { setActiveTab('visual'); setViewMode('actions'); }}
                    />
                </div>

                {/* Action Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-glass p-0 overflow-hidden">
                        {/* Tab Header inside Card */}
                        <div className="flex border-b border-white/10 bg-black/20">
                            <button
                                onClick={() => setViewMode('actions')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${viewMode === 'actions' ? 'text-orange-500 bg-orange-500/5' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Play size={16} /> Actions
                            </button>
                            <button
                                onClick={() => setViewMode('knowledge')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${viewMode === 'knowledge' ? 'text-orange-500 bg-orange-500/5' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Database size={16} /> Knowledge Base
                            </button>
                        </div>

                        <div className="p-8">
                            {viewMode === 'knowledge' ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="heading-lg text-white">Brain Training 🧠</h2>
                                        <button onClick={saveKnowledge} className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
                                            <Save size={16} /> Save Knowledge
                                        </button>
                                    </div>
                                    <p className="text-zinc-400 text-sm">
                                        Entrena a este agente proporcionando datos JSON. Pega el contenido de archivos como <code>github.json</code> aquí.
                                    </p>
                                    <textarea
                                        value={knowledgeData}
                                        onChange={(e) => setKnowledgeData(e.target.value)}
                                        className="w-full h-80 bg-zinc-950 font-mono text-xs text-green-400 p-4 rounded-xl border border-white/10 focus:border-orange-500 outline-none"
                                        placeholder={`{
    "context": "Here is knowledge for the agent...",
    "rules": []
}`}
                                    />
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'instagram' && (
                                        <div className="space-y-6">
                                            <h2 className="heading-lg text-white">Instagram Auto-Bot</h2>
                                            <p className="text-zinc-400">Este agente puede iniciar sesión, dar likes a hashtags del nicho y publicar contenido.</p>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => triggerAgent('/api/agents/instagram/start', {}, 'Instagram Agent')}
                                                    disabled={loading}
                                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                                >
                                                    <Play size={16} /> Iniciar Sesión y Escanear
                                                </button>
                                                <button
                                                    onClick={() => handleStop('instagram')}
                                                    className="px-4 bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/20 rounded-xl transition flex items-center justify-center"
                                                    title="Parada de Emergencia"
                                                >
                                                    <StopCircle size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'content' && (
                                        <div className="space-y-6">
                                            <h2 className="heading-lg text-white">Generador de Contenido Viral</h2>
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    placeholder="Nombre del Producto (ej. IA Heroes)"
                                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                                                    value={productName}
                                                    onChange={(e) => setProductName(e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Nicho (ej. Tecnología, Salud)"
                                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                                                    value={niche}
                                                    onChange={(e) => setNiche(e.target.value)}
                                                />
                                                <button
                                                    onClick={() => triggerAgent('/api/agents/content/generate', { productName, niche }, 'Content Agent')}
                                                    disabled={loading}
                                                    className="btn-primary w-full"
                                                >
                                                    {loading ? 'Generando...' : 'Crear Copy y Prompt'}
                                                </button>
                                            </div>
                                            {result?.copy && (
                                                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                                                    <h3 className="text-orange-400 font-bold mb-2">📢 Copy Generado:</h3>
                                                    <p className="text-zinc-300 whitespace-pre-wrap">{result.copy}</p>
                                                    <h3 className="text-orange-400 font-bold mt-4 mb-2">🎨 Prompt Visual:</h3>
                                                    <p className="text-zinc-400 italic text-sm">{result.image_prompt}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'visual' && (
                                        <div className="space-y-6">
                                            <h2 className="heading-lg text-white">Espía de Activos (Assets Spy)</h2>
                                            <p className="text-zinc-400">Extrae imágenes de alta calidad y busca carpetas de Drive/Dropbox ocultas en páginas de ventas.</p>
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    placeholder="URL de Página de Ventas o Checkout"
                                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                                                    value={productUrl}
                                                    onChange={(e) => setProductUrl(e.target.value)}
                                                />
                                                <button
                                                    onClick={() => triggerAgent('/api/agents/assets/scan', { productUrl }, 'Assets Agent')}
                                                    disabled={loading}
                                                    className="btn-primary w-full"
                                                >
                                                    {loading ? 'Escaneando...' : 'Escanear Activos'}
                                                </button>
                                            </div>
                                            {result?.assets && (
                                                <div className="mt-6 space-y-4">
                                                    <h3 className="text-white font-bold">Enlaces Encontrados ({result.assets.material_links.length})</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {result.assets.material_links.map((link, i) => (
                                                            <a key={i} href={link.url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30 hover:bg-blue-500/40">
                                                                {link.type}: {link.text}
                                                            </a>
                                                        ))}
                                                    </div>
                                                    <h3 className="text-white font-bold mt-4">Imágenes ({result.assets.images_found.length})</h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {result.assets.images_found.map((img, i) => (
                                                            <img key={i} src={img} alt="Asset" className="w-full h-24 object-cover rounded-lg border border-white/10" />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Terminal Logs */}
                    <div className="card-glass p-6 bg-black/40 font-mono text-sm max-h-60 overflow-y-auto">
                        <h3 className="text-zinc-500 mb-3 flex items-center gap-2"><Terminal size={14} /> System Logs</h3>
                        {logs.map((log, i) => (
                            <div key={i} className="text-zinc-400 border-b border-white/5 py-1 last:border-0">
                                <span className="text-emerald-500 mr-2">➜</span> {log}
                            </div>
                        ))}
                        {logs.length === 0 && <span className="text-zinc-600">Esperando comandos...</span>}
                    </div>
                </div>

            </div>
        </div>
    );
};

const AgentCard = ({ icon, title, desc, tooltip, active, onClick }) => (
    <div
        onClick={onClick}
        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4 group relative ${active ? 'bg-orange-600/10 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800/40'}`}
        title={tooltip}
    >
        <div className={`p-3 rounded-xl ${active ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
            {icon}
        </div>
        <div className="flex-1">
            <h3 className={`font-bold ${active ? 'text-white' : 'text-zinc-300'}`}>{title}</h3>
            <p className="text-xs text-zinc-500">{desc}</p>
            {tooltip && (
                <p className="text-[10px] text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    💡 {tooltip}
                </p>
            )}
        </div>
    </div>
);

export default Agents;
