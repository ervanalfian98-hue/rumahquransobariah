import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';

const Kepengurusan = ({ setActiveTab }) => {
    const [pengurusList, setPengurusList] = useState([]);

    const loadPengurus = () => {
        const saved = localStorage.getItem('rqs_kepengurusan');
        if (saved) {
            setPengurusList(JSON.parse(saved));
        } else {
            // Data bawaan jika kosong
            const initialData = [
                { id: '1', type: 'pimpinan', namaLengkap: 'Ust. H. Sobari, S.Pd.I', peran: 'Pembina / Pendiri', icon: 'user-circle' },
                { id: '2', type: 'pimpinan', namaLengkap: 'Ust. Ahmad Fulan', peran: 'Ketua Yayasan RQS', icon: 'user' },
                { id: '3', type: 'divisi', namaLengkap: 'Ust. Zaid', peran: 'Bidang Pendidikan', deskripsi: 'Membawahi Kurikulum Tahsin & Tahfidz', icon: 'books' },
                { id: '4', type: 'divisi', namaLengkap: 'Ust. Umar', peran: 'Bidang Dakwah & Sosial', deskripsi: 'Program Kajian Umum & Donasi', icon: 'megaphone' },
                { id: '5', type: 'divisi', namaLengkap: 'Ust. Ali', peran: 'Bidang Humas & Media', deskripsi: 'Informasi, Desain & Publikasi', icon: 'users' },
            ];
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

    const pimpinanList = pengurusList.filter(p => p.type === 'pimpinan');
    const divisiList = pengurusList.filter(p => p.type === 'divisi');

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kepengurusan</h2>
                    <p className="text-[10px] text-indigo-600 font-bold">Struktur Organisasi RQS</p>
                </div>
            </div>

            {/* Banner */}
            <div className="mx-4 mt-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1">Susunan Pengurus</h3>
                    <p className="text-xs text-white/90 mb-3 max-w-[85%]">Mengenal lebih dekat para pengurus dan pimpinan Rumah Quran Sobariah dalam mewujudkan visi misi dakwah.</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-white/20">
                    <PhosphorIcon icon="users-three" weight="fill" size={100} />
                </div>
            </div>

            {/* Pimpinan / Pembina */}
            <div className="px-4 mt-6">
                <h3 className="font-bold text-[#4A1C14] mb-3 text-sm text-center">Dewan Pembina & Pimpinan</h3>
                {pimpinanList.length === 0 ? (
                    <div className="text-center p-4 border border-dashed border-gray-300 rounded-xl">
                        <p className="text-xs text-gray-500">Belum ada data pimpinan.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        {pimpinanList.map((p, idx) => (
                            <div key={p.id} className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col items-center w-full max-w-[250px] relative overflow-hidden">
                                <div className={`absolute top-0 w-full h-12 left-0 right-0 ${idx === 0 ? 'bg-indigo-50' : 'bg-gray-50'}`}></div>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mb-2 ${idx === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                                    <PhosphorIcon icon={p.icon || 'user-circle'} size={32} weight="fill" />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm text-center px-2">{p.namaLengkap}</h4>
                                <p className={`text-[10px] font-bold px-3 py-1 rounded-full mt-1 ${idx === 0 ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 bg-gray-100'}`}>
                                    {p.peran}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Divisi / Bidang */}
            <div className="px-4 mt-8">
                <h3 className="font-bold text-[#4A1C14] mb-3 text-sm">Divisi & Bidang</h3>
                {divisiList.length === 0 ? (
                    <div className="text-center p-4 border border-dashed border-gray-300 rounded-xl">
                        <p className="text-xs text-gray-500">Belum ada data divisi.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {divisiList.map((d, i) => {
                            // Cycle through some colors for variety if we want, or just use emerald
                            const colors = [
                                { bg: 'bg-emerald-50', text: 'text-emerald-600' },
                                { bg: 'bg-amber-50', text: 'text-amber-600' },
                                { bg: 'bg-blue-50', text: 'text-blue-600' },
                                { bg: 'bg-rose-50', text: 'text-rose-600' },
                                { bg: 'bg-purple-50', text: 'text-purple-600' },
                            ];
                            const theme = colors[i % colors.length];
                            
                            return (
                                <div key={d.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${theme.bg} ${theme.text}`}>
                                        <PhosphorIcon icon={d.icon || 'users'} weight="fill" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm">{d.peran}</h4>
                                        <p className="text-[10px] text-gray-500">{d.deskripsi}</p>
                                        <p className="text-xs font-bold text-gray-700 mt-1">Koordinator: {d.namaLengkap}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <div className="mt-8 text-center px-4">
                <p className="text-[10px] text-gray-400">Hubungi kami jika ada pertanyaan seputar struktur organisasi.</p>
            </div>
        </div>
    );
};

export default Kepengurusan;
