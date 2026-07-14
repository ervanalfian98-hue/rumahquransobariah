import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';

const DEED_CATEGORIES = [
    {
        id: 'wajib',
        title: 'Shalat Wajib',
        icon: 'mosque',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        items: [
            { id: 'subuh', label: 'Shalat Subuh' },
            { id: 'dzuhur', label: 'Shalat Dzuhur' },
            { id: 'ashar', label: 'Shalat Ashar' },
            { id: 'maghrib', label: 'Shalat Maghrib' },
            { id: 'isya', label: 'Shalat Isya' }
        ]
    },
    {
        id: 'sunnah',
        title: 'Shalat Sunnah',
        icon: 'moon-stars',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        items: [
            { id: 'tahajud', label: 'Shalat Tahajud' },
            { id: 'dhuha', label: 'Shalat Dhuha' },
            { id: 'rawatib', label: 'Shalat Rawatib (Qabliyah/Ba\'diyah)' },
            { id: 'witir', label: 'Shalat Witir' }
        ]
    },
    {
        id: 'harian',
        title: 'Amalan Lainnya',
        icon: 'hand-heart',
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        items: [
            { id: 'tilawah', label: 'Tilawah Al-Quran' },
            { id: 'dzikir_pagi', label: 'Dzikir Pagi' },
            { id: 'dzikir_petang', label: 'Dzikir Petang' },
            { id: 'sedekah', label: 'Sedekah Hari Ini' },
            { id: 'istighfar', label: 'Istighfar (Min. 100x)' }
        ]
    }
];

const AmalScreen = ({ setActiveTab, currentUser }) => {
    // Trik untuk menginisialisasi state dari localStorage secara sinkron
    // agar tidak ada efek "berkedip" dari kosong menjadi terisi.
    const [checkedItems, setCheckedItems] = useState(() => {
        try {
            const userKey = currentUser ? (currentUser.username || currentUser.id) : '';
            const dateKey = userKey ? `amal_date_${userKey}` : 'amal_date';
            const checkedKey = userKey ? `amal_checked_${userKey}` : 'amal_checked';
            
            const savedDate = localStorage.getItem(dateKey);
            const today = new Date().toLocaleDateString('id-ID');
            
            // Jika hari berganti, reset semua amalan menjadi kosong
            if (savedDate !== today) {
                localStorage.setItem(dateKey, today);
                localStorage.setItem(checkedKey, JSON.stringify({}));
                return {};
            }
            
            const saved = localStorage.getItem(checkedKey);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    // Simpan ke localStorage setiap ada perubahan ceklis
    useEffect(() => {
        const userKey = currentUser ? (currentUser.username || currentUser.id) : '';
        const checkedKey = userKey ? `amal_checked_${userKey}` : 'amal_checked';
        localStorage.setItem(checkedKey, JSON.stringify(checkedItems));
    }, [checkedItems, currentUser]);

    const toggleItem = (itemId) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const resetAmal = () => {
        if(window.confirm("Apakah Anda yakin ingin mereset seluruh ceklis amalan hari ini?")) {
            setCheckedItems({});
        }
    };

    // Kalkulasi Progres
    const totalItems = DEED_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
    const completedItems = Object.values(checkedItems).filter(Boolean).length;
    const progressPercent = Math.round((completedItems / totalItems) * 100) || 0;

    const todayDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <div className="flex items-center">
                    <button onClick={() => setActiveTab('kategori')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                        <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Mutaba'ah Yaumiyah</h2>
                        <p className="text-[10px] text-[#B88A44]">Evaluasi Amal Harian</p>
                    </div>
                </div>
                <button 
                    onClick={resetAmal}
                    className="p-2 text-[#B88A44] hover:bg-red-50 hover:text-red-600 rounded-full transition-colors flex items-center justify-center"
                    title="Reset Amalan Hari Ini"
                >
                    <PhosphorIcon icon="arrow-counter-clockwise" size={20} weight="bold" />
                </button>
            </div>

            <div className="p-5">
                {/* Dashboard Card */}
                <div className="bg-gradient-to-br from-[#4A1C14] to-[#60271E] rounded-2xl p-5 mb-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <PhosphorIcon icon="calendar-check" size={64} weight="duotone" />
                    </div>
                    
                    <div className="relative z-10">
                        <h3 className="text-sm font-medium text-[#E8D2A6] mb-1">Amalan Hari Ini</h3>
                        <p className="font-bold text-base mb-5">{todayDate}</p>
                        
                        <div className="mb-2 flex justify-between items-end">
                            <span className="text-3xl font-black">{progressPercent}%</span>
                            <span className="text-xs text-[#E8D2A6] mb-1 font-medium">{completedItems} dari {totalItems} Selesai</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-black/30 rounded-full h-2.5 backdrop-blur-sm overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-[#E8D2A6] to-white h-2.5 rounded-full transition-all duration-700 ease-out" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Categories List */}
                <div className="space-y-6">
                    {DEED_CATEGORIES.map((category) => {
                        // Cek berapa banyak amalan yang sudah selesai dalam kategori ini
                        const catCompleted = category.items.filter(item => checkedItems[item.id]).length;
                        const isCatComplete = catCompleted === category.items.length;

                        return (
                            <div key={category.id} className="animate-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <div className={`p-1.5 rounded-lg ${category.bg} ${category.color}`}>
                                        <PhosphorIcon icon={category.icon} size={18} weight={isCatComplete ? "fill" : "regular"} />
                                    </div>
                                    <h3 className="font-bold text-[#4A1C14] text-[15px]">{category.title}</h3>
                                    {isCatComplete && (
                                        <span className="ml-auto text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                            Tuntas
                                        </span>
                                    )}
                                </div>
                                
                                <div className="bg-white rounded-2xl border border-[#E8D2A6]/40 shadow-sm overflow-hidden">
                                    {category.items.map((item, index) => {
                                        const isChecked = !!checkedItems[item.id];
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleItem(item.id)}
                                                className={`w-full flex items-center p-4 transition-colors duration-200 border-b border-gray-50 last:border-b-0 ${
                                                    isChecked ? 'bg-gray-50/50' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className={`
                                                    w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mr-3 transition-all duration-300
                                                    ${isChecked ? `${category.bg} ${category.border} ${category.color}` : 'border-gray-300 bg-white'}
                                                `}>
                                                    {isChecked && <PhosphorIcon icon="check" size={14} weight="bold" />}
                                                </div>
                                                
                                                <span className={`text-[14px] text-left flex-1 font-medium transition-all duration-300 ${
                                                    isChecked ? 'text-gray-400 line-through' : 'text-[#4A1C14]'
                                                }`}>
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>Catatan amalan akan otomatis direset setiap berganti hari.</p>
                </div>
            </div>
        </div>
    );
};

export default AmalScreen;
