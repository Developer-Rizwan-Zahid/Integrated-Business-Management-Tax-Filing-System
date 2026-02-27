"use client"

import Link from 'next/link';
import {
  Shield,
  Zap,
  BarChart3,
  Globe,
  ArrowRight,
  CheckCircle2,
  Layers,
  PieChart,
  Users,
  Building,
  CheckCircle,
  HelpCircle,
  CreditCard,
  Trophy,
  BadgeCheck,
  ChevronDown,
  ArrowRightCircle,
  MessageSquare
} from 'lucide-react';

import { cn } from '@/lib/utils';


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl z-50 px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">
            TaxSystem<span className="text-blue-600">.</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600 uppercase tracking-widest">
          <Link href="#features" className="hover:text-blue-600 transition-colors">
            Features
          </Link>
          <Link href="#modules" className="hover:text-blue-600 transition-colors">
            Modules
          </Link>
          <Link href="#workflow" className="hover:text-blue-600 transition-colors">
            Workflow
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md active:scale-95"
          >
            Create Account
          </Link>
        </div>
      </nav>


      {/* Hero Section */}
      <header className="relative pt-32 pb-24 px-4 md:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Content */}
          <div className="lg:col-span-8 space-y-10">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
              Do more with your <br />
              <span className="text-blue-700">TaxSystem account</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-700 font-medium max-w-2xl">
              Access your tax information with an Individual, Business or Tax Pro Account
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 max-w-2xl">
              <CheckmarkItem label="Refund status" />
              <CheckmarkItem label="Tax records" />
              <CheckmarkItem label="Payments" />
              <CheckmarkItem label="Notifications" />
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-4">
              <Link
                href="/auth/register"
                className="px-8 py-3 bg-[#005596] text-white rounded-md font-extrabold text-lg hover:bg-blue-800 transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:translate-y-[2px] active:shadow-none"
              >
                Create account
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 bg-white text-[#005596] border-2 border-[#005596] rounded-md font-extrabold text-lg hover:bg-blue-50 transition-all active:translate-y-[2px]"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Right Column: Info Card */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-8 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] space-y-8 z-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900">Where&apos;s my refund?</h2>
              <p className="text-lg font-semibold text-slate-700 italic border-b border-slate-200 pb-4">Two ways to check</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-900">TaxSystem account</h3>
                <p className="text-slate-600 font-medium leading-relaxed">Check your refund, tax records and more.</p>
                <Link
                  href="/auth/login"
                  className="inline-block px-8 py-2.5 bg-white text-[#005596] border-2 border-[#005596] rounded-md font-extrabold hover:bg-blue-50 transition-all"
                >
                  Sign in
                </Link>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100">
                <h3 className="text-xl font-black text-slate-900">Refund tracker</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Enter your SSN, filing status and refund amount on your return. <br />
                  <span className="font-bold underline underline-offset-4 decoration-slate-400">No sign in.</span>
                </p>
                <Link
                  href="/refund-tracker"
                  className="inline-block px-8 py-2.5 bg-white text-[#005596] border-2 border-[#005596] rounded-md font-extrabold hover:bg-blue-50 transition-all"
                >
                  Use refund tracker
                </Link>
              </div>
            </div>
          </div>

        </div>
      </header>


      {/* Modules Overview */}
      <section
        id="modules"
        className="py-28 px-8 bg-white border-y border-slate-200"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">
                Integrated Modules
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                Everything your finance team uses — finally connected.
              </h2>
              <p className="text-sm md:text-base text-slate-600">
                Built as a single, real‑time system of record: login once and move seamlessly from assets to
                tax, without losing context.
              </p>
            </div>
            <div className="text-xs text-slate-500 md:text-right">
              <p className="font-semibold">Modules included out‑of‑the‑box:</p>
              <p>Authentication • Asset Management • Finance • Tax Engine • Reporting</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <ModuleCard
              label="User & Admin Login"
              description="Role-based access for Admin, Accountant, and Staff with secure JWT authentication."
            />
            <ModuleCard
              label="Asset Management"
              description="Track assets, categories, depreciation, and assignments in real time."
            />
            <ModuleCard
              label="Income & Expenses"
              description="Capture every transaction with audit trails and live dashboards."
            />
            <ModuleCard
              label="Tax Calculation"
              description="Calculate taxable income and liability using configurable slabs."
            />
            <ModuleCard
              label="Reports & Analytics"
              description="Profit & Loss, tax summaries, and board‑ready exports in a click."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-16 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
          <StatItem icon={BadgeCheck} value="99.9%" label="Tax Accuracy" />
          <StatItem icon={Users} value="50k+" label="Daily Filings" />
          <StatItem icon={Shield} value="AES-256" label="Bank Grade Security" />
          <StatItem icon={Trophy} value="100%" label="Compliance Rate" />
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.1),transparent_70%)] pointer-events-none" />
      </section>

      {/* Solutions Grid */}
      <section id="solutions" className="py-32 px-8 bg-slate-50/50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto font-sans">
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Tailored Solutions for Every Scalable Entity
            </h2>
            <p className="text-slate-600 font-medium">
              Whether you are a solo accountant or a multinational corporation, our platform scales with your complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <SolutionCard
              title="Individual Accountants"
              features={["Client portfolio management", "Auto-tax calculations", "Secure document locker"]}
            />
            <SolutionCard
              title="Small Businesses"
              features={["Payroll & Expense tracking", "GST/VAT automation", "Profit & Loss dashboards"]}
            />
            <SolutionCard
              title="Enterprises"
              features={["Multi-department audits", "SignalR live data sync", "Advanced API integration"]}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-8 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium">Everything you need to know about the system.</p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="How secure is my tax data?"
              answer="We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your data is housed in enterprise-grade SOC2 compliant data centers."
            />
            <FAQItem
              question="Can I import data from my current spreadsheet?"
              answer="Yes, we support bulk CSV/Excel imports for assets, income, and expenses with automated category mapping."
            />
            <FAQItem
              question="Does the system support multiple users?"
              answer="Absolutely. You can define roles like Admin, Accountant, and Staff, each with granular permission controls."
            />
            <FAQItem
              question="Is the tax calculation real-time?"
              answer="Yes. As soon as you record a transaction, our engine recalculates your tax liability based on the latest slabs and regulations."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-blue-700 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),transparent_50%)]" />
          <h2 className="text-3xl md:text-6xl font-black text-white leading-[1.1] relative z-10">
            Ready to automate your <br />
            tax filing process?
          </h2>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl mx-auto relative z-10">
            Join thousands of businesses that have simplified their workflow and eliminated tax errors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 relative z-10">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-10 py-5 bg-white text-blue-700 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all active:scale-95 shadow-lg"
            >
              Create Account Now
            </Link>
            <Link
              href="#workflow"
              className="w-full sm:w-auto px-10 py-5 bg-blue-800 text-white rounded-2xl font-black text-lg border border-blue-600 hover:bg-blue-900 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start for New Users */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/70 border-y border-slate-200">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">
              Get Started in Minutes
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Three simple steps to set up your tax workspace.
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              Designed to work beautifully on mobile and desktop so you can review, approve, and file from anywhere.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <WorkflowStep
              step="01"
              title="Create your account"
              body="Sign up, choose your role, and invite your team members with the right permissions."
            />
            <WorkflowStep
              step="02"
              title="Import your data"
              body="Bring in assets, income, and expenses from your existing sheets or system."
            />
            <WorkflowStep
              step="03"
              title="Review & file"
              body="Track live metrics on the dashboard, generate reports, and file taxes with confidence."
            />
          </div>
        </div>
      </section>

      {/* Workflow / Dashboard Overview */}
      <section
        id="workflow"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200"
      >
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">
              End‑to‑End Workflow
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              From daily transactions to board‑ready tax reports.
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              A guided path that mirrors how finance teams really work — simplified into five clear stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
            <WorkflowStep
              step="01"
              title="Login"
              body="Secure sign‑in for every role with full audit history."
            />
            <WorkflowStep
              step="02"
              title="Manage Assets"
              body="Register and categorize company assets with depreciation rules."
            />
            <WorkflowStep
              step="03"
              title="Record Income & Expenses"
              body="Capture cashflow as it happens, linked to categories and departments."
            />
            <WorkflowStep
              step="04"
              title="Calculate Profit & Tax"
              body="Generate net profit and tax liability for any financial year."
            />
            <WorkflowStep
              step="05"
              title="Generate Reports"
              body="Export clean P&L and tax summaries for management or auditors."
            />
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-32 px-8 overflow-hidden relative bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10">
            <h3 className="text-4xl font-black leading-tight tracking-tight text-slate-900">
              Real-Time Synchronization <br />
              <span className="text-blue-600">at any scale.</span>
            </h3>
            <p className="text-lg text-slate-600 font-medium">
              Our SignalR-powered engine ensures that when an accountant in one office adds an expense, the manager in another office sees it update on their dashboard in milliseconds.
            </p>
            <div className="space-y-4">
              <CheckItem label="Zero-latency data broadcasting" />
              <CheckItem label="Automated conflict resolution" />
              <CheckItem label="Enterprise-grade data encryption" />
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-500/5 rounded-full blur-[100px]"></div>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl shadow-blue-100 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                  Live Feed
                </div>
              </div>
              <div className="space-y-4">
                <LiveActivityItem label="New Asset Added" time="Just now" user="Finance Team" color="bg-blue-600" />
                <LiveActivityItem label="Tax Report Generated" time="2m ago" user="System" color="bg-indigo-600" />
                <LiveActivityItem label="Expense Registered" time="5m ago" user="Ahmed Khan" color="bg-slate-800" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tighter">TaxSystem<span className="text-blue-600">.</span></span>
            </div>
            <p className="max-w-xs text-slate-600 text-sm font-medium leading-relaxed">
              Leading the way in integrated business intelligence and tax automation for modern enterprises worldwide.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-700">
              <li><Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-blue-600">Security</Link></li>
              <li><Link href="/register" className="hover:text-blue-600">Pricing</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Support</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-700">
              <li><Link href="#" className="hover:text-blue-600">Documentation</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Help Center</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-20 mt-20 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">© 2024 Integrated Tax System. All Rights Reserved.</p>
          <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Link href="#" className="hover:text-slate-900 transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Instagram</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckmarkItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
        <span className="text-white text-xs font-bold">✓</span>
      </div>
      <span className="text-lg font-bold text-slate-900 border-b-2 border-slate-900/10 pb-0.5 group-hover:border-slate-900 transition-colors">
        {label}
      </span>
    </div>
  );
}

