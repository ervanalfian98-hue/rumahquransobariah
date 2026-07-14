import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const Tamyiz = ({ setActiveTab }) => {
    const [videos, setVideos] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const loadVideos = async () => {
        const { data, error } = await supabase
            .from('rqs_tamyiz')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error && data) {
            setVideos(data);
        }
    };

    useEffect(() => {
        loadVideos();
    }, []);

    const categories = [
        { name: "Lagu Huruf", icon: "music-notes", bg: "bg-blue-50", text: "text-blue-600", desc: "Menghafal awamil dengan nada lagu." },
        { name: "Isim & Fi'il", icon: "books", bg: "bg-amber-50", text: "text-amber-600", desc: "Pengenalan kata benda dan kata kerja." },
        { name: "Praktek Tarjamah", icon: "translate", bg: "bg-rose-50", text: "text-rose-600", desc: "Latihan menterjemahkan surat pendek." },
        { name: "Kuis Evaluasi", icon: "brain", bg: "bg-purple-50", text: "text-purple-600", desc: "Uji kemampuan hafalan Tamyiz." }
    ];

    const filteredVideos = selectedCategory 
        ? videos.filter(v => v.category === selectedCategory) 
        : videos;

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Metode Tamyiz</h2>
                    <p className="text-[10px] text-teal-600 font-bold">Terjemah Al-Quran</p>
                </div>
            </div>

            {/* Banner */}
            <div className="mx-4 mt-4 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1">Pintar Terjemah Al-Quran</h3>
                    <p className="text-xs text-white/90 mb-3 max-w-[85%]">Belajar struktur bahasa Arab dan menterjemahkan Al-Quran semudah tersenyum dengan metode lagu Tamyiz.</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-white/20">
                    <PhosphorIcon icon="certificate" weight="fill" size={100} />
                </div>
            </div>

            {/* Modul Tamyiz Categories */}
            <div className="p-4 mt-2">
                <h3 className="font-bold text-[#4A1C14] mb-3 text-sm">Materi Tamyiz</h3>
                <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => (
                        <div 
                            key={cat.name}
                            onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                            className={`bg-white p-4 rounded-2xl border ${selectedCategory === cat.name ? 'border-teal-500 shadow-md ring-1 ring-teal-500' : 'border-gray-100 shadow-sm'} flex flex-col gap-2 cursor-pointer transition-all active:scale-95`}
                        >
                            <div className={`w-10 h-10 rounded-full ${cat.bg} ${cat.text} flex items-center justify-center mb-1`}>
                                <PhosphorIcon icon={cat.icon} size={24} weight="fill" />
                            </div>
                            <h4 className="font-bold text-gray-800 text-sm">{cat.name}</h4>
                            <p className="text-[10px] text-gray-500 leading-tight">{cat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Video Playlist */}
            <div className="px-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#4A1C14] text-sm">
                        {selectedCategory ? `Materi: ${selectedCategory}` : "Semua Video Pembelajaran"}
                    </h3>
                    {selectedCategory && (
                        <span onClick={() => setSelectedCategory(null)} className="text-[10px] font-bold text-teal-600 cursor-pointer px-2 py-1 bg-teal-50 rounded-full">
                            Tampilkan Semua
                        </span>
                    )}
                </div>
                
                <div className="flex flex-col gap-3">
                    {filteredVideos.map((vid) => (
                        <a 
                            key={vid.id} 
                            href={vid.youtube_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex gap-3 cursor-pointer hover:border-teal-200 transition-colors active:scale-[0.98]"
                        >
                            <div className="w-24 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative border border-gray-200">
                                <img src={`https://img.youtube.com/vi/${vid.youtube_id}/mqdefault.jpg`} className="w-full h-full object-cover" alt="Thumb" />
                                <div className="absolute inset-0 bg-stone-900 opacity-40"></div>
                                <PhosphorIcon icon="play-circle" size={28} weight="fill" className="text-white z-10 absolute" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{vid.title}</h4>
                                <p className="text-[10px] text-gray-500">{vid.speaker}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] text-teal-600 font-bold">{vid.duration}</p>
                                    <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-500 font-bold uppercase">{vid.category}</span>
                                </div>
                            </div>
                        </a>
                    ))}

                    {filteredVideos.length === 0 && (
                        <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-2xl">
                            <PhosphorIcon icon="video-camera-slash" size={32} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-400">Belum ada video materi di kategori ini</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tamyiz;
