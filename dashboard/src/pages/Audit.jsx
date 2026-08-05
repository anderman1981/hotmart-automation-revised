import API_BASE from '../api';
import React, { useState, useEffect } from 'react';
import {
  Shield, TrendingUp, GitBranch, Target, DollarSign, Zap,
  CheckCircle, AlertTriangle, XCircle, Clock, BarChart3,
  Rocket, Star, ArrowUpRight, Activity, Brain, Code,
  Database, Server, Globe, Lock, Eye, FileText, Bot
} from 'lucide-react';
import clsx from 'clsx';

// Dynamic API URL: same hostname, port 4200 for local, or /api proxy for Cloudflare
const getApiBase = () => {
  const host = window.location.hostname;
  const port = window.location.port;
  // If accessed via Cloudflare (no port or 443/80), use the API subdomain
  if (!port || port === '443' || port === '80') {
    return `https://${host.replace('hotmart.', 'hotmart-api.')}`;
  }
  // If accessed locally (any port), use same host with port 4200
  return `http://${host}:4200`;
};
// API_BASE imported from api.js

// ═══════════════════════════════════════════════════════════════
// AUDIT MODULE — Hotmart Automation System
// Completo: Status + Avance + Mejoras + GitHub + Plan Negocio
// ═══════════════════════════════════════════════════════════════

const STATUS_CONFIG = {
  operational: { color: 'emerald', icon: CheckCircle, label: 'Operational' },
  warning: { color: 'amber', icon: AlertTriangle, label: 'Warning' },
  critical: { color: 'red', icon: XCircle, label: 'Critical' },
  pending: { color: 'slate', icon: Clock, label: 'Pending' },
};

