"use client"

import { Bell, Search, User, ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const [user, setUser] = useState({ name: 'User', role: 'Staff' });
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Searching for:", searchQuery);
        // Simple alert for now, or could navigate to a search results page
        if (searchQuery) alert(`Searching for "${searchQuery}"... (Search feature integration in progress)`);
    };

    return (
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm print:hidden">
            <form onSubmit={handleSearch} className="relative w-96 flex items-center group">
                <Search className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for assets, taxes, reports..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </form>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        ref={notificationRef}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-slate-900">Notifications</h4>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">1 New</span>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                        <Bell className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 leading-tight">System Update</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Real-time data engine is now active for 2024 audits.</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-center text-slate-400 py-2">No more notifications</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>

                <div ref={profileRef} className="relative">
                    <div
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 pl-2 group cursor-pointer hover:bg-slate-50 py-1.5 px-3 rounded-xl transition-all"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-bold text-slate-900 leading-tight">{user.name || 'User'}</p>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mt-1">{user.role || 'Staff'}</p>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all", showProfileMenu && "rotate-180")} />
                    </div>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="p-4 bg-slate-50 border-b border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Details</p>
                                <p className="text-sm font-black text-slate-900 mt-1">{user.name || 'User'}</p>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">{(user as any).email || 'No email provided'}</p>
                            </div>
                            <div className="p-2">
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                                    <UserIcon className="w-4 h-4 text-slate-400" /> Profile View
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                                    <Settings className="w-4 h-4 text-slate-400" /> System Settings
                                </button>
                                <div className="h-[1px] bg-slate-100 my-2"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

