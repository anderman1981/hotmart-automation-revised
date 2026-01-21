import React, { useState, useEffect } from 'react';
import { Globe, Database, FileText, Link2, Unlink } from 'lucide-react';
import { toast } from 'sonner';

const SettingsData = () => {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSources = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/sources`);
            const data = await res.json();
            if (data.sources) setSources(data.sources);
        } catch (e) {
            toast.error('Failed to load data sources');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSources();
    }, []);

    const [newSource, setNewSource] = useState({ name: '', description: '', type: 'Globe' });

    const handleConnect = async () => {
        if (!newSource.name) return toast.error('Source name is required');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/sources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSource)
            });
            if (res.ok) {
                toast.success('Source connected and saved to DB');
                fetchSources();
                setNewSource({ name: '', description: '', type: 'Globe' });
            }
        } catch (e) {
            toast.error('Connection failed');
        }
    };

    const handleDisconnect = async (id) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/settings/sources/${id}`, { method: 'DELETE' });
            toast.success('Source disconnected');
            fetchSources();
        } catch (e) {
            toast.error('Disconnect failed');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Globe': return <Globe className="text-blue-400" size={24} />;
            case 'Database': return <Database className="text-emerald-400" size={24} />;
            case 'File': return <FileText className="text-amber-400" size={24} />;
            default: return <Globe className="text-blue-400" size={24} />;
        }
    };

    return (
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">Knowledge Data Sources</h2>
            <p className="text-zinc-400 text-sm mb-6">Connect external sources to feed the Learning Agent. Supports Web, SQL, and Files (PDF).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-zinc-900 border border-white/5 rounded-lg space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Plus className="text-blue-500" size={16} /> New Connection
                    </h3>
                    <input
                        className="w-full bg-black border border-white/10 rounded p-2 text-sm text-white"
                        placeholder="Source Name (e.g. Hotmart Docs)"
                        value={newSource.name}
                        onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                    />
                    <select
                        className="w-full bg-black border border-white/10 rounded p-2 text-sm text-white"
                        value={newSource.type}
                        onChange={e => setNewSource({ ...newSource, type: e.target.value })}
                    >
                        <option value="Globe">Website URL</option>
                        <option value="Database">SQL Database</option>
                        <option value="File">PDF / Text File</option>
                    </select>
                    <textarea
                        className="w-full bg-black border border-white/10 rounded p-2 text-sm text-white h-20"
                        placeholder="Description or connection string..."
                        value={newSource.description}
                        onChange={e => setNewSource({ ...newSource, description: e.target.value })}
                    />
                    <button
                        onClick={handleConnect}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all"
                    >
                        Connect Source
                    </button>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Active Connections</h3>
                    {sources.length === 0 ? (
                        <div className="p-8 text-center text-zinc-600 border border-dashed border-white/10 rounded-lg">
                            No sources connected.
                        </div>
                    ) : (
                        sources.map(source => (
                            <div key={source.id} className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-black rounded-lg">
                                        {getIcon(source.type)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{source.name}</h4>
                                        <p className="text-[10px] text-zinc-500 truncate max-w-[150px]">{source.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">
                                        {source.status || 'Active'}
                                    </span>
                                    <button
                                        onClick={() => handleDisconnect(source.id)}
                                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                                    >
                                        <Unlink size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const Plus = ({ className, size }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default SettingsData;
