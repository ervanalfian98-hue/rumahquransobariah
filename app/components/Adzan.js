import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';

const AdzanScreen = ({ setActiveTab }) => {
    const [prayerTimes, setPrayerTimes] = useState([]);
    const [notifSettings, setNotifSettings] = useState({
        Fajr: true,
        Sunrise: true,
        Dhuhr: true,
        Asr: true,
        Maghrib: true,
        Isha: true
    });
    const [permissionGranted, setPermissionGranted] = useState(false);
    
    // Countdown states
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nextPrayerName, setNextPrayerName] = useState('...');
    const [countdown, setCountdown] = useState('--:--:--');
    const [locationName, setLocationName] = useState('Sukabumi, ID');

    useEffect(() => {
        // Load saved settings
        const saved = localStorage.getItem('rqs_adzan_notif');
        if (saved) {
            setNotifSettings(JSON.parse(saved));
        }

        // Fetch prayer times for display
        const fetchJadwal = async () => {
            try {
                const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Sukabumi&country=Indonesia&method=11');
                const result = await response.json();
                if (result.code === 200) {
                    const timings = result.data.timings;
                    setPrayerTimes([
                        { id: 'Fajr', name: 'Subuh', time: timings.Fajr },
                        { id: 'Sunrise', name: 'Dhuha', time: timings.Sunrise },
                        { id: 'Dhuhr', name: 'Dzuhur', time: timings.Dhuhr },
                        { id: 'Asr', name: 'Ashar', time: timings.Asr },
                        { id: 'Maghrib', name: 'Maghrib', time: timings.Maghrib },
                        { id: 'Isha', name: 'Isya', time: timings.Isha },
                    ]);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchJadwal();

        // Check permission
        if ('Notification' in window) {
            setPermissionGranted(Notification.permission === 'granted');
        }
    }, []);

    // Timer logic for countdown
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            if (prayerTimes.length === 0) return;

            let next = null;
            let nextTimeDiff = Infinity;
            
            const currentTotalMinutes = now.getHours() * 60 + now.getMinutes() + (now.getSeconds() / 60);
            const wajibPrayers = prayerTimes.filter(p => p.id !== 'Sunrise');

            for (let prayer of wajibPrayers) {
                if (prayer.time === '--:--') continue;
                const [hours, minutes] = prayer.time.split(':').map(Number);
                const prayerTotalMinutes = hours * 60 + minutes;
                
                let diff = prayerTotalMinutes - currentTotalMinutes;
                
                if (diff > 0 && diff < nextTimeDiff) {
                    nextTimeDiff = diff;
                    next = prayer;
                }
            }

            if (!next) {
                const subuh = wajibPrayers.find(p => p.id === 'Fajr');
                if (subuh && subuh.time !== '--:--') {
                    const [hours, minutes] = subuh.time.split(':').map(Number);
                    const prayerTotalMinutes = hours * 60 + minutes;
                    nextTimeDiff = (24 * 60 - currentTotalMinutes) + prayerTotalMinutes;
                    next = subuh;
                }
            }

            if (next) {
                setNextPrayerName(`Menuju ${next.name}`);
                const totalSeconds = Math.floor(nextTimeDiff * 60);
                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;
                
                const formattedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                setCountdown(formattedTime);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [prayerTimes]);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert('Browser Anda tidak mendukung notifikasi.');
            return;
        }
        const permission = await Notification.requestPermission();
        setPermissionGranted(permission === 'granted');
        if (permission === 'granted') {
            new Notification('RQS', {
                body: 'Notifikasi Adzan berhasil diaktifkan!',
                icon: '/icon-192x192.png'
            });
        }
    };

    const toggleNotif = (id) => {
        const newSettings = { ...notifSettings, [id]: !notifSettings[id] };
        setNotifSettings(newSettings);
        localStorage.setItem('rqs_adzan_notif', JSON.stringify(newSettings));
        window.dispatchEvent(new Event('rqs-adzan-notif-updated'));
    };

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Navigasi (Back Button) */}
            <div className="absolute top-4 left-4 z-30">
                <button onClick={() => setActiveTab('kategori')} className="w-10 h-10 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-full flex items-center justify-center transition-colors shadow-sm border border-white/20">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
            </div>

            {/* Header: Kotak Merah Rounded Menggantung */}
            <div className="bg-[#4A1C14] pt-14 pb-8 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden flex flex-col items-center justify-center text-center">
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#E8D2A6 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 text-white/90 mb-3">
                        <PhosphorIcon icon="map-pin" size={12} weight="fill" /> {locationName}
                    </div>
                    <p className="text-xs font-bold text-[#E8D2A6] uppercase tracking-widest mb-1 opacity-90">{nextPrayerName}</p>
                    <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">{countdown}</h2>
                </div>
            </div>

            {/* Jadwal Sholat 1 Baris (Scrollable Horizontally) */}
            <div className="px-5 -mt-5 relative z-20">
                <div className="bg-white rounded-2xl p-2 shadow-lg border border-[#E8D2A6]/40 flex overflow-x-auto hide-scrollbar gap-1.5">
                    {prayerTimes.length > 0 ? prayerTimes.map((prayer, idx) => (
                        <div key={idx} className="flex-1 min-w-[50px] bg-[#FCF7E8] rounded-xl flex flex-col items-center justify-center py-2 shadow-sm border border-[#E8D2A6]/50 shrink-0">
                            <span className="text-[9px] font-semibold text-[#4A1C14]/70">{prayer.name}</span>
                            <span className="text-[11px] font-black mt-0.5 text-[#4A1C14]">{prayer.time}</span>
                        </div>
                    )) : (
                        <div className="w-full text-center text-xs text-gray-500 py-2">Memuat...</div>
                    )}
                </div>
            </div>

            {/* Pengaturan Notifikasi */}
            <div className="p-5 space-y-6 mt-4">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Pengaturan Adzan</h2>
                        <p className="text-[10px] text-[#B88A44]">Pilih waktu sholat yang ingin diberitahu</p>
                    </div>
                    <PhosphorIcon icon="bell-ringing" size={28} className="text-[#B88A44] opacity-30" weight="duotone" />
                </div>

                {!permissionGranted && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <div className="bg-amber-100 text-amber-600 p-2 rounded-xl shrink-0 mt-0.5">
                            <PhosphorIcon icon="warning-circle" size={20} weight="fill" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900 text-xs mb-1">Izinkan Notifikasi</h3>
                            <p className="text-[10px] text-amber-800/80 leading-relaxed mb-3">
                                Untuk menerima peringatan waktu sholat, Anda perlu memberikan izin notifikasi pada browser.
                            </p>
                            <button 
                                onClick={requestPermission}
                                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                            >
                                Aktifkan Sekarang
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm border border-[#E8D2A6]/40 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {prayerTimes.length > 0 ? prayerTimes.map((prayer, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-[#4A1C14] text-sm">{prayer.name}</h4>
                                    <p className="text-[10px] text-[#B88A44]">Bunyikan notifikasi saat waktu {prayer.name} masuk</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={notifSettings[prayer.id] || false}
                                        onChange={() => toggleNotif(prayer.id)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B88A44]"></div>
                                </label>
                            </div>
                        )) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdzanScreen;
