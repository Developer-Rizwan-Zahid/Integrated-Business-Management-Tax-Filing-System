"use client"

import { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Search, AlertCircle } from 'lucide-react';
import { financeAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
    const [role, setRole] = useState('Staff');
    const [isClosingPeriod, setIsClosingPeriod] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRole(user.role || 'Staff');
        }
        fetchTransactions();
        fetchExpenseCategories();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await financeAPI.getTransactions();
            setTransactions(data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        }
    };

    const fetchExpenseCategories = async () => {
        try {
            const data = await financeAPI.getExpenseCategories();
            if (data.length === 0) {
                try {
                    await fetch('http://localhost:5195/api/Seed/expense-categories', { method: 'POST' });
                    const newData = await financeAPI.getExpenseCategories();
                    setExpenseCategories(newData);
                    if (newData.length > 0) {
                        setSelectedCategoryId(newData[0].id);
                    }
                } catch (seedErr) {
                    console.error("Error seeding categories:", seedErr);
                }
            } else {
                setExpenseCategories(data);
                if (data.length > 0) setSelectedCategoryId(data[0].id);
            }
        } catch (err) {
            console.error("Error fetching expense categories:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            if (activeTab === 'income') {
                await financeAPI.addIncome({
                    amount: parseFloat(amount),
                    source: description,
                    date: new Date().toISOString()
                });
            } else {
                await financeAPI.addExpense({
                    amount: parseFloat(amount),
                    categoryId: selectedCategoryId,
                    description,
                    date: new Date().toISOString()
                });
            }

            setStatus(`Success! ${activeTab === 'income' ? 'Income' : 'Expense'} added.`);
            await fetchTransactions();
            setAmount('');
            setDescription('');
        } catch (err: any) {
            console.error(err);
            setStatus(err.response?.data || err.message || "Error adding transaction.");
        } finally {
            setLoading(false);
        }
    };

    const handleClosePeriod = async () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        if (!confirm(`Are you sure you want to CLOSE the financial period for ${month}/${year}? This will lock transactions for this period.`)) return;

        setIsClosingPeriod(true);
        try {
            await financeAPI.closePeriod(year, month);
            setStatus(`Success! Financial period ${month}/${year} closed.`);
        } catch (err: any) {
            setStatus(err.response?.data || "Failed to close period.");
        } finally {
            setIsClosingPeriod(false);
        }
    };

    const handleOpenPeriod = async () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        if (!confirm(`Are you sure you want to REOPEN the financial period for ${month}/${year}?`)) return;

        setStatus(null);
        try {
            await financeAPI.openPeriod(year, month);
            setStatus(`Success! Financial period ${month}/${year} reopened.`);
        } catch (err: any) {
            setStatus(err.response?.data || "Failed to reopen period.");
        }
    };

    const handleAddCategory = async () => {
        const name = prompt("Enter new category name:");
        if (!name) return;

        try {
            await financeAPI.createExpenseCategory(name);
            await fetchExpenseCategories();
            setStatus("Category created successfully.");
        } catch (err: any) {
            setStatus("Failed to create category.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Finance Management</h2>
                    <p className="text-slate-600 mt-1">Manage your income and expenses with real-time sync.</p>
                </div>
                {(role === 'Admin' || role === 'Accountant') && (
                    <div className="flex gap-4">
                        <button
                            onClick={handleAddCategory}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            Manage Categories
                        </button>
                        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            <button
                                onClick={handleClosePeriod}
                                disabled={isClosingPeriod}
                                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
                            >
                                {isClosingPeriod ? "Closing..." : "Close Period"}
                            </button>
                            <button
                                onClick={handleOpenPeriod}
                                className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Reopen
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex p-1 bg-slate-50 rounded-2xl mb-8">
                        <button
                            onClick={() => setActiveTab('income')}
                            className={cn(
                                "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                                activeTab === 'income' ? "bg-white text-blue-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            Add Income
                        </button>
                        <button
                            onClick={() => setActiveTab('expense')}
                            className={cn(
                                "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                                activeTab === 'expense' ? "bg-white text-red-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            Add Expense
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Amount ($)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                                required
                            />
                        </div>
                        {activeTab === 'expense' && expenseCategories.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                    Category
                                </label>
                                <select
                                    value={selectedCategoryId}
                                    onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                                >
                                    {expenseCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                {activeTab === 'income' ? 'Source' : 'Description'}
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={activeTab === 'income' ? "e.g. Services, Sales" : "e.g. Electricity, Rent"}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                                required
                            />
                        </div>

                        {status && (
                            <div className={cn(
                                "p-4 rounded-2xl text-xs font-medium flex items-center gap-2",
                                status.includes('Success') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                            )}>
                                {!status.includes('Success') && <AlertCircle className="w-4 h-4 shrink-0" />}
                                <span>{status}</span>
                            </div>
                        )}

                        <button
                            disabled={loading}
                            className={cn(
                                "w-full py-4 rounded-2xl text-sm font-bold text-white transition-all shadow-lg active:scale-95",
                                activeTab === 'income' ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-100" : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-100",
                                loading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {loading ? "Processing..." : `Record ${activeTab === 'income' ? 'Income' : 'Expense'}`}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Filter..."
                                className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-zinc-200 w-48"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <div key={tx.id} className="group flex items-center justify-between p-4 rounded-2xl border border-zinc-50 hover:border-blue-100 hover:bg-slate-50/50 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                            tx.type === 'income' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{tx.source || tx.description || 'Transaction'}</p>
                                            <p className="text-xs text-zinc-400">{new Date(tx.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            tx.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                tx.status === 'Rejected' ? "bg-red-50 text-red-600 border-red-100" :
                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {tx.status || 'Pending'}
                                        </div>
                                        <p className={cn(
                                            "text-base font-black",
                                            tx.type === 'income' ? "text-green-600" : "text-slate-900"
                                        )}>
                                            {tx.type === 'income' ? '+' : '-'}${(tx.amount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <Wallet className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                                <p className="text-sm font-medium text-zinc-400">No transactions yet. Add income or expenses to get started.</p>
                            </div>
                        )}
                    </div>

                    <button className="w-full mt-8 py-3 text-xs font-bold text-zinc-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                        View All Transactions
                    </button>
                </div>
            </div>
        </div>
    );
}
