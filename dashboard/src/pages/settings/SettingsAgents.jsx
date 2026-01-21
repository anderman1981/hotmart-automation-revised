import React, { useState, useEffect } from 'react';
import { Play, Square, Activity, Database, HardDrive, Cpu } from 'lucide-react';
import { toast } from 'sonner';

const SettingsAgents = () => {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAgents = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/agents');
            const data = await res.json();
            if (data.agents) setAgents(data.agents);
        } catch (error) {
            console.error('Error fetching agents:', error);
            toast.error('Failed to load agents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
        const interval = setInterval(fetchAgents, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleAgent = async (agentId, currentStatus) => {
        const action = currentStatus.includes('Running') ? 'stop' : 'start'; // Simple toggle logic needs backend support for 'start' specific agents if not generic
        // For now, only STOP is fully implemented generic, START depends on specific endpoints.
        // We will assume manager handles autonomy, so manual start might be triggering a task.
        // For this UI, we'll implement STOP.

        if (action === 'start') {
            toast.info(`Requesting Manager to start ${agentId}...`);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}/start`, { method: 'POST' });
                const data = await res.json();
                if (data.status === 'success') {
                    toast.success(`Signal sent to start ${agentId}`);
                    setTimeout(fetchAgents, 3000); // Wait for boot
                } else {
                    toast.error(`Failed to start: ${data.error}`);
                }
            } catch (e) {
                toast.error(e.message);
            }
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}/stop`, { method: 'POST' });
            const data = await res.json();
            if (data.status) {
                toast.success(`Agent ${agentId} stopped`);
                fetchAgents();
            }
        } catch (e) {
            toast.error(e.message);
        }
    };

    return (
        <div className="flex gap-6 h-[600px]">
            {/* Agent List */}
            <div className="w-1/3 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-bold text-white">System Agents</h3>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {agents.map(agent => (
                        <div
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent)}
                            className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedAgent?.id === agent.id ? 'bg-blue-500/20 border-blue-500/50' : 'bg-zinc-900/40 border-transparent hover:bg-white/5'}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-zinc-100">{agent.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${agent.status.includes('Running') || agent.status.includes('Active') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                                    {agent.status}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500">{agent.type}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Agent Details & Resources */}
            <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-6 overflow-y-auto">
                {selectedAgent ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{selectedAgent.name}</h2>
                                <p className="text-zinc-400 text-sm flex items-center gap-2">
                                    <Activity size={14} /> ID: {selectedAgent.id}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleAgent(selectedAgent.id, selectedAgent.status)}
                                    className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm ${selectedAgent.status.includes('Running') ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'}`}
                                >
                                    {selectedAgent.status.includes('Running') ? <><Square size={16} /> Stop Agent</> : <><Play size={16} /> Start Agent</>}
                                </button>
                            </div>
                        </div>

                        {/* Resource Usage (Mocked) */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                                <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Cpu size={14} /> CPU Usage</h4>
                                <div className="text-2xl font-mono text-blue-400">{Math.floor(Math.random() * 30) + 5}%</div>
                                <div className="w-full bg-zinc-800 h-1 mt-2 rounded-full"><div className="bg-blue-500 h-1 rounded-full" style={{ width: '25%' }}></div></div>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                                <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2"><HardDrive size={14} /> Memory</h4>
                                <div className="text-2xl font-mono text-purple-400">{Math.floor(Math.random() * 200) + 100} MB</div>
                                <div className="w-full bg-zinc-800 h-1 mt-2 rounded-full"><div className="bg-purple-500 h-1 rounded-full" style={{ width: '40%' }}></div></div>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                                <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Activity size={14} /> Uptime</h4>
                                <div className="text-2xl font-mono text-emerald-400">4h 23m</div>
                            </div>
                        </div>

                        {/* Data Ingestion Section */}
                        <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Database size={18} className="text-orange-500" /> Data Source Ingestion
                            </h3>
                            <p className="text-sm text-zinc-500 mb-4">Upload documents, videos, or JSON data for this agent to process.</p>

                            <div className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-8 text-center transition-colors cursor-pointer bg-zinc-900/50">
                                <p className="text-zinc-400">Drag & Drop files here or <span className="text-blue-400 underline">browse</span></p>
                                <p className="text-xs text-zinc-600 mt-2">Supports: PDF, MP4, JSON, TXT</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                        <Activity size={48} className="mb-4 opacity-20" />
                        <p>Select an agent to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsAgents;
