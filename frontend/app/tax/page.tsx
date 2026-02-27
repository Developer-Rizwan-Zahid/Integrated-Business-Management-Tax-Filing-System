"use client"

import { useState, useEffect } from 'react';
import { FileText, Calculator, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { taxAPI } from '@/lib/api';
import { cn } from '@/lib/utils';


export default function TaxPage() {
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [adjustedDepreciation, setAdjustedDepreciation] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [role, setRole] = useState('Staff');

    const fetchHistory = async () => {
        try {
            const data = await taxAPI.getSummary();
            setReports(data);
        } catch (err) {
            console.error("Error fetching tax history:", err);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRole(user.role || 'Staff');
        }
        fetchHistory();
    }, []);

    const handleCalculate = async (isPreview: boolean = false) => {
        setLoading(true);
        setError(null);
        if (!isPreview) setResult(null);

        try {
            const adjDep = adjustedDepreciation ? parseFloat(adjustedDepreciation) : undefined;
            const data = await taxAPI.calculate(parseInt(year), isPreview ? adjDep : undefined);
            setResult(data);
            if (!isPreview) {
                await fetchHistory();
                setAdjustedDepreciation('');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data || err.message || "Failed to calculate tax.");
        } finally {
            setLoading(false);
        }
    };

    if (role === 'Staff') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 shadow-xl shadow-red-100/50">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">
                        Only administrators and accountants can access the Tax Center. Please contact your supervisor for assistance.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Tax Center</h2>
                <p className="text-slate-600">Professional tax calculation compliant with current regulations.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-xl shadow-zinc-200/50">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 text-center md:text-left">Filing Year</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full px-6 py-4 bg-zinc-50 border border-slate-200 rounded-2xl text-xl font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                                />
                            </div>

                            {(role === 'Admin' || role === 'Accountant') && (
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 text-center md:text-left">Adjusted Depreciation (Optional)</label>
                                    <input
                                        type="number"
                                        value={adjustedDepreciation}
                                        onChange={(e) => setAdjustedDepreciation(e.target.value)}
                                        placeholder="Enter value for preview..."
                                        className="w-full px-6 py-4 bg-zinc-50 border border-slate-200 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleCalculate(false)}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? "Calculating..." : <><Calculator className="w-5 h-5" /> Calculate & Save</>}
                                </button>
                                {(role === 'Admin' || role === 'Accountant') && (
                                    <button
                                        onClick={() => handleCalculate(true)}
                                        disabled={loading}
                                        className="px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        Preview
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-zinc-50 border border-slate-200">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Status</p>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                    Ready to File
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-50 border border-slate-200">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Currency</p>
                                <div className="text-sm font-bold text-slate-900">USD ($)</div>
                            </div>
                        </div>
                    </div>

                    <div className="w-[1px] h-48 bg-zinc-100 hidden md:block"></div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-blue-50/30 rounded-[2rem] border border-blue-50">
                        {result ? (
                            <div className="space-y-4 animate-in zoom-in duration-500">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                                <div>
                                    <p className="text-sm font-bold text-zinc-400 uppercase">Estimated Tax</p>
                                    <p className="text-5xl font-black text-slate-900 mt-1">${result.taxAmount.toLocaleString()}</p>
                                </div>
                                <p className="text-xs text-slate-600">Based on taxable income of ${result.taxableIncome.toLocaleString()}</p>
                            </div>
                        ) : error ? (
                            <div className="space-y-4 animate-in shake duration-500">
                                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                                <p className="text-sm font-semibold text-red-500 px-4">{error}</p>
                            </div>
                        ) : (
                            <div className="space-y-4 opacity-40">
                                <FileText className="w-12 h-12 text-zinc-300 mx-auto" />
                                <p className="text-sm font-medium text-zinc-400">Run calculation to see results</p>
                            </div>
                        )}
                    </div>
                </div>

                {result && (
                    <div className="mt-12 pt-10 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
                        <ResultItem label="Total Revenue" value={`$${result.totalIncome.toLocaleString()}`} />
                        <ResultItem label="Total Deductions" value={`$${(result.totalExpenses + result.totalDepreciation).toLocaleString()}`} />
                        <ResultItem label="Tax Rate (Avg)" value={`${((result.taxAmount / result.taxableIncome) * 100).toFixed(1)}%`} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 text-white p-8 rounded-[2rem] flex items-center justify-between group cursor-pointer overflow-hidden relative">
                    <div className="relative z-10">
                        <h4 className="text-lg font-bold">Generate Full Report</h4>
                        <p className="text-zinc-400 text-sm mt-1">Detailed breakdown for audit purposes.</p>
                    </div>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform relative z-10" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/20 transition-all"></div>
                </div>
                <div className="bg-white border border-slate-200 p-8 rounded-[2rem] flex items-center justify-between group cursor-pointer shadow-sm">
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">Tax History</h4>
                        <p className="text-slate-600 text-sm mt-1">Review previous years&apos; calculations.</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-zinc-400 group-hover:translate-x-2 group-hover:text-slate-900 transition-all" />
                </div>
            </div>
        </div>
    );
}

function ResultItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="text-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-black text-slate-900">{value}</p>
        </div>
    );
}
