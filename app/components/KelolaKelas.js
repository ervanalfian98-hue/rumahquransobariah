import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { CLASSES as INITIAL_CLASSES } from './MockData';

const KelolaKelas = ({ onBack }) => {
    const [classes, setClasses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [tingkatan, setTingkatan] = useState('Dasar');
    const [color, setColor] = useState('bg-[#F5EBE9] text-[#4A1C14]'); // Default

    const COLOR_OPTIONS = [
        { label: 'Coklat Muda', value: 'bg-[#F5EBE9] text-[#4A1C14]' },
        { label: 'Emas/Kuning', value: 'bg-[#FCF7E8] text-[#B88A44]' },
        { label: 'Abu-abu', value: 'bg-stone-100 text-stone-700' },
        { label: 'Merah Muda', value: 'bg-red-50 text-red-800' },
        { label: 'Kuning Jingga', value: 'bg-amber-100 text-amber-800' },
        { label: 'Oranye', value: 'bg-orange-50 text-orange-800' },
        { label: 'Hijau', value: 'bg-emerald-50 text-emerald-800' },
        { label: 'Biru', value: 'bg-blue-50 text-blue-800' },
        { label: 'Ungu', value: 'bg-purple-50 text-purple-800' }
    ];

    const TINGKATAN_OPTIONS = ['Dasar', 'Menengah', 'Lanjutan', 'Khusus'];

    useEffect(() => {
        const loadClasses = () => {
            const saved = localStorage.getItem('rqs_classes');
            if (saved) {
                setClasses(JSON.parse(saved));
            } else {
                setClasses(INITIAL_CLASSES);
                localStorage.setItem('rqs_classes', JSON.stringify(INITIAL_CLASSES));
            }
        };
        loadClasses();
        window.addEventListener('storage', loadClasses);
        return () => window.removeEventListener('storage', loadClasses);
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        
        const id = editingId || name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
        const newClass = { id, name, desc, tingkatan, color };

        let updated;
        if (editingId) {
            updated = classes.map(c => c.id === editingId ? newClass : c);
        } else {
            updated = [...classes, newClass];
        }

        setClasses(updated);
        localStorage.setItem('rqs_classes', JSON.stringify(updated));
        window.dispatchEvent(new Event('rqs-classes-updated'));

        setIsModalOpen(false);
        resetForm();
    };

    const handleDelete = (id) => {
        if (!window.confirm('Yakin ingin menghapus kelas ini? Tholibah atau Pengajar yang terkait dengan kelas ini mungkin perlu diatur ulang.')) return;

        const updated = classes.filter(c => c.id !== id);
        setClasses(updated);
        localStorage.setItem('rqs_classes', JSON.stringify(updated));
        window.dispatchEvent(new Event('rqs-classes-updated'));
    };

    const handleEdit = (cls) => {
        setEditingId(cls.id);
        setName(cls.name);
        setDesc(cls.desc || '');
        setTingkatan(cls.tingkatan || 'Dasar');
        setColor(cls.color || 'bg-[#F5EBE9] text-[#4A1C14]');
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setDesc('');
        setTingkatan('Dasar');
        setColor('bg-[#F5EBE9] text-[#4A1C14]');
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-24">
            <div className="p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                        <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Kelas</h2>
                        <p className="text-[10px] text-[#B88A44] font-medium">Manajemen Kelas Pendidikan</p>
                    </div>
                </div>
                <button onClick={openAddModal} className="w-8 h-8 bg-[#4A1C14] text-[#FCF7E8] rounded-full flex items-center justify-center shadow-md">
                    <PhosphorIcon icon="plus" size={16} weight="bold" />
                </button>
            </div>

            <div className="p-5">
                <div className="space-y-4">
                    {classes.map(cls => (
                        <div key={cls.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${cls.color.split(' ')[0]} ${cls.color.split(' ')[1]}`}>
                                        <PhosphorIcon icon="book-open" size={24} weight="duotone" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#4A1C14] text-[15px]">{cls.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-bold bg-[#FCF7E8] text-[#B88A44] px-2 py-0.5 rounded uppercase tracking-wider">
                                                Tingkat: {cls.tingkatan || 'Dasar'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 relative z-10">
                                    <button onClick={() => handleEdit(cls)} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-100">
                                        <PhosphorIcon icon="pencil-simple" size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(cls.id)} className="w-8 h-8 bg-red-50 text-red-600 rounded-full flex items-center justify-center hover:bg-red-100">
                                        <PhosphorIcon icon="trash" size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[11px] text-[#4A1C14]/70 mt-2">{cls.desc}</p>
                        </div>
                    ))}
                    
                    {classes.length === 0 && (
                        <div className="text-center p-8 bg-white border border-dashed border-[#E8D2A6] rounded-2xl">
                            <PhosphorIcon icon="books" size={32} className="mx-auto text-[#B88A44]/50 mb-2" />
                            <p className="text-[12px] text-[#4A1C14]/60">Belum ada kelas. Silakan tambahkan kelas baru.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-5 shrink-0">
                                <h3 className="text-lg font-bold text-[#4A1C14]">
                                    {editingId ? 'Edit Kelas' : 'Tambah Kelas'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center hover:bg-gray-200">
                                    <PhosphorIcon icon="x" size={16} weight="bold" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4 overflow-y-auto hide-scrollbar pb-2">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#4A1C14]/70 mb-1.5 ml-1">Nama Kelas</label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 rounded-xl px-4 py-3 text-[13px] text-[#4A1C14] font-medium focus:outline-none focus:border-[#B88A44]"
                                        placeholder="Contoh: Tahsin Pemula"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[11px] font-bold text-[#4A1C14]/70 mb-1.5 ml-1">Tingkatan</label>
                                    <select 
                                        value={tingkatan}
                                        onChange={e => setTingkatan(e.target.value)}
                                        className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 rounded-xl px-4 py-3 text-[13px] text-[#4A1C14] font-medium focus:outline-none focus:border-[#B88A44]"
                                    >
                                        {TINGKATAN_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#4A1C14]/70 mb-1.5 ml-1">Deskripsi Singkat</label>
                                    <textarea 
                                        required 
                                        value={desc} 
                                        onChange={e => setDesc(e.target.value)}
                                        rows="2"
                                        className="w-full bg-[#FCF7E8] border border-[#E8D2A6]/50 rounded-xl px-4 py-3 text-[13px] text-[#4A1C14] font-medium focus:outline-none focus:border-[#B88A44] resize-none"
                                        placeholder="Contoh: Belajar huruf hijaiyah dari nol."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#4A1C14]/70 mb-1.5 ml-1">Warna Tema</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {COLOR_OPTIONS.map(opt => (
                                            <div 
                                                key={opt.value}
                                                onClick={() => setColor(opt.value)}
                                                className={`w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center transition-all ${opt.value.split(' ')[0]} ${color === opt.value ? 'border-[#4A1C14] scale-110' : 'border-transparent hover:scale-105'}`}
                                                title={opt.label}
                                            >
                                                {color === opt.value && <PhosphorIcon icon="check" size={16} className={opt.value.split(' ')[1]} weight="bold" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button type="submit" className="w-full bg-[#4A1C14] text-[#FCF7E8] rounded-xl py-3.5 font-bold text-[14px] shadow-md active:scale-[0.98] transition-transform">
                                        Simpan Kelas
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KelolaKelas;
