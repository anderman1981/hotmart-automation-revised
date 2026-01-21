import React, { useState, useEffect } from 'react';
import { Shield, Key, Plus, Trash2, Edit3, Save, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const SettingsAPI = () => {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchKeys = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/keys`);
            const data = await res.json();
            if (data.keys) setKeys(data.keys);
        } catch (e) {
            toast.error('Failed to load API keys');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const [isAdding, setIsAdding] = useState(false);
    const [newKey, setNewKey] = useState({ name: '', platform: '', key: '' });
    const [showKey, setShowKey] = useState({});

    const handleAdd = async () => {
        if (!newKey.name || !newKey.key) return toast.error('Name and Key are required');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newKey)
            });
            const data = await res.json();
            if (data.status === 'success') {
                toast.success('API Key added and persistent');
                fetchKeys();
                setNewKey({ name: '', platform: '', key: '' });
                setIsAdding(false);
            }
        } catch (e) {
            toast.error('Error saving API key');
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/settings/keys/${id}`, { method: 'DELETE' });
            toast.success('API Key deleted from DB');
            fetchKeys();
        } catch (e) {
            toast.error('Delete failed');
        }
    };

    const toggleShow = (id) => {
        setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="p-6 bg-white/5 rounded-xl border border-white/10 min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="text-orange-500" /> Security & API Keys
                    </h2>
                    <p className="text-zinc-400 text-sm">Manage your external service credentials and access tokens.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-all"
                >
                    <Plus size={16} /> Add New Key
                </button>
            </div>

            <div className="grid gap-4">
                {isAdding && (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Service Name (e.g. OpenAI)"
                                className="bg-zinc-900 border border-white/10 rounded-lg p-2 text-white text-sm"
                                value={newKey.name}
                                onChange={e => setNewKey({ ...newKey, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Platform (e.g. Marketing)"
                                className="bg-zinc-900 border border-white/10 rounded-lg p-2 text-white text-sm"
                                value={newKey.platform}
                                onChange={e => setNewKey({ ...newKey, platform: e.target.value })}
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="API Key or Token"
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white text-sm"
                                value={newKey.key}
                                onChange={e => setNewKey({ ...newKey, key: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-zinc-400 hover:text-white text-sm">Cancel</button>
                            <button onClick={handleAdd} className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-bold">Save Connection</button>
                        </div>
                    </div>
                )}

                {keys.map(item => (
                    <div key={item.id} className="p-4 bg-zinc-900/40 border border-white/5 rounded-xl hover:border-white/10 transition-all group">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="p-3 bg-white/5 rounded-lg text-orange-400">
                                    <Key size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        {item.name}
                                        <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded uppercase">{item.platform}</span>
                                    </h3>
                                    <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
                                        {showKey[item.id] ? item.key : item.key.replace(/./g, '•').slice(0, 16) + '...'}
                                        <button onClick={() => toggleShow(item.id)} className="text-zinc-600 hover:text-zinc-400">
                                            {showKey[item.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <p className="text-xs text-blue-400/70 leading-relaxed">
                    <strong>Note:</strong> API keys are encrypted before storage. External agents will automatically use these keys to authenticate against third-party services like Hotmart hooks or N8N workflows.
                </p>
            </div>
        </div>
    );
};

export default SettingsAPI;
