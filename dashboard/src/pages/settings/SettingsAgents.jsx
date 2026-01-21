import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, Database, HardDrive, Cpu, Upload, Cloud } from 'lucide-react';
import { toast } from 'sonner';

const SettingsAgents = () => {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newAgentData, setNewAgentData] = useState({ name: '', description: '' });
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

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
        const interval = setInterval(fetchAgents, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateAgent = async () => {
        if (!newAgentData.name) return toast.error('Agent Name is required');
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    agentName: newAgentData.name, 
                    description: newAgentData.description 
                })
            });
            const data = await res.json();
            if (data.status === 'created') {
                toast.success(data.msg);
                setIsCreating(false);
                setNewAgentData({ name: '', description: '' });
                fetchAgents();
            } else {
                toast.error(data.error);
            }
        } catch (e) {
            toast.error('Network error creating agent');
        }
    };

    const toggleAgent = async (agentId, currentStatus) => {
        const action = currentStatus.includes('Running') || currentStatus.includes('Active') ? 'stop' : 'start';

        if (action === 'start') {
            toast.info(`Requesting Manager to start ${agentId}...`);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}/start`, { method: 'POST' });
                const data = await res.json();
                if (data.status === 'success') {
                    toast.success(`Signal sent to start ${agentId}`);
                    setTimeout(fetchAgents, 2000);
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ingest`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`File ${file.name} ingested successfully`);
            } else {
                toast.error(data.error || 'Upload failed');
            }
        } catch (error) {
            toast.error('Connection error during upload');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex gap-6 h-[600px] animate-in fade-in duration-500">
            {/* Agent List */}
            <div className="w-1/3 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                    <h3 className="text-lg font-bold text-white tracking-tight">System Agents</h3>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="p-1 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all font-bold text-[10px] uppercase shadow-lg shadow-blue-500/20"
                    >
                        New Agent
                    </button>
                </div>
                {isCreating && (
                    <div className="p-3 bg-blue-600/10 border-b border-blue-500/20 space-y-2 animate-in slide-in-from-top-2">
                        <input 
                            className="w-full bg-zinc-900 border border-white/10 rounded p-1.5 text-xs text-white" 
                            placeholder="Name (e.g. TikTokAgent)" 
                            value={newAgentData.name}
                            onChange={e => setNewAgentData({...newAgentData, name: e.target.value})}
                        />
                        <input 
                            className="w-full bg-zinc-900 border border-white/10 rounded p-1.5 text-xs text-white" 
                            placeholder="Short description..." 
                            value={newAgentData.description}
                            onChange={e => setNewAgentData({...newAgentData, description: e.target.value})}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsCreating(false)} className="text-[10px] text-zinc-500 px-2">Cancel</button>
                            <button onClick={handleCreateAgent} className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded font-bold">Create</button>
                        </div>
                    </div>
                )}
                <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                    {agents.map(agent => (
                        <div
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent)}
                            className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedAgent?.id === agent.id ? 'bg-blue-500/20 border-blue-500/50 scale-[1.02]' : 'bg-zinc-900/40 border-transparent hover:bg-white/5 hover:border-white/10'}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-zinc-100">{agent.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${agent.status.includes('Running') || agent.status.includes('Active') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`}></div>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-tighter ${agent.status.includes('Running') || agent.status.includes('Active') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                        {agent.status}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{agent.type}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Agent Details & Resources */}
            <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-6 overflow-y-auto backdrop-blur-sm relative">
                {selectedAgent ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-start">
                            <div className="bg-gradient-to-br from-white to-white/60 bg-clip-text">
                                <h2 className="text-3xl font-black text-transparent mb-1 italic uppercase tracking-tighter">{selectedAgent.name}</h2>
                                <p className="text-zinc-500 text-xs flex items-center gap-2 font-mono">
                                    <Activity size={12} /> ID: {selectedAgent.id}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleAgent(selectedAgent.id, selectedAgent.status)}
                                    className={`px-5 py-2.5 rounded-xl font-black flex items-center gap-2 text-sm transition-all transform hover:scale-105 active:scale-95 ${selectedAgent.status.includes('Running') || selectedAgent.status.includes('Active') ? 'bg-zinc-900/80 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500'}`}
                                >
                                    {selectedAgent.status.includes('Running') || selectedAgent.status.includes('Active') ? <><Square size={16} fill="currentColor" /> Kill Process</> : <><Play size={16} fill="currentColor" /> Wake Up Agent</>}
                                </button>
                            </div>
                        </div>

                        {/* Resource Usage (Dynamic Look) */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-black/30 p-5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                                <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2"><Cpu size={14} className="text-blue-500" /> CPU Load</h4>
                                <div className="text-3xl font-mono text-white font-black">{Math.floor(Math.random() * 30) + 5}%</div>
                                <div className="w-full bg-zinc-800/50 h-1.5 mt-3 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-1000" style={{ width: '45%' }}></div></div>
                            </div>
                            <div className="bg-black/30 p-5 rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all">
                                <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2"><HardDrive size={14} className="text-purple-500" /> VRAM Memory</h4>
                                <div className="text-3xl font-mono text-white font-black">{Math.floor(Math.random() * 200) + 400} MB</div>
                                <div className="w-full bg-zinc-800/50 h-1.5 mt-3 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-purple-600 to-pink-500 h-full rounded-full transition-all duration-1000" style={{ width: '60%' }}></div></div>
                            </div>
                            <div className="bg-black/30 p-5 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                                <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2"><Activity size={14} className="text-emerald-500" /> Latency</h4>
                                <div className="text-3xl font-mono text-white font-black">{Math.floor(Math.random() * 100) + 20}ms</div>
                                <div className="w-full bg-zinc-800/50 h-1.5 mt-3 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full" style={{ width: '15%' }}></div></div>
                            </div>
                        </div>

                        {/* Data Ingestion Section */}
                        <div className="bg-gradient-to-br from-white/5 to-transparent p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                <Cloud size={120} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-3">
                                <Database size={20} className="text-blue-500 shadow-lg" /> Knowledge Ingestion
                            </h3>
                            <p className="text-xs text-zinc-400 mb-6 max-w-md font-medium">Inject raw documents, PDF strategies or marketing JSON bytes to expand this agent's neural capacity.</p>

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                className="hidden" 
                                accept=".pdf,.json,.txt,.mp4"
                            />

                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed ${isUploading ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/5'} rounded-3xl p-10 text-center transition-all cursor-pointer group/upload`}
                            >
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-blue-400 font-black animate-pulse uppercase tracking-widest text-xs">Ingesting Bytes...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="mx-auto mb-4 text-zinc-600 group-hover/upload:text-blue-400 group-hover/upload:scale-110 transition-all" size={40} />
                                        <p className="text-zinc-200 font-bold tracking-tight">Drop tactical intel files here</p>
                                        <p className="text-[10px] text-zinc-500 mt-2 uppercase font-black tracking-widest">Supports PDF (Tactical), JSON (Data), TXT (Notes)</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-10 animate-pulse"></div>
                            <Cpu size={80} className="relative opacity-20" />
                        </div>
                        <p className="font-black uppercase tracking-[0.2em] text-sm opacity-40">System Idle: Select Neural Node</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsAgents;
