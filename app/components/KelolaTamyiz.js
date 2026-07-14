import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const KelolaTamyiz = ({ onBack }) => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const categories = ["Lagu Huruf", "Isim & Fi'il", "Praktek Tarjamah", "Kuis Evaluasi"];

    const [form, setForm] = useState({
        title: '',
        speaker: 'Ustadz Abu Rabbani',
        duration: '',
        category: categories[0],
        youtube_url: ''
    });

    const loadVideos = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('rqs_tamyiz')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error && data) {
            setVideos(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadVideos();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const ytid = getYoutubeId(form.youtube_url);
        if (!ytid) {
            alert('URL YouTube tidak valid!');
            return;
        }

        setIsLoading(true);
        const videoData = { ...form, youtube_id: ytid };

        if (editingId) {
            await supabase.from('rqs_tamyiz').update(videoData).eq('id', editingId);
        } else {
            await supabase.from('rqs_tamyiz').insert([videoData]);
        }
        
        setIsFormOpen(false);
        setEditingId(null);
        loadVideos();
    };

    const handleEdit = (vid) => {
        setEditingId(vid.id);
        setForm({
            title: vid.title,
            speaker: vid.speaker,
            duration: vid.duration,
            category: vid.category,
            youtube_url: vid.youtube_url
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus video materi ini?')) {
            setIsLoading(true);
            await supabase.from('rqs_tamyiz').delete().eq('id', id);
            loadVideos();
        }
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm({
            title: '',
            speaker: 'Ustadz Abu Rabbani',
            duration: '',
            category: categories[0],
            youtube_url: ''
        });
        setIsFormOpen(true);
    };

    if (isFormOpen) {
        return (
            <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative">
                <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                    <button onClick={() => setIsFormOpen(false)} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                        <PhosphorIcon icon="arrow-left" size={24} />
                    </button>
                    <h2 className="text-lg font-bold text-[#4A1C14]">
                        {editingId ? "Edit Materi" : "Tambah Materi Tamyiz"}
                    </h2>
                </div>

                <form onSubmit={handleSave} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Judul Materi</label>
                        <input required name="title" value={form.title} onChange={handleChange} type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500" placeholder="Contoh: Lagu Bijarrin" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Kategori</label>
                        <select required name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500 bg-white">
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Nama Pemateri</label>
                        <input required name="speaker" value={form.speaker} onChange={handleChange} type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500" placeholder="Contoh: Ustadz Abu Rabbani" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Link YouTube</label>
                        <input required name="youtube_url" value={form.youtube_url} onChange={handleChange} type="url" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500" placeholder="https://youtube.com/watch?v=..." />
                        {form.youtube_url && getYoutubeId(form.youtube_url) && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-gray-200">
                                <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${getYoutubeId(form.youtube_url)}`} frameBorder="0" allowFullScreen></iframe>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Durasi Video</label>
                        <input required name="duration" value={form.duration} onChange={handleChange} type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500" placeholder="Contoh: 15:20" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-teal-600 text-white font-bold rounded-xl p-3 mt-4 hover:bg-teal-700 transition-colors shadow-md">
                        {isLoading ? "Menyimpan..." : "Simpan Materi"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative">
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={onBack} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-2">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Tamyiz</h2>
                    <p className="text-[10px] text-teal-600">Manajemen Materi Tamyiz</p>
                </div>
                <button onClick={openAddForm} className="p-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-full transition">
                    <PhosphorIcon icon="plus" size={24} />
                </button>
            </div>

            <div className="p-5 space-y-4">
                {isLoading && <div className="text-center py-4"><PhosphorIcon icon="circle-notch" className="animate-spin text-teal-500 mx-auto" size={24}/></div>}
                
                {videos.map(vid => (
                    <div key={vid.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-3 relative group">
                        <div className="w-24 h-16 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200 shrink-0">
                            <img src={`https://img.youtube.com/vi/${vid.youtube_id}/mqdefault.jpg`} className="w-full h-full object-cover" alt="Thumb" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center pr-12">
                            <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{vid.title}</h4>
                            <p className="text-[10px] text-gray-500">{vid.category}</p>
                            <p className="text-[10px] text-teal-600 font-bold mt-0.5">{vid.duration}</p>
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                            <button onClick={() => handleEdit(vid)} className="w-7 h-7 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-100">
                                <PhosphorIcon icon="pencil-simple" size={14} />
                            </button>
                            <button onClick={() => handleDelete(vid.id)} className="w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100">
                                <PhosphorIcon icon="trash" size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {!isLoading && videos.length === 0 && (
                    <div className="text-center text-gray-400 py-10 text-sm">Belum ada materi Tamyiz. (Jika error, pastikan tabel rqs_tamyiz sudah dibuat di Supabase)</div>
                )}
            </div>
        </div>
    );
};

export default KelolaTamyiz;
