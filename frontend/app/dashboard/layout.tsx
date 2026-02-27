"use client"

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useEffect } from 'react';
import signalrService from '@/lib/signalrService';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        signalrService.startConnection();
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50 print:p-0 print:bg-white">
                    <div className="max-w-[1400px] mx-auto print:max-w-none print:w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
