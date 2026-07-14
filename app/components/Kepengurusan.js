import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';

const Kepengurusan = ({ setActiveTab }) => {
    const [pengurusList, setPengurusList] = useState([]);
    const [managementUsers, setManagementUsers] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        type: 'pimpinan', // 'pimpinan' or 'divisi'
        namaLengkap: '',
        userId: '',
        peran: '',
        deskripsi: '',
        icon: 'user'
    });

    const loadData = () => {
        // Load all users to find management
        const allUsers = JSON.parse(localStorage.getItem('rqs_users') || '[]');
        const mngUsers = allUsers.filter(u => u.role === 'management' && u.verified !== false);
        setManagementUsers(mngUsers);

        // Load kepengurusan structure
        const saved = localStorage.getItem('rqs_kepengurusan');
        if (saved) {
            setPengurusList(JSON.parse(saved));
        } else {
            setPengurusList([]);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const savePengurus = (newList) => {
        setPengurusList(newList);
        localStorage.setItem('rqs_kepengurusan', JSON.stringify(newList));
    };

    const handleSave = () => {
        if (!formData.namaLengkap || !formData.peran || !formData.userId) {
            alert("Nama, Jabatan/Divisi, dan Akun harus diisi!");
            return;
        }

        const newPengurus = {
            ...formData,
            id: Date.now().toString()
        };

        const newList = [...pengurusList, newPengurus];
        savePengurus(newList);
        
        setIsFormOpen(false);
        setFormData({
            type: 'pimpinan',
            namaLengkap: '',
            userId: '',
            peran: '',
            deskripsi: '',
            icon: 'user'
        });
    };

    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus pengurus ini?")) {
            const newList = pengurusList.filter(p => p.id !== id);
            savePengurus(newList);
        }
    };

    const pimpinanList = pengurusList.filter(p => p.type === 'pimpinan');
    const divisiList = pengurusList.filter(p => p.type === 'divisi');
    
    // Anggota are management users whose ID is not in pengurusList.userId
    const assignedUserIds = pengurusList.map(p => p.userId);
    const anggotaList = managementUsers.filter(u => !assignedUserIds.includes(u.id));

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Pengurus</h2>
                    <p className="text-[10px] text-indigo-600 font-bold">Struktur Management RQS</p>
                </div>
            </div>

            {isFormOpen ? (
                <div className="px-5 mt-6">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-[#4A1C14] mb-4 border-b pb-2 flex items-center gap-2">
                            <PhosphorIcon icon="plus-circle" size={20} className="text-indigo-600" /> 
                            Tambah Pengurus Baru
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Jenis Posisi</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="pimpinan">Pimpinan Utama</option>
                                    <option value="divisi">Divisi / Bidang</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    {formData.type === 'pimpinan' ? 'Nama Pimpinan' : 'Nama Koordinator'}
                                </label>
                                <input 
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ketik nama lengkap..."
                                    value={formData.namaLengkap}
                                    onChange={(e) => setFormData({...formData, namaLengkap: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Akun Terdaftar</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.userId}
                                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                                >
                                    <option value="">-- Pilih Akun Management --</option>
                                    {managementUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.nama} ({u.email})</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-1">Akun yang dipilih akan masuk ke posisi ini.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    {formData.type === 'pimpinan' ? 'Jabatan' : 'Nama Divisi/Bidang'}
                                </label>
                                <input 
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder={formData.type === 'pimpinan' ? 'Misal: Ketua Yayasan' : 'Misal: Bidang Pendidikan'}
                                    value={formData.peran}
                                    onChange={(e) => setFormData({...formData, peran: e.target.value})}
                                />
                            </div>

                            {formData.type === 'divisi' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Tugas</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Misal: Membawahi Kurikulum Tahsin & Tahfidz"
                                        value={formData.deskripsi}
                                        onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Ikon Tampilan</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                >
                                    <option value="user">User Umum</option>
                                    <option value="user-circle">User Pimpinan</option>
                                    <option value="books">Pendidikan / Buku</option>
                                    <option value="megaphone">Sosial / Dakwah</option>
                                    <option value="users">Humas / Tim</option>
                                </select>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm"
                                >
                                    Simpan Pengurus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="px-5 mt-4">
                        <button 
                            onClick={() => setIsFormOpen(true)}
                            className="w-full bg-indigo-50 border border-indigo-200 text-indigo-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition"
                        >
                            <PhosphorIcon icon="plus-circle" size={20} />
                            Tambah Pengurus Baru
                        </button>
                    </div>

                    {/* Daftar Anggota Belum Ditempatkan */}
                    <div className="px-5 mt-6">
                        <h3 className="font-bold text-[#4A1C14] mb-3 text-sm border-b pb-2 flex items-center justify-between">
                            <span>Anggota Management</span>
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{anggotaList.length} Orang</span>
                        </h3>
                        {anggotaList.length === 0 ? (
                            <div className="text-center p-4 border border-dashed border-gray-300 rounded-xl bg-white">
                                <p className="text-xs text-gray-500">Semua anggota management sudah ditempatkan.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pimpinan / Pembina */}
                    <div className="px-5 mt-8">
                        <h3 className="font-bold text-[#4A1C14] mb-3 text-sm text-center">Dewan Pembina & Pimpinan</h3>
                        {pimpinanList.length === 0 ? (
                            <div className="text-center p-4 border border-dashed border-gray-300 rounded-xl">
                                <p className="text-xs text-gray-500">Belum ada data pimpinan.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                {pimpinanList.map((p, idx) => (
                                    <div key={p.id} className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col items-center w-full max-w-[250px] relative overflow-hidden group">
                                        <button onClick={() => handleDelete(p.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-sm">
                                            <PhosphorIcon icon="trash" size={16} />
                                        </button>
                                        <div className={`absolute top-0 w-full h-12 left-0 right-0 ${idx === 0 ? 'bg-indigo-50' : 'bg-gray-50'}`}></div>
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mb-2 ${idx === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                                            <PhosphorIcon icon={p.icon || 'user-circle'} size={32} weight="fill" />
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-sm text-center px-2">{p.namaLengkap}</h4>
                                        <p className={`text-[10px] font-bold px-3 py-1 rounded-full mt-1 ${idx === 0 ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 bg-gray-100'}`}>
                                            {p.peran}
                                        </p>
                                        <p className="text-[9px] text-gray-400 mt-2 truncate w-full text-center">Akun Terhubung: {managementUsers.find(u => u.id === p.userId)?.nama || '-'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Divisi / Bidang */}
                    <div className="px-5 mt-8">
                        <h3 className="font-bold text-[#4A1C14] mb-3 text-sm">Divisi & Bidang</h3>
                        {divisiList.length === 0 ? (
                            <div className="text-center p-4 border border-dashed border-gray-300 rounded-xl">
                                <p className="text-xs text-gray-500">Belum ada data divisi.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {divisiList.map((d, i) => {
                                    const colors = [
                                        { bg: 'bg-emerald-50', text: 'text-emerald-600' },
                                        { bg: 'bg-amber-50', text: 'text-amber-600' },
                                        { bg: 'bg-blue-50', text: 'text-blue-600' },
                                        { bg: 'bg-rose-50', text: 'text-rose-600' },
                                        { bg: 'bg-purple-50', text: 'text-purple-600' },
                                    ];
                                    const theme = colors[i % colors.length];
                                    
                                    return (
                                        <div key={d.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 relative group">
                                            <button onClick={() => handleDelete(d.id)} className="absolute -top-2 -right-2 text-red-400 hover:text-red-600 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white border shadow-sm rounded-full">
                                                <PhosphorIcon icon="trash" size={14} />
                                            </button>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${theme.bg} ${theme.text}`}>
                                                <PhosphorIcon icon={d.icon || 'users'} weight="fill" size={24} />
                                            </div>
                                            <div className="flex-1 pr-2 overflow-hidden">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{d.peran}</h4>
                                                <p className="text-[10px] text-gray-500 leading-tight truncate">{d.deskripsi}</p>
                                                <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded max-w-fit border border-gray-200">
                                                    <PhosphorIcon icon="user-circle" />
                                                    <span className="truncate">{d.namaLengkap}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Kepengurusan;
