import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Bot, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Package, label: 'Products', path: '/productos' }, // Fixed path
        { icon: Bot, label: 'Agents', path: '/agentes' }, // Fixed path
    ];

    return (
        <aside className="w-72 bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 h-screen flex flex-col p-6 fixed top-0 left-0 z-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-10 px-2 mt-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
                    <span className="text-white font-bold text-xl font-display">H</span>
                </div>
                <div>
                    <h1 className="text-xl font-display font-bold text-white tracking-tight">Hotmart</h1>
                    <p className="text-xs text-zinc-500 font-medium">Automation Agent</p>
                </div>
            </div>

            <nav className="space-y-2 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            'nav-item group',
                            isActive && 'active'
                        )}
                    >
                        <item.icon size={20} className="group-hover:scale-110 transition-transform duration-200" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="pt-6 border-t border-white/5 space-y-2">
                <NavLink
                    to="/config"
                    className={({ isActive }) => clsx(
                        'nav-item w-full text-left group hover:bg-zinc-800/50',
                        isActive && 'active'
                    )}
                >
                    <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                    <span>Settings</span>
                </NavLink>

                {/* System Info Card */}
                <div className="px-4 py-3 bg-zinc-950/40 rounded-xl mt-4 border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold">
                            v1.1
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-300">System Active</p>
                            <p className="text-[10px] text-zinc-500 font-mono">Branch: <span className="text-emerald-400">dev</span></p>
                        </div>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
