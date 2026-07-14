import React, { useState, useEffect, useRef } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const GaleriDokumentasi = ({ onBack }) => {
    const [galeri, setGaleri] = useState([]);
    const [keterangan, setKeterangan] = useState('');
    const [tanggal, setTanggal] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const fileInputRef = useRef(null);

    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.from('galeri_dokumentasi').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                setGaleri(data || []);
            } catch (error) {
                console.error("Supabase error:", error);
            }
        } else {
            const localData = JSON.parse(localStorage.getItem('dummy_galeri') || '[]');
            setGaleri(localData);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!keterangan || !tanggal) return alert('Keterangan dan tanggal wajib diisi!');
        if (!isEditing && !file) return alert('Pilih gambar terlebih dahulu!');

        setIsLoading(true);

        try {
            let publicUrl = previewUrl; 
            let imagePath = null;

            if (isSupabaseConfigured) {
                if (file) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    imagePath = `dokumentasi/${fileName}`;

                    // Logika ke Supabase Storage
                    const { error: uploadError } = await supabase.storage.from('galeri').upload(imagePath, file);
                    if (uploadError) throw uploadError;

                    const { data: publicUrlData } = supabase.storage.from('galeri').getPublicUrl(imagePath);
                    publicUrl = publicUrlData.publicUrl;
                }

                if (isEditing) {
                    const updates = { keterangan, tanggal };
                    if (file) {
                        updates.image_url = publicUrl;
                        updates.image_path = imagePath;
                        
                        // Hapus gambar lama di storage agar tidak menumpuk
                        const oldItem = galeri.find(g => g.id === isEditing);
                        if (oldItem && oldItem.image_path) {
                            await supabase.storage.from('galeri').remove([oldItem.image_path]);
                        }
                    }
                    const { error } = await supabase.from('galeri_dokumentasi').update(updates).eq('id', isEditing);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('galeri_dokumentasi').insert([
                        { keterangan, tanggal, image_url: publicUrl, image_path: imagePath }
                    ]);
                    if (error) throw error;
                }
            } else {
                // Dummy LocalStorage Logic
                const newItem = {
                    id: isEditing ? isEditing : Date.now().toString(),
                    keterangan,
                    tanggal,
                    image_url: file ? previewUrl : (galeri.find(g => g.id === isEditing)?.image_url),
                    image_path: 'dummy/path.jpg'
                };

                let newData;
                if (isEditing) {
                    newData = galeri.map(g => g.id === isEditing ? newItem : g);
                } else {
                    newData = [newItem, ...galeri];
                }
                localStorage.setItem('dummy_galeri', JSON.stringify(newData));
                setGaleri(newData);
            }

            resetForm();
            if (isSupabaseConfigured) fetchData();

        } catch (error) {
            alert('Terjadi kesalahan: ' + error.message);
            console.error(error);
        } finally {
            setIsLoading(false);
            window.dispatchEvent(new Event('rqs-galeri-updated'));
        }
    };

    const handleDelete = async (id, imagePath) => {
        if (!confirm('Yakin ingin menghapus foto ini?')) return;
        setIsLoading(true);

        try {
            if (isSupabaseConfigured) {
                // HAPUS BERSIH LOGIKA: Hapus dari Supabase Storage
                if (imagePath) {
                    await supabase.storage.from('galeri').remove([imagePath]);
                }
                // Hapus baris data dari Database
                await supabase.from('galeri_dokumentasi').delete().eq('id', id);
                fetchData();
            } else {
                const newData = galeri.filter(g => g.id !== id);
                localStorage.setItem('dummy_galeri', JSON.stringify(newData));
                setGaleri(newData);
            }
        } catch (error) {
            alert('Gagal menghapus: ' + error.message);
        } finally {
            setIsLoading(false);
            window.dispatchEvent(new Event('rqs-galeri-updated'));
        }
    };

    const handleEdit = (item) => {
        setIsEditing(item.id);
        setKeterangan(item.keterangan);
        setTanggal(item.tanggal);
        setPreviewUrl(item.image_url);
        setFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(null);
        setKeterangan('');
        setTanggal('');
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="pb-28 animate-in fade-in duration-300 bg-[#FDFBF7] min-h-screen relative z-30">
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Galeri Dokumentasi</h2>
                </div>
            </div>

            <div className="p-5 space-y-6">
                
                {!isSupabaseConfigured && (
                    <div className="bg-red-50 p-3 rounded-xl border border-red-200 flex gap-3 items-start">
                        <PhosphorIcon icon="warning" size={20} className="text-red-500 shrink-0 mt-0.5" weight="fill" />
                        <p className="text-[11px] text-red-800 leading-tight">
                            <strong>Mode Demo Aktif:</strong> Karena API Keys Supabase belum Anda pasang di <code>.env.local</code>, foto akan disimpan di LocalStorage. Tapi kode murni logika ke Supabase (beserta hapus storage bersih) sudah siap tertanam di file ini!
                        </p>
                    </div>
                )}

                {/* Form Upload/Edit */}
                <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E8D2A6]/50">
                    <h3 className="font-bold text-[#4A1C14] mb-4">{isEditing ? 'Edit Dokumentasi' : 'Upload Foto Baru'}</h3>
                    
                    <div className="space-y-4">
                        {/* Image Upload Area */}
                        <div>
                            <label className="block text-xs font-bold text-[#4A1C14] mb-1.5">Foto Dokumentasi</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-40 bg-[#FCF7E8] border-2 border-dashed border-[#E8D2A6] rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative hover:border-[#B88A44] transition-colors"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <PhosphorIcon icon="image" size={32} className="text-[#B88A44] mb-2" />
                                        <span className="text-xs text-[#4A1C14]/70 font-medium">Klik untuk memilih foto</span>
                                    </>
                                )}
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                            />
                        </div>

                        {/* Keterangan */}
                        <div>
                            <label className="block text-xs font-bold text-[#4A1C14] mb-1.5">Keterangan / Judul</label>
                            <input 
                                type="text"
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                placeholder="Contoh: Kegiatan Kajian Rutin"
                                className="w-full bg-[#FDFBF7] border border-[#E8D2A6] rounded-xl p-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] transition-colors"
                            />
                        </div>

                        {/* Tanggal */}
                        <div>
                            <label className="block text-xs font-bold text-[#4A1C14] mb-1.5">Tanggal</label>
                            <input 
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                className="w-full bg-[#FDFBF7] border border-[#E8D2A6] rounded-xl p-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] transition-colors"
                            />
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
                                    <PhosphorIcon icon={isEditing ? "floppy-disk" : "upload-simple"} size={20} weight="bold" />
                                )}
                                {isLoading ? "Memproses..." : (isEditing ? "Simpan Perubahan" : "Upload")}
                            </button>
                        </div>
                    </div>
                </form>

                {/* List Galeri */}
                <div>
                    <h3 className="font-bold text-[#4A1C14] mb-4 text-lg border-b-2 border-[#E8D2A6] inline-block pb-1">Daftar Galeri</h3>
                    
                    <div className="space-y-4">
                        {galeri.length === 0 ? (
                            <div className="text-center p-8 bg-white rounded-2xl border border-[#E8D2A6]/50">
                                <PhosphorIcon icon="images" size={48} className="text-[#E8D2A6] mx-auto mb-2" />
                                <p className="text-[#4A1C14]/60 text-xs">Belum ada foto yang diupload.</p>
                            </div>
                        ) : (
                            galeri.map((item) => (
                                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex gap-3 items-center">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-[#E8D2A6]/50">
                                        <img src={item.image_url} alt={item.keterangan} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-[#4A1C14] text-sm truncate">{item.keterangan}</h4>
                                        <div className="flex items-center gap-1 mt-1 text-[#B88A44]">
                                            <PhosphorIcon icon="calendar-blank" size={12} weight="bold" />
                                            <span className="text-[10px] font-medium">{item.tanggal}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button 
                                            onClick={() => handleEdit(item)}
                                            className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                        >
                                            <PhosphorIcon icon="pencil-simple" size={16} weight="bold" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id, item.image_path)}
                                            className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                                        >
                                            <PhosphorIcon icon="x" size={16} weight="bold" />
                                        </button>
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

export default GaleriDokumentasi;
