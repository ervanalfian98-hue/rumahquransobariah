import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { PRAYER_TIMES, CLASSES, QUICK_MENU, CATEGORY_GROUPS } from './MockData';
import Navbar from './Navbar';
import JadwalSholat from './JadwalSholat';
import { supabase } from '../lib/supabaseClient';

const BerandaScreen = ({ setActiveTab, currentUser }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [dzikirType, setDzikirType] = useState('pagi');
    const [showPopup, setShowPopup] = useState(false);
    const audioRef = useRef(null);

    // Menu Cepat Settings
    const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.items);
    const [pinnedMenus, setPinnedMenus] = useState([]);
    const [isMenuSettingsOpen, setIsMenuSettingsOpen] = useState(false);
    const [tempPinned, setTempPinned] = useState([]);
    const quickMenuRef = useRef(null);

    // Animasi geser otomatis Menu Cepat (kanan ke kiri)
    useEffect(() => {
        let isMounted = true;
        
        const runAnimation = () => {
            if (quickMenuRef.current && isMounted) {
                // Hapus class smooth sementara agar scroll awal instan
                quickMenuRef.current.classList.remove('scroll-smooth');
                // Scroll ke paling ujung kanan
                quickMenuRef.current.scrollLeft = quickMenuRef.current.scrollWidth;
                
                // Tambahkan delay sedikit untuk memastikan render selesai, baru animasikan ke kiri
                setTimeout(() => {
                    if (quickMenuRef.current && isMounted) {
                        quickMenuRef.current.classList.add('scroll-smooth');
                        quickMenuRef.current.scrollTo({
                            left: 0,
                            behavior: 'smooth'
                        });
                    }
                }, 500);
            }
        };

        // Kasih waktu bagi DOM untuk merender elemen agar scrollWidth akurat
        setTimeout(runAnimation, 150);

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        const storageKey = `rqs_pinned_menus_${currentUser.username || currentUser.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            setPinnedMenus(JSON.parse(saved));
        } else {
            setPinnedMenus(QUICK_MENU.map(m => m.name));
        }
    }, [currentUser]);

    const displayedMenus = ALL_CATEGORIES.filter(item => pinnedMenus.includes(item.name));
    
    // Sort displayed menus so they match the order in pinnedMenus array
    displayedMenus.sort((a, b) => pinnedMenus.indexOf(a.name) - pinnedMenus.indexOf(b.name));

    const handleSaveMenuSettings = () => {
        if (!currentUser) return;
        const storageKey = `rqs_pinned_menus_${currentUser.username || currentUser.id}`;
        setPinnedMenus(tempPinned);
        localStorage.setItem(storageKey, JSON.stringify(tempPinned));
        setIsMenuSettingsOpen(false);
    };

    const togglePinMenu = (menuName) => {
        setTempPinned(prev => 
            prev.includes(menuName) 
                ? prev.filter(n => n !== menuName)
                : [...prev, menuName]
        );
    };

    // Helper untuk Kalender Widget
    const getHijriDate = (date) => {
        try {
            const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            const parts = formatter.formatToParts(date);
            const dayStr = parts.find(p => p.type === 'day')?.value || '1';
            const day = parseInt(dayStr.replace(/[^0-9]/g, '')) || 1;
            const month = parts.find(p => p.type === 'month')?.value || '';
            const year = parts.find(p => p.type === 'year')?.value || '';
            return { day, month, year: year.replace(/[^0-9]/g, '') };
        } catch (e) {
            return { day: 1, month: 'Muharram', year: '1446' };
        }
    };

    const isFastingDay = (date, hijriDay) => {
        const dayOfWeek = date.getDay();
        const types = [];
        if (dayOfWeek === 1 || dayOfWeek === 4) types.push('Senin Kamis');
        if (hijriDay === 13 || hijriDay === 14 || hijriDay === 15) types.push('Ayyamul Bidh');
        return types;
    };

    const today = new Date();
    const hijriToday = getHijriDate(today);
    const fastingToday = isFastingDay(today, hijriToday.day);

    // Tentang RQS Data States
    const defaultTentangData = {
        visi: "Menjadi lembaga pendidikan Al-Qur'an terdepan yang mencetak generasi Qur'ani, berakhlak mulia, dan berdaya guna bagi umat.",
        misi: "Menyelenggarakan pembelajaran Al-Qur'an yang sistematis dan mudah dipahami.\nMembentuk karakter Tholibah yang sesuai dengan nilai-nilai Islam.\nMemberdayakan potensi Tholibah untuk kemanfaatan sosial.",
        latarBelakang: "Rumah Quran Sobariah (RQS) didirikan atas dasar kepedulian terhadap pentingnya membumikan Al-Qur'an di tengah masyarakat modern. Kami hadir sebagai wadah yang nyaman, profesional, dan bersahabat bagi siapa saja yang ingin memperbaiki bacaan, menghafal, dan memahami isi kandungan Al-Qur'an, dari tingkat pemula hingga lanjutan.",
        budaya: "Disiplin, Sinergi, Istiqomah, Ikhlas, Berdaya"
    };

    const [tentangData, setTentangData] = useState(defaultTentangData);
    const [galeriData, setGaleriData] = useState([]);
    const [pengumumanData, setPengumumanData] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAllPengumuman, setShowAllPengumuman] = useState(false);

    const loadTentangData = () => {
        const savedData = localStorage.getItem('rqs_tentang_content');
        if (savedData) {
            setTentangData(JSON.parse(savedData));
        }
    };

    const loadGaleriData = async () => {
        const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL';
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.from('galeri_dokumentasi').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                setGaleriData(data || []);
            } catch (error) {
                console.error("Supabase error:", error);
            }
        } else {
            const localData = JSON.parse(localStorage.getItem('dummy_galeri') || '[]');
            setGaleriData(localData);
        }
    };

    const loadPengumumanData = async () => {
        const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL';
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.from('pengumuman').select('*').order('tanggal', { ascending: false }).order('created_at', { ascending: false });
                if (error) throw error;
                setPengumumanData(data || []);
            } catch (error) {
                console.error("Supabase error:", error);
            }
        } else {
            const localData = JSON.parse(localStorage.getItem('dummy_pengumuman') || '[]');
            setPengumumanData(localData);
        }
    };

    useEffect(() => {
        loadTentangData();
        loadGaleriData();
        loadPengumumanData();
        window.addEventListener('rqs-content-updated', loadTentangData);
        window.addEventListener('rqs-galeri-updated', loadGaleriData);
        window.addEventListener('rqs-pengumuman-updated', loadPengumumanData);
        return () => {
            window.removeEventListener('rqs-content-updated', loadTentangData);
            window.removeEventListener('rqs-galeri-updated', loadGaleriData);
            window.removeEventListener('rqs-pengumuman-updated', loadPengumumanData);
        };
    }, []);

    useEffect(() => {
        const hour = new Date().getHours();
        const type = (hour >= 3 && hour < 15) ? 'pagi' : 'petang';
        setDzikirType(type);
        
        const dateStr = new Date().toISOString().split('T')[0];
        const storageKey = `dzikir_selesai_${dateStr}_${type}`;
        
        if (!localStorage.getItem(storageKey)) {
            setShowPopup(true);
        } else {
            setShowPopup(false);
        }
    }, []);

    const handleDzikirEnded = () => {
        const text = dzikirType === 'pagi' ? 'Telah selesai Dzikir Pagi' : 'Telah selesai Dzikir Petang';
        if (!notifications.includes(text)) {
            setNotifications(prev => [text, ...prev]);
        }
        
        const dateStr = new Date().toISOString().split('T')[0];
        localStorage.setItem(`dzikir_selesai_${dateStr}_${dzikirType}`, 'true');
        setShowPopup(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="pb-24 animate-in fade-in duration-500 bg-[#FDFBF7]">
            <Navbar setActiveTab={setActiveTab} notifications={notifications} currentUser={currentUser} />

            <JadwalSholat setActiveTab={setActiveTab} />



            {/* Menu Cepat (Horizontal Scroll) dengan Vektor Warna */}
            <div className="mt-6 px-5">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-[#4A1C14]">Menu Cepat</h3>
                    <button onClick={() => setActiveTab('kategori')} className="text-xs text-[#B88A44] font-bold flex items-center gap-1 hover:text-[#4A1C14] transition-colors">
                        Lihat Semua Kategori <PhosphorIcon icon="caret-right" weight="bold" size={14} />
                    </button>
                </div>
                <div ref={quickMenuRef} className="flex overflow-x-auto gap-3 pb-3 pt-1 px-1 -mx-1 hide-scrollbar snap-x scroll-smooth">
                    {displayedMenus.map((menu, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                const routeMap = {
                                    'Iqra': 'iqra',
                                    'Kalender': 'kalender',
                                    'Kiblat': 'kiblat',
                                    'Hadist': 'hadist',
                                    'Zakat': 'zakat',
                                    'Merchandise': 'merchandise',
                                    'Adzan': 'adzan',
                                    'Susunan Kepengurusan': 'kepengurusan',
                                    'RQS Berdaya': 'rqs-berdaya',
                                    'Herbal': 'rqs-herbal',
                                    'MLP': 'rqs-mlp',
                                    'Asbabun Nuzul': 'asbabun-nuzul',
                                    'Tafsir': 'tafsir',
                                    'Bacaan Sholat': 'bacaan-sholat',
                                    'Tasbih': 'tasbih',
                                    'Sirah Nabi': 'sirah-nabi',
                                    'Asmaul Husna': 'asmaul-husna',
                                    'Kisah 25 Nabi': 'kisah-25-nabi',
                                    'Amal': 'amal',
                                    'Dzikir': 'dzikir',
                                    'Artikel': 'artikel',
                                    'Renungan': 'renungan',
                                    'Doa': 'doa',
                                    'Pengajar': 'pengajar',
                                    'Tamyiz': 'tamyiz',
                                    'Sosial Media': 'sosmed',
                                    'Donasi': 'donasi',
                                    'Qurban': 'qurban'
                                };
                                
                                if (routeMap[menu.name]) {
                                    setActiveTab(routeMap[menu.name]);
                                } else {
                                    setActiveTab('kategori');
                                }
                            }}
                            className="snap-start flex flex-col items-center justify-center min-w-[75px] h-[85px] bg-white rounded-2xl shadow-sm border border-[#E8D2A6]/50 cursor-pointer"
                        >
                            <div className={`mb-1.5 flex items-center justify-center w-11 h-11 rounded-[14px] ${menu.bg} ${menu.color}`}>
                                {menu.isText ? (
                                    <span className="font-serif font-bold text-xl leading-none">Al</span>
                                ) : (
                                    <PhosphorIcon icon={menu.icon} size={26} />
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-[#4A1C14] text-center leading-tight">{menu.name}</span>
                        </motion.div>
                    ))}
                    {/* Tombol Pengaturan Cepat */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setTempPinned([...pinnedMenus]);
                            setIsMenuSettingsOpen(true);
                        }}
                        className="snap-start flex flex-col items-center justify-center min-w-[75px] h-[85px] bg-[#FCF7E8] rounded-2xl shadow-sm border border-[#E8D2A6] cursor-pointer"
                    >
                        <div className="text-[#4A1C14] mb-1.5 bg-white w-11 h-11 rounded-[14px] shadow-sm flex items-center justify-center">
                            <PhosphorIcon icon="faders" size={24} weight="fill" />
                        </div>
                        <span className="text-[10px] font-bold text-[#4A1C14] text-center leading-tight">Pengaturan</span>
                    </motion.div>
                </div>
            </div>

            {/* Pemutar Audio Dzikir */}
            <div className="px-5 mt-6 relative">
                <AnimatePresence>
                    {showPopup && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: -10, x: "-50%" }}
                            className="absolute -top-3 left-1/2 bg-[#B88A44] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg z-20 flex items-center gap-1.5 whitespace-nowrap"
                        >
                            <PhosphorIcon icon="info" weight="fill" size={14} />
                            Jangan lupa dzikir {dzikirType}!
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-white rounded-[1.25rem] p-4 shadow-sm border border-[#E8D2A6]/50 flex flex-col relative overflow-hidden">
                    <PhosphorIcon icon="music-notes" size={80} weight="fill" className="absolute -right-4 -bottom-4 text-[#FCF7E8] opacity-60 z-0 pointer-events-none" />
                    
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#B88A44] to-[#A37936] rounded-[14px] shadow-sm flex items-center justify-center shrink-0 text-white relative overflow-hidden">
                            <PhosphorIcon icon="headphones" size={26} weight="fill" className="relative z-10" />
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                        <div className="flex-1 pr-2">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="bg-[#FCF7E8] text-[#B88A44] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest border border-[#E8D2A6]">Audio</span>
                            </div>
                            <h3 className="font-bold text-[#4A1C14] text-[13px] leading-tight mb-0.5 capitalize">Dzikir {dzikirType}</h3>
                            <p className="text-[10px] text-[#4A1C14]/60 font-bold">Ust. Hanan Attaki</p>
                        </div>
                    </div>
                    
                    <div className="w-full relative z-10 bg-[#FCF7E8] rounded-full p-1 border border-[#E8D2A6]/50 shadow-inner">
                        <audio 
                            ref={audioRef}
                            controls 
                            controlsList="nodownload"
                            onContextMenu={(e) => e.preventDefault()}
                            className="w-full h-10 outline-none" 
                            style={{ opacity: 0.9 }}
                            onEnded={handleDzikirEnded}
                            key={dzikirType}
                        >
                            <source src={`/dzikir${dzikirType}.mp3`} type="audio/mpeg" />
                            Browser Anda tidak mendukung pemutar audio ini.
                        </audio>
                    </div>
                </div>
            </div>

            {/* Papan Pengumuman */}
            <div className="px-5 mt-6">
                <div className="bg-gradient-to-r from-[#B88A44] to-[#A37936] rounded-2xl p-4 shadow-md flex items-center justify-between relative overflow-hidden">
                    <PhosphorIcon icon="megaphone" weight="fill" size={64} className="absolute -left-4 -bottom-4 text-white opacity-10" />
                    <div className="flex items-center gap-3 relative z-10 w-full pr-3">
                        <div className="bg-white/20 p-2 rounded-xl shrink-0">
                            <PhosphorIcon icon="bell-ringing" weight="fill" size={20} className="text-white animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Info Terbaru</span>
                                <span className="text-[9px] text-[#FCF7E8] font-medium">{pengumumanData.length > 0 ? pengumumanData[0].tanggal : 'Hari ini'}</span>
                            </div>
                            <p className="text-white text-[11px] font-bold leading-tight line-clamp-2">
                                {pengumumanData.length > 0 ? pengumumanData[0].judul : 'Belum ada pengumuman terbaru.'}
                            </p>
                            {pengumumanData.length > 0 && pengumumanData[0].isi && (
                                <p className="text-white/90 text-[10px] leading-snug mt-1 line-clamp-2">
                                    {pengumumanData[0].isi}
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={() => setShowAllPengumuman(true)} className="shrink-0 bg-white text-[#4A1C14] text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 hover:bg-[#FCF7E8] transition-colors">
                        Lainnya <PhosphorIcon icon="caret-right" size={12} weight="bold" />
                    </button>
                </div>
            </div>

            {/* Konten Animasi Interaktif */}
            <motion.div
                className="px-5 mt-8 space-y-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
            >
                <h3 className="font-bold text-[#4A1C14] mb-2 text-lg border-b-2 border-[#B88A44] inline-block pb-1">Tentang RQS</h3>

                {/* Visi Misi */}
                <motion.div variants={itemVariants} className="bg-white p-5 rounded-3xl border border-[#E8D2A6] shadow-sm relative overflow-hidden">
                    <PhosphorIcon icon="quotes" size={80} weight="fill" className="absolute -right-4 -top-4 text-[#FCF7E8] opacity-80 z-0" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-[#B88A44] text-white p-2.5 rounded-xl shadow-sm">
                                <PhosphorIcon icon="target" size={24} weight="fill" />
                            </div>
                            <h4 className="font-bold text-[#4A1C14] text-lg">Visi & Misi</h4>
                        </div>
                        <div className="mb-5">
                            <span className="text-[10px] font-bold text-[#B88A44] uppercase tracking-wider block mb-1">Visi</span>
                            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} viewport={{ once: true }} className="text-[13px] font-medium text-[#4A1C14] leading-relaxed italic">
                                &quot;{tentangData.visi}&quot;
                            </motion.p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-[#B88A44] uppercase tracking-wider block mb-1.5">Misi</span>
                            <ul className="text-[11.5px] text-[#4A1C14]/80 space-y-2.5 list-none">
                                {tentangData.misi.split('\n').filter(m => m.trim() !== '').map((misi, i) => (
                                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }} viewport={{ once: true }} className="flex items-start gap-2">
                                        <PhosphorIcon icon="check-circle" size={16} weight="fill" className="text-[#B88A44] shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">{misi}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Latar Belakang */}
                <motion.div variants={itemVariants} className="bg-[#FCF7E8] p-5 rounded-3xl border border-[#E8D2A6] shadow-sm relative overflow-hidden">
                    <PhosphorIcon icon="mosque" size={100} weight="fill" className="absolute -right-6 -bottom-6 text-[#B88A44] opacity-10 z-0" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-[#4A1C14] text-white p-2.5 rounded-xl shadow-sm">
                                <PhosphorIcon icon="history" size={24} weight="fill" />
                            </div>
                            <h4 className="font-bold text-[#4A1C14] text-lg">Latar Belakang</h4>
                        </div>
                        <motion.p initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }} viewport={{ once: true }} className="text-[11.5px] text-[#4A1C14]/80 leading-relaxed text-justify">
                            {tentangData.latarBelakang}
                        </motion.p>
                    </div>
                </motion.div>

                {/* Budaya RQS */}
                <motion.div variants={itemVariants} className="bg-[#FCF7E8] p-5 rounded-3xl border border-[#E8D2A6] shadow-inner relative overflow-hidden">
                    <PhosphorIcon icon="drop" size={100} weight="fill" className="absolute -right-5 -top-5 text-[#B88A44] opacity-5 transform rotate-45" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <PhosphorIcon icon="shield-check" size={24} weight="duotone" className="text-[#4A1C14]" />
                        <h4 className="font-bold text-[#4A1C14] text-base">Budaya RQS</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 relative z-10">
                        {tentangData.budaya.split(',').map(b => b.trim()).filter(b => b !== '').map((kata, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15, type: "spring", stiffness: 200 }} whileHover={{ scale: 1.1, backgroundColor: "#4A1C14", color: "#FFF" }} className="bg-white border border-[#B88A44]/50 text-[#4A1C14] px-3 py-1.5 rounded-full text-xs font-bold cursor-default shadow-sm transition-colors duration-300">
                                {kata}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Dokumentasi Foto */}
                <motion.div variants={itemVariants} className="pt-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-[#B88A44] text-white p-2.5 rounded-xl shadow-sm">
                            <PhosphorIcon icon="camera" size={24} weight="fill" />
                        </div>
                        <h4 className="font-bold text-[#4A1C14] text-lg">Galeri Dokumentasi</h4>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
                        {galeriData.length > 0 ? (
                            galeriData.map((item, idx) => (
                                <motion.div 
                                    key={item.id || idx} 
                                    onClick={() => setSelectedImage(item)}
                                    className="snap-center min-w-[260px] h-[180px] bg-slate-200 rounded-3xl overflow-hidden relative shadow-sm border border-[#E8D2A6] cursor-pointer"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <img 
                                        src={item.image_url} 
                                        alt={item.keterangan} 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <PhosphorIcon icon="calendar-blank" size={12} className="text-[#FCF7E8]" />
                                            <p className="text-[#FCF7E8] text-[9px] font-medium">{item.tanggal}</p>
                                        </div>
                                        <p className="text-white text-[13px] font-bold leading-tight">{item.keterangan}</p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="w-full text-center p-6 border-2 border-dashed border-[#E8D2A6] rounded-3xl">
                                <p className="text-xs text-[#4A1C14]/60">Belum ada dokumentasi yang diupload.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Lightbox / Modal Galeri */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                            className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors z-50"
                        >
                            <PhosphorIcon icon="x" size={24} weight="bold" />
                        </button>

                        <motion.img 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            src={selectedImage.image_url} 
                            alt={selectedImage.keterangan} 
                            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl mb-4"
                            onClick={(e) => e.stopPropagation()}
                        />
                        
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-white font-bold text-lg mb-1">{selectedImage.keterangan}</h3>
                            <div className="flex items-center justify-center gap-1.5 text-white/70">
                                <PhosphorIcon icon="calendar-blank" size={14} />
                                <span className="text-sm">{selectedImage.tanggal}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Semua Pengumuman */}
            <AnimatePresence>
                {showAllPengumuman && (
                    <motion.div 
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col"
                    >
                        {/* Header Modal */}
                        <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                            <button onClick={() => setShowAllPengumuman(false)} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                                <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                            </button>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Semua Pengumuman</h2>
                            </div>
                        </div>

                        {/* List Pengumuman */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FDFBF7]">
                            {pengumumanData.length === 0 ? (
                                <div className="text-center p-8 bg-white rounded-2xl border border-[#E8D2A6]/50">
                                    <PhosphorIcon icon="megaphone" size={48} className="text-[#E8D2A6] mx-auto mb-2" />
                                    <p className="text-[#4A1C14]/60 text-xs">Belum ada pengumuman tersedia.</p>
                                </div>
                            ) : (
                                pengumumanData.map((item) => (
                                    <motion.div 
                                        key={item.id} 
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-[#FCF7E8] text-[#B88A44] flex items-center justify-center shrink-0">
                                                <PhosphorIcon icon="megaphone" size={16} weight="fill" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-[#4A1C14] text-[13px] leading-tight">{item.judul}</h4>
                                                <p className="text-[10px] text-[#4A1C14]/60">{item.tanggal}</p>
                                            </div>
                                        </div>
                                        <div className="bg-[#FCF7E8] p-3 rounded-xl border border-[#E8D2A6]/30 mt-2">
                                            <p className="text-[11.5px] text-[#4A1C14]/80 leading-relaxed whitespace-pre-wrap">{item.isi}</p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Pengaturan Menu Cepat */}
            <AnimatePresence>
                {isMenuSettingsOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-[#FDFBF7] flex flex-col"
                    >
                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsMenuSettingsOpen(false)} className="p-2 -ml-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                                    <PhosphorIcon icon="x" size={24} weight="bold" />
                                </button>
                                <div>
                                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Atur Menu Cepat</h2>
                                    <p className="text-[10px] text-[#B88A44]">Pilih menu yang ingin ditampilkan di beranda</p>
                                </div>
                            </div>
                            <button onClick={handleSaveMenuSettings} className="bg-[#4A1C14] text-[#FCF7E8] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#3A140E] transition-colors shadow-sm">
                                Simpan
                            </button>
                        </div>

                        {/* List Semua Menu Kategori */}
                        <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-6">
                            {CATEGORY_GROUPS.map((group, gIdx) => (
                                <div key={gIdx} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50">
                                    <h3 className="font-bold text-[#4A1C14] text-xs mb-3 border-b border-[#E8D2A6]/30 pb-2">{group.title}</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {group.items.map((item, iIdx) => {
                                            const isSelected = tempPinned.includes(item.name);
                                            return (
                                                <div 
                                                    key={iIdx}
                                                    onClick={() => togglePinMenu(item.name)}
                                                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-[#B88A44] bg-[#FCF7E8]' : 'border-gray-100 hover:border-[#E8D2A6] bg-gray-50/50'}`}
                                                >
                                                    <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${isSelected ? item.bg + ' ' + item.color : 'bg-gray-200 text-gray-500'}`}>
                                                        <PhosphorIcon icon={item.icon} size={20} />
                                                    </div>
                                                    <span className={`text-[11px] leading-tight flex-1 ${isSelected ? 'font-bold text-[#4A1C14]' : 'font-medium text-gray-600'}`}>
                                                        {item.name}
                                                    </span>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#B88A44] bg-[#B88A44] text-white' : 'border-gray-300'}`}>
                                                        {isSelected && <PhosphorIcon icon="check" size={12} weight="bold" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BerandaScreen;