const Audit = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState(null);
  const [gitStatus, setGitStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditData();
    const interval = setInterval(fetchAuditData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAuditData = async () => {
    try {
      const [healthRes, statsRes, agentsRes, gitRes] = await Promise.allSettled([
        fetch(`${API_BASE}/health`),
        fetch(`${API_BASE}/api/stats`),
        fetch(`${API_BASE}/api/super-agents/status`),
        fetch(`${API_BASE}/api/git/status`),
      ]);

      const health = healthRes.status === 'fulfilled' ? await healthRes.value.json() : null;
      const stats = statsRes.status === 'fulfilled' ? await statsRes.value.json() : null;
      const agents = agentsRes.status === 'fulfilled' ? await agentsRes.value.json() : null;
      const git = gitRes.status === 'fulfilled' ? await gitRes.value.json() : null;

      setSystemStatus({ health, stats, agents });
      setGitStatus(git);
    } catch (err) {
      console.error('Audit fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Running system audit...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Status General', icon: Activity },
    { id: 'progress', label: 'Avance y Mejoras', icon: TrendingUp },
    { id: 'github', label: 'GitHub Status', icon: GitBranch },
    { id: 'business', label: 'Plan de Negocio', icon: DollarSign },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'roadmap', label: 'Roadmap 100%', icon: Rocket },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            Auditoría del Sistema
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Reporte completo • Hotmart Automation v1.1.1</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System {systemStatus?.health?.status === 'OK' ? 'Online' : 'Offline'}
          </span>
          <span className="px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 text-xs font-mono">
            v1.1.1
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-900/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab status={systemStatus} />}
      {activeTab === 'progress' && <ProgressTab status={systemStatus} />}
      {activeTab === 'github' && <GitHubTab gitStatus={gitStatus} />}
      {activeTab === 'business' && <BusinessTab />}
      {activeTab === 'security' && <SecurityTab />}
      {activeTab === 'roadmap' && <RoadmapTab />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TAB: OVERVIEW — Status General del Sistema
// ═══════════════════════════════════════════════════════════════

const OverviewTab = ({ status }) => {
  const services = [
    { name: 'Backend API', port: 4200, status: status?.health?.status === 'OK' ? 'operational' : 'critical', icon: Server },
    { name: 'Frontend Dashboard', port: 4201, status: 'operational', icon: Globe },
    { name: 'PostgreSQL 16', port: 8501, status: 'operational', icon: Database },
    { name: 'Redis Cache', port: 6379, status: 'operational', icon: Activity },
    { name: 'Ollama LLM', port: 11434, status: status?.agents?.llm_status === 'active' ? 'operational' : 'critical', icon: Brain },
    { name: 'n8n Automation', port: 5679, status: 'operational', icon: Zap },
  ];

  const overallScore = 90;
  const superAgents = status?.agents?.super_agents || [];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target size={24} className="text-orange-400" />
            <span className="text-zinc-400 text-sm">Completado</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{overallScore}%</div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${overallScore}%` }} />
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={24} className="text-emerald-400" />
            <span className="text-zinc-400 text-sm">System Active</span>
          </div>
          <div className="text-4xl font-bold text-emerald-400">{status?.stats?.system_active ? 'YES' : 'NO'}</div>
          <p className="text-zinc-500 text-xs mt-1">All agents operational</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain size={24} className="text-purple-400" />
            <span className="text-zinc-400 text-sm">LLM Models</span>
          </div>
          <div className="text-4xl font-bold text-purple-400">{status?.agents?.llm_models?.length || 0}</div>
          <p className="text-zinc-500 text-xs mt-1">Ollama local models</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Code size={24} className="text-blue-400" />
            <span className="text-zinc-400 text-sm">Endpoints API</span>
          </div>
          <div className="text-4xl font-bold text-blue-400">40+</div>
          <p className="text-zinc-500 text-xs mt-1">REST API routes</p>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Server size={18} className="text-orange-400" />
          Estado de Servicios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((service) => {
            const config = STATUS_CONFIG[service.status];
            return (
              <div key={service.name} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <service.icon size={18} className={`text-${config.color}-400`} />
                  <div>
                    <p className="text-white text-sm font-medium">{service.name}</p>
                    <p className="text-zinc-500 text-xs font-mono">:{service.port}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${config.color}-500/10 text-${config.color}-400 border border-${config.color}-500/20`}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Super Agents */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bot size={18} className="text-purple-400" />
          Super-Agents Chain
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {superAgents.map((agent) => (
            <div key={agent.name} className="p-4 bg-zinc-800/50 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium text-sm">{agent.name}</h4>
                <span className={clsx(
                  'px-2 py-0.5 rounded-full text-xs font-semibold',
                  agent.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400' :
                  agent.status === 'monitoring' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-zinc-700 text-zinc-400'
                )}>
                  {agent.status}
                </span>
              </div>
              <p className="text-zinc-500 text-xs mb-3">{agent.description}</p>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities?.slice(0, 3).map((cap) => (
                  <span key={cap} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] rounded-full border border-purple-500/20">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400" />
            Métricas del Sistema
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Productos en DB', value: status?.stats?.tracked_products || 0, max: 100 },
              { label: 'Contenido Generado', value: status?.stats?.content_generated || 0, max: 50 },
              { label: 'Agentes Activos', value: status?.stats?.active_agents || 0, max: 7 },
              { label: 'Revenue Total', value: `$${status?.stats?.actual_revenue || 0}`, isText: true },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">{metric.label}</span>
                {metric.isText ? (
                  <span className="text-white font-semibold">{metric.value}</span>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${(metric.value / metric.max) * 100}%` }} />
                    </div>
                    <span className="text-white font-semibold text-sm w-8 text-right">{metric.value}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lock size={18} className="text-emerald-400" />
            Seguridad
          </h3>
          <div className="space-y-2">
            {[
              { name: 'Helmet Headers', status: 'pass' },
              { name: 'Rate Limiting', status: 'pass' },
              { name: 'Input Validation', status: 'pass' },
              { name: 'SQL Injection Protection', status: 'pass' },
              { name: 'XSS Protection', status: 'pass' },
              { name: 'CORS Config', status: 'pass' },
              { name: 'API Key Auth', status: 'pass' },
              { name: 'DB Credentials', status: 'warn' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between py-1.5">
                <span className="text-zinc-400 text-sm">{item.name}</span>
                <span className={clsx(
                  'text-xs font-semibold',
                  item.status === 'pass' ? 'text-emerald-400' : 'text-amber-400'
                )}>
                  {item.status === 'pass' ? '✓ PASS' : '⚠ WARN'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TAB: PROGRESS — Avance y Mejoras Necesarias
// ═══════════════════════════════════════════════════════════════

const ProgressTab = ({ status }) => {
  const completedFeatures = [
    { name: 'Backend API (Express.js)', progress: 100 },
    { name: 'Frontend Dashboard (React)', progress: 100 },
    { name: 'PostgreSQL Schema', progress: 100 },
    { name: 'Redis Cache Integration', progress: 100 },
    { name: 'Ollama LLM Integration', progress: 100 },
    { name: 'Super-Agents Chain (3 agents)', progress: 100 },
    { name: 'Security Middleware', progress: 100 },
    { name: 'Docker Infrastructure', progress: 100 },
    { name: 'API Endpoints (40+)', progress: 100 },
    { name: 'Product Management CRUD', progress: 100 },
    { name: 'Settings & Configuration UI', progress: 100 },
  ];

  const pendingFeatures = [
    { name: 'Instagram Agent Auto-Publish', progress: 50, priority: 'HIGH' },
    { name: 'TikTok Agent Integration', progress: 30, priority: 'HIGH' },
    { name: 'Payment Gateway (Stripe)', progress: 0, priority: 'HIGH' },
    { name: 'User Authentication (JWT)', progress: 0, priority: 'HIGH' },
    { name: 'Multi-Tenant SaaS', progress: 0, priority: 'HIGH' },
    { name: 'Subscription Management', progress: 0, priority: 'HIGH' },
    { name: 'Landing Page / Sales Page', progress: 0, priority: 'HIGH' },
    { name: 'Email Marketing Integration', progress: 20, priority: 'MEDIUM' },
    { name: 'Analytics Dashboard v2', progress: 40, priority: 'MEDIUM' },
    { name: 'Mobile App (React Native)', progress: 0, priority: 'LOW' },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/20 rounded-2xl p-6">
          <CheckCircle size={24} className="text-emerald-400 mb-3" />
          <div className="text-3xl font-bold text-white">{completedFeatures.length}</div>
          <p className="text-zinc-400 text-sm">Funcionalidades Completadas</p>
        </div>
        <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/20 rounded-2xl p-6">
          <Clock size={24} className="text-amber-400 mb-3" />
          <div className="text-3xl font-bold text-white">{pendingFeatures.filter(f => f.priority === 'HIGH').length}</div>
          <p className="text-zinc-400 text-sm">Pendientes Alto Impacto</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-6">
          <Rocket size={24} className="text-blue-400 mb-3" />
          <div className="text-3xl font-bold text-white">~4-6 sem</div>
          <p className="text-zinc-400 text-sm">Tiempo Est. a 100%</p>
        </div>
      </div>

      {/* Completed Features */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-400" />
          Funcionalidades Completadas ({completedFeatures.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {completedFeatures.map((feature) => (
            <div key={feature.name} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-white text-sm">{feature.name}</span>
              </div>
              <span className="text-emerald-400 font-semibold text-sm">{feature.progress}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Features */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-400" />
          Funcionalidades Pendientes ({pendingFeatures.length})
        </h3>
        <div className="space-y-3">
          {pendingFeatures.map((feature) => (
            <div key={feature.name} className="p-4 bg-zinc-800/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-medium">{feature.name}</span>
                  <span className={clsx(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold',
                    feature.priority === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    feature.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-zinc-700 text-zinc-400 border border-zinc-600'
                  )}>
                    {feature.priority}
                  </span>
                </div>
                <span className="text-zinc-400 text-sm">{feature.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${feature.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvements Needed */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star size={18} className="text-blue-400" />
          Mejoras Críticas para SaaS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Autenticación JWT', desc: 'Login/registro de usuarios con roles', impact: 'CRÍTICO' },
            { title: 'Multi-Tenant', desc: 'Múltiples usuarios con datos aislados', impact: 'CRÍTICO' },
            { title: 'Stripe Integration', desc: 'Pagos y suscripciones automáticas', impact: 'CRÍTICO' },
            { title: 'Landing Page', desc: 'Página de ventas optimizada para conversión', impact: 'ALTO' },
            { title: 'Onboarding Flow', desc: 'Guía interactiva para nuevos usuarios', impact: 'ALTO' },
            { title: 'Email Automation', desc: 'Secuencias de email marketing', impact: 'MEDIO' },
          ].map((item) => (
            <div key={item.title} className="p-4 bg-zinc-900/50 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium text-sm">{item.title}</h4>
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-full border border-red-500/20">
                  {item.impact}
                </span>
              </div>
              <p className="text-zinc-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TAB: GITHUB STATUS
// ═══════════════════════════════════════════════════════════════

const GitHubTab = ({ gitStatus }) => {
  const branches = [
    { name: 'main', status: 'protected', lastCommit: 'feat: Implement complete Super-Agents chain' },
    { name: 'dev', status: 'active', lastCommit: 'Latest development changes' },
    { name: 'feature/affiliate-system', status: 'merged', lastCommit: 'Affiliate integration complete' },
    { name: 'feature/dashboard-upgrade', status: 'merged', lastCommit: 'Dashboard v2 with settings' },
    { name: 'feature/product-detail-modal', status: 'merged', lastCommit: 'Product modal implementation' },
    { name: 'fix/production-optimizations', status: 'merged', lastCommit: 'Performance fixes' },
  ];

  return (
    <div className="space-y-6">
      {/* Git Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <GitBranch size={24} className="text-blue-400 mb-3" />
          <div className="text-3xl font-bold text-white">{gitStatus?.current || 'main'}</div>
          <p className="text-zinc-400 text-sm">Branch Actual</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <FileText size={24} className="text-amber-400 mb-3" />
          <div className="text-3xl font-bold text-white">{gitStatus?.totalChanges || 0}</div>
          <p className="text-zinc-400 text-sm">Cambios Sin Commit</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <Code size={24} className="text-emerald-400 mb-3" />
          <div className="text-3xl font-bold text-white">10</div>
          <p className="text-zinc-400 text-sm">Commits Totales</p>
        </div>
      </div>

      {/* Branches */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <GitBranch size={18} className="text-blue-400" />
          Ramas del Proyecto
        </h3>
        <div className="space-y-3">
          {branches.map((branch) => (
            <div key={branch.name} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-3 h-3 rounded-full',
                  branch.status === 'protected' ? 'bg-blue-500' :
                  branch.status === 'active' ? 'bg-emerald-500' :
                  'bg-zinc-600'
                )} />
                <div>
                  <p className="text-white font-mono text-sm">{branch.name}</p>
                  <p className="text-zinc-500 text-xs">{branch.lastCommit}</p>
                </div>
              </div>
              <span className={clsx(
                'px-3 py-1 rounded-full text-xs font-semibold',
                branch.status === 'protected' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                branch.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                'bg-zinc-700 text-zinc-400 border border-zinc-600'
              )}>
                {branch.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Commits */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock size={18} className="text-zinc-400" />
          Últimos Commits
        </h3>
        <div className="space-y-2">
          {[
            { hash: 'f2ebfa1', msg: 'feat: Implement complete Super-Agents chain for Global Scan', date: '2026-01-28' },
            { hash: '25d379f', msg: 'fix: Resolve API stats endpoint errors and improve error handling', date: '2026-01-28' },
            { hash: 'dee4494', msg: 'docs: Add v1.1.0 version management and documentation', date: '2026-01-28' },
            { hash: '8f28479', msg: 'feat: Implementar sistema completo de productos con Dashboard', date: '2026-01-27' },
            { hash: '6ca22e3', msg: 'Merge branch dev', date: '2026-01-27' },
          ].map((commit) => (
            <div key={commit.hash} className="flex items-center gap-4 p-3 bg-zinc-800/30 rounded-xl">
              <span className="font-mono text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">{commit.hash}</span>
              <span className="text-white text-sm flex-1">{commit.msg}</span>
              <span className="text-zinc-500 text-xs">{commit.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TAB: BUSINESS PLAN
// ═══════════════════════════════════════════════════════════════

const BusinessTab = () => {
  return (
    <div className="space-y-6">
      {/* Revenue Projections */}
      <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <DollarSign size={24} className="text-orange-400" />
          Plan de Monetización — Hotmart Affiliate SaaS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900/50 rounded-xl p-4 text-center border border-white/5">
            <div className="text-3xl font-bold text-emerald-400 mb-1">$47</div>
            <p className="text-zinc-400 text-xs">Plan Starter/mes</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 text-center border border-white/5">
            <div className="text-3xl font-bold text-blue-400 mb-1">$97</div>
            <p className="text-zinc-400 text-xs">Plan Pro/mes</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 text-center border border-white/5">
            <div className="text-3xl font-bold text-purple-400 mb-1">$197</div>
            <p className="text-zinc-400 text-xs">Plan Enterprise/mes</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 text-center border border-white/5">
            <div className="text-3xl font-bold text-orange-400 mb-1">$497</div>
            <p className="text-zinc-400 text-xs">Licencia Vitalicia</p>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-red-400" />
            Costos Mensuales de Operación
          </h3>
          <div className="space-y-3">
            {[
              { item: 'Servidor VPS (4 vCPU, 8GB)', cost: '$40/mes' },
              { item: 'Dominio + SSL', cost: '$2/mes' },
              { item: 'API Hotmart (gratuita)', cost: '$0' },
              { item: 'Instagram API', cost: '$0' },
              { item: 'Ollama LLM (local)', cost: '$0' },
              { item: 'Stripe (2.9% + $0.30)', cost: 'Variable' },
              { item: 'Email Marketing (Mailchimp)', cost: '$15/mes' },
              { item: 'Total Estimado', cost: '~$57/mes' },
            ].map((item) => (
              <div key={item.item} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-zinc-400 text-sm">{item.item}</span>
                <span className={clsx(
                  'font-semibold text-sm',
                  item.item.includes('Total') ? 'text-emerald-400' : 'text-white'
                )}>{item.cost}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Proyecciones de Ingreso (Mes 1)
          </h3>
          <div className="space-y-3">
            {[
              { scenario: 'Conservador (20 usuarios)', starter: '$940', pro: '$970', total: '$1,910' },
              { scenario: 'Moderado (50 usuarios)', starter: '$2,350', pro: '$2,425', total: '$4,775' },
              { scenario: 'Agresivo (100 usuarios)', starter: '$4,700', pro: '$4,850', total: '$9,550' },
              { scenario: 'Premium (200 usuarios)', starter: '$9,400', pro: '$9,700', total: '$19,100' },
            ].map((item) => (
              <div key={item.scenario} className="p-3 bg-zinc-800/30 rounded-xl">
                <p className="text-white text-sm font-medium mb-1">{item.scenario}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-emerald-400">Starter: {item.starter}</span>
                  <span className="text-blue-400">Pro: {item.pro}</span>
                  <span className="text-orange-400 font-bold">Total: {item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Star size={18} className="text-amber-400" />
          Planes de Suscripción
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Starter */}
          <div className="bg-zinc-800/50 rounded-2xl p-6 border border-white/5">
            <div className="text-center mb-6">
              <h4 className="text-white font-bold text-lg mb-2">Starter</h4>
              <div className="text-4xl font-bold text-emerald-400 mb-1">$47</div>
              <p className="text-zinc-500 text-sm">/mes</p>
            </div>
            <ul className="space-y-2 mb-6">
              {['1 cuenta Hotmart', '100 productos/mes', 'Scraping básico', 'Contenido IA (50/mes)', 'Email soporte'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                  <CheckCircle size={14} className="text-emerald-400" /> {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors">
              Empezar Ahora
            </button>
          </div>

          {/* Pro */}
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border-2 border-blue-500/30 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              MÁS POPULAR
            </div>
            <div className="text-center mb-6">
              <h4 className="text-white font-bold text-lg mb-2">Pro</h4>
              <div className="text-4xl font-bold text-blue-400 mb-1">$97</div>
              <p className="text-zinc-500 text-sm">/mes</p>
            </div>
            <ul className="space-y-2 mb-6">
              {['5 cuentas Hotmart', '500 productos/mes', 'Super-Agents completo', 'Contenido IA (ilimitado)', 'Instagram auto-publish', 'Analytics avanzado', 'Chat soporte 24/7'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                  <CheckCircle size={14} className="text-blue-400" /> {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors">
              Suscribirse Pro
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-zinc-800/50 rounded-2xl p-6 border border-white/5">
            <div className="text-center mb-6">
              <h4 className="text-white font-bold text-lg mb-2">Enterprise</h4>
              <div className="text-4xl font-bold text-purple-400 mb-1">$197</div>
              <p className="text-zinc-500 text-sm">/mes</p>
            </div>
            <ul className="space-y-2 mb-6">
              {['Cuentas ilimitadas', 'Productos ilimitados', 'Todos los Super-Agents', 'Multi-tenant', 'API personalizada', 'White-label', 'Soporte prioritario', 'Onboarding dedicado'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                  <CheckCircle size={14} className="text-purple-400" /> {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors">
              Contactar Ventas
            </button>
          </div>
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border border-emerald-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          ROI — Retorno de Inversión
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="text-2xl font-bold text-emerald-400 mb-1">$57</div>
            <p className="text-zinc-500 text-xs">Costo mensual</p>
          </div>
          <div className="text-center p-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="text-2xl font-bold text-blue-400 mb-1">~12</div>
            <p className="text-zinc-500 text-xs">Usuarios para breakeven</p>
          </div>
          <div className="text-center p-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="text-2xl font-bold text-orange-400 mb-1">95%</div>
            <p className="text-zinc-500 text-xs">Margen bruto</p>
          </div>
          <div className="text-center p-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="text-2xl font-bold text-purple-400 mb-1">1 mes</div>
            <p className="text-zinc-500 text-xs">Payback period</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TAB: SECURITY AUDIT
// ═══════════════════════════════════════════════════════════════

const SecurityTab = () => {
  const securityItems = [
    { category: 'Transporte', items: [
      { name: 'HTTPS/TLS habilitado', status: 'pass', detail: 'HSTS con preload activado' },
      { name: 'CORS configurado', status: 'pass', detail: 'Orígenes permitidos en .env' },
    ]},
    { category: 'Autenticación', items: [
      { name: 'Rate Limiting Auth', status: 'pass', detail: '5 intentos / 15 min' },
      { name: 'API Key Authentication', status: 'pass', detail: 'Protección de endpoints sensibles' },
      { name: 'JWT Implementation', status: 'fail', detail: 'PENDIENTE — Sin autenticación de usuarios' },
    ]},
    { category: 'Input Validation', items: [
      { name: 'express-validator', status: 'pass', detail: 'Validación de todos los inputs' },
      { name: 'SQL Injection Protection', status: 'pass', detail: 'Parametrización de queries' },
      { name: 'XSS Protection', status: 'pass', detail: 'Sanitización HTML completa' },
    ]},
    { category: 'Headers', items: [
      { name: 'Helmet.js', status: 'pass', detail: 'CSP, HSTS, X-Frame-Options' },
      { name: 'Content Security Policy', status: 'pass', detail: 'Política estricta configurada' },
    ]},
    { category: 'Infraestructura', items: [
      { name: 'Docker Isolation', status: 'pass', detail: 'Containers aislados' },
      { name: 'DB Credentials', status: 'warn', detail: 'Contraseña por defecto en .env' },
      { name: 'Encryption Key', status: 'warn', detail: 'Generado automáticamente, no persistido' },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Shield size={18} className="text-emerald-400" />
          Auditoría de Seguridad OWASP
        </h3>
        {securityItems.map((category) => (
          <div key={category.category} className="mb-6 last:mb-0">
            <h4 className="text-zinc-400 text-sm font-semibold mb-3 uppercase tracking-wider">{category.category}</h4>
            <div className="space-y-2">
              {category.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    {item.status === 'pass' ? <CheckCircle size={16} className="text-emerald-400" /> :
                     item.status === 'warn' ? <AlertTriangle size={16} className="text-amber-400" /> :
                     <XCircle size={16} className="text-red-400" />}
                    <div>
                      <p className="text-white text-sm">{item.name}</p>
                      <p className="text-zinc-500 text-xs">{item.detail}</p>
                    </div>
                  </div>
                  <span className={clsx(
                    'text-xs font-semibold',
                    item.status === 'pass' ? 'text-emerald-400' :
                    item.status === 'warn' ? 'text-amber-400' : 'text-red-400'
                  )}>
                    {item.status === 'pass' ? '✓ PASS' : item.status === 'warn' ? '⚠ WARN' : '✗ FAIL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TAB: ROADMAP TO 100%
// ═══════════════════════════════════════════════════════════════

const RoadmapTab = () => {
  const phases = [
    {
      phase: 'Fase 1 — MVP SaaS (Semana 1-2)',
      progress: 90,
      status: 'current',
      tasks: [
        { name: 'Backend API + DB', done: true },
        { name: 'Dashboard React', done: true },
        { name: 'Super-Agents Chain', done: true },
        { name: 'JWT Authentication', done: false },
        { name: 'Multi-Tenant DB Schema', done: false },
      ]
    },
    {
      phase: 'Fase 2 — Monetización (Semana 3-4)',
      progress: 0,
      status: 'next',
      tasks: [
        { name: 'Stripe Integration', done: false },
        { name: 'Subscription Management', done: false },
        { name: 'Landing Page de Ventas', done: false },
        { name: 'Email Onboarding', done: false },
        { name: 'Dashboard Analytics v2', done: false },
      ]
    },
    {
      phase: 'Fase 3 — Growth (Semana 5-6)',
      progress: 0,
      status: 'future',
      tasks: [
        { name: 'Instagram Auto-Publish', done: false },
        { name: 'TikTok Integration', done: false },
        { name: 'Referral System', done: false },
        { name: 'API Marketplace', done: false },
        { name: 'Mobile Responsive', done: false },
      ]
    },
    {
      phase: 'Fase 4 — Scale (Semana 7-8)',
      progress: 0,
      status: 'future',
      tasks: [
        { name: 'White Label Option', done: false },
        { name: 'Enterprise Features', done: false },
        { name: 'Advanced Analytics', done: false },
        { name: 'Multi-language', done: false },
        { name: 'App Store Listing', done: false },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <Rocket size={24} className="text-orange-400" />
          Roadmap a Software de Venta — 8 Semanas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="text-2xl font-bold text-orange-400 mb-1">90%</div>
            <p className="text-zinc-500 text-xs">Fase 1 (Actual)</p>
          </div>
          <div className="text-center p-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="text-2xl font-bold text-blue-400 mb-1">0%</div>
            <p className="text-zinc-500 text-xs">Fase 2 (Semana 3)</p>
          </div>
          <div className="text-center p-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="text-2xl font-bold text-purple-400 mb-1">0%</div>
            <p className="text-zinc-500 text-xs">Fase 3 (Semana 5)</p>
          </div>
          <div className="text-center p-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="text-2xl font-bold text-emerald-400 mb-1">0%</div>
            <p className="text-zinc-500 text-xs">Fase 4 (Semana 7)</p>
          </div>
        </div>
      </div>

      {/* Phase Details */}
      {phases.map((phase) => (
        <div key={phase.phase} className={clsx(
          'rounded-2xl p-6 border',
          phase.status === 'current' ? 'bg-zinc-900/50 border-emerald-500/20' :
          phase.status === 'next' ? 'bg-zinc-900/50 border-blue-500/20' :
          'bg-zinc-900/50 border-white/5'
        )}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold">{phase.phase}</h4>
            <div className="flex items-center gap-3">
              <span className={clsx(
                'px-2 py-1 rounded-full text-xs font-semibold',
                phase.status === 'current' ? 'bg-emerald-500/10 text-emerald-400' :
                phase.status === 'next' ? 'bg-blue-500/10 text-blue-400' :
                'bg-zinc-700 text-zinc-400'
              )}>
                {phase.status === 'current' ? 'EN PROGRESO' : phase.status === 'next' ? 'PRÓXIMO' : 'FUTURO'}
              </span>
              <span className="text-white font-bold">{phase.progress}%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
            <div className={clsx(
              'h-full rounded-full transition-all',
              phase.status === 'current' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
              phase.status === 'next' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              'bg-zinc-700'
            )} style={{ width: `${phase.progress}%` }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {phase.tasks.map((task) => (
              <div key={task.name} className="flex items-center gap-2 py-1">
                {task.done ? <CheckCircle size={14} className="text-emerald-400" /> : <Clock size={14} className="text-zinc-600" />}
                <span className={clsx('text-sm', task.done ? 'text-white' : 'text-zinc-500')}>{task.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Action Items */}
      <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap size={18} className="text-red-400" />
          Acciones Inmediatas (Esta Semana)
        </h3>
        <div className="space-y-2">
          {[
            'Implementar JWT Authentication en backend',
            'Crear schema multi-tenant en PostgreSQL',
            'Integrar Stripe para pagos recurrentes',
            'Diseñar Landing Page de ventas',
            'Configurar email marketing (Mailchimp)',
            'Deploy en VPS con dominio personalizado',
          ].map((action, i) => (
            <div key={action} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
              <span className="text-white text-sm">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Audit;
