import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';

const RiwayatAbsensi = ({ currentUser, setActiveTab }) => {
    const [absensiHistory, setAbsensiHistory] = useState([]);
    const [setoranHistory, setSetoranHistory] = useState([]);

    useEffect(() => {
        if (!currentUser) return;
        
        // Load Absensi
        const jadwalData = JSON.parse(localStorage.getItem('rqs_jadwal') || '[]');
        const myAbsensi = [];
        jadwalData.forEach(j => {
            if (j.absensi && Array.isArray(j.absensi)) {
                // Some logic might store tholibahId or id
                const record = j.absensi.find(a => a.tholibahId === currentUser.id || a.id === currentUser.id);
                if (record) {
                    myAbsensi.push({
                        ...record,
                        tanggal: j.tanggal,
                        namaKelas: j.namaKelas,
                        waktuSelesai: j.waktuSelesai
                    });
                }
            }
        });
        myAbsensi.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));
        setAbsensiHistory(myAbsensi);

        // Load Setoran
        const allSetoran = JSON.parse(localStorage.getItem('rqs_setoran_hafalan') || '[]');
        const mySetoran = allSetoran.filter(s => s.tholibahId === currentUser.id);
        mySetoran.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));
        setSetoranHistory(mySetoran);

    }, [currentUser]);

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('beranda')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1 text-center">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Riwayat Absensi & Setoran</h2>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="p-5">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white border border-[#E8D2A6] rounded-2xl p-4 text-center shadow-sm">
                        <PhosphorIcon icon="check-circle" size={28} className="text-emerald-500 mx-auto mb-2" weight="fill" />
                        <h3 className="text-2xl font-bold text-[#4A1C14]">{absensiHistory.length}</h3>
                        <p className="text-[10px] text-[#4A1C14]/60 mt-1 uppercase tracking-wider font-bold">Total Kehadiran</p>
                    </div>
                    <div className="bg-white border border-[#E8D2A6] rounded-2xl p-4 text-center shadow-sm">
                        <PhosphorIcon icon="book-open-text" size={28} className="text-[#B88A44] mx-auto mb-2" weight="fill" />
                        <h3 className="text-2xl font-bold text-[#4A1C14]">{setoranHistory.length}</h3>
                        <p className="text-[10px] text-[#4A1C14]/60 mt-1 uppercase tracking-wider font-bold">Total Setoran</p>
                    </div>
                </div>

                <h3 className="font-bold text-[#4A1C14] text-sm mb-3 border-b border-[#E8D2A6]/30 pb-2">
                    Riwayat Kehadiran Kelas
                </h3>
                {absensiHistory.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-[#E8D2A6] mb-6">
                        <PhosphorIcon icon="calendar-x" size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-[11px] text-[#4A1C14]/60">Belum ada riwayat kehadiran.</p>
                    </div>
                ) : (
                    <div className="space-y-3 mb-8">
                        {absensiHistory.map((a, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                    <PhosphorIcon icon="check-square" size={20} weight="fill" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">Hadir - {a.namaKelas || 'Kelas RQS'}</h4>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{new Date(a.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <h3 className="font-bold text-[#4A1C14] text-sm mb-3 border-b border-[#E8D2A6]/30 pb-2">
                    Riwayat Setoran Hafalan
                </h3>
                {setoranHistory.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-[#E8D2A6]">
                        <PhosphorIcon icon="book-bookmark" size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-[11px] text-[#4A1C14]/60">Belum ada riwayat setoran hafalan.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {setoranHistory.map((s, i) => (
                            <div key={i} className={`bg-white p-4 rounded-2xl border shadow-sm ${s.status === 'selesai' ? 'border-emerald-200' : 'border-amber-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{s.surah}</h4>
                                        <p className="text-[10px] text-gray-500">Ayat: {s.ayat}</p>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                                        s.status === 'selesai' ? 'bg-emerald-50 text-emerald-600' :
                                        s.status === 'disimak' ? 'bg-blue-50 text-blue-600' :
                                        'bg-amber-50 text-amber-600'
                                    }`}>
                                        {s.status?.toUpperCase() || 'MENUNGGU'}
                                    </span>
                                </div>
                                {s.status === 'selesai' && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-[9px] text-gray-500 mb-0.5">Nilai Tajwid/Fashohah</p>
                                            <p className="font-bold text-[#B88A44] text-sm">{s.nilai || '-'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-[9px] text-gray-500 mb-0.5">Disimak Oleh</p>
                                            <p className="font-bold text-gray-700 text-xs truncate">{s.ustadz_name || '-'}</p>
                                        </div>
                                        {s.catatan && (
                                            <div className="col-span-2 bg-blue-50/50 p-2 rounded-lg mt-1">
                                                <p className="text-[9px] text-blue-500 mb-0.5 font-bold">Catatan Ustadz/ah:</p>
                                                <p className="text-[10px] text-gray-700">{s.catatan}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiwayatAbsensi;
