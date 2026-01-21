import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import { toast } from 'sonner';
import {
    DollarSign, Package, FileText, Users, Activity,
    ArrowUpRight, MonitorPlay, Zap, RefreshCw, Server, BookOpen, Power
} from 'lucide-react';
// ... existing imports ...

// ... inside component ...

const handleSystemToggle = async () => {
    const action = systemOn ? 'stopping' : 'starting';
    const toastId = toast.loading(`System ${action}...`);

    try {
        const endpoint = systemOn ? '/api/system/stop' : '/api/system/start';
        const res = await fetch(import.meta.env.VITE_API_URL + endpoint, { method: 'POST' });
        const data = await res.json();

        if (data.status === 'success') {
            setSystemOn(!systemOn);
            toast.success(data.msg || `System ${systemOn ? 'Stopped' : 'Started'}`, { id: toastId });
        } else {
            toast.error('Operation failed', { id: toastId });
        }
    } catch (e) {
        toast.error('Error toggling system: ' + e.message, { id: toastId });
    }
};

const handleGlobalScan = async () => {
    setLoadingScan(true);
    toast.info('Initiating Global Scan...');
    try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/agents/detector/start', { method: 'POST' });
        const data = await res.json();
        toast.success(data.msg);
    } catch (error) {
        toast.error('Error starting scan: ' + error.message);
    } finally {
        setLoadingScan(false);
    }
};
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data for Charts
const data = [
    { name: 'Lun', sales: 400, visits: 240 },
    { name: 'Mar', sales: 300, visits: 139 },
    { name: 'Mie', sales: 200, visits: 980 },
    { name: 'Jue', sales: 278, visits: 390 },
    { name: 'Vie', sales: 189, visits: 480 },
    { name: 'Sab', sales: 239, visits: 380 },
    { name: 'Dom', sales: 349, visits: 430 },
];

const activityData = [
    { hour: '00', active: 12 }, { hour: '04', active: 5 },
    { hour: '08', active: 45 }, { hour: '12', active: 89 },
    { hour: '16', active: 120 }, { hour: '20', active: 80 },
];

const logs = [
    { id: 1, type: 'success', msg: 'Detector Agent encontró 3 productos nuevos', time: '2 min ago' },
    { id: 2, type: 'info', msg: 'Analizando tendencias de nicho: "Pets"', time: '15 min ago' },
    { id: 3, type: 'warning', msg: 'Proxy rotation initiated (Anti-ban)', time: '42 min ago' },
    { id: 4, type: 'success', msg: 'Publicación programada en TikTok', time: '1h ago' },
];

