"use client"

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Briefcase,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    X,
    CheckCircle2,
    Loader2,
    Download
} from 'lucide-react';
import signalrService from '@/lib/signalrService';
import { cn } from '@/lib/utils';
import { reportsAPI, financeAPI } from '@/lib/api';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface Stats {
    totalAssets: number;
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    taxLiability: number;
    yearlyGrowth: number;
}

export default function DashboardPage() {
    const [role, setRole] = useState('Staff');
    const [stats, setStats] = useState<Stats>({
        totalAssets: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        taxLiability: 0,
        yearlyGrowth: 0
    });

    const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
    const [pnlData, setPnlData] = useState<any[]>([]);
    const [expensePieData, setExpensePieData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [modalTab, setModalTab] = useState<'income' | 'expense'>('income');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    const fetchData = async () => {
        try {
            let metrics = { totalAssetValue: 0, currentYearProfit: 0, taxPayable: 0 };
            let pnl: any[] = [];
            let expensePie: any[] = [];
            let currentRole = role;

            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setRole(user.role || 'Staff');
                currentRole = user.role || 'Staff';
            }

            if (currentRole !== 'Staff') {
                try {
                    const [metricsRes, pnlRes, expensePieRes] = await Promise.all([
                        reportsAPI.getDashboardMetrics(),
                        reportsAPI.getProfitLoss(),
                        financeAPI.getExpenseByCategory()
                    ]);
                    metrics = metricsRes;
                    pnl = pnlRes;
                    expensePie = expensePieRes;
                } catch (e) {
                    console.error("Failed to fetch admin metrics", e);
                }
            }

            const [transactions, categories, financeSummary] = await Promise.all([
                financeAPI.getTransactions(),
                financeAPI.getExpenseCategories(),
                financeAPI.getSummary()
            ]);
            // ... (rest of fetchData)

            // Calculate Yearly Growth %
            const currentYear = new Date().getFullYear();
            const thisYearPnl = pnl.find((f: any) => f.year === currentYear);
            const lastYearPnl = pnl.find((f: any) => f.year === currentYear - 1);

            let growth = 0;
            if (thisYearPnl && lastYearPnl && lastYearPnl.totalIncome > 0) {
                growth = ((thisYearPnl.totalIncome - lastYearPnl.totalIncome) / lastYearPnl.totalIncome) * 100;
            } else if (thisYearPnl && (!lastYearPnl || lastYearPnl.totalIncome === 0)) {
                growth = 100; // If there's income this year but none last year
            }

            setStats({
                totalAssets: role === 'Staff' ? transactions.filter((t: any) => t.type === 'asset').length : (metrics.totalAssetValue || 0),
                totalIncome: financeSummary.totalIncome || 0,
                totalExpenses: financeSummary.totalExpenses || 0,
                netProfit: role === 'Staff' ? (financeSummary.totalIncome - financeSummary.totalExpenses) : (metrics.currentYearProfit || 0),
                taxLiability: role === 'Staff' ? 0 : (metrics.taxPayable || 0),
                yearlyGrowth: growth
            });

            setPnlData(pnl);
            setExpensePieData(expensePie);

            const formatted = transactions.map((t: any) => ({
                type: 'Finance',
                action: t.type === 'income' ? 'IncomeAdded' : 'ExpenseAdded',
                amount: t.amount,
                source: t.source || t.description,
                time: new Date(t.date).toLocaleTimeString(),
                isHistorical: true
            }));
            setRecentUpdates(formatted);

            setExpenseCategories(categories);
            if (categories.length > 0) setSelectedCategoryId(categories[0].id);

            const currentYearData = pnl.find((f: any) => f.year === currentYear);
            if (currentYearData) {
                setStats(prev => ({
                    ...prev,
                    totalIncome: currentYearData.totalIncome || 0,
                    totalExpenses: currentYearData.totalExpenses || 0,
                }));
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // ... (signalr listeners)
        signalrService.on("AssetChanged", (data) => {
            setRecentUpdates(prev => [{ type: 'Asset', ...data, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
            if (data.action === "Created") {
                setStats(prev => ({ ...prev, totalAssets: prev.totalAssets + 1 }));
            }
        });

        signalrService.on("FinanceChanged", (data) => {
            setRecentUpdates(prev => [{ type: 'Finance', ...data, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
            if (data.action === "IncomeAdded") {
                setStats(prev => ({
                    ...prev,
                    totalIncome: prev.totalIncome + (data.amount || 0),
                    netProfit: prev.netProfit + (data.amount || 0)
                }));
            } else if (data.action === "ExpenseAdded") {
                setStats(prev => ({
                    ...prev,
                    totalExpenses: prev.totalExpenses + (data.amount || 0),
                    netProfit: prev.netProfit - (data.amount || 0)
                }));
            }
        });

        return () => {
            signalrService.off("AssetChanged");
            signalrService.off("FinanceChanged");
        };
    }, []);

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (modalTab === 'income') {
                await financeAPI.addIncome({ amount: parseFloat(amount), source: description, date: new Date().toISOString() });
            } else {
                await financeAPI.addExpense({ amount: parseFloat(amount), categoryId: selectedCategoryId, description, date: new Date().toISOString() });
            }
            setShowAddModal(false);
            setAmount('');
            setDescription('');
        } catch (err) {
            console.error("Error adding transaction:", err);
            alert("Failed to add transaction. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownload = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Waking up fiscal engine...</p>
            </div>
        );
    }

    const chartBars = pnlData.length > 0
        ? pnlData.map(d => ({ label: `FY${d.year}`, val: d.totalIncome }))
        : Array.from({ length: 12 }, (_, i) => ({ label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i], val: Math.random() * 100000 }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Overview</h2>
                    <p className="text-slate-600 font-medium mt-1">Real-time updates from all business modules.</p>
                </div>
                <div className="flex gap-3 print:hidden">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <Download className="w-4 h-4 text-slate-400" />
                        Download Report
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-xs font-bold text-white hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Transaction
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={role === 'Staff' ? "My Income" : "Total Income"}
                    value={`$${stats.totalIncome.toLocaleString()}`}
                    icon={TrendingUp}
                    trend={role === 'Staff' ? "Personal" : "+12.5%"}
                    positive={true}
                    color="blue"
                />
                <StatCard
                    title={role === 'Staff' ? "My Expenses" : "Total Expenses"}
                    value={`$${stats.totalExpenses.toLocaleString()}`}
                    icon={TrendingDown}
                    trend={role === 'Staff' ? "Personal" : "+4.2%"}
                    positive={false}
                    color="red"
                />
                <StatCard
                    title={role === 'Staff' ? "My Contribution" : "Net Profit"}
                    value={`$${stats.netProfit.toLocaleString()}`}
                    icon={Wallet}
                    trend={role === 'Staff' ? "Filtered" : "+18.3%"}
                    positive={true}
                    color="green"
                />
                <StatCard
                    title={role === 'Staff' ? "My Assets" : "Total Assets"}
                    value={stats.totalAssets.toLocaleString()}
                    icon={Briefcase}
                    trend={role === 'Staff' ? "Requests" : `+${stats.yearlyGrowth.toFixed(1)}% YoY`}
                    positive={role === 'Staff' || stats.yearlyGrowth >= 0}
                    color="indigo"
                />
            </div>

            {role !== 'Staff' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Analytics - Left main column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Revenue Analytics</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1 italic">Comparison across fiscal segments</p>
                                </div>
                                <select className="bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500 rounded-xl px-4 py-2 focus:ring-0 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
                                    <option>Periodic Overview</option>
                                    <option>Annual Growth</option>
                                </select>
                            </div>
                            <div className="h-64 flex items-end justify-between gap-4 px-2">
                                {chartBars.map((bar, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div
                                            className="w-full bg-blue-50/50 rounded-t-2xl group-hover:bg-blue-600 transition-all duration-500 relative"
                                            style={{ height: `${Math.min(100, (bar.val / (Math.max(...chartBars.map(b => b.val)) || 1)) * 100)}%` }}
                                        >
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-2 rounded-xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 shadow-2xl">
                                                <p className="font-bold">${bar.val.toLocaleString()}</p>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700"></div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bar.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Expense Distribution</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1 italic">Operational costs breakdown</p>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                {expensePieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={expensePieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={120}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {expensePieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(value: number | undefined) => `$${(value || 0).toLocaleString()}`}
                                                contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 font-medium italic">
                                        No expense data to display
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Live Activity - Moved inside the grid but shown always maybe? Let's check. */}
                    {/* Actually requirements said restricted dashboard. Activity should stay. */}
                </div>
            )}

            <div className={cn("grid grid-cols-1 gap-8", role !== 'Staff' ? "lg:grid-cols-1" : "lg:grid-cols-1")}>
                {/* Always show activity for now, but in a full block if Staff */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-100">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Live
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentUpdates.length > 0 ? recentUpdates.map((update, i) => (
                            <div key={i} className="flex gap-4 group animate-in slide-in-from-right duration-500 bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                                <div className={cn(
                                    "w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg",
                                    update.type === 'Asset' ? "bg-blue-50 text-blue-600" : "bg-indigo-50 text-indigo-600"
                                )}>
                                    {update.type === 'Asset' ? <Briefcase className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">
                                        {update.type === 'Asset' ? `Asset Req: ${update.asset?.name || 'Asset'}` : `Finance: ${update.action === 'IncomeAdded' ? 'Income' : 'Expense'}`}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{update.time}</span>
                                        <span className="text-[10px] text-slate-200">•</span>
                                        <p className="text-[11px] text-slate-500 font-medium italic truncate">
                                            {update.type === 'Asset' ? "Pending Approval" : `$${update.amount?.toLocaleString()} — ${update.source || update.description || 'Record'}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-12">
                                <Activity className="w-12 h-12 text-slate-200 mb-4" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Synchronization...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Post Transaction</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="flex p-1.5 bg-slate-50 rounded-2xl">
                                <button
                                    onClick={() => setModalTab('income')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        modalTab === 'income' ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Income
                                </button>
                                <button
                                    onClick={() => setModalTab('expense')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        modalTab === 'expense' ? "bg-white text-red-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Expense
                                </button>
                            </div>

                            <form onSubmit={handleAddTransaction} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 pl-1">Amount ($)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        required
                                    />
                                </div>

                                {modalTab === 'expense' && expenseCategories.length > 0 && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 pl-1">Category</label>
                                        <select
                                            value={selectedCategoryId}
                                            onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                                        >
                                            {expenseCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 pl-1">
                                        {modalTab === 'income' ? 'Revenue Source' : 'Description'}
                                    </label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={modalTab === 'income' ? "e.g. Consulting, Sales" : "e.g. Office Rent, Cloud Services"}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        required
                                    />
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    className={cn(
                                        "w-full py-5 rounded-[1.5rem] text-sm font-black text-white uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3",
                                        modalTab === 'income' ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-200" : "bg-gradient-to-r from-red-600 to-red-700 shadow-red-200",
                                        isSubmitting && "opacity-70 cursor-not-allowed"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>Record {modalTab === 'income' ? 'Income' : 'Expense'}</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon: Icon, trend, positive, color }: any) {
    const colors: any = {
        blue: "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-200",
        red: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-200",
        green: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-200",
        indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-200"
    };

    return (
        <div className="group bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-500 hover:-translate-y-1">
            <div className="flex items-start justify-between">
                <div className={cn("p-4 rounded-2xl transition-all duration-500 shadow-lg group-hover:scale-110", colors[color])}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border",
                    positive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                )}>
                    {trend}
                    {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </div>
            </div>
            <div className="mt-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
                <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight group-hover:text-blue-600 transition-colors">{value}</p>
            </div>
        </div>
    );
}

