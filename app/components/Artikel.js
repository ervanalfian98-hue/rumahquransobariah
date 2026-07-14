import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const Artikel = ({ setActiveTab }) => {
    const [artikelList, setArtikelList] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);

    const loadArticles = async () => {
        const { data, error } = await supabase
            .from('rqs_artikel')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            setArtikelList(data);
        }
    };

    useEffect(() => {
        loadArticles();
        
        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:rqs_artikel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rqs_artikel' }, (payload) => {
                loadArticles();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Detail View
    if (selectedArticle) {
        return (
            <div className="pb-28 animate-in slide-in-from-right-4 duration-300 bg-white min-h-screen">
                <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                    <button onClick={() => setSelectedArticle(null)} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                        <PhosphorIcon icon="arrow-left" size={24} />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-[#4A1C14] leading-tight truncate">Baca Artikel</h2>
                    </div>
                </div>

                {/* Article Header Image */}
                <div className="w-full h-56 bg-gray-100 relative">
                    {selectedArticle.image && <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />}
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>

                {/* Article Content */}
                <div className="p-5 -mt-6 relative z-10 bg-white rounded-t-3xl">
                    <span className="inline-block bg-[#FDF9F1] text-[#B88A44] border border-[#E8D2A6] text-[10px] font-bold px-3 py-1 rounded-full mb-3">
                        {selectedArticle.category}
                    </span>
                    <h1 className="text-2xl font-bold text-[#4A1C14] mb-3 leading-tight">{selectedArticle.title}</h1>
                    
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                        <PhosphorIcon icon="calendar-blank" size={16} className="text-gray-400" />
                        <span className="text-[11px] text-gray-500 font-medium">
                            {selectedArticle.timestamp ? selectedArticle.timestamp.split(' ')[0] : ''} <span className="mx-1">•</span> {selectedArticle.hijriDate}
                        </span>
                    </div>

                    <div className="text-[13px] text-gray-700 leading-relaxed text-justify whitespace-pre-wrap font-medium">
                        {selectedArticle.content}
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen">
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Artikel</h2>
                    <p className="text-[10px] text-[#B88A44]">Kumpulan Ilmu & Inspirasi</p>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {artikelList.length === 0 && (
                    <div className="text-center text-gray-400 py-10 text-sm">Belum ada artikel saat ini.</div>
                )}
                
                {artikelList.map((item, idx) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedArticle(item)}
                        className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                    >
                        {/* Thumbnail Kiri */}
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                            {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                        </div>
                        
                        {/* Info Kanan */}
                        <div className="flex-1 py-1 flex flex-col justify-center">
                            <div className="mb-1.5">
                                <span className="inline-block bg-[#4A1C14] text-[#E8D2A6] text-[9px] font-bold px-2 py-0.5 rounded-md">
                                    {item.category}
                                </span>
                            </div>
                            <h3 className="font-bold text-[#4A1C14] text-[13px] leading-snug line-clamp-2 mb-2">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <PhosphorIcon icon="clock" size={12} />
                                <span className="text-[9px] font-medium truncate">
                                    {item.timestamp ? item.timestamp.split(' ')[0] + ' ' + (item.timestamp.split(' ')[1] || '') + ' ' + (item.timestamp.split(' ')[2] || '') : ''} • {item.hijriDate}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Artikel;
