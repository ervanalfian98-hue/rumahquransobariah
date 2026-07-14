import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';

const AsbabunNuzulScreen = ({ setActiveTab }) => {
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedSurah, setSelectedSurah] = useState(null);

    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                // Using EQuran API which provides a very detailed description & Asbabun Nuzul for each Surah
                const res = await fetch('https://equran.id/api/v2/surat');
                const data = await res.json();
                if (data.code === 200) {
                    setSurahs(data.data);
                }
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };
        fetchSurahs();
    }, []);

    const filteredSurahs = surahs.filter(s => 
        s.namaLatin.toLowerCase().includes(search.toLowerCase()) || 
        s.nomor.toString() === search
    );

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            <style>{`
                .asbabun-nuzul-content i {
                    color: #B88A44;
                    font-weight: 500;
                }
                .asbabun-nuzul-content p {
                    margin-bottom: 12px;
                }
            `}</style>
            
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('kategori')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Asbabun Nuzul</h2>
                    <p className="text-[10px] text-[#B88A44]">Sejarah & Asal-usul Turunnya Surah</p>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Search */}
                <div className="relative">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari surah (contoh: Yasin, 36)..."
                        className="w-full bg-white border border-[#E8D2A6]/60 rounded-2xl py-3 pl-10 pr-4 text-sm text-[#4A1C14] placeholder:text-[#B88A44]/60 focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30 shadow-sm"
                    />
                    <PhosphorIcon icon="magnifying-glass" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B88A44]" />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <PhosphorIcon icon="circle-notch" size={32} className="text-[#B88A44] animate-spin" />
                        <p className="text-[#4A1C14]/60 text-xs font-medium">Memuat Asbabun Nuzul...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSurahs.map((surah) => (
                            <div key={surah.nomor} className="bg-white rounded-2xl border border-[#E8D2A6]/40 overflow-hidden shadow-sm">
                                <button 
                                    onClick={() => setSelectedSurah(selectedSurah === surah.nomor ? null : surah.nomor)}
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FCF7E8]/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#FCF7E8] text-[#4A1C14] font-black flex items-center justify-center shrink-0 border border-[#E8D2A6]/50">
                                            {surah.nomor}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#4A1C14] text-sm">{surah.namaLatin}</h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[10px] font-bold text-[#B88A44] uppercase tracking-wider">{surah.tempatTurun}</span>
                                                <span className="w-1 h-1 rounded-full bg-[#E8D2A6]"></span>
                                                <span className="text-[10px] text-[#4A1C14]/60">{surah.arti}</span>
                                                <span className="w-1 h-1 rounded-full bg-[#E8D2A6]"></span>
                                                <span className="text-[10px] text-[#4A1C14]/60">{surah.jumlahAyat} Ayat</span>
                                            </div>
                                        </div>
                                    </div>
                                    <PhosphorIcon 
                                        icon="caret-down" 
                                        size={16} 
                                        weight="bold"
                                        className={`text-[#B88A44] transition-transform ${selectedSurah === surah.nomor ? 'rotate-180' : ''}`} 
                                    />
                                </button>
                                
                                {selectedSurah === surah.nomor && (
                                    <div className="p-4 pt-0 border-t border-[#E8D2A6]/20 bg-[#FAFAFA] animate-in slide-in-from-top-2 duration-300">
                                        <div className="mt-3 p-4 bg-white rounded-xl border border-[#E8D2A6]/40 text-[13px] text-[#4A1C14]/80 leading-relaxed text-justify asbabun-nuzul-content" dangerouslySetInnerHTML={{ __html: surah.deskripsi }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {filteredSurahs.length === 0 && (
                            <div className="text-center py-10 text-gray-500 text-sm">Surah tidak ditemukan</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AsbabunNuzulScreen;
