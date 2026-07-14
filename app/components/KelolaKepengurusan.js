import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';

const KelolaKepengurusan = ({ onBack }) => {
    const [pengurusList, setPengurusList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState(null);
    const [type, setType] = useState('pimpinan'); // pimpinan, divisi
    const [namaLengkap, setNamaLengkap] = useState('');
    const [peran, setPeran] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [icon, setIcon] = useState('user'); // For divisi

    const ICON_OPTIONS = ['user', 'users', 'books', 'megaphone', 'chart-bar', 'heart', 'shield-check'];

    const loadPengurus = () => {
        const saved = localStorage.getItem('rqs_kepengurusan');
        if (saved) {
            setPengurusList(JSON.parse(saved));
        } else {
            // Default mock data if empty
            const initialData = [
                { id: '1', type: 'pimpinan', namaLengkap: 'Ust. H. Sobari, S.Pd.I', peran: 'Pembina / Pendiri', icon: 'user-circle' },
                { id: '2', type: 'pimpinan', namaLengkap: 'Ust. Ahmad Fulan', peran: 'Ketua Yayasan RQS', icon: 'user' },
                { id: '3', type: 'divisi', namaLengkap: 'Ust. Zaid', peran: 'Bidang Pendidikan', deskripsi: 'Membawahi Kurikulum Tahsin & Tahfidz', icon: 'books' },
                { id: '4', type: 'divisi', namaLengkap: 'Ust. Umar', peran: 'Bidang Dakwah & Sosial', deskripsi: 'Program Kajian Umum & Donasi', icon: 'megaphone' },
                { id: '5', type: 'divisi', namaLengkap: 'Ust. Ali', peran: 'Bidang Humas & Media', deskripsi: 'Informasi, Desain & Publikasi', icon: 'users' },
            ];
            localStorage.setItem('rqs_kepengurusan', JSON.stringify(initialData));
            setPengurusList(initialData);
        }
    };

    useEffect(() => {
        loadPengurus();
        window.addEventListener('storage', loadPengurus);
        window.addEventListener('rqs-kepengurusan-updated', loadPengurus);
        return () => {
            window.removeEventListener('storage', loadPengurus);
            window.removeEventListener('rqs-kepengurusan-updated', loadPengurus);
        };
    }, []);

    const handleSave = () => {
        if (!namaLengkap.trim() || !peran.trim()) return alert("Nama dan Peran/Jabatan wajib diisi.");

        const saved = JSON.parse(localStorage.getItem('rqs_kepengurusan') || '[]');
        let updated;

        if (editingId) {
            updated = saved.map(p => p.id === editingId ? { ...p, type, namaLengkap, peran, deskripsi, icon } : p);
        } else {
            const newPengurus = {
                id: Date.now().toString(),
                type,
                namaLengkap,
                peran,
                deskripsi: type === 'divisi' ? deskripsi : '',
                icon: type === 'divisi' ? icon : (type === 'pimpinan' ? 'user' : 'user')
            };
            updated = [...saved, newPengurus];
        }

        localStorage.setItem('rqs_kepengurusan', JSON.stringify(updated));
        window.dispatchEvent(new Event('rqs-kepengurusan-updated'));
        
        setIsModalOpen(false);
        resetForm();
    };

    const handleDelete = (id) => {
        if (window.confirm("Yakin ingin menghapus pengurus ini?")) {
            const saved = JSON.parse(localStorage.getItem('rqs_kepengurusan') || '[]');
            const updated = saved.filter(p => p.id !== id);
            localStorage.setItem('rqs_kepengurusan', JSON.stringify(updated));
            window.dispatchEvent(new Event('rqs-kepengurusan-updated'));
        }
    };

    const openEdit = (item) => {
        setEditingId(item.id);
        setType(item.type);
        setNamaLengkap(item.namaLengkap);
        setPeran(item.peran);
        setDeskripsi(item.deskripsi || '');
        setIcon(item.icon || 'user');
        setIsModalOpen(true);
    };

    const openAdd = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setType('pimpinan');
        setNamaLengkap('');
        setPeran('');
        setDeskripsi('');
        setIcon('user');
    };

    const pimpinanList = pengurusList.filter(p => p.type === 'pimpinan');
    const divisiList = pengurusList.filter(p => p.type === 'divisi');

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Kepengurusan</h2>
                </div>
            </div>

            <div className="px-5 mt-6">
                <button 
                    onClick={openAdd}
                    className="w-full bg-[#4A1C14] text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-[#3A140E] transition-colors flex items-center justify-center gap-2 mb-6"
                >
                    <PhosphorIcon icon="plus-circle" size={20} weight="fill" />
                    Tambah Pengurus Baru
                </button>

                {/* Seksi Dewan Pimpinan */}
                <h3 className="font-bold text-[#4A1C14] text-sm mb-3 border-b border-[#E8D2A6]/30 pb-2">
                    Dewan Pimpinan & Pembina
                </h3>
                
                {pimpinanList.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-[#E8D2A6] mb-6">
                        <p className="text-[11px] text-[#4A1C14]/60">Belum ada data pimpinan.</p>
                    </div>
                ) : (
                    <div className="space-y-3 mb-8">
                        {pimpinanList.map((p) => (
                            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                    <PhosphorIcon icon="user-circle" size={24} weight="fill" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm">{p.namaLengkap}</h4>
                                    <p className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                                        {p.peran}
                                    </p>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                    <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg">
                                        <PhosphorIcon icon="pencil-simple" size={16} weight="bold" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">
                                        <PhosphorIcon icon="trash" size={16} weight="bold" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Seksi Divisi */}
                <h3 className="font-bold text-[#4A1C14] text-sm mb-3 border-b border-[#E8D2A6]/30 pb-2">
                    Divisi & Koordinator
                </h3>

                {divisiList.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-[#E8D2A6]">
                        <p className="text-[11px] text-[#4A1C14]/60">Belum ada data divisi.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {divisiList.map((p) => (
                            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col gap-2 relative">
                                <div className="absolute top-4 right-4 flex gap-1.5">
                                    <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg">
                                        <PhosphorIcon icon="pencil-simple" size={14} weight="bold" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">
                                        <PhosphorIcon icon="trash" size={14} weight="bold" />
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-3 pr-16">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                        <PhosphorIcon icon={p.icon || 'users'} size={20} weight="fill" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-[13px]">{p.peran}</h4>
                                        <p className="text-[10px] font-bold text-gray-600 mt-0.5">Koor: {p.namaLengkap}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 mt-1">
                                    <p className="text-[10px] text-gray-500">{p.deskripsi}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
                        >
                            <div className="p-4 bg-white border-b border-[#E8D2A6]/30 flex items-center justify-between sticky top-0 z-10">
                                <h3 className="text-sm font-bold text-[#4A1C14] flex items-center gap-2">
                                    <PhosphorIcon icon={editingId ? "pencil-simple" : "plus-circle"} size={18} className="text-[#B88A44]" />
                                    {editingId ? 'Edit Pengurus' : 'Tambah Pengurus'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1.5">
                                    <PhosphorIcon icon="x" size={16} weight="bold" />
                                </button>
                            </div>
                            
                            <div className="p-5 overflow-y-auto bg-[#FDFBF7] flex-1">
                                <div className="space-y-4">
                                    {/* Jenis Posisi */}
                                    <div>
                                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Jenis Posisi</label>
                                        <div className="flex gap-2">
                                            <label className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors ${type === 'pimpinan' ? 'bg-[#FCF7E8] border-[#B88A44] text-[#B88A44]' : 'bg-white border-[#E8D2A6]/50 text-[#4A1C14]/60'}`}>
                                                <input type="radio" value="pimpinan" checked={type === 'pimpinan'} onChange={() => setType('pimpinan')} className="hidden" />
                                                Pimpinan Utama
                                            </label>
                                            <label className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors ${type === 'divisi' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-[#E8D2A6]/50 text-[#4A1C14]/60'}`}>
                                                <input type="radio" value="divisi" checked={type === 'divisi'} onChange={() => setType('divisi')} className="hidden" />
                                                Divisi / Bidang
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">
                                            {type === 'pimpinan' ? 'Nama Pimpinan' : 'Nama Koordinator'}
                                        </label>
                                        <input 
                                            type="text" 
                                            value={namaLengkap}
                                            onChange={(e) => setNamaLengkap(e.target.value)}
                                            placeholder={type === 'pimpinan' ? "Cth: Ust. H. Sobari, S.Pd.I" : "Cth: Ust. Zaid"} 
                                            className="w-full bg-white border border-[#E8D2A6]/80 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">
                                            {type === 'pimpinan' ? 'Jabatan' : 'Nama Divisi/Bidang'}
                                        </label>
                                        <input 
                                            type="text" 
                                            value={peran}
                                            onChange={(e) => setPeran(e.target.value)}
                                            placeholder={type === 'pimpinan' ? "Cth: Pembina / Pendiri" : "Cth: Bidang Pendidikan"} 
                                            className="w-full bg-white border border-[#E8D2A6]/80 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44]"
                                        />
                                    </div>

                                    {type === 'divisi' && (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Deskripsi Divisi</label>
                                                <textarea 
                                                    value={deskripsi}
                                                    onChange={(e) => setDeskripsi(e.target.value)}
                                                    placeholder="Cth: Membawahi Kurikulum Tahsin & Tahfidz"
                                                    rows="2"
                                                    className="w-full bg-white border border-[#E8D2A6]/80 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] resize-none"
                                                ></textarea>
                                            </div>
                                            
                                            <div>
                                                <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Pilih Ikon</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {ICON_OPTIONS.map(i => (
                                                        <div 
                                                            key={i} 
                                                            onClick={() => setIcon(i)}
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border transition-colors ${icon === i ? 'bg-emerald-50 border-emerald-400 text-emerald-600' : 'bg-white border-gray-200 text-gray-400'}`}
                                                        >
                                                            <PhosphorIcon icon={i} size={20} weight={icon === i ? "fill" : "regular"} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="p-4 bg-white border-t border-[#E8D2A6]/30">
                                <button 
                                    onClick={handleSave}
                                    className="w-full bg-[#4A1C14] text-white font-bold text-sm py-3.5 rounded-xl shadow-md hover:bg-[#3A140E] transition-colors"
                                >
                                    {editingId ? 'Simpan Perubahan' : 'Tambah Data'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KelolaKepengurusan;
