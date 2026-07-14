import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const Navbar = ({ notifications = [], currentUser, setActiveTab }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    return (
        <div className="flex justify-between items-center p-5 bg-[#FDFBF7] sticky top-0 z-40 shadow-sm border-b border-[#E8D2A6]/30">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FCF7E8] rounded-xl border border-[#E8D2A6] flex items-center justify-center overflow-hidden shadow-sm">
                    <img src="/logorqs.jpg" alt="Logo RQS" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-xl font-serif font-bold text-[#4A1C14] leading-tight">RQS</h1>
                    <p className="text-[9px] text-[#B88A44] font-bold tracking-wider uppercase">Rumah Quran Sobariah</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative">
                    <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 bg-white rounded-full text-[#4A1C14] relative flex items-center justify-center shadow-sm border border-[#E8D2A6]/50">
                        <PhosphorIcon icon="bell" size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                        )}
                    </button>
                    
                    <AnimatePresence>
                        {isNotifOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8D2A6]/50 py-2 z-50 origin-top-right"
                            >
                                <h3 className="px-4 py-2 font-bold text-[#4A1C14] text-xs border-b border-[#E8D2A6]/30 flex items-center gap-2">
                                    <PhosphorIcon icon="bell" weight="fill" className="text-[#B88A44]" /> Notifikasi
                                </h3>
                                <div className="max-h-[200px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif, idx) => (
                                            <div key={idx} className="px-4 py-3 text-[11px] text-[#4A1C14] border-b border-gray-100 last:border-0 hover:bg-[#FCF7E8] transition-colors flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#B88A44] mt-1.5 shrink-0"></div>
                                                <span className="leading-tight font-medium">{notif}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-4 text-xs text-[#4A1C14]/60 text-center italic">Belum ada pemberitahuan baru.</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 bg-[#FCF7E8] p-1 pr-3 rounded-full border border-[#E8D2A6]"
                    >
                        <div className="w-8 h-8 bg-[#B88A44] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner uppercase">
                            {currentUser?.nama?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-medium text-[#4A1C14] block">
                            {currentUser?.nama?.split(' ')[0] || 'User'}
                        </span>
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E8D2A6]/50 py-2 z-50 origin-top-right"
                            >
                                <button onClick={() => { setActiveTab('pengaturan-profil'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[#4A1C14] hover:bg-[#FCF7E8] flex items-center gap-3 transition-colors">
                                    <PhosphorIcon icon="gear" size={18} className="text-[#B88A44]" /> Pengaturan Profil
                                </button>
                                <button onClick={() => { setActiveTab('riwayat-absensi'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[#4A1C14] hover:bg-[#FCF7E8] flex items-center gap-3 transition-colors">
                                    <PhosphorIcon icon="clock" size={18} className="text-[#B88A44]" /> Riwayat Absensi
                                </button>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button 
                                    onClick={async () => {
                                        await supabase.auth.signOut();
                                        localStorage.removeItem('rqs_currentUser');
                                        window.location.href = '/';
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                >
                                    <PhosphorIcon icon="sign-out" size={18} /> Keluar Akun
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
