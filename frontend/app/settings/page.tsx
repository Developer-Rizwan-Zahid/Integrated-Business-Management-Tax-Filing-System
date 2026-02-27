"use client"

import { useState, useEffect } from 'react';
import {
    Settings,
    Save,
    DatabaseBackup,
    UploadCloud,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { settingsAPI } from '@/lib/api';

export default function SettingsPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await settingsAPI.getSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSetting = (key: string, value: string) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // In a real scenario, you might send all settings or just explicitly modified ones
            for (const setting of settings) {
                await settingsAPI.updateSetting(setting.key, setting.value);
            }
            setToastMessage("Settings updated successfully.");
            setTimeout(() => setToastMessage(''), 3000);
        } catch (error) {
            console.error("Failed to save settings", error);
            setToastMessage("Failed to save settings.");
            setTimeout(() => setToastMessage(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleBackup = async () => {
        try {
            const blob = await settingsAPI.backupDatabase();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            setToastMessage("Database backup generated successfully.");
            setTimeout(() => setToastMessage(''), 3000);
        } catch (error) {
            console.error("Failed to backup database", error);
        }
    };

    const handleRestore = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            await settingsAPI.restoreDatabase(file);
            setToastMessage("Database restore simulated successfully.");
            setTimeout(() => setToastMessage(''), 3000);
        } catch (error) {
            console.error("Failed to restore database", error);
            setToastMessage("Failed to restore database.");
            setTimeout(() => setToastMessage(''), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-5xl mx-auto">
            {toastMessage && (
                <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-sm tracking-tight">{toastMessage}</span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h2>
                    <p className="text-slate-600 font-medium mt-1">Configure global application parameters and data management.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* General Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <Settings className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">General Configuration</h3>
                        </div>

                        <div className="space-y-6">
                            {settings.length > 0 ? settings.map((setting) => (
                                <div key={setting.id} className="grid grid-cols-1 md:grid-cols-3 md:items-center gap-4 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-4 -mx-4 rounded-2xl transition-colors">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-bold text-slate-700">{setting.key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}</label>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{setting.description}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        {setting.type === 'bool' ? (
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={setting.value === 'true'}
                                                    onChange={(e) => handleUpdateSetting(setting.key, e.target.checked.toString())}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        ) : setting.type === 'number' ? (
                                            <input
                                                type="number"
                                                value={setting.value}
                                                onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={setting.value}
                                                onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            />
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-slate-400 font-medium italic">No settings found. Generate default settings via backend.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8 border-t-4 border-t-indigo-600">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <DatabaseBackup className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Data Management</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-800 mb-2">Export Backup</h4>
                                <p className="text-xs text-slate-500 mb-4 leading-relaxed">Download a complete JSON snapshot of all entities and relationships in the current database.</p>
                                <button
                                    onClick={handleBackup}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm hover:bg-slate-100 active:scale-95"
                                >
                                    <DatabaseBackup className="w-4 h-4 text-slate-400" /> Generate JSON Backup
                                </button>
                            </div>

                            <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-800 mb-2">Restore Backup</h4>
                                <p className="text-xs text-slate-500 mb-4 leading-relaxed">Upload a validated JSON Backup file to simulate a database restoration process.</p>
                                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:bg-slate-800 active:scale-95 cursor-pointer">
                                    <UploadCloud className="w-4 h-4 text-slate-400" /> Upload Backup File
                                    <input
                                        type="file"
                                        accept=".json"
                                        className="hidden"
                                        onChange={handleRestore}
                                    />
                                </label>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 text-center leading-relaxed">
                                Warning: Restoration overrides system data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
