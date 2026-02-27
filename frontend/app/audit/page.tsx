"use client"

import { useState, useEffect } from 'react';
import { Activity, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { auditAPI } from '@/lib/api';

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('Staff');

    const fetchLogs = async () => {
        try {
            const data = await auditAPI.getLogs();
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRole(user.role || 'Staff');
        }
        fetchLogs();
    }, []);

    if (role !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 shadow-xl shadow-amber-100/50">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Privileged Access</h2>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">
                        System audit logs are only accessible to administrators. Please contact your system administrator for audit requests.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Compiling System Activity...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Audit Logs</h2>
                    <p className="text-slate-600 font-medium mt-1">Immutable record of critical state changes.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" /> All Time
                    </div>
                </div>

                <div className="space-y-4">
                    {logs.map((log) => (
                        <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] bg-zinc-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{log.action}</p>
                                    <p className="text-xs font-semibold text-slate-500 mt-1">{log.details}</p>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 text-left md:text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">User ID: {log.userId} • IP: {log.ipAddress}</p>
                                <p className="text-xs font-bold text-slate-900 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-center py-12 text-slate-400 font-medium">No system logs available.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
