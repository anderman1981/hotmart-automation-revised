import React from 'react';
import { Database, Link, Upload, Globe } from 'lucide-react';

const SettingsData = () => {
    return (
        <div className="space-y-6">
             <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Global Data Sources</h2>
                        <p className="text-zinc-400 text-sm">Manage external knowledge sources for the Learning Agent.</p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 text-sm font-bold">
                        <Link size={16} /> Connect Source
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Globe size={20} /></div>
                            <h3 className="font-bold text-white">Hotmart Academy</h3>
                        </div>
                        <p className="text-xs text-zinc-500 mb-3">Auto-scraping enabled. Accessing public tutorials and documentation.</p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Database size={20} /></div>
                            <h3 className="font-bold text-white">Product Metrics</h3>
                        </div>
                        <p className="text-xs text-zinc-500 mb-3">Internal sales and click data from Bayesian engine.</p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Synced 2m ago
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsData;
