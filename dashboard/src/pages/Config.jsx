import React, { useEffect, useState } from 'react';

function Config() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAgentName, setNewAgentName] = useState('');
    const [newAgentDesc, setNewAgentDesc] = useState('');

    const fetchAgents = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/agents');
            const data = await res.json();
            if (data.agents) setAgents(data.agents);
        } catch (error) {
            console.error('Error fetching agents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
        const interval = setInterval(fetchAgents, 5000); // Poll status
        return () => clearInterval(interval);
    }, []);

    const handleCreateAgent = async (e) => {
        e.preventDefault();
        if (!newAgentName) return;

        try {
            const res = await fetch('http://localhost:4000/api/agents/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentName: newAgentName, description: newAgentDesc })
            });
            const data = await res.json();
            if (data.status === 'created') {
                alert(`Agente ${newAgentName} creado! Reinicia el contenedor 'motor' para activarlo.`);
                setNewAgentName('');
                setNewAgentDesc('');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                ⚙️ Configuración del Sistema
            </h1>

            {/* Agent Registry */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold mb-4 text-white">📡 Registro de Agentes</h2>
                {loading ? (
                    <p className="text-gray-400">Cargando...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left bg-black/20 rounded-lg overflow-hidden">
                            <thead className="bg-black/40 text-purple-300 uppercase text-sm">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Tipo</th>
                                    <th className="p-4">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 text-gray-300">
                                {agents.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-white/5 transition">
                                        <td className="p-4 font-mono text-sm text-yellow-500">{agent.id}</td>
                                        <td className="p-4 font-medium text-white">{agent.name}</td>
                                        <td className="p-4">{agent.type}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${agent.status === 'Running' || agent.status.includes('Active')
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {agent.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Agent Wizard */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold mb-4 text-white">🧪 Crear Nuevo Agente</h2>
                <form onSubmit={handleCreateAgent} className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre del Agente (sin espacios)</label>
                        <input
                            type="text"
                            className="w-full bg-black/30 border border-white/10 rounded p-2 text-white focus:border-purple-500 outline-none"
                            placeholder="Ej: Twitter, TikTok, Analytics"
                            value={newAgentName}
                            onChange={(e) => setNewAgentName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                        <textarea
                            className="w-full bg-black/30 border border-white/10 rounded p-2 text-white focus:border-purple-500 outline-none"
                            placeholder="¿Qué hará este agente?"
                            value={newAgentDesc}
                            onChange={(e) => setNewAgentDesc(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-2 px-4 rounded transition shadow-lg shadow-cyan-500/30"
                    >
                        Generar Código Base
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Config;