const Dashboard = () => {
    const [status, setStatus] = useState('Checking...');
    const [ping, setPing] = useState(0);
    const [stats, setStats] = useState({ products: 0, sales: 0, content_generated: 0, active_agents: 0 });
    const [learningStats, setLearningStats] = useState({ logs: [], mastery: 0, total_topics: 0 });
    const [loadingScan, setLoadingScan] = useState(false);
    const [systemOn, setSystemOn] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/stats');
            const data = await res.json();
            setStats(data);
            if (data.system_active !== undefined) setSystemOn(data.system_active);

            // Learning Logs
            const resLogs = await fetch(import.meta.env.VITE_API_URL + '/api/agents/learning/logs');
            const dataLogs = await resLogs.json();
            setLearningStats(dataLogs);
        } catch (e) {
            console.error('Stats load failed', e);
        }
    };

    useEffect(() => {
        const start = Date.now();
        fetch(import.meta.env.VITE_API_URL + '/health')
            .then(res => res.json())
            .then(() => {
                setStatus('ONLINE');
                setPing(Date.now() - start);
            })
            .catch(() => setStatus('OFFLINE'));

        fetchData(); // Initial load
        const interval = setInterval(() => {
            setPing(Math.floor(Math.random() * 40) + 10);
            fetchData(); // Poll stats
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSystemToggle = async () => {
        try {
            const endpoint = systemOn ? '/api/system/stop' : '/api/system/start';
            const res = await fetch(import.meta.env.VITE_API_URL + endpoint, { method: 'POST' });
            const data = await res.json();
            if (data.status === 'success') {
                setSystemOn(!systemOn);
            }
        } catch (e) {
            alert('Error toggling system: ' + e.message);
        }
    };

    const handleGlobalScan = async () => {
        setLoadingScan(true);
        try {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/agents/detector/start', { method: 'POST' });
            const data = await res.json();
            alert(`✅ ${data.msg}`);
        } catch (error) {
            alert('❌ Error starting scan: ' + error.message);
        } finally {
            setLoadingScan(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white tracking-tighter mb-1">
                        Command Center
                    </h1>
                    <div className="flex items-center gap-3 text-sm">
                        <span className={`px-2 py-0.5 rounded border ${status === 'ONLINE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                            } font-mono font-bold flex items-center gap-2`}>
                            {status === 'ONLINE' && <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>}
                            {status}
                        </span>
                        <span className="text-zinc-500 font-mono flex items-center gap-1">
                            <Server size={14} /> {ping}ms latency
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSystemToggle}
                        className={`px-6 py-3 rounded-xl font-bold font-display shadow-lg flex items-center gap-2 transition-all ${systemOn
                            ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/40'
                            }`}
                    >
                        <Power size={20} />
                        {systemOn ? 'Stop System' : 'Start System'}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGlobalScan}
                        disabled={loadingScan || !systemOn}
                        className={`px-6 py-3 rounded-xl font-bold font-display shadow-lg flex items-center gap-2 transition-all ${loadingScan || !systemOn
                            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                            : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/40'
                            }`}
                    >
                        <Zap size={20} className={loadingScan ? 'animate-pulse' : 'fill-white'} />
                        {loadingScan ? 'Scanning...' : 'Trigger Global Scan'}
                    </motion.button>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Ganancia Estimada" value={`$${(stats.sales || 0).toLocaleString()}`} icon={DollarSign} trend={12} color="orange" delay={0} />
                <StatsCard title="Productos Rastreados" value={stats.products || 0} icon={Package} trend={5} color="blue" delay={100} />
                <StatsCard title="Contenido Generado" value={stats.content_generated || 0} icon={FileText} trend={24} color="purple" delay={200} />
                <StatsCard title="Agentes Trabajando" value={`${stats.active_agents || 0} / 7`} icon={Users} color="emerald" delay={300} />
            </div>

            {/* Main Visuals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[450px]">

                {/* Learning Center Section */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-6 shadow-xl"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <BookOpen className="text-blue-400" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Centro de Aprendizaje</h2>
                                    <p className="text-zinc-400 text-xs">Learning Agent Knowledge Base</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-blue-400">{learningStats.mastery}%</span>
                                <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Maestría</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-6 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-600 to-cyan-400 h-1.5 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${learningStats.mastery}%` }}
                            ></div>
                        </div>

                        {/* Recent Logs Feed */}
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Actividad Reciente</h3>
                            {(!learningStats.logs || learningStats.logs.length === 0) ? (
                                <p className="text-zinc-600 text-sm italic">Esperando primera sesión de aprendizaje...</p>
                            ) : (
                                learningStats.logs.map((log) => (
                                    <div key={log.id} className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/30 flex justify-between items-center hover:bg-zinc-800/50 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-blue-300 font-bold text-xs bg-blue-500/10 px-1.5 py-0.5 rounded">
                                                    {log.payload?.topic || 'N/A'}
                                                </span>
                                                <span className="text-zinc-500 text-[10px]">
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 text-zinc-400 text-[10px]">
                                                {log.payload?.top_results && log.payload.top_results.slice(0, 2).map((item, idx) => (
                                                    <span key={idx} className="truncate max-w-[150px]">• {item.title}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-zinc-500 text-[10px] bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">
                                                +{log.payload?.count || 0} arts
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Main Chart */}
                    <div className="lg:col-span-2 card-glass p-6 flex flex-col min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Activity size={18} className="text-orange-500" /> Rendimiento de Ventas
                                </h3>
                                <p className="text-sm text-zinc-500">Revenue stream vs traffic analysis</p>
                            </div>
                            <select className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm rounded-lg px-3 py-1 outline-none focus:border-orange-500/50">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>

                        <div className="flex-1 w-full h-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F04E23" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#F04E23" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="name" stroke="#666" tick={{ fill: '#666' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis stroke="#666" tick={{ fill: '#666' }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(v) => `$${v}`} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#333', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#F04E23" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                    <Area type="monotone" dataKey="visits" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity Feed & Mini Stats */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Activity Heatmap substitute (Bar) */}
                    <div className="card-glass p-6 flex-1">
                        <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <MonitorPlay size={16} /> Agent Activity Hours
                        </h3>
                        <div className="h-40 w-full mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData}>
                                    <Bar dataKey="active" radius={[4, 4, 0, 0]}>
                                        {activityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#F04E23' : '#3f3f46'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-white/5 pt-4">
                            <span>Efficiency Rate</span>
                            <span className="text-emerald-400 font-bold">+24%</span>
                        </div>
                    </div>

                    {/* Live Logs */}
                    <div className="card-glass p-0 overflow-hidden flex-1 flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <RefreshCw size={14} className="animate-spin-slow" /> System Logs
                            </h3>
                            <button className="text-xs text-orange-500 hover:text-orange-400">View All</button>
                        </div>
                        <div className="p-4 space-y-4 overflow-y-auto max-h-[300px] scrollbar-hide">
                            <AnimatePresence>
                                {logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex gap-3 items-start group"
                                    >
                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                            log.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                'bg-blue-500'
                                            }`} />
                                        <div>
                                            <p className="text-sm text-zinc-300 group-hover:text-white transition-colors leading-tight">
                                                {log.msg}
                                            </p>
                                            <p className="text-[10px] text-zinc-600 mt-1 font-mono">{log.time}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
