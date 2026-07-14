import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';

const TafsirScreen = ({ setActiveTab }) => {
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [selectedSurah, setSelectedSurah] = useState(null); // The surah object being viewed
    const [tafsirData, setTafsirData] = useState([]);
    const [loadingTafsir, setLoadingTafsir] = useState(false);
    
    // Separate search states
    const [searchAyatNum, setSearchAyatNum] = useState('');
    const [searchTafsirText, setSearchTafsirText] = useState('');

    // Fetch list of Surahs initially
    useEffect(() => {
        const fetchSurahs = async () => {
            try {
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

    // When a surah is selected, fetch its Tafsir
    const handleSelectSurah = async (surah) => {
        setSelectedSurah(surah);
        setLoadingTafsir(true);
        setTafsirData([]);
        setSearchAyatNum('');
        setSearchTafsirText('');
        
        try {
            const res = await fetch(`https://equran.id/api/v2/tafsir/${surah.nomor}`);
            const data = await res.json();
            if (data.code === 200) {
                setTafsirData(data.data.tafsir);
            }
        } catch (e) {
            console.error(e);
        }
        setLoadingTafsir(false);
    };

    const filteredSurahs = surahs.filter(s => 
        s.namaLatin.toLowerCase().includes(search.toLowerCase()) || 
        s.nomor.toString() === search
    );

    const filteredTafsir = tafsirData.filter(t => {
        const ayatTarget = searchAyatNum.trim();
        const textTarget = searchTafsirText.toLowerCase().trim();
        
        // Parse int so '02' matches 2
        const ayatMatch = ayatTarget === '' || (t.ayat && t.ayat === parseInt(ayatTarget, 10));
        const textMatch = textTarget === '' || (t.teks && t.teks.toLowerCase().includes(textTarget));
        
        return ayatMatch && textMatch;
    });

    // View: Tafsir Detail
    if (selectedSurah) {
        return (
            <div className="pb-28 animate-in slide-in-from-right-4 duration-300 bg-[#FAFAFA] min-h-full">
                {/* Header */}
                <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                    <button onClick={() => setSelectedSurah(null)} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                        <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Tafsir {selectedSurah.namaLatin}</h2>
                        <p className="text-[10px] text-[#B88A44]">Tafsir Kemenag RI (Tahlili)</p>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* Surah Info Card */}
                    <div className="bg-gradient-to-br from-[#4A1C14] to-[#3A140E] p-5 rounded-2xl text-white shadow-md relative overflow-hidden text-center">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#B88A44] opacity-20 rounded-full blur-2xl"></div>
                        <h2 className="text-2xl font-bold font-serif mb-1">{selectedSurah.nama}</h2>
                        <p className="text-[#E8D2A6] text-xs mb-3 font-medium tracking-wide">{selectedSurah.namaLatin} • {selectedSurah.arti}</p>
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] backdrop-blur-sm border border-white/20">
                            <span className="uppercase">{selectedSurah.tempatTurun}</span>
                            <span className="w-1 h-1 bg-[#E8D2A6] rounded-full"></span>
                            <span>{selectedSurah.jumlahAyat} AYAT</span>
                        </div>
                    </div>

                    {/* Search Ayat & Teks (Split View) */}
                    {!loadingTafsir && tafsirData.length > 0 && (
                        <div className="flex gap-2">
                            {/* Kolom Kiri: Nomor Ayat */}
                            <div className="relative w-28 shrink-0">
                                <input 
                                    type="text" 
                                    inputMode="numeric"
                                    value={searchAyatNum}
                                    onChange={(e) => setSearchAyatNum(e.target.value)}
                                    placeholder="Ayat ke-"
                                    className="w-full bg-white border border-[#E8D2A6]/60 rounded-2xl py-3 px-3 text-center text-sm font-bold text-[#4A1C14] placeholder:font-normal placeholder:text-[#B88A44]/60 focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30 shadow-sm"
                                />
                            </div>
                            
                            {/* Kolom Kanan: Teks Tafsir */}
                            <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    value={searchTafsirText}
                                    onChange={(e) => setSearchTafsirText(e.target.value)}
                                    placeholder="Cari kata dalam tafsir..."
                                    className="w-full bg-white border border-[#E8D2A6]/60 rounded-2xl py-3 pl-10 pr-4 text-sm text-[#4A1C14] placeholder:text-[#B88A44]/60 focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30 shadow-sm"
                                />
                                <PhosphorIcon icon="magnifying-glass" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B88A44]" />
                            </div>
                        </div>
                    )}

                    {/* Tafsir List */}
                    {loadingTafsir ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <PhosphorIcon icon="circle-notch" size={32} className="text-[#B88A44] animate-spin" />
                            <p className="text-[#4A1C14]/60 text-xs font-medium">Memuat Tafsir...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTafsir.map((tafsir) => (
                                <div key={tafsir.ayat} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E8D2A6]/40">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-full bg-[#FCF7E8] text-[#4A1C14] font-bold text-xs flex items-center justify-center border border-[#B88A44]/30">
                                            {tafsir.ayat}
                                        </div>
                                        <h3 className="font-bold text-[#4A1C14] text-sm">Tafsir Ayat ke-{tafsir.ayat}</h3>
                                    </div>
                                    <p className="text-[13px] text-[#4A1C14]/80 leading-relaxed text-justify">
                                        {tafsir.teks}
                                    </p>
                                </div>
                            ))}
                            {filteredTafsir.length === 0 && (searchAyatNum || searchTafsirText) && (
                                <div className="text-center py-10 text-gray-500 text-sm">Pencarian tidak ditemukan</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // View: List of Surahs
    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('kategori')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Tafsir Al-Qur'an</h2>
                    <p className="text-[10px] text-[#B88A44]">Pilih surah untuk membaca tafsir</p>
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
                        <p className="text-[#4A1C14]/60 text-xs font-medium">Memuat Daftar Surah...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSurahs.map((surah) => (
                            <button 
                                key={surah.nomor}
                                onClick={() => handleSelectSurah(surah)}
                                className="w-full bg-white rounded-2xl border border-[#E8D2A6]/40 p-4 flex items-center justify-between text-left hover:bg-[#FCF7E8]/50 transition-colors shadow-sm"
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
                                    icon="caret-right" 
                                    size={16} 
                                    weight="bold"
                                    className="text-[#B88A44]" 
                                />
                            </button>
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

export default TafsirScreen;
