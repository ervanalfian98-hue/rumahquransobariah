import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const BroadcastPengumuman = ({ onBack }) => {
    const [pengumuman, setPengumuman] = useState([]);
    const [judul, setJudul] = useState('');
    const [tanggal, setTanggal] = useState('');
    const [isi, setIsi] = useState('');
    const [isEditing, setIsEditing] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.from('rqs_pengumuman').select('*').order('tanggal', { ascending: false }).order('created_at', { ascending: false });
                if (error) throw error;
                setPengumuman(data || []);
            } catch (error) {
                console.error("Supabase error:", error);
            }
        } else {
            const localData = JSON.parse(localStorage.getItem('dummy_pengumuman') || '[]');
            setPengumuman(localData);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!judul || !tanggal || !isi) return alert('Semua kolom wajib diisi!');
        setIsLoading(true);

        try {
            if (isSupabaseConfigured) {
                if (isEditing) {
                    const { error } = await supabase.from('rqs_pengumuman').update({ judul, tanggal, isi }).eq('id', isEditing);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('rqs_pengumuman').insert([{ judul, tanggal, isi }]);
                    if (error) throw error;
                }
            } else {
                const newItem = {
                    id: isEditing ? isEditing : Date.now().toString(),
                    judul,
                    tanggal,
                    isi
                };
                let newData;
                if (isEditing) {
                    newData = pengumuman.map(p => p.id === isEditing ? newItem : p);
                } else {
                    newData = [newItem, ...pengumuman];
                }
                // Sort descending
                newData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                localStorage.setItem('dummy_pengumuman', JSON.stringify(newData));
                setPengumuman(newData);
            }

            resetForm();
            if (isSupabaseConfigured) fetchData();

        } catch (error) {
            alert('Terjadi kesalahan: ' + error.message);
        } finally {
            setIsLoading(false);
            window.dispatchEvent(new Event('rqs-pengumuman-updated'));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;
        setIsLoading(true);

        try {
            if (isSupabaseConfigured) {
                await supabase.from('rqs_pengumuman').delete().eq('id', id);
                fetchData();
            } else {
                const newData = pengumuman.filter(p => p.id !== id);
                localStorage.setItem('dummy_pengumuman', JSON.stringify(newData));
                setPengumuman(newData);
            }
        } catch (error) {
            alert('Gagal menghapus: ' + error.message);
        } finally {
            setIsLoading(false);
            window.dispatchEvent(new Event('rqs-pengumuman-updated'));
        }
    };

    const handleEdit = (item) => {
        setIsEditing(item.id);
        setJudul(item.judul);
        setTanggal(item.tanggal);
        setIsi(item.isi);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setJudul('');
        setTanggal('');
        setIsi('');
    };

    return (
        <div className="pb-28 animate-in fade-in duration-300 bg-[#FDFBF7] min-h-screen relative z-30">
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Broadcast Pengumuman</h2>
                </div>
            </div>

            <div className="p-5 space-y-6">
                
                {!isSupabaseConfigured && (
                    <div className="bg-red-50 p-3 rounded-xl border border-red-200 flex gap-3 items-start">
                        <PhosphorIcon icon="warning" size={20} className="text-red-500 shrink-0 mt-0.5" weight="fill" />
                        <p className="text-[11px] text-red-800 leading-tight">
                            <strong>Mode Demo Aktif:</strong> Karena API Keys Supabase belum terpasang di <code>.env.local</code>, pengumuman disimpan di LocalStorage.
                        </p>
                    </div>
                )}

                {/* Form Input */}
                <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E8D2A6]/50">
                    <h3 className="font-bold text-[#4A1C14] mb-4">{isEditing ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#4A1C14] mb-1.5">Judul Pengumuman</label>
                            <input 
                                type="text"
                                value={judul}
                                onChange={(e) => setJudul(e.target.value)}
                                placeholder="Contoh: Libur Hari Raya"
                                className="w-full bg-[#FDFBF7] border border-[#E8D2A6] rounded-xl p-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#4A1C14] mb-1.5">Tanggal</label>
                            <input 
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                className="w-full bg-[#FDFBF7] border border-[#E8D2A6] rounded-xl p-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#4A1C14] mb-1.5">Isi Pengumuman</label>
                            <textarea 
                                value={isi}
                                onChange={(e) => setIsi(e.target.value)}
                                rows={4}
                                placeholder="Tuliskan isi pengumuman secara lengkap..."
                                className="w-full bg-[#FDFBF7] border border-[#E8D2A6] rounded-xl p-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] transition-colors resize-none"
                            ></textarea>
                        </div>

                        <div className="flex gap-2 pt-2">
                            {isEditing && (
                                <button 
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-[#FCF7E8] text-[#4A1C14] font-bold py-3 rounded-xl shadow-sm hover:bg-[#E8D2A6] transition-colors"
                                >
                                    Batal
                                </button>
                            )}
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className={`${isEditing ? 'flex-1' : 'w-full'} bg-[#B88A44] text-white font-bold py-3 rounded-xl shadow-md hover:bg-[#A37936] transition-colors flex items-center justify-center gap-2`}
                            >
                                {isLoading ? (
                                    <PhosphorIcon icon="spinner" className="animate-spin" size={20} />
                                ) : (
                                    <PhosphorIcon icon={isEditing ? "floppy-disk" : "paper-plane-right"} size={20} weight="bold" />
                                )}
                                {isLoading ? "Memproses..." : (isEditing ? "Simpan Perubahan" : "Kirim Pengumuman")}
                            </button>
                        </div>
                    </div>
                </form>

                {/* List Pengumuman */}
                <div>
                    <h3 className="font-bold text-[#4A1C14] mb-4 text-lg border-b-2 border-[#E8D2A6] inline-block pb-1">Histori Pengumuman</h3>
                    
                    <div className="space-y-3">
                        {pengumuman.length === 0 ? (
                            <div className="text-center p-8 bg-white rounded-2xl border border-[#E8D2A6]/50">
                                <PhosphorIcon icon="megaphone" size={48} className="text-[#E8D2A6] mx-auto mb-2" />
                                <p className="text-[#4A1C14]/60 text-xs">Belum ada pengumuman yang dikirim.</p>
                            </div>
                        ) : (
                            pengumuman.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-[#4A1C14] text-sm truncate">{item.judul}</h4>
                                            <div className="flex items-center gap-1 mt-1 text-[#B88A44]">
                                                <PhosphorIcon icon="calendar-blank" size={12} weight="bold" />
                                                <span className="text-[10px] font-medium">{item.tanggal}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 shrink-0">
                                            <button 
                                                onClick={() => handleEdit(item)}
                                                className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                            >
                                                <PhosphorIcon icon="pencil-simple" size={14} weight="bold" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="w-7 h-7 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                                            >
                                                <PhosphorIcon icon="x" size={14} weight="bold" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#E8D2A6]/30">
                                        <p className="text-xs text-[#4A1C14]/80 leading-relaxed whitespace-pre-wrap">{item.isi}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BroadcastPengumuman;
