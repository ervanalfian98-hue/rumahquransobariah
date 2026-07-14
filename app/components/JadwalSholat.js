import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';

const JadwalSholat = ({ setActiveTab }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [locationName, setLocationName] = useState('Sukabumi, ID');
    const [hijriDate, setHijriDate] = useState('Memuat...');
    const [masehiDate, setMasehiDate] = useState('Memuat...');
    const [fastingTypes, setFastingTypes] = useState([]);
    
    const [prayerTimesList, setPrayerTimesList] = useState([
        { id: 'Fajr', name: 'Subuh', time: '--:--' },
        { id: 'Sunrise', name: 'Dhuha', time: '--:--' },
        { id: 'Dhuhr', name: 'Dzuhur', time: '--:--' },
        { id: 'Asr', name: 'Ashar', time: '--:--' },
        { id: 'Maghrib', name: 'Maghrib', time: '--:--' },
        { id: 'Isha', name: 'Isya', time: '--:--' },
    ]);
    
    const [nextPrayerName, setNextPrayerName] = useState('...');
    const [countdown, setCountdown] = useState('--:--:--');

    // Fetch data jadwal sholat
    useEffect(() => {
        const fetchJadwal = async () => {
            try {
                // Gunakan default Sukabumi jika geolokasi lama, atau bisa disesuaikan
                const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Sukabumi&country=Indonesia&method=11');
                const result = await response.json();
                
                if (result.code === 200) {
                    const timings = result.data.timings;
                    const hijri = result.data.date.hijri;
                    const gregorian = result.data.date.gregorian;
                    
                    // Format Hijriah
                    setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year} H`);
                    
                    // Format Masehi (Bulan bahasa indonesia secara manual atau dari API)
                    const monthsId = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                    const masehiMonth = monthsId[gregorian.month.number - 1];
                    setMasehiDate(`${gregorian.day} ${masehiMonth} ${gregorian.year}`);
                    
                    // Hitung Puasa Sunnah
                    const dayOfWeek = new Date().getDay();
                    const hDay = parseInt(hijri.day, 10);
                    const types = [];
                    if (dayOfWeek === 1 || dayOfWeek === 4) types.push('Senin Kamis');
                    if (hDay === 13 || hDay === 14 || hDay === 15) types.push('Ayyamul Bidh');
                    setFastingTypes(types);

                    // Update jadwal
                    setPrayerTimesList([
                        { id: 'Fajr', name: 'Subuh', time: timings.Fajr },
                        { id: 'Sunrise', name: 'Dhuha', time: timings.Sunrise },
                        { id: 'Dhuhr', name: 'Dzuhur', time: timings.Dhuhr },
                        { id: 'Asr', name: 'Ashar', time: timings.Asr },
                        { id: 'Maghrib', name: 'Maghrib', time: timings.Maghrib },
                        { id: 'Isha', name: 'Isya', time: timings.Isha },
                    ]);
                }
            } catch (error) {
                console.error("Gagal mengambil jadwal sholat:", error);
            }
        };

        fetchJadwal();
    }, []);

    // Timer untuk waktu saat ini & hitung mundur sholat berikutnya
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            // Hitung sholat selanjutnya
            let next = null;
            let nextTimeDiff = Infinity;
            
            const currentTotalMinutes = now.getHours() * 60 + now.getMinutes() + (now.getSeconds() / 60);

            // Filter sholat wajib (tanpa dhuha untuk hitung mundur biasanya, tapi disini kita ikutkan juga jika mau)
            // Untuk jadwal sholat selanjutnya, abaikan Dhuha sebagai waktu "wajib", atau jika mau dihitung gapapa
            const wajibPrayers = prayerTimesList.filter(p => p.id !== 'Sunrise');

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

            // Jika tidak ada sholat selanjutnya hari ini, berarti Subuh besok
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
                
                // Format countdown (jam:menit:detik)
                const totalSeconds = Math.floor(nextTimeDiff * 60);
                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;
                
                const formattedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                setCountdown(formattedTime);
            }

        }, 1000);

        return () => clearInterval(timer);
    }, [prayerTimesList]);

    // Mengambil lokasi real user (opsional jika diizinkan)
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // Bisa reverse geocoding di sini jika diperlukan, tapi untuk sekarang kita biarkan default
                    // atau cukup tampilkan "Lokasi Anda"
                    // setLocationName("Lokasi Anda"); 
                },
                (error) => {
                    console.log("Geolokasi tidak diizinkan atau gagal");
                }
            );
        }
    }, []);

    return (
        <div className="mx-5 mt-4 flex gap-3">
            {/* Kotak Kiri (Utama) */}
            <div className="w-[45%] p-4 bg-gradient-to-br from-[#5A2318] to-[#3A140E] rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#B88A44] opacity-20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#B88A44] opacity-10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <p className="text-[12px] font-medium opacity-90 text-[#FCF7E8]">{hijriDate}</p>
                    <p className="text-[11px] opacity-70 mt-0.5">{masehiDate}</p>
                    
                    {fastingTypes.length > 0 ? (
                        <div className="mt-3 flex items-center gap-1.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-100 w-fit px-2 py-1 rounded-lg backdrop-blur-sm border border-emerald-500/30">
                            <PhosphorIcon icon="moon" size={12} weight="fill" /> Puasa {fastingTypes.join(', ')}
                        </div>
                    ) : (
                        <div className="mt-3 flex items-center gap-1.5 text-[9px] font-medium bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10 text-[#FCF7E8]">
                            Tidak ada puasa sunnah
                        </div>
                    )}
                </div>

                <div className="relative z-10 mt-4 flex justify-start gap-2">
                    <button onClick={() => setActiveTab && setActiveTab('kiblat')} className="w-12 h-12 bg-[#B88A44]/20 backdrop-blur-md rounded-full flex items-center justify-center border border-[#B88A44]/30 animate-pulse text-[#B88A44] hover:bg-[#B88A44]/40 transition-colors shrink-0">
                        <PhosphorIcon icon="compass" size={28} />
                    </button>
                    <button onClick={() => setActiveTab && setActiveTab('kalender')} className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-[#FCF7E8] hover:bg-white/20 transition-colors shrink-0 shadow-sm">
                        <PhosphorIcon icon="calendar-plus" size={24} weight="fill" />
                    </button>
                </div>
            </div>

            {/* Kotak Kanan (Jadwal Sholat) */}
            <div 
                className="w-[55%] flex flex-col cursor-pointer group transition-transform active:scale-95"
                onClick={() => setActiveTab && setActiveTab('adzan')}
            >
                {/* Waktu Menuju Sholat */}
                <div className="bg-gradient-to-br from-[#B88A44] to-[#A37936] rounded-[1.25rem] p-2.5 shadow-sm mb-2 flex flex-col items-center justify-center text-center text-white relative group-hover:from-[#c59853] group-hover:to-[#b38541] transition-colors">
                    <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-0.5">{nextPrayerName}</p>
                    <h2 className="text-xl font-bold text-white tracking-tight leading-none mb-1.5">{countdown}</h2>
                    <div className="flex items-center gap-1 text-[8.5px] font-medium bg-black/15 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10 text-white/90">
                        <PhosphorIcon icon="map-pin" size={10} weight="fill" /> {locationName}
                    </div>
                </div>

                {/* 6 Kotak Jadwal Sholat */}
                <div className="grid grid-cols-3 grid-rows-2 gap-2 flex-1">
                    {prayerTimesList.map((prayer, idx) => (
                        <div key={idx} className="bg-white rounded-xl flex flex-col items-center justify-center py-2 shadow-sm border border-[#E8D2A6]/50">
                            <span className="text-[9px] font-semibold text-[#4A1C14]/60">{prayer.name}</span>
                            <span className="text-[11px] font-bold mt-0.5 text-[#4A1C14]">{prayer.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JadwalSholat;
