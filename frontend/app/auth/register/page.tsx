"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, UserPlus, Briefcase, Calculator, Building, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authAPI } from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState('Staff');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        email: '',
        password: '',
        username: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const username = formData.username || formData.email.split('@')[0];

            await authAPI.register(
                username,
                formData.email,
                formData.password,
                role
            );

            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.response?.data || err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[100px]"></div>

            <div className="w-full max-w-[500px] relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Create Account</h1>
                    <p className="text-zinc-500 mt-2 font-medium italic">Join 500+ businesses using our system.</p>
                </div>

                <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-2xl shadow-zinc-200/30">
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <RoleCard icon={Briefcase} label="Admin" active={role === 'Admin'} onClick={() => setRole('Admin')} />
                        <RoleCard icon={Calculator} label="Accountant" active={role === 'Accountant'} onClick={() => setRole('Accountant')} />
                        <RoleCard icon={User} label="Staff" active={role === 'Staff'} onClick={() => setRole('Staff')} />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 mb-6">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-2xl text-sm text-green-600 mb-6">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <span>Registration successful! Redirecting to login...</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                icon={User}
                                label="First Name"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
                            />
                            <InputField
                                icon={User}
                                label="Last Name"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
                            />
                        </div>
                        <InputField
                            icon={Building}
                            label="Company Name"
                            placeholder="Apex Corp"
                            value={formData.companyName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('companyName', e.target.value)}
                        />
                        <InputField
                            icon={Mail}
                            label="Email Address"
                            placeholder="john@apex.com"
                            type="email"
                            value={formData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                            required
                        />
                        <InputField
                            icon={User}
                            label="Username (optional)"
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('username', e.target.value)}
                        />
                        <InputField
                            icon={Lock}
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                            required
                        />

                        <div className="flex items-center gap-2 px-1">
                            <input type="checkbox" id="terms" className="w-4 h-4 rounded-md border-zinc-200 text-blue-600 focus:ring-blue-100" required />
                            <label htmlFor="terms" className="text-xs text-zinc-500 font-medium tracking-tight">
                                I agree to the <span className="text-blue-600 font-bold underline cursor-pointer">Terms of Service</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-70 mt-4 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Complete Registration <UserPlus className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest text-[10px]">
                            Already have an account? <Link href="/auth/login" className="text-blue-600 font-black hover:underline">Log In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RoleCard({ icon: Icon, label, active, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 text-center group",
                active
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                    : "bg-slate-50 border-slate-200 text-zinc-400 hover:border-blue-200"
            )}
        >
            <Icon className={cn("w-5 h-5", active ? "text-white" : "text-zinc-400 group-hover:text-blue-400")} />
            <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
        </div>
    );
}

function InputField({ icon: Icon, label, placeholder, type = "text", value, onChange, required }: any) {
    return (
        <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                    required={required}
                />
            </div>
        </div>
    );
}
