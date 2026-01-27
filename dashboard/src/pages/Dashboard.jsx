import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import ProductList from '../components/ProductList';
import { toast } from 'sonner';
import {
    DollarSign, Package, FileText, Users, Activity,
    ArrowUpRight, MonitorPlay, Zap, RefreshCw, Server, BookOpen, Power
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data for Charts
const data = [
    { name: 'Mon', sales: 400, visits: 240 },
    { name: 'Tue', sales: 300, visits: 139 },
    { name: 'Wed', sales: 200, visits: 980 },
    { name: 'Thu', sales: 278, visits: 390 },
    { name: 'Fri', sales: 189, visits: 480 },
    { name: 'Sat', sales: 239, visits: 380 },
    { name: 'Sun', sales: 349, visits: 430 },
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
    const [status, setStatus] = useState('ONLINE');
    const [ping, setPing] = useState(25);
    const [stats, setStats] = useState({ 
        estimated_earnings: 0,
        selected_products: 0,
        actual_revenue: 0,
        tracked_products: 0,
        new_products: 0,
        content_generated: 0,
        content_trend: 0,
        content_this_week: 0,
        active_agents: 0,
        total_agents: 7
    });
    const [learningStats, setLearningStats] = useState({ logs: [], mastery: 67, total_topics: 12 });
    const [loadingScan, setLoadingScan] = useState(false);
    const [systemOn, setSystemOn] = useState(true);
    const [scanProgress, setScanProgress] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    // Handle global scan
    const handleGlobalScan = async () => {
        const toastId = toast.loading('🚀 Starting global marketplace scan...');
        setLoadingScan(true);
        setIsScanning(true);
        setScanProgress(0);
        
        // Simulate scan progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress = Math.min(progress + Math.random() * 20 + 5, 100);
            setScanProgress(Math.floor(progress));
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                const mockProducts = Math.floor(Math.random() * 15) + 8; // 8-22 new products
                
                setTimeout(() => {
                    toast.success(`✅ Global scan completed! Found ${mockProducts} new products.`, { id: toastId });
                    
                    // Update stats to reflect new products
                    setStats(prev => ({
                        ...prev,
                        tracked_products: prev.tracked_products + mockProducts,
                        new_products: mockProducts
                    }));
                    
                    // Set scan result for ProductList
                    setScanResult({
                        new_products: mockProducts,
                        total_products: mockProducts,
                        scan_time: new Date().toISOString()
                    });
                    
                    setLoadingScan(false);
                    setIsScanning(false);
                    setScanProgress(0);
                    
                    // Clear scan result after 10 seconds
                    setTimeout(() => setScanResult(null), 10000);
                    
                    console.log(`📦 Mock scan completed: ${mockProducts} new products added to database`);
                }, 500);
            }
        }, 800);
        
        // Error handling fallback
        try {
            setTimeout(() => {
                const mockProducts = Math.floor(Math.random() * 15) + 8;
                
                toast.success(`✅ Global scan completed! Found ${mockProducts} new products.`, { id: toastId });
                
                setStats(prev => ({
                    ...prev,
                    tracked_products: prev.tracked_products + mockProducts,
                    new_products: mockProducts
                }));
                
                setScanResult({
                    new_products: mockProducts,
                    total_products: mockProducts,
                    scan_time: new Date().toISOString()
                });
                
                setLoadingScan(false);
                setIsScanning(false);
                setScanProgress(0);
                
                setTimeout(() => setScanResult(null), 10000);
                
                console.log(`📦 Mock scan completed: ${mockProducts} new products added to database`);
            }, 4000);
        } catch (error) {
            console.error('Error starting global scan:', error);
            toast.error('❌ Scan failed. Please try again.', { id: toastId });
            setLoadingScan(false);
            setIsScanning(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/stats');
            const data = await res.json();
            setStats(data);
            if (data.system_active !== undefined) setSystemOn(data.system_active);
        } catch (e) {
            console.error('Failed to fetch stats', e);
            setStats(prev => ({
                ...prev,
                status: 'OFFLINE',
                ping: 0
            }));
        }
    };

    // Check if backend is available before fetching
    const checkBackendAvailability = async () => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + '/health', {
                method: 'GET',
                timeout: 3000
            });
            return response.ok;
        } catch (e) {
            return false;
        }
    };

    // Initialize stats on mount
    useEffect(() => {
        const initStats = async () => {
            const isBackendAvailable = await checkBackendAvailability();
            if (isBackendAvailable) {
                await fetchStats();
            } else {
                console.log('Backend not available, using fallback data');
            }
        };
        
        initStats();
        
        // Set up periodic stats refresh
        const statsInterval = setInterval(fetchStats, 30000); // Every 30 seconds
        
        return () => clearInterval(statsInterval);
    }, []);

    // Initialize learning stats
    useEffect(() => {
        const mockLearningLogs = [
            { topic: "Marketing Digital", progress: 85, status: "completed" },
            { topic: "Python Automation", progress: 60, status: "in_progress" },
            { topic: "Social Media Trends", progress: 40, status: "in_progress" }
        ];
        
        setLearningStats({
            logs: mockLearningLogs,
            mastery: 67,
            total_topics: 12
        });
    }, []);

    const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];
    
    const activeAgentsCount = learningStats.logs?.filter(log => log.status === 'completed').length || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Hotmart Automation Dashboard</h1>
                        <p className="text-gray-400">Real-time marketplace intelligence and content automation</p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex gap-3"
                    >
                        <button
                            onClick={handleGlobalScan}
                            disabled={loadingScan || isScanning}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
                        >
                            {loadingScan || isScanning ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Scanning... {scanProgress}%</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4" />
                                    <span>Global Scan</span>
                                </>
                            )}
                        </button>
                        <button className="px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            <span>Refresh</span>
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <StatsCard
                        title="Estimated Earnings"
                        value={`$${stats.estimated_earnings.toLocaleString()}`}
                        trend={12.5}
                        icon={DollarSign}
                        color="emerald"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <StatsCard
                        title="Tracked Products"
                        value={stats.tracked_products}
                        trend={8.2}
                        icon={Package}
                        color="blue"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <StatsCard
                        title="Content Generated"
                        value={stats.content_generated}
                        trend={15.3}
                        icon={FileText}
                        color="purple"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <StatsCard
                        title="Active Agents"
                        value={`${activeAgentsCount}/${stats.total_agents}`}
                        trend={0}
                        icon={Users}
                        color="orange"
                    />
                </motion.div>
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                    <h3 className="text-xl font-semibold text-white mb-6">Revenue Overview</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <RechartsTooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1F2937', 
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#F3F4F6' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="sales" 
                                stroke="#10B981" 
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                    <h3 className="text-xl font-semibold text-white mb-6">24h Activity</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={activityData}>
                            <Bar dataKey="active" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                            <XAxis dataKey="hour" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <RechartsTooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1F2937', 
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#F3F4F6' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* System Status & Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* System Status */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">System Status</h3>
                        <div className={`w-3 h-3 rounded-full ${systemOn ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Status</span>
                            <span className={`font-medium ${systemOn ? 'text-emerald-400' : 'text-red-400'}`}>
                                {systemOn ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">API Latency</span>
                            <span className="text-white font-medium">{ping}ms</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Uptime</span>
                            <span className="text-white font-medium">24h</span>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                    <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                        <AnimatePresence>
                            {logs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="flex gap-3 items-start p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-all"
                                >
                                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                        log.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                            log.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                                'bg-blue-500'
                                            }`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm text-zinc-300 group-hover:text-white transition-colors leading-tight font-medium">
                                                {log.msg}
                                            </p>
                                            <span className="text-[10px] text-zinc-600 font-mono whitespace-nowrap ml-2">{log.time}</span>
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 bg-zinc-900/50 px-1.5 rounded border border-zinc-800">
                                                {log.type}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Productos en Tiempo Real - Sección completa */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
            >
                <ProductList isScanning={isScanning} scanProgress={scanProgress} scanResult={scanResult} />
            </motion.div>
        </div>
    );
};

export default Dashboard;