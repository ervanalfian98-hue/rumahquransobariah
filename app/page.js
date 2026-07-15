'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from './lib/supabaseClient';

// Helper component for Phosphor Icons
const PhosphorIcon = ({ icon, size = 24, weight = "regular", className = "" }) => {
    const weightClass = weight === 'regular' ? `ph ph-${icon}` : `ph-${weight} ph-${icon}`;
    return <i className={`${weightClass} ${className}`} style={{ fontSize: size }}></i>;
};

export default function LoginScreen() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showKodeAkses, setShowKodeAkses] = useState(false);
    const [registerType, setRegisterType] = useState('tholibah'); // 'tholibah' | 'management'
    
    // Auth States
    const [isGoogleRegister, setIsGoogleRegister] = useState(false);
    const [googleEmail, setGoogleEmail] = useState('');
    
    const [formData, setFormData] = useState({
        nama: '',
        tempatLahir: '',
        tanggalLahir: '',
        username: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        kodeAkses: ''
    });

    const [loginData, setLoginData] = useState({
        identifier: '',
        password: ''
    });

    useEffect(() => {
        // Auto-redirect if already logged in
        const existingUser = localStorage.getItem('rqs_currentUser');
        if (existingUser) {
            router.push('/home');
            return;
        }

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await handleSupabaseSession(session);
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                if (session) {
                    await handleSupabaseSession(session);
                }
            });

            return () => subscription.unsubscribe();
        };

        checkSession();
        // Also fetch and sync users on load just in case
        syncUsersFromSupabase();
    }, []);

    const syncUsersFromSupabase = async () => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (data) {
            // Map to localStorage format so all other components using rqs_users don't break
            const formattedUsers = data.map(u => ({
                id: u.id,
                nama: u.nama,
                tempatLahir: u.tempat_lahir,
                tanggalLahir: u.tanggal_lahir,
                username: u.username,
                phone: u.phone,
                email: u.email,
                password: u.password,
                role: u.role,
                isGoogle: u.is_google,
                verified: u.verified
            }));
            localStorage.setItem('rqs_users', JSON.stringify(formattedUsers));
            return formattedUsers;
        }
        return JSON.parse(localStorage.getItem('rqs_users') || '[]');
    };

    const handleSupabaseSession = async (session) => {
        const email = session.user.email;
        const users = await syncUsersFromSupabase();
        const user = users.find(u => u.email === email);
        
        if (user) {
            if (user.role === 'tholibah' && user.verified === false) {
                alert("Akun Anda belum diverifikasi oleh Management RQS. Harap menunggu konfirmasi!");
                supabase.auth.signOut();
                return;
            }
            localStorage.setItem('rqs_currentUser', JSON.stringify(user));
            router.push('/home');
        } else {
            // User authenticated with Google but not in our Supabase DB yet
            setGoogleEmail(email);
            setIsGoogleRegister(true);
            setIsLogin(false);
            
            // Pre-fill name if available
            const fullName = session.user.user_metadata?.full_name || '';
            setFormData(prev => ({ ...prev, nama: prev.nama || fullName }));
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        
        if (!isGoogleRegister) {
            if (formData.password !== formData.confirmPassword) {
                return alert("Password dan Konfirmasi Password tidak cocok!");
            }
        }
        
        // Kode acak untuk management: 34t8wJOd
        if (registerType === 'management' && formData.kodeAkses !== '34t8wJOd') {
            return alert("Kode akses khusus management salah!");
        }
        
        const finalEmail = isGoogleRegister ? googleEmail : formData.email;
        
        // Sync to get latest users before checking if exists
        const users = await syncUsersFromSupabase();
        
        if (users.find(u => u.email === finalEmail || u.username === formData.username)) {
            return alert("Username atau Email sudah terdaftar!");
        }
        
        // Generate an ID for the new user, ideally Supabase UUID, but we use Date.now() for manual register to avoid needing a uuid generator on client
        let userId = Date.now().toString();
        if (isGoogleRegister) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                userId = session.user.id;
            }
        }
        
        const newUserToInsert = {
            id: userId,
            nama: formData.nama,
            tempat_lahir: formData.tempatLahir,
            tanggal_lahir: formData.tanggalLahir,
            username: formData.username,
            phone: formData.phone,
            email: finalEmail,
            password: formData.password, // Empty if Google
            role: registerType,
            is_google: isGoogleRegister,
            verified: registerType === 'management'
        };
        
        const { error } = await supabase.from('profiles').insert([newUserToInsert]);
        
        if (error) {
            console.error(error);
            return alert("Gagal mendaftar ke server Supabase. Pastikan tabel profiles sudah ada dan RLS dimatikan.");
        }
        
        // Sync local storage
        await syncUsersFromSupabase();
        
        const newUserForLocal = {
            id: userId,
            nama: formData.nama,
            tempatLahir: formData.tempatLahir,
            tanggalLahir: formData.tanggalLahir,
            username: formData.username,
            phone: formData.phone,
            email: finalEmail,
            password: formData.password,
            role: registerType,
            isGoogle: isGoogleRegister,
            verified: registerType === 'management'
        };
        
        if (registerType === 'tholibah') {
            alert("Pendaftaran berhasil! Akun Anda sedang dalam antrean verifikasi oleh Management RQS. Harap bersabar menunggu konfirmasi sebelum Anda bisa Login.");
            if (isGoogleRegister) {
                // Sign out of Supabase immediately so they don't get auto-logged in while unverified
                supabase.auth.signOut();
            }
            // Reset form and go to login
            setFormData({ nama: '', tempatLahir: '', tanggalLahir: '', username: '', phone: '', email: '', password: '', confirmPassword: '', kodeAkses: '' });
            setIsGoogleRegister(false);
            setIsLogin(true);
        } else {
            alert("Pendaftaran Management berhasil!");
            if (isGoogleRegister) {
                // If management registered via Google, auto-login immediately
                localStorage.setItem('rqs_currentUser', JSON.stringify(newUserForLocal));
                router.push('/home');
                return;
            } else {
                // Reset form and go to login for manual register
                setFormData({ nama: '', tempatLahir: '', tanggalLahir: '', username: '', phone: '', email: '', password: '', confirmPassword: '', kodeAkses: '' });
                setIsLogin(true);
            }
        }
    };

    const handleGoogleRegisterInit = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}`
            }
        });
        
        if (error) {
            console.error('Error saat register:', error.message);
            alert('Gagal mendaftar dengan Google');
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        
        // Update local users from Supabase before logging in to ensure cross-device sync
        const users = await syncUsersFromSupabase();
        const user = users.find(u => (u.email === loginData.identifier || u.username === loginData.identifier) && u.password === loginData.password);
        
        if (user) {
            if (user.role === 'tholibah' && user.verified === false) {
                return alert("Akun Anda belum diverifikasi oleh Management RQS. Harap menunggu konfirmasi!");
            }
            localStorage.setItem('rqs_currentUser', JSON.stringify(user));
            router.push('/home');
        } else {
            alert("Email/Username atau Password salah!");
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}`
            }
        });
        
        if (error) {
            console.error('Error saat login:', error.message);
            alert('Gagal login dengan Google');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto min-h-[100dvh] bg-[#FDFBF7] relative overflow-hidden flex flex-col font-sans shadow-2xl">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#B88A44]/15 rounded-bl-full -mr-10 -mt-10 blur-3xl pointer-events-none"></div>
            <div className="absolute top-32 left-0 w-56 h-56 bg-[#B88A44]/15 rounded-full -ml-20 blur-3xl pointer-events-none"></div>
            
            <div className="absolute top-0 right-0 opacity-[0.05] pointer-events-none w-80 h-80">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#4A1C14" strokeWidth="0.5">
                    <circle cx="100" cy="0" r="80" />
                    <circle cx="100" cy="0" r="60" />
                    <circle cx="100" cy="0" r="40" />
                    <path d="M20,0 L100,80 M40,0 L100,60 M60,0 L100,40 M0,20 L80,100" />
                    <path d="M100,0 L0,100 M100,20 L20,100 M100,40 L40,100" strokeDasharray="2,2" />
                </svg>
            </div>
            
            <div className="absolute bottom-0 left-0 opacity-[0.05] pointer-events-none w-80 h-80 rotate-180 transform origin-bottom-left">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#4A1C14" strokeWidth="0.5">
                    <circle cx="100" cy="0" r="80" />
                    <circle cx="100" cy="0" r="60" />
                    <circle cx="100" cy="0" r="40" />
                    <path d="M20,0 L100,80 M40,0 L100,60 M60,0 L100,40 M0,20 L80,100" />
                    <path d="M100,0 L0,100 M100,20 L20,100 M100,40 L40,100" strokeDasharray="2,2" />
                </svg>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto hide-scrollbar relative z-10 flex flex-col pt-12 px-7 pb-40">
                {/* Logo Section */}
                <div className="flex items-center justify-center gap-3 mb-8 mt-2 shrink-0">
                    <div className="w-16 h-16 shrink-0 bg-[#FCF7E8] rounded-xl border border-[#E8D2A6] p-1 shadow-sm flex items-center justify-center">
                        <img src="/logorqs.jpg" alt="Logo RQS" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[20px] sm:text-[22px] font-bold leading-tight text-[#4A1C14] tracking-tight">Rumah Qur&apos;an</h1>
                        <h1 className="text-[20px] sm:text-[22px] font-bold leading-tight text-[#B88A44] tracking-tight">Shobariyyah</h1>
                        <p className="text-[11px] text-[#4A1C14]/60 mt-0.5 font-medium">RQS Community App</p>
                    </div>
                </div>

                {/* Segmented Control */}
                <div className="bg-[#B88A44] rounded-full p-1.5 flex mb-6 relative shadow-sm shrink-0">
                    <motion.div 
                        className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#FCF7E8] rounded-full shadow-sm"
                        animate={{ left: isLogin ? "6px" : "calc(50%)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                    <button 
                        onClick={() => { setIsLogin(true); setIsGoogleRegister(false); }}
                        className={`flex-1 py-3 text-[14px] font-bold z-10 transition-colors ${isLogin ? 'text-[#4A1C14]' : 'text-[#FCF7E8]/90 hover:text-white'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 text-[14px] font-bold z-10 transition-colors ${!isLogin ? 'text-[#4A1C14]' : 'text-[#FCF7E8]/90 hover:text-white'}`}
                    >
                        Register
                    </button>
                </div>

                {/* Forms Container */}
                <div className="flex-1 flex flex-col">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div 
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col"
                            >
                                <form onSubmit={handleLoginSubmit}>
                                    <div className="space-y-4 mb-3">
                                        <div className="relative flex items-center">
                                            <PhosphorIcon icon="envelope-simple" size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B88A44]/70" />
                                            <input 
                                                required
                                                type="text" 
                                                value={loginData.identifier}
                                                onChange={e => setLoginData({...loginData, identifier: e.target.value})}
                                                placeholder="Username / Email" 
                                                className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 text-[#4A1C14] rounded-full py-4 pl-14 pr-4 text-[13.5px] font-medium focus:outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 transition-all placeholder:text-[#4A1C14]/40"
                                            />
                                        </div>

                                        <div className="relative flex items-center">
                                            <PhosphorIcon icon="lock-key" size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B88A44]/70 z-10" />
                                            <input 
                                                required
                                                type={showPassword ? "text" : "password"} 
                                                value={loginData.password}
                                                onChange={e => setLoginData({...loginData, password: e.target.value})}
                                                placeholder="Password" 
                                                className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 text-[#4A1C14] rounded-full py-4 pl-14 pr-12 text-[13.5px] font-medium focus:outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 transition-all placeholder:text-[#4A1C14]/40"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-[#B88A44] hover:text-[#4A1C14] transition-colors z-10"
                                            >
                                                <PhosphorIcon icon={showPassword ? "eye" : "eye-slash"} size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right mb-8">
                                        <a href="#" className="text-[12px] font-bold text-[#B88A44] hover:underline">Forgot Password?</a>
                                    </div>

                                    <button type="submit" className="w-full bg-[#4A1C14] text-[#FCF7E8] rounded-full py-4 text-center font-bold text-[15px] shadow-lg hover:bg-[#3A140E] active:scale-[0.98] transition-all mb-8 block border border-[#4A1C14]">
                                        Login
                                    </button>
                                </form>

                                <div className="flex items-center gap-4 mb-8 px-4">
                                    <div className="h-px bg-[#E8D2A6]/60 flex-1"></div>
                                    <span className="text-[12px] text-[#4A1C14]/50 font-bold uppercase tracking-wider">Or login with</span>
                                    <div className="h-px bg-[#E8D2A6]/60 flex-1"></div>
                                </div>

                                <button type="button" onClick={handleGoogleLogin} className="w-full bg-white border border-[#E8D2A6] text-[#4A1C14] rounded-full py-3.5 flex items-center justify-center gap-3 font-bold text-[14px] shadow-sm hover:bg-[#FCF7E8] active:scale-[0.98] transition-all">
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                    Login with Google
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="register"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col"
                            >
                                {isGoogleRegister && (
                                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl mb-6 text-xs font-bold flex items-center gap-2">
                                        <PhosphorIcon icon="check-circle" size={18} weight="fill" />
                                        Lengkapi data di bawah untuk menyelesaikan pendaftaran Google Anda.
                                    </div>
                                )}

                                <form onSubmit={handleRegisterSubmit}>
                                    <div className="space-y-3 mb-8">
                                        <div className="flex gap-2 mb-2">
                                            <button 
                                                type="button"
                                                onClick={() => setRegisterType('tholibah')} 
                                                className={`flex-1 py-3 rounded-2xl text-[13px] font-bold border transition-colors flex justify-center items-center gap-2 ${registerType === 'tholibah' ? 'bg-[#4A1C14] text-white border-[#4A1C14] shadow-md' : 'bg-[#FCF7E8] text-[#4A1C14] border-[#E8D2A6]'}`}
                                            >
                                                <PhosphorIcon icon="student" size={18} weight={registerType === 'tholibah' ? 'fill' : 'regular'} />
                                                Tholibah
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setRegisterType('management')} 
                                                className={`flex-1 py-3 rounded-2xl text-[13px] font-bold border transition-colors flex justify-center items-center gap-2 ${registerType === 'management' ? 'bg-[#4A1C14] text-white border-[#4A1C14] shadow-md' : 'bg-[#FCF7E8] text-[#4A1C14] border-[#E8D2A6]'}`}
                                            >
                                                <PhosphorIcon icon="briefcase" size={18} weight={registerType === 'management' ? 'fill' : 'regular'} />
                                                Management
                                            </button>
                                        </div>

                                        {/* Common Inputs */}
                                        <div className="relative flex items-center">
                                            <PhosphorIcon icon="user" size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B88A44]/70" />
                                            <input required type="text" placeholder="Nama Lengkap" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 text-[#4A1C14] rounded-full py-3.5 pl-14 pr-4 text-[13px] font-medium focus:outline-none focus:border-[#B88A44] focus:ring-1 focus:ring-[#B88A44]/20 transition-all placeholder:text-[#4A1C14]/40" />
                                        </div>

                                        <div className="relative flex items-center">
                                            <PhosphorIcon icon="map-pin" size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B88A44]/70" />
                                            <input required type="text" placeholder="Tempat Lahir" value={formData.tempatLahir} onChange={e => setFormData({...formData, tempatLahir: e.target.value})} className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 text-[#4A1C14] rounded-full py-3.5 pl-14 pr-4 text-[13px] font-medium focus:outline-none focus:border-[#B88A44] focus:ring-1 focus:ring-[#B88A44]/20 transition-all placeholder:text-[#4A1C14]/40" />
                                        </div>

                                        <div className="relative flex items-center">
                                            <PhosphorIcon icon="calendar-blank" size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B88A44]/70" />
                                            <input required type="date" value={formData.tanggalLahir} onChange={e => setFormData({...formData, tanggalLahir: e.target.value})} className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 text-[#4A1C14] rounded-full py-3.5 pl-14 pr-4 text-[13px] font-medium focus:outline-none focus:border-[#B88A44] focus:ring-1 focus:ring-[#B88A44]/20 transition-all text-[#4A1C14]/70 uppercase" />
                                        </div>

                                        <div className="relative flex items-center">
                                            <PhosphorIcon icon="at" size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B88A44]/70" />
                                            <input required type="text" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 text-[#4A1C14] rounded-full py-3.5 pl-14 pr-4 text-[13px] font-medium focus:outline-none focus:border-[#B88A44] focus:ring-1 focus:ring-[#B88A44]/20 transition-all placeholder:text-[#4A1C14]/40" />
                                        </div>

                                        <div className="relative flex items-center">
                                            <PhosphorIcon icon="phone" size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B88A44]/70" />
                                            <input required type="tel" placeholder="Nomor HP" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 text-[#4A1C14] rounded-full py-3.5 pl-14 pr-4 text-[13px] font-medium focus:outline-none focus:border-[#B88A44] focus:ring-1 focus:ring-[#B88A44]/20 transition-all placeholder:text-[#4A1C14]/40" />
                                        </div>

                                        {/* Hidden if Google Register */}
                                        {!isGoogleRegister && (
                                            <>
                                                <div className="relative flex items-center">
                                                    <PhosphorIcon icon="envelope-simple" size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B88A44]/70" />
                                                    <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 text-[#4A1C14] rounded-full py-3.5 pl-14 pr-4 text-[13px] font-medium focus:outline-none focus:border-[#B88A44] focus:ring-1 focus:ring-[#B88A44]/20 transition-all placeholder:text-[#4A1C14]/40" />
                                                </div>
                                                <div className="relative flex items-center">
                                                    <PhosphorIcon icon="lock-key" size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B88A44]/70 z-10" />
                                                    <input required type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 text-[#4A1C14] rounded-full py-3.5 pl-14 pr-12 text-[13px] font-medium focus:outline-none focus:border-[#B88A44] focus:ring-1 focus:ring-[#B88A44]/20 transition-all placeholder:text-[#4A1C14]/40" />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-[#B88A44] hover:text-[#4A1C14] transition-colors z-10">
                                                        <PhosphorIcon icon={showPassword ? "eye" : "eye-slash"} size={18} />
                                                    </button>
                                                </div>
                                                <div className="relative flex items-center">
                                                    <PhosphorIcon icon="lock-key" size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B88A44]/70 z-10" />
                                                    <input required type={showConfirmPassword ? "text" : "password"} placeholder="Konfirmasi Password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 text-[#4A1C14] rounded-full py-3.5 pl-14 pr-12 text-[13px] font-medium focus:outline-none focus:border-[#B88A44] focus:ring-1 focus:ring-[#B88A44]/20 transition-all placeholder:text-[#4A1C14]/40" />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-[#B88A44] hover:text-[#4A1C14] transition-colors z-10">
                                                        <PhosphorIcon icon={showConfirmPassword ? "eye" : "eye-slash"} size={18} />
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        <AnimatePresence>
                                            {registerType === 'management' && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    className="relative flex items-center overflow-hidden"
                                                >
                                                    <PhosphorIcon icon="key" size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500/80 z-10" />
                                                    <input required type={showKodeAkses ? "text" : "password"} placeholder="Kode Akses Rahasia" value={formData.kodeAkses} onChange={e => setFormData({...formData, kodeAkses: e.target.value})} className="w-full bg-rose-50 border border-rose-200 text-[#4A1C14] rounded-full py-3.5 pl-14 pr-12 text-[13px] font-medium focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20 transition-all placeholder:text-rose-800/50" />
                                                    <button type="button" onClick={() => setShowKodeAkses(!showKodeAkses)} className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-rose-500/80 hover:text-rose-700 transition-colors z-10">
                                                        <PhosphorIcon icon={showKodeAkses ? "eye" : "eye-slash"} size={18} />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {isGoogleRegister ? (
                                        <div className="flex gap-2 mb-6">
                                            <button 
                                                type="button" 
                                                onClick={async () => {
                                                    await supabase.auth.signOut();
                                                    setIsGoogleRegister(false);
                                                    setIsLogin(true);
                                                }} 
                                                className="w-1/3 bg-white text-[#4A1C14] border border-[#E8D2A6] rounded-full py-4 text-center font-bold text-[13px] shadow-sm hover:bg-[#FCF7E8] transition-all"
                                            >
                                                Batalkan
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="w-2/3 bg-[#4A1C14] text-[#FCF7E8] rounded-full py-4 text-center font-bold text-[14px] shadow-lg hover:bg-[#3A140E] active:scale-[0.98] transition-all border border-[#4A1C14]"
                                            >
                                                Selesaikan
                                            </button>
                                        </div>
                                    ) : (
                                        <button type="submit" className="w-full bg-[#4A1C14] text-[#FCF7E8] rounded-full py-4 text-center font-bold text-[15px] shadow-lg hover:bg-[#3A140E] active:scale-[0.98] transition-all mb-6 block border border-[#4A1C14]">
                                            Register Sekarang
                                        </button>
                                    )}
                                </form>

                                {!isGoogleRegister && (
                                    <>
                                        <div className="flex items-center gap-4 mb-6 px-4">
                                            <div className="h-px bg-[#E8D2A6]/60 flex-1"></div>
                                            <span className="text-[12px] text-[#4A1C14]/50 font-bold uppercase tracking-wider">Or register with</span>
                                            <div className="h-px bg-[#E8D2A6]/60 flex-1"></div>
                                        </div>

                                        <button type="button" onClick={handleGoogleRegisterInit} className="w-full bg-white border border-[#E8D2A6] text-[#4A1C14] rounded-full py-3.5 flex items-center justify-center gap-3 font-bold text-[14px] shadow-sm hover:bg-[#FCF7E8] active:scale-[0.98] transition-all mb-8">
                                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                            Register with Google
                                        </button>
                                    </>
                                )}

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Wavy Background Graphic */}
            <div className="absolute bottom-0 left-0 right-0 h-40 w-full overflow-hidden shrink-0 pointer-events-none z-0">
                <div className="absolute bottom-0 w-full h-full">
                    {/* Background wave (Gold) */}
                    <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-[#B88A44]/30" fill="currentColor" preserveAspectRatio="none" style={{height: '100%'}}>
                        <path d="M0,256L48,245.3C96,235,192,213,288,218.7C384,224,480,256,576,256C672,256,768,224,864,197.3C960,171,1056,149,1152,144C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    {/* Main wave (Brown) */}
                    <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-[#4A1C14]" fill="currentColor" preserveAspectRatio="none" style={{height: '85%'}}>
                        <path d="M0,224L48,229.3C96,235,192,245,288,229.3C384,213,480,171,576,165.3C672,160,768,192,864,208C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    {/* Darker bottom accent wave (Darker Brown) */}
                    <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-[#3A140E]" fill="currentColor" preserveAspectRatio="none" style={{height: '40%'}}>
                        <path d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,250.7C672,267,768,277,864,261.3C960,245,1056,203,1152,192C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </div>

            {/* Bottom Navigation Icons & Floating Icon */}
            <div className="absolute bottom-0 left-0 right-0 h-40 w-full shrink-0 pointer-events-none z-20">
                <div className="absolute bottom-4 left-0 right-0 h-16 flex justify-between items-center px-16 z-10 pointer-events-auto">
                    <button className="text-[#B88A44] flex flex-col items-center hover:scale-110 transition-transform">
                        <PhosphorIcon icon="house" size={24} weight="fill" />
                        <span className="w-1.5 h-1.5 bg-[#B88A44] rounded-full mt-1"></span>
                    </button>
                    
                    <button className="text-[#E8D2A6]/60 hover:text-[#FCF7E8] flex flex-col items-center hover:scale-110 transition-transform mb-1">
                        <PhosphorIcon icon="user" size={24} weight="fill" />
                    </button>
                </div>

                {/* Floating Center Icon (Quran Book) */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center z-20 pointer-events-auto">
                    <div className="relative w-[72px] h-[72px]">
                        <div className="absolute inset-0 bg-[#B88A44] rounded-[24px] rotate-[15deg] opacity-20"></div>
                        <div className="absolute inset-0 bg-[#FCF7E8] rounded-[22px] shadow-xl flex items-center justify-center transform border-2 border-[#E8D2A6] rotate-[5deg] hover:rotate-0 transition-transform duration-300 cursor-pointer">
                            <PhosphorIcon icon="book-open-text" size={36} weight="duotone" className="text-[#4A1C14]" />
                        </div>
                    </div>
                </div>
        </div>
        </div>
    );
}