function StatItem({ icon: Icon, value, label }: any) {
  return (
    <div className="text-center space-y-2 group">
      <div className="flex justify-center">
        <Icon className="w-8 h-8 text-blue-500 group-hover:scale-125 transition-transform" />
      </div>
      <p className="text-3xl font-black text-white tracking-widest">{value}</p>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
}

function SolutionCard({ title, features }: { title: string; features: string[] }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 flex flex-col h-full group">
      <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight group-hover:text-blue-700 transition-colors">{title}</h3>
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-slate-600 font-medium text-sm">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <Link href="/auth/register" className="flex items-center gap-2 text-sm font-black text-blue-700 hover:translate-x-1 transition-transform">
        Get Started <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="group border border-slate-200 rounded-2xl p-6 hover:border-blue-400 transition-all duration-300 bg-white">
      <details className="cursor-pointer">
        <summary className="flex items-center justify-between font-black text-slate-900 text-lg list-none outline-none">
          {question}
          <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
        </summary>
        <p className="text-slate-600 mt-4 leading-relaxed font-medium">
          {answer}
        </p>
      </details>
    </div>
  );
}

function LogoPlaceholder({ icon: Icon, label }: any) {


  return (
    <div className="flex items-center gap-2 group cursor-default">
      <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
      <span className="text-lg font-bold tracking-tight text-slate-600 group-hover:text-slate-900 transition-colors">
        {label}
      </span>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-100 transition-all duration-500 group">
      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-8 shadow-md group-hover:scale-110 transition-transform", color)}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-black mb-4 tracking-tight text-slate-900">{title}</h3>
      <p className="text-slate-600 font-medium text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function CheckItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
      </div>
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </div>
  );
}

function LiveActivityItem({ label, time, user, color }: any) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 group hover:bg-white transition-all cursor-default">
      <div className={cn("w-2 h-10 rounded-full", color)}></div>
      <div className="flex-1">
        <p className="text-sm font-black tracking-tight text-slate-900">{label}</p>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{user}</p>
      </div>
      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
        {time}
      </span>
    </div>
  );
}

function ModuleCard({ label, description }: { label: string; description: string }) {
  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white px-5 py-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">{label}</p>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function WorkflowStep({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="relative h-full rounded-xl border border-slate-200 bg-white px-5 py-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
      <span className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">{step}</span>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="text-xs text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}
