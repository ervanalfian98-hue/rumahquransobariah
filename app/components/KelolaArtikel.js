import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const getTodayHijri = () => {
    const today = new Date();
    return new Intl.DateTimeFormat('id-TN-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(today) + " H";
};

const getTodayTimestamp = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) + " " + today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const KelolaArtikel = ({ onBack }) => {
    const [artikelList, setArtikelList] = useState([]);
    const [categories, setCategories] = useState(['Aqidah', 'Fiqih', 'Akhlaq', 'Sejarah Islam', 'Tafsir', 'Umum']);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form fields
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(''); 
    const [imagePreview, setImagePreview] = useState('');
    
    // Auto dates
    const [timestamp, setTimestamp] = useState('');
    const [hijriDate, setHijriDate] = useState('');

    const loadArtikel = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('rqs_artikel')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error && data) {
            setArtikelList(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadArtikel();

        const storedCats = localStorage.getItem('rqs_artikel_categories');
        if (storedCats) {
            const parsedCats = JSON.parse(storedCats);
            setCategories(parsedCats);
            if (parsedCats.length > 0 && !category) {
                setCategory(parsedCats[0]);
            }
        } else if (!category) {
            setCategory('Aqidah');
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran gambar terlalu besar. Maksimal 2MB.');
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onload = (upload) => {
                setImagePreview(upload.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddCategory = () => {
        const newCat = window.prompt("Masukkan nama kategori ilmu baru (contoh: Tasawuf, Siroh Nabawiyah):");
        if (newCat && newCat.trim() !== '') {
            const formattedCat = newCat.trim();
            if (!categories.includes(formattedCat)) {
                const updatedCats = [...categories, formattedCat];
                setCategories(updatedCats);
                localStorage.setItem('rqs_artikel_categories', JSON.stringify(updatedCats));
            }
            setCategory(formattedCat);
        }
    };

    const openAddForm = () => {
        setEditingId(null);
        setTitle('');
        setCategory(categories[0] || 'Umum');
        setContent('');
        setImage('');
        setImagePreview('');
        setTimestamp(getTodayTimestamp());
        setHijriDate(getTodayHijri());
        setIsFormOpen(true);
    };

    const openEditForm = (item) => {
        setEditingId(item.id);
        setTitle(item.title);
        
        if (!categories.includes(item.category)) {
            const updatedCats = [...categories, item.category];
            setCategories(updatedCats);
            localStorage.setItem('rqs_artikel_categories', JSON.stringify(updatedCats));
        }
        
        setCategory(item.category);
        setContent(item.content);
        setImage(item.image || '');
        setImagePreview(item.image || '');
        setTimestamp(item.timestamp);
        setHijriDate(item.hijriDate);
        setIsFormOpen(true);
    };

    const handleSave = async () => {
        if (!title || !content || (!image && !imagePreview)) {
            alert("Harap lengkapi Judul, Gambar, dan Isi Artikel!");
            return;
        }

        setIsLoading(true);
        let finalImageUrl = typeof image === 'string' ? image : '';

        if (typeof image !== 'string' && image instanceof File) {
            const fileExt = image.name.split('.').pop();
            const fileName = `artikel-${Date.now()}.${fileExt}`;
            const { data, error } = await supabase.storage
                .from('artikel')
                .upload(fileName, image, { cacheControl: '3600', upsert: false });
                
            if (error) {
                alert('Gagal mengupload gambar: ' + error.message);
                setIsLoading(false);
                return;
            }
            const { data: publicUrlData } = supabase.storage.from('artikel').getPublicUrl(fileName);
            finalImageUrl = publicUrlData.publicUrl;
        }

        const articleData = {
            title,
            category,
            content,
            image: finalImageUrl,
            timestamp,
            hijriDate
        };

        if (editingId) {
            const { error } = await supabase.from('rqs_artikel').update(articleData).eq('id', editingId);
            if (error) alert('Error update: ' + error.message);
        } else {
            const { error } = await supabase.from('rqs_artikel').insert([articleData]);
            if (error) alert('Error insert: ' + error.message);
        }

        setIsLoading(false);
        setIsFormOpen(false);
        loadArtikel();
    };

    const handleDelete = async (id, imageUrl) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus artikel ini? (Gambar juga akan dihapus)")) {
            setIsLoading(true);
            const { error } = await supabase.from('rqs_artikel').delete().eq('id', id);
            
            if (!error && imageUrl && imageUrl.includes('supabase.co/storage/v1/object/public/artikel/')) {
                const fileName = imageUrl.split('/').pop();
                await supabase.storage.from('artikel').remove([fileName]);
            }
            
            setIsLoading(false);
            loadArtikel();
        }
    };

    if (isFormOpen) {
        return (
            <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative">
                {isLoading && (
                    <div className="fixed inset-0 bg-white/50 z-[100] flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                            <PhosphorIcon icon="circle-notch" className="animate-spin text-[#B88A44]" size={24} />
                            <span className="font-bold text-gray-700 text-sm">Menyimpan Artikel...</span>
                        </div>
                    </div>
                )}
                <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                    <button onClick={() => setIsFormOpen(false)} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                        <PhosphorIcon icon="arrow-left" size={24} />
                    </button>
                    <h2 className="text-lg font-bold text-[#4A1C14]">
                        {editingId ? "Edit Artikel" : "Tulis Artikel"}
                    </h2>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Gambar Artikel</label>
                        {imagePreview ? (
                            <div className="relative w-full h-40 rounded-xl overflow-hidden mb-2 shadow-sm border border-gray-200">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button onClick={() => { setImage(''); setImagePreview(''); }} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors">
                                    <PhosphorIcon icon="x" size={16} />
                                </button>
                            </div>
                        ) : (
                            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:outline-none" />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Judul Artikel</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#B88A44]" placeholder="Contoh: Pentingnya Menjaga Lisan" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Kategori Ilmu</label>
                        <div className="flex gap-2">
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#B88A44] bg-white">
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleAddCategory} 
                                className="bg-[#FDF9F1] text-[#B88A44] border border-[#E8D2A6] px-4 rounded-xl font-bold flex items-center justify-center hover:bg-[#E8D2A6] transition"
                                title="Tambah Kategori Baru"
                            >
                                <PhosphorIcon icon="plus" size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-[#4A1C14] mb-1">Waktu (Auto)</label>
                            <input value={timestamp} readOnly type="text" className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-xs text-gray-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#4A1C14] mb-1">Hijriah (Auto)</label>
                            <input value={hijriDate} readOnly type="text" className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-xs text-gray-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Isi Artikel</label>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="8" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#B88A44]" placeholder="Tuliskan isi artikel Anda di sini..."></textarea>
                    </div>
                    <button onClick={handleSave} className="w-full bg-[#4A1C14] text-white font-bold rounded-xl p-3 mt-4 hover:bg-[#3A140F] transition-colors shadow-md">
                        {editingId ? "Simpan Perubahan" : "Terbitkan Artikel"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative">
            {isLoading && (
                <div className="fixed inset-0 bg-white/50 z-[100] flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                        <PhosphorIcon icon="circle-notch" className="animate-spin text-[#B88A44]" size={24} />
                        <span className="font-bold text-gray-700 text-sm">Memuat...</span>
                    </div>
                </div>
            )}
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={onBack} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-2">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Artikel</h2>
                    <p className="text-[10px] text-[#B88A44]">Manajemen Blog RQS</p>
                </div>
                <button onClick={openAddForm} className="p-2 bg-[#FDF9F1] text-[#B88A44] hover:bg-[#E8D2A6] rounded-full transition">
                    <PhosphorIcon icon="plus" size={24} />
                </button>
            </div>

            <div className="p-5 space-y-4">
                {artikelList.length === 0 && (
                    <div className="text-center text-gray-400 py-10 text-sm">Belum ada artikel. Silakan tambah baru atau Database belum siap.</div>
                )}
                {artikelList.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative group flex gap-3">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="absolute top-3 right-3 flex items-center space-x-2">
                                <button onClick={() => openEditForm(item)} className="text-blue-400 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors">
                                    <PhosphorIcon icon="pencil-simple" size={16} />
                                </button>
                                <button onClick={() => handleDelete(item.id, item.image)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors">
                                    <PhosphorIcon icon="trash" size={16} />
                                </button>
                            </div>

                            <span className="inline-block bg-[#FDF9F1] text-[#B88A44] border border-[#E8D2A6] text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">
                                {item.category}
                            </span>
                            <h3 className="font-bold text-[#4A1C14] text-sm pr-16 line-clamp-2 leading-snug">{item.title}</h3>
                            <p className="text-[10px] text-gray-400 mt-1">{item.timestamp ? item.timestamp.split(' ')[0] : ''}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KelolaArtikel;
