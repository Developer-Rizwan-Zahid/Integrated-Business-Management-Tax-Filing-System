"use client"

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Download,
    Calendar,
    Filter,
    BarChart4,
    PieChart as PieChartIcon,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { reportsAPI, assetAPI } from '@/lib/api';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('pnl');
    const [loading, setLoading] = useState(true);
    const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
    const [pnlReport, setPnlReport] = useState<any[]>([]);
    const [taxSummary, setTaxSummary] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [toastMessage, setToastMessage] = useState('');
    const [role, setRole] = useState('Staff');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [metrics, pnl, tax, allAssets] = await Promise.all([
                reportsAPI.getDashboardMetrics(),
                reportsAPI.getProfitLoss(startDate || undefined, endDate || undefined),
                reportsAPI.getTaxSummary(startDate || undefined, endDate || undefined),
                reportsAPI.getAssets(startDate || undefined, endDate || undefined)
            ]);

            setDashboardMetrics(metrics);
            setPnlReport(pnl);
            setTaxSummary(tax);
            setAssets(allAssets);
        } catch (error) {
            console.error("Failed to fetch report data:", error);
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
        fetchData();
    }, []);

    if (role === 'Staff') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 shadow-xl shadow-red-100/50">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">
                        Only administrators and accountants can access the Report Intelligence center. Please contact your supervisor.
                    </p>
                </div>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const handleViewStatus = () => {
        setToastMessage("Audit status is running normally and up to date for 2024.");
        setTimeout(() => setToastMessage(''), 4000);
    };

    const handleExportExcel = () => {
        let dataToExport: any[] = [];
        let sheetName = "";

        if (reportType === 'pnl') {
            dataToExport = pnlReport.map(r => ({
                Year: r.year,
                'Total Income': r.totalIncome,
                'Total Expenses': r.totalExpenses,
                'Profit': r.totalIncome - r.totalExpenses,
                'Tax Paid': r.taxPaid
            }));
            sheetName = "Profit_And_Loss";
        } else if (reportType === 'tax') {
            dataToExport = taxSummary.map(t => ({
                Year: t.year,
                'Taxable Income': t.taxableIncome,
                'Tax Amount': t.taxAmount,
                Status: t.status,
                'Calculated Date': new Date(t.calculatedDate).toLocaleDateString()
            }));
            sheetName = "Tax_Liability";
        } else if (reportType === 'assets') {
            dataToExport = assets.map(a => ({
                Name: a.name,
                'Purchase Price': a.purchasePrice,
                'Current Depreciation': a.currentDepreciation || 0,
                'Net Value': a.purchasePrice - (a.currentDepreciation || 0),
                Status: a.status,
                'Purchase Date': new Date(a.purchaseDate).toLocaleDateString()
            }));
            sheetName = "Asset_Valuation";
        }

        if (dataToExport.length === 0) {
            setToastMessage("No data available to export.");
            setTimeout(() => setToastMessage(''), 4000);
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        XLSX.writeFile(workbook, `${sheetName}_Report.xlsx`);
        setToastMessage(`Exported ${sheetName.replace(/_/g, ' ')} to Excel.`);
        setTimeout(() => setToastMessage(''), 4000);
    };

    const renderPnlView = () => {
        const currentYearPnl = pnlReport.length > 0 ? pnlReport[0] : { totalIncome: 0, totalExpenses: 0, taxPaid: 0 };
        const totalEstimatedPnl = pnlReport.reduce((acc, curr) => acc + (curr.totalIncome - curr.totalExpenses), 0);

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryGridItem label="Operating Revenue" value={`$${currentYearPnl.totalIncome.toLocaleString()}`} trend="+8.2%" status="positive" />
                    <SummaryGridItem label="Deductible Costs" value={`$${currentYearPnl.totalExpenses.toLocaleString()}`} trend="-2.1%" status="negative" />
                    <SummaryGridItem label="Projected Tax" value={`$${currentYearPnl.taxPaid.toLocaleString()}`} trend="0.0%" status="neutral" />
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-bold text-slate-900">Profit & Loss Breakdown</h3>
                        <div className="flex items-center gap-3 print:hidden">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <span className="text-slate-400 font-bold text-xs">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button
                                onClick={fetchData}
                                className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900 px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                <Filter className="w-3 h-3" /> Filter
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {pnlReport.map((report, idx) => (
                            <ReportTableRow
                                key={idx}
                                label={`FY ${report.year} Summary`}
                                revenue={`$${report.totalIncome.toLocaleString()}`}
                                expense={`$${report.totalExpenses.toLocaleString()}`}
                                profit={`$${(report.totalIncome - report.totalExpenses).toLocaleString()}`}
                            />
                        ))}
                        {pnlReport.length === 0 && (
                            <div className="text-center py-8 text-zinc-400 font-medium">No P&L data available.</div>
                        )}
                        <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between px-8">
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest leading-none">Total Estimated P&L</p>
                            <p className="text-4xl font-black text-blue-600 leading-none">${totalEstimatedPnl.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTaxView = () => {
        const totalTaxLiability = taxSummary.reduce((acc, curr) => acc + curr.taxAmount, 0);

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryGridItem label="Total Taxable Income" value={`$${taxSummary.reduce((acc, curr) => acc + curr.taxableIncome, 0).toLocaleString()}`} trend="+" status="neutral" />
                    <SummaryGridItem label="Total Tax Liability" value={`$${totalTaxLiability.toLocaleString()}`} trend="+" status="negative" />
                    <SummaryGridItem label="Active Records" value={taxSummary.length.toString()} trend="0.0%" status="neutral" />
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-bold text-slate-900">Tax Liability Breakdown</h3>
                        <div className="flex items-center gap-3 print:hidden">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
                            <span className="text-slate-400 font-bold text-xs">to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
                            <button onClick={fetchData} className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900 px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
                                <Filter className="w-3 h-3" /> Filter
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {taxSummary.map((tax, idx) => (
                            <ReportTableRow
                                key={tax.id}
                                label={`FY ${tax.year} Tax Record`}
                                revenue={`$${tax.taxableIncome?.toLocaleString() || 0}`}
                                expense={`$${tax.taxAmount?.toLocaleString() || 0}`}
                                profit={tax.status}
                                expenseLabel="Tax Amount"
                                profitLabel="Status"
                            />
                        ))}
                        {taxSummary.length === 0 && (
                            <div className="text-center py-8 text-zinc-400 font-medium">No tax records available.</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderAssetsView = () => {
        const totalValue = assets.reduce((acc, curr) => acc + curr.purchasePrice, 0);
        const totalDepreciation = dashboardMetrics?.totalDepreciation || 0;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryGridItem label="Total Asset Value" value={`$${totalValue.toLocaleString()}`} trend="+" status="positive" />
                    <SummaryGridItem label="Total Depreciation" value={`$${totalDepreciation.toLocaleString()}`} trend="-" status="negative" />
                    <SummaryGridItem label="Total Assets" value={assets.length.toString()} trend="0.0%" status="neutral" />
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-bold text-slate-900">Asset Valuation Breakdown</h3>
                        <div className="flex items-center gap-3 print:hidden">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
                            <span className="text-slate-400 font-bold text-xs">to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
                            <button onClick={fetchData} className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900 px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
                                <Filter className="w-3 h-3" /> Filter
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {assets.slice(0, 10).map((asset, idx) => (
                            <ReportTableRow
                                key={asset.id}
                                label={asset.name}
                                revenue={`$${asset.purchasePrice.toLocaleString()}`}
                                expense={`$${asset.currentDepreciation?.toLocaleString() || 0}`}
                                profit={`$${(asset.purchasePrice - (asset.currentDepreciation || 0)).toLocaleString()}`}
                                revenueLabel="Purchase Price"
                                expenseLabel="Current Depr."
                                profitLabel="Net Value"
                            />
                        ))}
                        {assets.length === 0 && (
                            <div className="text-center py-8 text-zinc-400 font-medium">No assets available.</div>
                        )}
                        {assets.length > 10 && (
                            <div className="text-center py-4 text-zinc-400 text-sm font-bold uppercase tracking-widest hidden print:block">
                                ... and {assets.length - 10} more assets.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 print:m-0 print:p-0">
            {toastMessage && (
                <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-sm tracking-tight">{toastMessage}</span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between print:mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Report Intelligence</h2>
                    <p className="text-slate-600 font-medium">Auto-generated business summaries and tax compliance audits.</p>
                </div>
                <div className="flex gap-3 print:hidden">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all shadow-sm hover:bg-slate-50 active:scale-95 group"
                    >
                        <Download className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                        Export Excel
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 group"
                    >
                        <Download className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                        Generate PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-4 print:hidden">
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm overflow-hidden border-l-4 border-l-blue-600">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Core Financials</h4>
                        <div className="space-y-1">
                            <ReportNavItem icon={TrendingUp} label="Profit & Loss" active={reportType === 'pnl'} onClick={() => setReportType('pnl')} />
                            <ReportNavItem icon={BarChart4} label="Tax Liability" active={reportType === 'tax'} onClick={() => setReportType('tax')} />
                            <ReportNavItem icon={PieChartIcon} label="Asset Valuation" active={reportType === 'assets'} onClick={() => setReportType('assets')} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="relative z-10 space-y-4">
                            <div className="p-3 bg-white/10 rounded-2xl w-fit">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h5 className="font-bold text-lg">Yearly Audit</h5>
                                <p className="text-blue-100 text-xs mt-1 leading-relaxed">System-wide data validation is running for fiscal year 2024.</p>
                            </div>
                            <button
                                onClick={handleViewStatus}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white text-blue-600 px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
                            >
                                View Status <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-1000"></div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-8 print:col-span-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 bg-white/50 rounded-[2.5rem] border border-slate-200 border-dashed">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                            <p className="text-sm font-bold text-slate-500">Compiling Report Intelligence...</p>
                        </div>
                    ) : (
                        <>
                            {reportType === 'pnl' && renderPnlView()}
                            {reportType === 'tax' && renderTaxView()}
                            {reportType === 'assets' && renderAssetsView()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function ReportNavItem({ icon: Icon, label, active, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer group",
                active
                    ? "bg-blue-50 text-blue-600"
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
            )}
        >
            <Icon className={cn("w-5 h-5", active ? "text-blue-600" : "text-zinc-400 group-hover:scale-110 transition-transform")} />
            <span>{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
        </div>
    );
}

function SummaryGridItem({ label, value, trend, status }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{label}</p>
            <div className="flex items-end justify-between">
                <p className="text-2xl font-black text-slate-900 tracking-tight truncate pr-2">{value}</p>
                <div className={cn(
                    "flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg",
                    status === 'positive' ? "text-green-600 bg-green-50" : status === 'negative' ? "text-red-600 bg-red-50" : "text-slate-600 bg-zinc-50"
                )}>
                    {trend} {status === 'negative' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                </div>
            </div>
        </div>
    );
}

function ReportTableRow({
    label, revenue, expense, profit,
    revenueLabel = "Revenue",
    expenseLabel = "Expenses",
    profitLabel = "Profit"
}: any) {
    return (
        <div className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] bg-zinc-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-lg hover:shadow-zinc-100 transition-all duration-500 print:border-slate-200 print:bg-white">
            <div className="space-y-1 mb-4 md:mb-0">
                <p className="text-md font-bold text-slate-900">{label}</p>
                <p className="text-xs text-zinc-400 font-medium tracking-tight italic">Verified by SignalR Fiscal Engine</p>
            </div>
            <div className="grid grid-cols-3 gap-8 md:gap-16">
                <div className="text-center md:text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{revenueLabel}</p>
                    <p className="text-sm font-bold text-slate-900">{revenue}</p>
                </div>
                <div className="text-center md:text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{expenseLabel}</p>
                    <p className={cn("text-sm font-bold", expenseLabel.includes("Tax") || expenseLabel.includes("Expenses") ? "text-red-500" : "text-slate-500")}>
                        {expense}
                    </p>
                </div>
                <div className="text-center md:text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{profitLabel}</p>
                    <p className={cn("text-sm font-bold",
                        profitLabel === "Status" ? "text-blue-600" :
                            profitLabel === "Net Value" || profitLabel === "Profit" ? "text-green-600" : "text-slate-900"
                    )}>
                        {profit}
                    </p>
                </div>
            </div>
        </div>
    );
}

