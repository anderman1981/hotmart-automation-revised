import React, { useState } from 'react';
import { Database, Link, Globe, Trash2, Edit3, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const SettingsData = () => {
    const [sources, setSources] = useState([
        { id: 1, name: 'Hotmart Academy', description: 'Auto-scraping enabled. Accessing public tutorials.', type: 'Globe', status: 'Active' },
        { id: 2, name: 'Product Metrics', description: 'Internal sales and click data from Bayesian engine.', type: 'Database', status: 'Synced 2m ago' }
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', type: 'Globe' });

    const handleAdd = () => {
        if (!formData.name) return toast.error('Name is required');
        setSources([...sources, { ...formData, id: Date.now(), status: 'Pending' }]);
        setFormData({ name: '', description: '', type: 'Globe' });
        setIsAdding(false);
        toast.success('Data source connection initiated');
    };

    const handleDelete = (id) => {
        setSources(sources.filter(s => s.id !== id));
        toast.warning('Data source disconnected');
    };

    return (
        <div className="space-y-6">
             <div className="p-6 bg-white/5 rounded-xl border border-white/10 min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Global Data Sources</h2>
                        <p className="text-zinc-400 text-sm">Manage external knowledge sources for the Learning Agent.</p>
                    </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-all"
                    >
                        <Link size={16} /> Connect Source
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isAdding && (
                        <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 space-y-3 animate-in fade-in zoom-in-95">
                            <input 
                                className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-sm" 
                                placeholder="Source Name"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            <textarea 
                                className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-sm h-20" 
                                placeholder="Description or URL"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                            <div className="flex justify-between items-center">
                                <select 
                                    className="bg-zinc-800 border border-white/10 rounded p-1 text-xs text-zinc-300"
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="Globe">Web URL</option>
                                    <option value="Database">SQL Database</option>
                                    <option value="File">JSON/CSV File</option>
                                </select>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs text-zinc-400">Cancel</button>
                                    <button onClick={handleAdd} className="bg-emerald-600 px-3 py-1 rounded text-white text-xs font-bold flex items-center gap-1">
                                        <Save size={12} /> Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {sources.map(source => (
                        <div key={source.id} className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group relative">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${source.type === 'Globe' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                        {source.type === 'Globe' ? <Globe size={20} /> : <Database size={20} />}
                                    </div>
                                    <h3 className="font-bold text-white">{source.name}</h3>
                                </div>
                                <button 
                                    onClick={() => handleDelete(source.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{source.description}</p>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                <span className={`w-2 h-2 rounded-full ${source.status === 'Active' ? 'bg-emerald-500' : source.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span> 
                                {source.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsData;
