// --- MOCK DATA ---
export const PRAYER_TIMES = [
    { name: 'Subuh', time: '04:30' },
    { name: 'Dhuha', time: '06:15' },
    { name: 'Dzuhur', time: '11:55' },
    { name: 'Ashar', time: '15:15' },
    { name: 'Maghrib', time: '17:50' },
    { name: 'Isya', time: '19:05' },
];

export const CLASSES = [
    { id: 'tahsin_pemula', name: 'Tahsin Pemula', desc: 'Belajar huruf hijaiyah dari nol.', color: 'bg-[#F5EBE9] text-[#4A1C14]' },
    { id: 'tahsin_teori', name: 'Tahsin Teori', desc: 'Memperbaiki makhorijul huruf.', color: 'bg-[#FCF7E8] text-[#B88A44]' },
    { id: 'pra_tahfidz', name: 'Pra Tahfidz', desc: 'Persiapan hafalan Quran.', color: 'bg-stone-100 text-stone-700' },
    { id: 'tahfidz', name: 'Tahfidz', desc: 'Setoran hafalan bersanad.', color: 'bg-[#FCF7E8] text-[#4A1C14]' },
    { id: 'b_arab_tamyiz', name: 'B. Arab Tamyiz', desc: 'Metode terjemah Al-Quran.', color: 'bg-red-50 text-red-800' },
    { id: 'ulc', name: 'Kelas ULC', desc: 'Ultimate Life Changing.', color: 'bg-amber-100 text-amber-800' },
    { id: 'matan', name: 'Kelas Matan', desc: 'Kajian kitab matan tajwid.', color: 'bg-orange-50 text-orange-800' },
];

// Data Menu Cepat untuk Beranda (Warna-warni Vektor Datar)
export const QUICK_MENU = [
    { name: 'RQS Berdaya', icon: 'trend-up', color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Hadist', icon: 'book-bookmark', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { name: 'Zakat', icon: 'hand-coins', color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Pengajar', icon: 'chalkboard-teacher', color: 'text-teal-600', bg: 'bg-teal-50' },
    { name: 'Doa', icon: 'hands-praying', color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Asmaul Husna', icon: '99', color: 'text-rose-500', bg: 'bg-rose-50' },
    { name: 'Sirah Nabi', icon: 'scroll', color: 'text-amber-800', bg: 'bg-amber-50' },
    { name: 'Tasbih', icon: 'tasbih', color: 'text-rose-700', bg: 'bg-rose-50' },
];

// Data Lengkap Kategori Sesuai Permintaan (Warna-warni Vektor Datar)
export const CATEGORY_GROUPS = [
    {
        title: 'RQS',
        items: [
            { name: 'Pengajar', icon: 'chalkboard-teacher', color: 'text-teal-600', bg: 'bg-teal-50' },
            { name: 'Susunan Kepengurusan', icon: 'users-three', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { name: 'RQS Berdaya', icon: 'trend-up', color: 'text-blue-600', bg: 'bg-blue-50' },
            { name: 'Merchandise', icon: 'tote', color: 'text-orange-500', bg: 'bg-orange-50' },
            { name: 'Herbal', icon: 'leaf', color: 'text-green-600', bg: 'bg-green-50' },
            { name: 'MLP', icon: 'headset', color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ]
    },
    {
        title: 'Ibadah',
        items: [
            { name: 'Hadist', icon: 'book-bookmark', color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { name: 'Zakat', icon: 'hand-coins', color: 'text-amber-500', bg: 'bg-amber-50' },
            { name: 'Adzan', icon: 'mosque', color: 'text-sky-600', bg: 'bg-sky-50' }
        ]
    },
    {
        title: 'Al-Quran',
        items: [
            { name: 'Iqra', icon: 'book-open', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { name: 'Asbabun Nuzul', icon: 'cloud-sun', color: 'text-blue-500', bg: 'bg-blue-50' },
            { name: 'Tafsir', icon: 'magnifying-glass-plus', color: 'text-purple-600', bg: 'bg-purple-50' }
        ]
    },
    {
        title: 'Shalat',
        items: [
            { name: 'Kiblat', icon: 'compass', color: 'text-blue-700', bg: 'bg-blue-50' },
            { name: 'Bacaan Sholat', icon: 'hands-praying', color: 'text-amber-700', bg: 'bg-amber-50' },
            { name: 'Tasbih', icon: 'tasbih', color: 'text-rose-700', bg: 'bg-rose-50' }
        ]
    },
    {
        title: 'Belajar',
        items: [
            { name: 'Sirah Nabi', icon: 'scroll', color: 'text-amber-800', bg: 'bg-amber-50' },
            { name: 'Asmaul Husna', icon: '99', color: 'text-rose-500', bg: 'bg-rose-50' },
            { name: 'Kisah 25 Nabi', icon: 'users-three', color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { name: 'Tamyiz', icon: 'certificate', color: 'text-teal-700', bg: 'bg-teal-50' }
        ]
    },
    {
        title: 'Ibadah Harian',
        items: [
            { name: 'Amal', icon: 'hand-heart', color: 'text-rose-600', bg: 'bg-rose-50' },
            { name: 'Dzikir', icon: 'infinity', color: 'text-indigo-700', bg: 'bg-indigo-50' },
            { name: 'Doa', icon: 'hands-praying', color: 'text-amber-600', bg: 'bg-amber-50' }
        ]
    },
    {
        title: 'Informasi',
        items: [
            { name: 'Kalender', icon: 'calendar-blank', color: 'text-red-500', bg: 'bg-red-50' },
            { name: 'Renungan', icon: 'lightbulb', color: 'text-purple-500', bg: 'bg-purple-50' },
            { name: 'Artikel', icon: 'newspaper', color: 'text-blue-600', bg: 'bg-blue-50' }
        ]
    },
    {
        title: 'Lainnya',
        items: [
            { name: 'Qurban', icon: 'cow', color: 'text-amber-800', bg: 'bg-amber-50' },
            { name: 'Donasi', icon: 'money', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { name: 'Sosial Media', icon: 'device-mobile', color: 'text-slate-600', bg: 'bg-slate-100' }
        ]
    }
];

