import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';

const KELAS_LIST = [
    { id: 'tahsin_pemula', name: 'Tahsin Pemula' },
    { id: 'tahsin_teori', name: 'Tahsin Teori' },
    { id: 'pra_tahfidz', name: 'Pra Tahfidz' },
    { id: 'tahfidz', name: 'Tahfidz' },
    { id: 'b_arab_tamyiz', name: 'B. Arab Tamyiz' },
    { id: 'ulc', name: 'ULC' },
    { id: 'matan', name: 'Matan' }
];

const KelolaPengajar = ({ onBack }) => {
    const [pengajarList, setPengajarList] = useState([]);
    const [managementUsers, setManagementUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState(null);
    const [nama, setNama] = useState('');
    const [userId, setUserId] = useState('');
    const [gender, setGender] = useState('ustadzah');
    const [selectedClasses, setSelectedClasses] = useState([]);

    const loadPengajar = () => {
        // Load all users to find management
        const allUsers = JSON.parse(localStorage.getItem('rqs_users') || '[]');
        const mngUsers = allUsers.filter(u => u.role === 'management' && u.verified !== false);
        setManagementUsers(mngUsers);

        const saved = localStorage.getItem('rqs_pengajar');
        if (saved) {
            setPengajarList(JSON.parse(saved));
        } else {
            // Default mock data if empty
            const initialData = [
                { id: '1', name: 'Lia', gender: 'ustadzah', classes: ['tahsin_teori'] }
            ];
            localStorage.setItem('rqs_pengajar', JSON.stringify(initialData));
            setPengajarList(initialData);
        }
    };

    useEffect(() => {
        loadPengajar();
        window.addEventListener('storage', loadPengajar);
        window.addEventListener('rqs-pengajar-updated', loadPengajar);
        return () => {
            window.removeEventListener('storage', loadPengajar);
            window.removeEventListener('rqs-pengajar-updated', loadPengajar);
        };
    }, []);

    const handleSave = () => {
        if (!nama.trim()) return alert("Nama pengajar tidak boleh kosong.");
        if (selectedClasses.length === 0) return alert("Pilih minimal satu kelas untuk diajar.");

        const saved = JSON.parse(localStorage.getItem('rqs_pengajar') || '[]');
        let updated;

        if (editingId) {
            updated = saved.map(p => p.id === editingId ? { ...p, name: nama, gender, classes: selectedClasses, userId } : p);
        } else {
            const newPengajar = {
                id: Date.now().toString(),
                name: nama,
                userId,
                gender,
                classes: selectedClasses
            };
            updated = [...saved, newPengajar];
        }

        localStorage.setItem('rqs_pengajar', JSON.stringify(updated));
        window.dispatchEvent(new Event('rqs-pengajar-updated'));
        
        setIsModalOpen(false);
        resetForm();
    };

    const handleDelete = (id) => {
        if (window.confirm("Yakin ingin menghapus pengajar ini?")) {
            const saved = JSON.parse(localStorage.getItem('rqs_pengajar') || '[]');
            const updated = saved.filter(p => p.id !== id);
            localStorage.setItem('rqs_pengajar', JSON.stringify(updated));
            window.dispatchEvent(new Event('rqs-pengajar-updated'));
        }
    };

    const openEdit = (pengajar) => {
        setEditingId(pengajar.id);
        setNama(pengajar.name);
        setUserId(pengajar.userId || '');
        setGender(pengajar.gender);
        setSelectedClasses(pengajar.classes || []);
        setIsModalOpen(true);
    };

    const openAdd = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setNama('');
        setUserId('');
        setGender('ustadzah');
        setSelectedClasses([]);
    };

    const toggleClass = (classId) => {
        if (selectedClasses.includes(classId)) {
            setSelectedClasses(selectedClasses.filter(id => id !== classId));
        } else {
            setSelectedClasses([...selectedClasses, classId]);
        }
    };

    const getClassName = (id) => {
        const cls = KELAS_LIST.find(c => c.id === id);
        return cls ? cls.name : id;
    };

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Pengajar</h2>
                </div>
            </div>

            <div className="px-5 mt-6">
                <button 
                    onClick={openAdd}
                    className="w-full bg-[#4A1C14] text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-[#3A140E] transition-colors flex items-center justify-center gap-2 mb-6"
                >
                    <PhosphorIcon icon="user-plus" size={20} weight="fill" />
                    Tambah Pengajar Baru
                </button>

                <h3 className="font-bold text-[#4A1C14] text-sm mb-3 border-b border-[#E8D2A6]/30 pb-2">
                    Daftar Pengajar Aktif
                </h3>

                {pengajarList.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-[#E8D2A6]">
                        <PhosphorIcon icon="users-slash" size={32} className="mx-auto text-[#B88A44]/50 mb-2" />
                        <p className="text-[12px] text-[#4A1C14]/60">Belum ada pengajar yang didaftarkan.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pengajarList.map((p) => (
                            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8D2A6]/50 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${p.gender === 'ustadz' ? 'bg-blue-600' : 'bg-[#B88A44]'}`}>
                                            {p.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#4A1C14] text-sm">
                                                {p.gender === 'ustadz' ? 'Ustadz ' : 'Ustadzah '}{p.name}
                                            </h4>
                                            <p className="text-[10px] text-[#4A1C14]/60 bg-[#FCF7E8] px-2 py-0.5 rounded-md inline-block mt-1">
                                                {p.classes.length} Kelas Diajar
                                            </p>
                                            <p className="text-[9px] text-gray-400 mt-1">
                                                Akun: {managementUsers.find(u => u.id === p.userId)?.nama || 'Belum dihubungkan'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                            <PhosphorIcon icon="pencil-simple" size={16} weight="bold" />
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                            <PhosphorIcon icon="trash" size={16} weight="bold" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-[10px] font-bold text-[#4A1C14] mb-2 flex items-center gap-1">
                                        <PhosphorIcon icon="chalkboard-teacher" size={14} className="text-[#B88A44]" /> Mengajar di:
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {p.classes.map(clsId => (
                                            <span key={clsId} className="text-[9px] font-bold text-[#4A1C14]/80 bg-white border border-[#E8D2A6]/50 px-2 py-1 rounded-full shadow-sm">
                                                {getClassName(clsId)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Tambah/Edit Pengajar */}
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
                                    <PhosphorIcon icon={editingId ? "pencil-simple" : "user-plus"} size={18} className="text-[#B88A44]" />
                                    {editingId ? 'Edit Pengajar' : 'Tambah Pengajar'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1.5">
                                    <PhosphorIcon icon="x" size={16} weight="bold" />
                                </button>
                            </div>
                            
                            <div className="p-5 overflow-y-auto bg-[#FDFBF7] flex-1">
                                <div className="space-y-4">
                                    {/* Nama Pengajar */}
                                    <div>
                                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Nama Panggilan</label>
                                        <input 
                                            type="text" 
                                            value={nama}
                                            onChange={(e) => setNama(e.target.value)}
                                            placeholder="Cth: Lia, Hanan..." 
                                            className="w-full bg-white border border-[#E8D2A6]/80 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] transition-all"
                                        />
                                    </div>

                                    {/* Akun Terdaftar */}
                                    <div>
                                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Akun Terdaftar</label>
                                        <select 
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            className="w-full bg-white border border-[#E8D2A6]/80 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] transition-all"
                                        >
                                            <option value="">-- Pilih Akun (Opsional) --</option>
                                            {managementUsers.map(u => (
                                                <option key={u.id} value={u.id}>{u.nama} ({u.email})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Gelar / Gender */}
                                    <div>
                                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Gelar Pengajar</label>
                                        <div className="flex gap-3">
                                            <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold cursor-pointer transition-colors ${gender === 'ustadz' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-[#E8D2A6]/50 text-[#4A1C14]/60'}`}>
                                                <input type="radio" name="gender" value="ustadz" checked={gender === 'ustadz'} onChange={() => setGender('ustadz')} className="hidden" />
                                                <PhosphorIcon icon="gender-male" size={16} /> Ustadz
                                            </label>
                                            <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold cursor-pointer transition-colors ${gender === 'ustadzah' ? 'bg-[#FCF7E8] border-[#B88A44]/50 text-[#B88A44]' : 'bg-white border-[#E8D2A6]/50 text-[#4A1C14]/60'}`}>
                                                <input type="radio" name="gender" value="ustadzah" checked={gender === 'ustadzah'} onChange={() => setGender('ustadzah')} className="hidden" />
                                                <PhosphorIcon icon="gender-female" size={16} /> Ustadzah
                                            </label>
                                        </div>
                                    </div>

                                    {/* Pilih Kelas */}
                                    <div>
                                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-2 mt-2">Tugas Mengajar (Bisa Lebih Dari Satu)</label>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 hide-scrollbar">
                                            {KELAS_LIST.map((cls) => (
                                                <label key={cls.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedClasses.includes(cls.id) ? 'bg-[#FCF7E8] border-[#B88A44] shadow-sm' : 'bg-white border-[#E8D2A6]/50 hover:bg-gray-50'}`}>
                                                    <input type="checkbox" className="hidden" checked={selectedClasses.includes(cls.id)} onChange={() => toggleClass(cls.id)} />
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedClasses.includes(cls.id) ? 'bg-[#B88A44] border-[#B88A44] text-white' : 'border-gray-300'}`}>
                                                        {selectedClasses.includes(cls.id) && <PhosphorIcon icon="check" size={14} weight="bold" />}
                                                    </div>
                                                    <span className={`text-[12px] font-bold ${selectedClasses.includes(cls.id) ? 'text-[#4A1C14]' : 'text-[#4A1C14]/70'}`}>{cls.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-white border-t border-[#E8D2A6]/30">
                                <button 
                                    onClick={handleSave}
                                    className="w-full bg-[#4A1C14] text-white font-bold text-sm py-3.5 rounded-xl shadow-md hover:bg-[#3A140E] transition-colors"
                                >
                                    {editingId ? 'Simpan Perubahan' : 'Daftarkan Pengajar'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KelolaPengajar;
