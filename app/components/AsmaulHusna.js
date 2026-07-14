import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';

const AsmaulHusnaScreen = ({ setActiveTab }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAsmaulHusna = async () => {
            try {
                const res = await fetch('https://api.myquran.com/v2/husna/semua');
                if (!res.ok) throw new Error('Gagal mengambil data Asmaul Husna');
                const result = await res.json();
                if (result.status && result.data) {
                    setData(result.data);
                } else {
                    throw new Error('Format data tidak sesuai');
                }
            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAsmaulHusna();
    }, []);

    const filteredData = data.filter(item => 
        item.latin.toLowerCase().includes(search.toLowerCase()) || 
        item.indo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('kategori')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Asmaul Husna</h2>
                    <p className="text-[10px] text-[#B88A44]">99 Nama-nama Allah yang indah</p>
                </div>
            </div>

            <div className="p-5">
                {/* Search Bar */}
                <div className="relative mb-6">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama atau arti (contoh: Ar Rahman, Pengasih)..."
                        className="w-full bg-white border border-[#E8D2A6]/60 rounded-2xl py-3 pl-11 pr-4 text-sm text-[#4A1C14] placeholder:text-[#B88A44]/60 focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30 shadow-sm"
                    />
                    <PhosphorIcon icon="magnifying-glass" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B88A44]" />
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-20 gap-3">
                        <div className="w-8 h-8 border-4 border-[#E8D2A6] border-t-[#B88A44] rounded-full animate-spin"></div>
                        <p className="text-xs text-[#B88A44] font-medium animate-pulse">Memuat 99 Nama Allah...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100">
                        <PhosphorIcon icon="warning-circle" size={32} className="text-red-400 mx-auto mb-2" />
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-100 text-red-700 text-xs rounded-xl font-bold hover:bg-red-200">
                            Coba Lagi
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {filteredData.map((item, index) => (
                            <div 
                                key={item.id} 
                                className="bg-white p-4 rounded-2xl border border-[#E8D2A6]/40 shadow-sm flex items-center gap-4 hover:border-[#B88A44]/40 transition-colors animate-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${(index % 15) * 50}ms`, animationFillMode: 'both' }}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#FCF7E8] text-[#4A1C14] font-black flex items-center justify-center shrink-0 border border-[#E8D2A6]/50 shadow-inner">
                                    {item.id}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-[#4A1C14] text-sm mb-0.5">{item.latin}</h3>
                                    <p className="text-[11px] text-[#B88A44] font-medium leading-tight">
                                        {item.indo}
                                    </p>
                                </div>
                                <div className="text-2xl font-serif text-[#4A1C14] text-right shrink-0">
                                    {item.arab}
                                </div>
                            </div>
                        ))}

                        {filteredData.length === 0 && (
                            <div className="text-center py-10 flex flex-col items-center gap-2">
                                <PhosphorIcon icon="file-search" size={32} className="text-[#B88A44]/50" />
                                <p className="text-gray-500 text-sm">Nama Asmaul Husna tidak ditemukan</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AsmaulHusnaScreen;
