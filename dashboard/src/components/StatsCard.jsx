import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, trendLabel, trendSuffix = '%', color = "blue", delay = 0 }) => {
    return (
        <div
            className="card-glass p-6 relative overflow-hidden group hover:border-white/20 animate-slide-up"
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
        >
            <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 rounded-full bg-white/10">
                {Icon && <Icon size={120} />}
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-zinc-400 text-sm font-medium">{title}</h3>
                    {Icon && <div className="p-2 rounded-lg bg-white/5 text-zinc-400"><Icon size={20} /></div>}
                </div>

                <p className="text-3xl font-display font-bold text-white tracking-tight">{value}</p>

                {trend !== undefined && (
                    <div className={clsx(
                        "flex items-center gap-1 mt-3 text-xs font-medium px-2 py-1 rounded-full w-fit backdrop-blur-md",
                        trend > 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                    )}>
                        {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{Math.abs(trend)}{trendSuffix}</span>
                        <span className="opacity-60 ml-1">{trendLabel || 'vs last week'}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
