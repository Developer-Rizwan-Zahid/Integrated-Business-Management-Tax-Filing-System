"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Wallet,
    Briefcase,
    FileText,
    Settings,
    LogOut,
    ChevronRight,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Assets', icon: Briefcase, href: '/assets' },
    { name: 'Finance', icon: Wallet, href: '/finance' },
    { name: 'Tax Calculation', icon: FileText, href: '/tax' },
    { name: 'Reports', icon: FileText, href: '/reports' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState('Staff');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRole(user.role || 'Staff');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/auth/login');
    };

    return (
        <div className="flex flex-col h-screen w-64 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 shadow-lg print:hidden">
            <div className="p-6 border-b border-slate-200">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white text-xs font-black">BT</span>
                    </div>
                    <span className="truncate bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">TaxSystem</span>
                </h1>
            </div>

            <nav className="flex-1 mt-4 px-4 space-y-2">
                {menuItems
                    .filter(item => {
                        if (role === 'Staff') {
                            return item.name !== 'Tax Calculation' && item.name !== 'Reports';
                        }
                        return true;
                    })
                    .concat(role === 'Admin' ? [{ name: 'Audit Logs', icon: Activity, href: '/audit' }] : [])
                    .map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-semibold",
                                pathname === item.href
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5",
                                pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            <span>{item.name}</span>
                            {pathname === item.href && (
                                <ChevronRight className="ml-auto w-4 h-4 text-white/80" />
                            )}
                        </Link>
                    ))}
            </nav>

            <div className="p-4 border-t border-slate-200 space-y-2 bg-slate-50/50">
                {role === 'Admin' && (
                    <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
