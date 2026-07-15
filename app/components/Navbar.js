import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const Navbar = ({ notifications = [], currentUser, setActiveTab }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [globalNotifs, setGlobalNotifs] = useState([]);

    useEffect(() => {
        const fetchGlobalNotifs = async () => {
            try {
                let notifs = [];
                const limit = 3;

                // 1. Setoran Hafalan
                const { data: setoran } = await supabase.from('rqs_setoran').select('student_name, surah, created_at').order('created_at', { ascending: false }).limit(limit);
                if (setoran) setoran.forEach(s => notifs.push({ time: new Date(s.created_at).getTime(), text: `${s.student_name} telah menyetorkan hafalan surah ${s.surah}` }));

                // 2. Pengumuman
                const { data: pengumuman } = await supabase.from('pengumuman').select('judul, created_at').order('created_at', { ascending: false }).limit(limit);
                if (pengumuman) pengumuman.forEach(p => notifs.push({ time: new Date(p.created_at).getTime(), text: `Pengumuman: ${p.judul}` }));

                // 3. Artikel
                const { data: artikel } = await supabase.from('rqs_artikel').select('title, created_at').order('created_at', { ascending: false }).limit(limit);
                if (artikel) artikel.forEach(a => notifs.push({ time: new Date(a.created_at).getTime(), text: `Artikel baru: ${a.title}` }));

                // 4. Renungan
                const { data: renungan } = await supabase.from('rqs_renungan').select('title, created_at').order('created_at', { ascending: false }).limit(limit);
                if (renungan) renungan.forEach(r => notifs.push({ time: new Date(r.created_at).getTime(), text: `Renungan baru: ${r.title}` }));

                // 5. Jadwal Kelas
                const { data: kelas } = await supabase.from('rqs_classes').select('name, created_at').order('created_at', { ascending: false }).limit(limit);
                if (kelas) kelas.forEach(k => notifs.push({ time: new Date(k.created_at).getTime(), text: `Kelas baru: ${k.name}` }));

                // 6. Akun Baru (Profiles)
                const { data: profiles } = await supabase.from('profiles').select('nama, created_at').order('created_at', { ascending: false }).limit(limit);
                if (profiles) profiles.forEach(p => notifs.push({ time: new Date(p.created_at).getTime(), text: `Ahlan wa sahlan, ${p.nama} baru bergabung!` }));

                // Sort by time desc
                notifs.sort((a, b) => b.time - a.time);
                
                // Get top 15 text only
                setGlobalNotifs(notifs.slice(0, 15).map(n => n.text));
            } catch (err) {
                console.error("Error fetching global notifs:", err);
            }
        };

        fetchGlobalNotifs();
    }, []);

    const allNotifications = [...(notifications || []), ...globalNotifs];

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
                        {allNotifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                        )}
                    </button>
                    
                    <AnimatePresence>
                        {isNotifOpen && (
                            <>
                                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsNotifOpen(false)}></div>
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8D2A6]/50 py-2 z-50 origin-top-right"
                                >
                                <h3 className="px-4 py-2 font-bold text-[#4A1C14] text-xs border-b border-[#E8D2A6]/30 flex items-center gap-2">
                                    <PhosphorIcon icon="bell" weight="fill" className="text-[#B88A44]" /> Notifikasi
                                </h3>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {allNotifications.length > 0 ? (
                                        allNotifications.map((notif, idx) => (
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
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 bg-[#FCF7E8] p-1 pr-3 rounded-full border border-[#E8D2A6]"
                    >
                        {currentUser?.avatarData ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden shadow-inner border border-[#E8D2A6]">
                                <img src={currentUser.avatarData} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 bg-[#B88A44] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner uppercase">
                                {currentUser?.nama?.charAt(0) || 'U'}
                            </div>
                        )}
                        <span className="text-sm font-medium text-[#4A1C14] block">
                            {currentUser?.nama?.split(' ')[0] || 'User'}
                        </span>
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
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
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
