"use client"

import { useState, useEffect } from 'react';
import { Briefcase, Plus, Filter, Download, MoreHorizontal, Settings2, AlertCircle } from 'lucide-react';
import { assetAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AssetsPage() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number>(1);
    const [role, setRole] = useState('Staff');

    const fetchAssets = async () => {
        try {
            const data = await assetAPI.getAll();
            setAssets(data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching assets:", err);
            setError(err.response?.data || err.message || "Failed to load assets");
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await assetAPI.getCategories();
            setCategories(data);
            if (data.length > 0 && !selectedCategory) {
                setSelectedCategory(data[0].id);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRole(user.role || 'Staff');
        }
        fetchAssets();
        fetchCategories();
    }, []);

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await assetAPI.create({
                name,
                categoryId: selectedCategory,
                purchasePrice: parseFloat(price),
                salvageValue: 0,
                usefulLifeYears: 5,
                purchaseDate: new Date().toISOString()
            });

            // Re-fetch after add to ensure real data from DB
            await fetchAssets();
            setName('');
            setPrice('');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data || err.message || "Failed to add asset. Please try again.");
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await assetAPI.updateStatus(id, newStatus);
            await fetchAssets();
            // TODO: Optional toast message here, omitted due to layout issues in previous edits
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update asset status.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Asset Management</h2>
                    <p className="text-slate-600 mt-1">Track company inventory and automatic depreciation.</p>
                </div>
                <div className="flex gap-3">
                    {(role === 'Admin' || role === 'Accountant') && (
                        <button
                            onClick={async () => {
                                const name = prompt("New category name:");
                                if (name) {
                                    try {
                                        await assetAPI.createCategory({ name });
                                        await fetchCategories();
                                    } catch (err) {
                                        alert("Failed to create category");
                                    }
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Settings2 className="w-4 h-4" />
                            Manage Categories
                        </button>
                    )}
                    <button className={cn(
                        "flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm",
                        role === 'Staff' && "hidden"
                    )}>
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Quick Add Form */}
                <div className="xl:col-span-1 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm h-fit sticky top-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Plus className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{role === 'Staff' ? 'Request Asset' : 'New Asset'}</h3>
                    </div>

                    <form onSubmit={handleAddAsset} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Asset Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Server Rack"
                                className="w-full px-4 py-3 bg-zinc-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                                required
                            />
                        </div>
                        {categories.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Purchase Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-zinc-50 border border-slate-200 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                                required
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Registering..." : (role === 'Staff' ? "Request Registration" : "Add to Inventory")}
                        </button>
                    </form>
                </div>

                {/* Asset Table */}
                <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">All Assets</span>
                            <span className="px-3 py-1 bg-white border border-slate-200 text-zinc-500 text-[10px] font-bold rounded-full uppercase tracking-wider cursor-pointer hover:bg-zinc-50">In Use</span>
                            <span className="px-3 py-1 bg-white border border-slate-200 text-zinc-500 text-[10px] font-bold rounded-full uppercase tracking-wider cursor-pointer hover:bg-zinc-50">Maintenance</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Filter className="w-4 h-4 text-slate-500 cursor-pointer" />
                            <Settings2 className="w-4 h-4 text-slate-500 cursor-pointer" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asset Details</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Value</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {assets.map((asset) => (
                                    <tr key={asset.id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <Briefcase className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{asset.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">
                                                        Acquired: {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                                {asset.category || asset.categoryName || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-slate-900">${(asset.purchasePrice || asset.price || 0).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                asset.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    asset.status === 'Rejected' ? "bg-red-50 text-red-600 border-red-100" :
                                                        "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    asset.status === 'Approved' ? "bg-emerald-500" :
                                                        asset.status === 'Rejected' ? "bg-red-500" :
                                                            "bg-amber-500"
                                                )}></span>
                                                {asset.status || 'Pending'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {role !== 'Staff' && asset.status === 'Pending' ? (
                                                <div className="flex items-center justify-end gap-2 text-right">
                                                    <button
                                                        onClick={() => handleStatusChange(asset.id, 'Approved')}
                                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(asset.id, 'Rejected')}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                role !== 'Staff' && (
                                                    <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-lg hover:bg-white border border-transparent hover:border-slate-200 shadow-none hover:shadow-sm">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {assets.length === 0 && (
                            <div className="p-12 text-center">
                                <Briefcase className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                                <p className="text-sm font-medium text-slate-500">No assets found. Add your first asset to get started.</p>
                            </div>
                        )}
                    </div>

                    {assets.length > 0 && (
                        <div className="p-6 bg-zinc-50/30 border-t border-zinc-50 text-center">
                            <button className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
                                Show more inventory items
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
