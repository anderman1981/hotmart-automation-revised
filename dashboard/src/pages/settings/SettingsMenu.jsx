import React, { useState, useEffect } from 'react';
import { Menu, Grid, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const SettingsMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ label: '', path: '', id: '' });

    const fetchMenu = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/menu`);
            const data = await res.json();
            if (data.menu) setMenuItems(data.menu);
        } catch (e) {
            toast.error('Failed to load menu from server');
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleAdd = async () => {
        if (!formData.label || !formData.path) return toast.error('Label and Path are required');
        const newItem = {
            id: formData.label.toLowerCase().replace(/\s/g, '-'),
            label: formData.label,
            path: formData.path
        };
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/menu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            if (res.ok) {
                toast.success('Menu item saved to DB');
                fetchMenu();
                setFormData({ label: '', path: '', id: '' });
                setIsAdding(false);
            }
        } catch (e) {
            toast.error('Save failed');
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData(item);
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/menu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success('Menu item updated in DB');
                fetchMenu();
                setEditingId(null);
                setFormData({ label: '', path: '', id: '' });
            }
        } catch (e) {
            toast.error('Update failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/menu/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Menu item removed from DB');
                fetchMenu();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Delete failed');
            }
        } catch (e) {
            toast.error('Error connecting to server');
        }
    };

    return (
        <div className="p-6 bg-white/5 rounded-xl border border-white/10 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">Menu Customization</h2>
                    <p className="text-zinc-400 text-sm">Organize your dashboard layout and navigation.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-all"
                >
                    <Plus size={16} /> Add Menu Item
                </button>
            </div>

            <div className="space-y-3">
                {isAdding && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex gap-4 animate-in slide-in-from-right-4">
                        <input
                            className="bg-zinc-900 border border-white/10 rounded p-2 text-sm flex-1"
                            placeholder="Label (e.g. Analytics)"
                            value={formData.label}
                            onChange={e => setFormData({ ...formData, label: e.target.value })}
                        />
                        <input
                            className="bg-zinc-900 border border-white/10 rounded p-2 text-sm flex-1"
                            placeholder="Path (e.g. /analytics)"
                            value={formData.path}
                            onChange={e => setFormData({ ...formData, path: e.target.value })}
                        />
                        <button onClick={handleAdd} className="bg-blue-600 px-4 rounded text-white font-bold"><Save size={16} /></button>
                        <button onClick={() => setIsAdding(false)} className="text-zinc-400"><X size={16} /></button>
                    </div>
                )}

                {menuItems.map((item) => (
                    <div key={item.id} className="p-4 bg-zinc-900/50 border border-zinc-700/50 rounded-lg flex items-center justify-between group">
                        {editingId === item.id ? (
                            <div className="flex gap-4 w-full">
                                <input
                                    className="bg-zinc-800 border border-white/10 rounded p-1 text-sm flex-1"
                                    value={formData.label}
                                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                                />
                                <input
                                    className="bg-zinc-800 border border-white/10 rounded p-1 text-sm flex-1"
                                    value={formData.path}
                                    onChange={e => setFormData({ ...formData, path: e.target.value })}
                                />
                                <button onClick={handleUpdate} className="text-emerald-400"><Save size={18} /></button>
                                <button onClick={() => setEditingId(null)} className="text-zinc-400"><X size={18} /></button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-4">
                                    <Grid size={20} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
                                    <div>
                                        <span className="text-white font-medium block">{item.label}</span>
                                        <span className="text-[10px] text-zinc-500 font-mono">{item.path}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {item.is_default ? (
                                        <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-1 rounded uppercase">System</span>
                                    ) : (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(item)} className="text-zinc-500 hover:text-white"><Edit3 size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-zinc-500 hover:text-red-400"><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <p className="text-xs text-zinc-500 mt-6 text-center italic">Changes are saved globally in PostgreSQL database.</p>
        </div>
    );
};

export default SettingsMenu;
