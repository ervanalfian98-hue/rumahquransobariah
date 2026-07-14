import React, { useState } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { DOA_CATEGORIES, DOA_DATA } from './DoaData';

const DoaScreen = ({ setActiveTab }) => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [search, setSearch] = useState('');

    // Filter categories for the home view
    const filteredCategories = DOA_CATEGORIES.filter(cat => 
        cat.title.toLowerCase().includes(search.toLowerCase())
    );

    // Filter prayers for the category view
    const currentPrayers = activeCategory ? (DOA_DATA[activeCategory.id] || []) : [];
    const filteredPrayers = currentPrayers.filter(doa => 
        doa.title.toLowerCase().includes(search.toLowerCase()) || 
        (doa.translation && doa.translation.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button 
                    onClick={() => activeCategory ? setActiveCategory(null) : setActiveTab('kategori')} 
                    className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors"
                >
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">
                        {activeCategory ? activeCategory.title : 'Kumpulan Doa'}
                    </h2>
                    <p className="text-[10px] text-[#B88A44]">
                        {activeCategory ? `${currentPrayers.length} Doa Pilihan` : 'Referensi NU Online'}
                    </p>
                </div>
            </div>

            {/* Banner (Only on Category List) */}
            {!activeCategory && (
                <div className="bg-gradient-to-r from-[#4A1C14] to-[#60271E] text-white pt-6 pb-8 px-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#B88A44] opacity-20 rounded-bl-full blur-2xl"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold font-serif mb-1">Senjata Mukmin</h2>
                            <p className="text-xs text-[#E8D2A6]/90 font-medium max-w-[200px] leading-relaxed">
                                "Doa adalah senjata seorang mukmin, tiang agama, dan cahaya langit serta bumi."
                            </p>
                        </div>
                        <PhosphorIcon icon="hands-praying" size={56} className="text-[#E8D2A6] opacity-90" weight="duotone" />
                    </div>
                </div>
            )}

            <div className="p-5">
                {/* Search Bar */}
                <div className="relative mb-6">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={activeCategory ? `Cari di ${activeCategory.title}...` : "Cari kategori doa..."}
                        className="w-full bg-white border border-[#E8D2A6]/60 rounded-2xl py-3 pl-11 pr-4 text-sm text-[#4A1C14] placeholder:text-[#B88A44]/60 focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30 shadow-sm"
                    />
                    <PhosphorIcon icon="magnifying-glass" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B88A44]" />
                </div>

                {/* VIEW 1: CATEGORY GRID */}
                {!activeCategory && (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredCategories.map((cat, index) => (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveCategory(cat); setSearch(''); }}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/40 flex flex-col items-center justify-center text-center gap-3 hover:border-[#B88A44] hover:bg-[#FCF7E8]/50 transition-all duration-300 animate-in zoom-in-95"
                                style={{ animationDelay: `${(index % 16) * 40}ms` }}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#FCF7E8] text-[#B88A44] flex items-center justify-center">
                                    <PhosphorIcon icon={cat.icon} size={24} weight="duotone" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#4A1C14] text-[13px] leading-tight mb-1">{cat.title}</h3>
                                    <p className="text-[10px] text-gray-500 font-medium">{cat.count} Doa</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* VIEW 2: PRAYER LIST */}
                {activeCategory && (
                    <div className="space-y-4">
                        {filteredPrayers.map((doa, index) => (
                            <div 
                                key={index} 
                                className="bg-white rounded-2xl p-5 border border-[#E8D2A6]/40 shadow-sm hover:border-[#B88A44]/30 transition-all duration-300 animate-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${(index % 10) * 50}ms` }}
                            >
                                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                                    <h3 className="font-bold text-[#4A1C14] text-[15px] leading-snug pr-2">{doa.title}</h3>
                                    <div className="w-6 h-6 rounded-full bg-[#FCF7E8] text-[#B88A44] flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold">{index + 1}</span>
                                    </div>
                                </div>
                                
                                <div className="text-right mb-5 mt-2">
                                    <p className="text-2xl font-serif text-[#4A1C14] leading-loose break-words" dir="rtl">
                                        {doa.arabic}
                                    </p>
                                </div>
                                
                                <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                                    <p className="text-[12px] text-[#4A1C14]/80 italic leading-relaxed mb-2">
                                        <span className="font-bold not-italic text-[#4A1C14]">Latin: </span>
                                        {doa.latin}
                                    </p>
                                    <p className="text-[12px] text-[#4A1C14] leading-relaxed">
                                        <span className="font-bold text-[#4A1C14]">Arti: </span>
                                        {doa.translation}
                                    </p>
                                </div>
                                
                                {doa.fadhilah && (
                                    <div className="flex gap-2 items-start bg-[#FCF7E8]/50 p-3 rounded-xl border border-[#E8D2A6]/30">
                                        <PhosphorIcon icon="info" size={16} className="text-[#B88A44] shrink-0 mt-0.5" weight="fill" />
                                        <p className="text-[11px] text-[#4A1C14]/90 font-medium leading-relaxed">
                                            <span className="font-bold">Fadhilah Doa: </span>{doa.fadhilah}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredPrayers.length === 0 && (
                            <div className="text-center py-10 flex flex-col items-center gap-3">
                                <PhosphorIcon icon="books" size={48} className="text-[#B88A44]/30" weight="duotone" />
                                <div>
                                    <p className="text-[#4A1C14] font-bold text-sm">Doa belum tersedia</p>
                                    <p className="text-gray-500 text-xs mt-1">Kami akan segera melengkapi doa di kategori ini berdasarkan referensi NU Online.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoaScreen;
