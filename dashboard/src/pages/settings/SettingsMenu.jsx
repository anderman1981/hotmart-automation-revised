import React from 'react';
import { Menu, Grid, Plus } from 'lucide-react';

const SettingsMenu = () => {
    return (
        <div className="p-6 bg-white/5 rounded-xl border border-white/10 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">Menu Customization</h2>
                    <p className="text-zinc-400 text-sm">Organize your dashboard layout and navigation.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 text-sm font-bold">
                    <Plus size={16} /> Add Menu Item
                </button>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-zinc-900/50 border border-zinc-700/50 rounded-lg flex items-center justify-between group cursor-move">
                    <div className="flex items-center gap-4">
                        <Grid size={20} className="text-zinc-500" />
                        <span className="text-white font-medium">Dashboard</span>
                    </div>
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Default</span>
                </div>
                <div className="p-4 bg-zinc-900/50 border border-zinc-700/50 rounded-lg flex items-center justify-between group cursor-move">
                    <div className="flex items-center gap-4">
                        <Menu size={20} className="text-zinc-500" />
                        <span className="text-white font-medium">Products</span>
                    </div>
                    <button className="text-zinc-500 hover:text-white">Edit</button>
                </div>
                <div className="p-4 bg-zinc-900/50 border border-zinc-700/50 rounded-lg flex items-center justify-between group cursor-move">
                    <div className="flex items-center gap-4">
                        <Menu size={20} className="text-zinc-500" />
                        <span className="text-white font-medium">Agents</span>
                    </div>
                    <button className="text-zinc-500 hover:text-white">Edit</button>
                </div>
            </div>

            <p className="text-xs text-zinc-500 mt-6 text-center italic">Drag and drop reordering coming soon...</p>
        </div>
    );
};

export default SettingsMenu;
