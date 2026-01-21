import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex font-sans selection:bg-orange-500/30">
            <Toaster position="top-right" theme="dark" />
            <Sidebar />
            <main className="flex-1 ml-72 p-8 lg:p-12 overflow-x-hidden min-h-screen relative z-0">
                <div className="max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
