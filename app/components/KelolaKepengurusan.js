import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { CLASSES } from './MockData';
import { supabase } from '../lib/supabaseClient';

const KelolaKepengurusan = ({ onBack }) => {
    const [viewMode, setViewMode] = useState('main'); // main, detail, absen_detail, setoran_detail
    const [selectedManagement, setSelectedManagement] = useState(null);
    const [managementStats, setManagementStats] = useState({ absensiList: [], setoranList: [] });

    const [pengurusList, setPengurusList] = useState([]);
    const [managementUsers, setManagementUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState(null);
    const [type, setType] = useState('pimpinan'); // pimpinan, divisi
    const [namaLengkap, setNamaLengkap] = useState('');
    const [userId, setUserId] = useState('');
    const [peran, setPeran] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [icon, setIcon] = useState('user'); // For divisi

    const ICON_OPTIONS = ['user', 'users', 'books', 'megaphone', 'chart-bar', 'heart', 'shield-check'];

    const loadPengurus = () => {
        // Load all users to find management
        const allUsers = JSON.parse(localStorage.getItem('rqs_users') || '[]');
        const mngUsers = allUsers.filter(u => u.role === 'management' && u.verified !== false);
        setManagementUsers(mngUsers);

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

    const fetchManagementStats = (user) => {
        const absensiList = [];
        const setoranList = [];

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('rqs_absen_')) {
                    const data = JSON.parse(localStorage.getItem(key));
                    const userAbsen = data[user.id];
                    if (userAbsen) {
                        const dateStr = key.replace('rqs_absen_', '');
                        if (Array.isArray(userAbsen)) {
                            userAbsen.forEach(classId => {
                                absensiList.push({ date: dateStr, classId });
                            });
                        } else {
                            absensiList.push({ date: dateStr, classId: userAbsen }); 
                        }
                    }
                }
            }
        } catch(e) {}
        absensiList.sort((a,b) => new Date(b.date) - new Date(a.date));

        try {
            const allSetoran = JSON.parse(localStorage.getItem('rqs_setoran_hafalan') || '[]');
            const mySetoran = allSetoran.filter(s => s.tholibahId === user.id || s.userId === user.id);
            setoranList.push(...mySetoran);
        } catch(e) {}
        setoranList.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));

        setManagementStats({ absensiList, setoranList });
    };

    const calculateAge = (dob) => {
        if (!dob) return '-';
        const diff_ms = Date.now() - new Date(dob).getTime();
        const age_dt = new Date(diff_ms); 
        return Math.abs(age_dt.getUTCFullYear() - 1970) + " Tahun";
    };

    const handleMakeTholibah = () => {
        if (!selectedManagement) return;
        if (!window.confirm(`Apakah Anda yakin ingin menjadikan ${selectedManagement.nama} sebagai Tholibah? Hak akses Management akan dicabut.`)) return;

        // Update rqs_users
        let allUsers = JSON.parse(localStorage.getItem('rqs_users') || '[]');
        const userIndex = allUsers.findIndex(u => u.id === selectedManagement.id);
        if (userIndex !== -1) {
            allUsers[userIndex].role = 'tholibah';
            allUsers[userIndex].verified = false;
            localStorage.setItem('rqs_users', JSON.stringify(allUsers));
        }

        // Add to rqs_tholibah
        const currentTholibah = JSON.parse(localStorage.getItem('rqs_tholibah') || '[]');
        if (!currentTholibah.find(t => t.id === selectedManagement.id)) {
            currentTholibah.push({
                id: selectedManagement.id,
                name: selectedManagement.nama,
                phone: selectedManagement.phone || '',
                classId: null,
                joined: new Date().toISOString().split('T')[0]
            });
            localStorage.setItem('rqs_tholibah', JSON.stringify(currentTholibah));
        }

        // Remove from rqs_kepengurusan
        const currentKepengurusan = JSON.parse(localStorage.getItem('rqs_kepengurusan') || '[]');
        const updatedKepengurusan = currentKepengurusan.map(k => k.userId === selectedManagement.id ? { ...k, userId: '' } : k);
        localStorage.setItem('rqs_kepengurusan', JSON.stringify(updatedKepengurusan));

        window.dispatchEvent(new Event('rqs-kepengurusan-updated'));
        setViewMode('main');
        setSelectedManagement(null);
        alert(`${selectedManagement.nama} berhasil diubah menjadi Tholibah.`);
    };

    const handlePermanentDelete = async () => {
        if (!selectedManagement) return;
        if (!window.confirm(`PERINGATAN 1: Apakah Anda yakin ingin MENGHAPUS PERMANEN akun ${selectedManagement.nama}?`)) return;
        if (!window.confirm(`PERINGATAN 2: Tindakan ini tidak bisa dibatalkan! Semua data absen, setoran, progress, dan penempatan posisi akun ini akan musnah. Lanjutkan?`)) return;

        const targetId = selectedManagement.id;

        // Delete from Supabase profiles
        const { error: profileError } = await supabase.from('profiles').delete().eq('id', targetId);
        if (profileError) {
            console.error("Gagal hapus profile:", profileError);
        }

        // Call RPC to delete auth user
        const { error: rpcError } = await supabase.rpc('delete_user_admin', { user_id_to_delete: targetId });
        if (rpcError) {
            console.warn("RPC delete_user_admin gagal:", rpcError.message);
        }

        let allUsers = JSON.parse(localStorage.getItem('rqs_users') || '[]');
        allUsers = allUsers.filter(u => u.id !== targetId);
        localStorage.setItem('rqs_users', JSON.stringify(allUsers));

        let currentKepengurusan = JSON.parse(localStorage.getItem('rqs_kepengurusan') || '[]');
        currentKepengurusan = currentKepengurusan.map(k => k.userId === targetId ? { ...k, userId: '' } : k);
        localStorage.setItem('rqs_kepengurusan', JSON.stringify(currentKepengurusan));

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (key.startsWith('rqs_absen_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data[targetId] !== undefined) {
                        delete data[targetId];
                        localStorage.setItem(key, JSON.stringify(data));
                    }
                } catch(e) {}
            }
        }

        let allSetoran = JSON.parse(localStorage.getItem('rqs_setoran_hafalan') || '[]');
        allSetoran = allSetoran.filter(s => s.userId !== targetId && s.tholibahId !== targetId);
        localStorage.setItem('rqs_setoran_hafalan', JSON.stringify(allSetoran));

        window.dispatchEvent(new Event('rqs-kepengurusan-updated'));
        setViewMode('main');
        setSelectedManagement(null);
        alert(`Akun ${selectedManagement.nama} telah dibersihkan.`);
    };

    const handleKelolaAkun = (userObj) => {
        if (!userObj) return;
        setSelectedManagement(userObj);
        fetchManagementStats(userObj);
        setViewMode('detail');
    };

    const handleSave = () => {
        if (!namaLengkap.trim() || !peran.trim()) return alert("Nama dan Peran/Jabatan wajib diisi.");

        const saved = JSON.parse(localStorage.getItem('rqs_kepengurusan') || '[]');
        let updated;

        if (editingId) {
            updated = saved.map(p => p.id === editingId ? { ...p, type, namaLengkap, userId, peran, deskripsi, icon } : p);
        } else {
            const newPengurus = {
                id: Date.now().toString(),
                type,
                namaLengkap,
                userId,
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
        setUserId(item.userId || '');
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
        setUserId('');
        setPeran('');
        setDeskripsi('');
        setIcon('user');
    };

    const pimpinanList = pengurusList.filter(p => p.type === 'pimpinan');
    const divisiList = pengurusList.filter(p => p.type === 'divisi');

    // Anggota are management users whose ID is not in pengurusList.userId
    const assignedUserIds = pengurusList.map(p => p.userId);
    const anggotaList = managementUsers.filter(u => !assignedUserIds.includes(u.id));

    const renderMainView = () => (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 mt-6">
                <button 
                    onClick={openAdd}
                    className="w-full bg-[#4A1C14] text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-[#3A140E] transition-colors flex items-center justify-center gap-2 mb-6"
                >
                    <PhosphorIcon icon="plus-circle" size={20} weight="fill" />
                    Tambah Pengurus Baru
                </button>

                {/* Daftar Anggota Belum Ditempatkan */}
                <h3 className="font-bold text-[#4A1C14] text-sm mb-3 border-b border-[#E8D2A6]/30 pb-2 flex justify-between items-center">
                    <span>Anggota Management</span>
                    <span className="text-[10px] bg-[#FCF7E8] text-[#B88A44] px-2 py-0.5 rounded-full">{anggotaList.length} Orang</span>
                </h3>
                {anggotaList.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-[#E8D2A6] mb-6">
                        <p className="text-[11px] text-[#4A1C14]/60">Semua anggota management sudah ditempatkan.</p>
                    </div>
                ) : (
                    <div className="space-y-3 mb-8">
                        {anggotaList.map(u => (
                            <div key={u.id} className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold">
                                    {u.nama.charAt(0)}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-bold text-gray-800 text-sm truncate">{u.nama}</h4>
                                    <p className="text-[10px] text-gray-500 truncate">{u.email} | {u.phone}</p>
                                    <p className="text-[9px] text-indigo-500 mt-0.5">Menunggu penempatan posisi...</p>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                    <button onClick={() => handleKelolaAkun(u)} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">Kelola</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-bold text-gray-800 text-sm truncate">{p.namaLengkap}</h4>
                                    <p className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                                        {p.peran}
                                    </p>
                                    <p className="text-[9px] text-gray-400 mt-1 truncate">
                                        Akun: {managementUsers.find(u => u.id === p.userId)?.nama || 'Belum dihubungkan'}
                                    </p>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                    <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg">
                                        <PhosphorIcon icon="pencil-simple" size={16} weight="bold" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">
                                        <PhosphorIcon icon="trash" size={16} weight="bold" />
                                    </button>
                                    {managementUsers.find(u => u.id === p.userId) && (
                                        <button onClick={() => handleKelolaAkun(managementUsers.find(u => u.id === p.userId))} className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg" title="Kelola Akun">
                                            <PhosphorIcon icon="user-gear" size={16} weight="bold" />
                                        </button>
                                    )}
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
                                    {managementUsers.find(u => u.id === p.userId) && (
                                        <button onClick={() => handleKelolaAkun(managementUsers.find(u => u.id === p.userId))} className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg" title="Kelola Akun">
                                            <PhosphorIcon icon="user-gear" size={14} weight="bold" />
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3 pr-16">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                        <PhosphorIcon icon={p.icon || 'users'} size={20} weight="fill" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-gray-800 text-[13px] truncate">{p.peran}</h4>
                                        <p className="text-[10px] font-bold text-gray-600 mt-0.5 truncate">Koor: {p.namaLengkap}</p>
                                        <p className="text-[9px] text-gray-400 mt-0.5 truncate">
                                            Akun: {managementUsers.find(u => u.id === p.userId)?.nama || 'Belum dihubungkan'}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 mt-1">
                                    <p className="text-[10px] text-gray-500">{p.deskripsi}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
    );

    const renderAbsenDetail = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 mt-4 pb-10">
            <h3 className="font-bold text-[#4A1C14] mb-4">Riwayat Kehadiran: {selectedManagement?.nama}</h3>
            {managementStats.absensiList.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-[#E8D2A6]">
                    <p className="text-[#4A1C14]/60 text-[11px]">Belum ada riwayat kehadiran di kelas manapun.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {managementStats.absensiList.map((a, i) => {
                        const cls = CLASSES?.find(c => c.id === a.classId);
                        return (
                            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center gap-3">
                                <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                                    <PhosphorIcon icon="calendar-check" size={24} weight="fill" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#4A1C14] text-sm">{new Date(a.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                                    <p className="text-[11px] text-gray-500">Hadir di {cls ? cls.name : 'Kelas (Belum Terdaftar)'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );

    const renderSetoranDetail = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 mt-4 pb-10">
            <h3 className="font-bold text-[#4A1C14] mb-4">Riwayat Setoran: {selectedManagement?.nama}</h3>
            {managementStats.setoranList.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-[#E8D2A6]">
                    <p className="text-[#4A1C14]/60 text-[11px]">Belum ada riwayat setoran hafalan.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {managementStats.setoranList.map(s => (
                        <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-[#4A1C14] text-sm">{s.surat_target} - Ayat {s.ayat_target}</h4>
                                <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${s.status === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FCF7E8] text-[#B88A44]'}`}>
                                    {s.status?.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-2">{new Date(s.tanggal).toLocaleString('id-ID')}</p>
                            {s.catatan && (
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <p className="text-[11px] font-bold text-gray-600">Catatan Ustadz/ah:</p>
                                    <p className="text-[11px] text-gray-500">{s.catatan}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );

    const renderManagementDetail = () => {
        if (!selectedManagement) return null;
        
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 mt-4 pb-10">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#E8D2A6]/50 relative overflow-hidden mb-5">
                    <div className="absolute top-0 left-0 w-full h-16 bg-[#4A1C14]"></div>
                    <div className="relative z-10 flex flex-col items-center mt-4">
                        <div className="w-20 h-20 bg-white border-4 border-white rounded-full shadow-md flex items-center justify-center text-3xl font-bold text-[#4A1C14] bg-gradient-to-br from-[#FCF7E8] to-[#E8D2A6] overflow-hidden">
                            {selectedManagement.avatarData ? (
                                <img src={selectedManagement.avatarData} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                selectedManagement.nama.charAt(0)
                            )}
                        </div>
                        <h3 className="font-bold text-[#4A1C14] text-lg mt-3">{selectedManagement.nama}</h3>
                        
                        <div className="flex flex-col items-center mt-2 space-y-1.5 w-full">
                            {selectedManagement.email && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <PhosphorIcon icon="envelope-simple" size={14} />
                                    <span>{selectedManagement.email}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <PhosphorIcon icon="phone" size={14} />
                                <span>{selectedManagement.phone}</span>
                            </div>
                            
                            {(selectedManagement.tempatLahir || selectedManagement.tanggalLahir) && (
                                <div className="flex flex-col items-center gap-1 mt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <PhosphorIcon icon="map-pin" size={14} />
                                        <span>
                                            {selectedManagement.tempatLahir || '-'}, {selectedManagement.tanggalLahir ? new Date(selectedManagement.tanggalLahir).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-[#B88A44] bg-[#FCF7E8] px-2 py-0.5 mt-0.5 rounded border border-[#E8D2A6]/50">
                                        Usia: {calculateAge(selectedManagement.tanggalLahir)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <h4 className="font-bold text-[#4A1C14] text-sm mb-3">Statistik Aktivitas</h4>
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                        <PhosphorIcon icon="calendar-check" size={24} className="text-blue-500 mb-1" weight="duotone" />
                        <span className="text-2xl font-bold text-blue-700">{managementStats.absensiList.length}x</span>
                        <span className="text-[10px] font-bold text-blue-600/70">Hadir Kelas</span>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                        <PhosphorIcon icon="books" size={24} className="text-emerald-500 mb-1" weight="duotone" />
                        <span className="text-2xl font-bold text-emerald-700">{managementStats.setoranList.length}x</span>
                        <span className="text-[10px] font-bold text-emerald-600/70">Setoran Hafalan</span>
                    </div>
                </div>

                <h4 className="font-bold text-[#4A1C14] text-sm mb-3">Menu Kelola</h4>
                <div className="space-y-3">
                    <button onClick={() => setViewMode('absen_detail')} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                                <PhosphorIcon icon="list-checks" size={20} weight="fill" />
                            </div>
                            <div className="text-left">
                                <h5 className="font-bold text-[#4A1C14] text-sm">Lihat Detail Absensi</h5>
                                <p className="text-[10px] text-gray-500">Riwayat kehadiran kelas</p>
                            </div>
                        </div>
                        <PhosphorIcon icon="caret-right" size={16} className="text-gray-400" />
                    </button>
                    
                    <button onClick={() => setViewMode('setoran_detail')} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <PhosphorIcon icon="microphone-stage" size={20} weight="fill" />
                            </div>
                            <div className="text-left">
                                <h5 className="font-bold text-[#4A1C14] text-sm">Lihat Riwayat Setoran</h5>
                                <p className="text-[10px] text-gray-500">Capaian hafalan</p>
                            </div>
                        </div>
                        <PhosphorIcon icon="caret-right" size={16} className="text-gray-400" />
                    </button>
                </div>

                <h4 className="font-bold text-red-600 text-sm mt-8 mb-3 flex items-center gap-2">
                    <PhosphorIcon icon="warning-circle" size={18} weight="fill" />
                    Zona Berbahaya
                </h4>
                <div className="space-y-3">
                    <button 
                        onClick={handleMakeTholibah}
                        className="w-full bg-white p-4 rounded-2xl shadow-sm border border-orange-200 flex items-center justify-between hover:bg-orange-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                                <PhosphorIcon icon="user-minus" size={20} weight="fill" />
                            </div>
                            <div className="text-left">
                                <h5 className="font-bold text-orange-700 text-sm">Jadikan Sebagai Tholibah</h5>
                                <p className="text-[10px] text-orange-600/70">Cabut hak akses Management</p>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={handlePermanentDelete}
                        className="w-full bg-white p-4 rounded-2xl shadow-sm border border-red-200 flex items-center justify-between hover:bg-red-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                                <PhosphorIcon icon="trash" size={20} weight="fill" />
                            </div>
                            <div className="text-left">
                                <h5 className="font-bold text-red-700 text-sm">Hapus Permanen Akun Ini</h5>
                                <p className="text-[10px] text-red-600/70">Hapus bersih dari database aplikasi</p>
                            </div>
                        </div>
                    </button>
                </div>
            </motion.div>
        );
    };    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-screen">
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                <button 
                    onClick={() => {
                        if (viewMode === 'main') onBack();
                        else if (viewMode === 'detail') setViewMode('main');
                        else setViewMode('detail');
                    }} 
                    className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors"
                >
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">
                        {viewMode === 'main' ? 'Kelola Kepengurusan' : 
                         viewMode === 'detail' ? 'Kelola Akun' : 
                         viewMode === 'absen_detail' ? 'Detail Absensi' : 'Riwayat Setoran'}
                    </h2>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'main' && renderMainView()}
                {viewMode === 'detail' && renderManagementDetail()}
                {viewMode === 'absen_detail' && renderAbsenDetail()}
                {viewMode === 'setoran_detail' && renderSetoranDetail()}
            </AnimatePresence>

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
                                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Pilih Akun Terdaftar</label>
                                        <select 
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            className="w-full bg-white border border-[#E8D2A6]/80 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44]"
                                        >
                                            <option value="">-- Pilih Akun Management --</option>
                                            {managementUsers.map(u => (
                                                <option key={u.id} value={u.id}>{u.nama} ({u.email})</option>
                                            ))}
                                        </select>
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
