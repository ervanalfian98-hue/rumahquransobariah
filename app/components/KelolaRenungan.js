import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const KelolaRenungan = ({ onBack }) => {
    const [renunganList, setRenunganList] = useState([]);
    
    // Form states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [newExcerpt, setNewExcerpt] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newDate, setNewDate] = useState('');

    useEffect(() => {
        const fetchRenungan = async () => {
            const { data, error } = await supabase.from('rqs_renungan').select('*').order('created_at', { ascending: false });
            if (data && !error) {
                setRenunganList(data);
            }
        };
        fetchRenungan();
    }, []);

    const openAddForm = () => {
        setEditingId(null);
        setNewTitle('');
        setNewExcerpt('');
        setNewContent('');
        setNewDate('');
        setIsFormOpen(true);
    };

    const openEditForm = (item) => {
        setEditingId(item.id);
        setNewTitle(item.title);
        setNewExcerpt(item.excerpt);
        setNewContent(item.content);
        setNewDate(item.date);
        setIsFormOpen(true);
    };

    const handleSave = async () => {
        if (!newTitle || !newExcerpt || !newContent || !newDate) {
            alert("Harap lengkapi semua bidang!");
            return;
        }

        const payload = {
            title: newTitle,
            excerpt: newExcerpt,
            content: newContent,
            date: newDate
        };

        if (editingId) {
            // Edit existing item
            const { error } = await supabase.from('rqs_renungan').update(payload).eq('id', editingId);
            if (error) {
                console.error(error);
                alert('Gagal mengupdate renungan.');
                return;
            }
            setRenunganList(renunganList.map(item => item.id === editingId ? { ...item, ...payload } : item));
        } else {
            // Create new item
            const { data, error } = await supabase.from('rqs_renungan').insert([payload]).select();
            if (error) {
                console.error(error);
                alert('Gagal menambah renungan.');
                return;
            }
            if (data) {
                setRenunganList([data[0], ...renunganList]);
            }
        }

        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus renungan ini?")) {
            const { error } = await supabase.from('rqs_renungan').delete().eq('id', id);
            if (error) {
                console.error(error);
                alert('Gagal menghapus renungan.');
                return;
            }
            setRenunganList(renunganList.filter(item => item.id !== id));
        }
    };

    if (isFormOpen) {
        return (
            <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen">
                <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                    <button onClick={() => setIsFormOpen(false)} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                        <PhosphorIcon icon="arrow-left" size={24} />
                    </button>
                    <h2 className="text-lg font-bold text-[#4A1C14]">
                        {editingId ? "Edit Renungan" : "Tambah Renungan"}
                    </h2>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Judul Renungan</label>
                        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#B88A44]" placeholder="Contoh: Mensyukuri Nikmat Sehat" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Tanggal Hijriah</label>
                        <input value={newDate} onChange={(e) => setNewDate(e.target.value)} type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#B88A44]" placeholder="Contoh: 12 Muharram 1445 H" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Kutipan / Excerpt</label>
                        <textarea value={newExcerpt} onChange={(e) => setNewExcerpt(e.target.value)} rows="2" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#B88A44]" placeholder="Kutipan singkat yang menarik..."></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Isi Renungan</label>
                        <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows="6" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#B88A44]" placeholder="Isi lengkap renungan..."></textarea>
                    </div>
                    <button onClick={handleSave} className="w-full bg-[#4A1C14] text-white font-bold rounded-xl p-3 mt-4">
                        {editingId ? "Simpan Perubahan" : "Simpan Renungan"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen">
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={onBack} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-2">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Renungan</h2>
                    <p className="text-[10px] text-[#B88A44]">Manajemen Artikel</p>
                </div>
                <button onClick={openAddForm} className="p-2 bg-[#FDF9F1] text-[#B88A44] hover:bg-[#E8D2A6] rounded-full transition">
                    <PhosphorIcon icon="plus" size={24} />
                </button>
            </div>

            <div className="p-5 space-y-4">
                {renunganList.length === 0 && (
                    <div className="text-center text-gray-400 py-10 text-sm">Belum ada renungan. Silakan tambah baru.</div>
                )}
                {renunganList.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative group">
                        
                        {/* Action Buttons Container */}
                        <div className="absolute top-3 right-3 flex items-center space-x-2">
                            {/* Edit Button */}
                            <button 
                                onClick={() => openEditForm(item)} 
                                className="text-blue-400 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                                title="Edit Renungan"
                            >
                                <PhosphorIcon icon="pencil-simple" size={16} />
                            </button>

                            {/* Delete Button */}
                            <button 
                                onClick={() => handleDelete(item.id)} 
                                className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                                title="Hapus Renungan"
                            >
                                <PhosphorIcon icon="trash" size={16} />
                            </button>
                        </div>
                        
                        <h3 className="font-bold text-[#4A1C14] text-sm pr-16">{item.title}</h3>
                        <p className="text-[10px] text-[#B88A44] mt-1">{item.date}</p>
                        <p className="text-[11px] text-gray-600 mt-2 line-clamp-2">{item.excerpt}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KelolaRenungan;
