import React, { useState } from 'react';
import { Bot, Menu, Database, Shield, LayoutGrid } from 'lucide-react';
import SettingsAgents from './settings/SettingsAgents';
import SettingsMenu from './settings/SettingsMenu';
import SettingsData from './settings/SettingsData';

function Config() {
    const [activeTab, setActiveTab] = useState('agents');

    const renderContent = () => {
        switch (activeTab) {
            case 'agents': return <SettingsAgents />;
            case 'menu': return <SettingsMenu />;
            case 'data': return <SettingsData />;
            default: return <SettingsAgents />;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                System Configuration
            </h1>

            <div className="flex gap-8">
                {/* Settings Sidebar */}
                <div className="w-64 shrink-0 space-y-2">
                    <button
                        onClick={() => setActiveTab('agents')}
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'agents' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Bot size={18} /> <span className="font-medium">Agents</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'menu' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <LayoutGrid size={18} /> <span className="font-medium">Menu Customization</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'data' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Database size={18} /> <span className="font-medium">Data Sources</span>
                    </button>
                    <div className="h-px bg-white/5 my-4 mx-2"></div>
                    <div className="px-4 py-2">
                        <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold mb-2">Advanced</p>
                        <p className="text-xs text-zinc-500">Security & API Keys</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-[600px] animate-fade-in">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default Config;
