import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';

const SetorHafalanMaster = ({ onBack, ustadzName = 'Ustadz Hanan' }) => {
    const [setoranList, setSetoranList] = useState([]);
    const [activeActionId, setActiveActionId] = useState(null);
    const [catatan, setCatatan] = useState('');

    const loadSetoran = () => {
        const saved = localStorage.getItem('rqs_setoran_hafalan');
        if (saved) {
            setSetoranList(JSON.parse(saved).sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal)));
        }
    };

    useEffect(() => {
        loadSetoran();
        window.addEventListener('storage', loadSetoran);
        window.addEventListener('rqs-setoran-updated', loadSetoran);
        return () => {
            window.removeEventListener('storage', loadSetoran);
            window.removeEventListener('rqs-setoran-updated', loadSetoran);
        };
    }, []);

    const updateStatus = (id, newStatus, catatanTeks = '') => {
        const saved = JSON.parse(localStorage.getItem('rqs_setoran_hafalan') || '[]');
        const idx = saved.findIndex(s => s.id === id);
        if (idx !== -1) {
            saved[idx].status = newStatus;
            saved[idx].ustadz_name = ustadzName;
            if (catatanTeks) saved[idx].catatan = catatanTeks;
            
            localStorage.setItem('rqs_setoran_hafalan', JSON.stringify(saved));
            window.dispatchEvent(new Event('rqs-setoran-updated'));
            loadSetoran();
        }
    };

    const handleSimak = (id) => {
        updateStatus(id, 'disimak');
    };

    const handleSelesai = () => {
        if (activeActionId) {
            updateStatus(activeActionId, 'selesai', catatan);
            setActiveActionId(null);
            setCatatan('');
        }
    };

    const pendingSetoran = setoranList.filter(s => s.status === 'menunggu' || s.status === 'disimak');
    const historySetoran = setoranList.filter(s => s.status === 'selesai');

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Setoran Hafalan</h2>
                </div>
            </div>

            <div className="px-5 mt-5">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8D2A6]/50 mb-6">
                    <h3 className="font-bold text-[#4A1C14] text-[13px] border-b border-[#E8D2A6]/30 pb-2 mb-3">
                        <PhosphorIcon icon="hourglass-high" size={16} className="inline mr-1" />
                        Antrian Setoran & Sedang Disimak
                    </h3>
                    
                    {pendingSetoran.length === 0 ? (
                        <div className="text-center py-6">
                            <PhosphorIcon icon="check-circle" size={32} className="mx-auto text-[#B88A44]/50 mb-2" />
                            <p className="text-[11px] text-[#4A1C14]/60">Tidak ada antrian setoran hafalan saat ini.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingSetoran.map(s => (
                                <div key={s.id} className={`p-4 rounded-xl border ${s.status === 'menunggu' ? 'bg-[#FCF7E8] border-[#E8D2A6]/80' : 'bg-emerald-50 border-emerald-200'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-[#4A1C14] text-[13px]">{s.tholibah_name}</h4>
                                            <p className="text-[10px] text-[#4A1C14]/60">{new Date(s.tanggal).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${s.status === 'menunggu' ? 'bg-[#B88A44] text-white' : 'bg-emerald-500 text-white'}`}>
                                            {s.status === 'menunggu' ? 'Menunggu' : 'Sedang Disimak'}
                                        </span>
                                    </div>
                                    <div className="bg-white/50 p-2 rounded-lg border border-white/50 mb-3">
                                        <p className="text-[11px] font-bold text-[#4A1C14]">Target: {s.surat_target}</p>
                                    </div>
                                    
                                    {s.status === 'menunggu' ? (
                                        <button 
                                            onClick={() => handleSimak(s.id)}
                                            className="w-full bg-[#B88A44] text-white text-[11px] font-bold py-2.5 rounded-lg shadow-sm hover:bg-[#A37936] transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <PhosphorIcon icon="headphones" size={16} weight="fill" />
                                            Simak Hafalan Ini
                                        </button>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-emerald-700 font-medium mb-1">
                                                Anda sedang menyimak hafalan ini.
                                            </p>
                                            <button 
                                                onClick={() => setActiveActionId(s.id)}
                                                className="w-full bg-emerald-600 text-white text-[11px] font-bold py-2.5 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <PhosphorIcon icon="check-square-offset" size={16} weight="fill" />
                                                Selesai & Beri Catatan
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8D2A6]/50">
                    <h3 className="font-bold text-[#4A1C14] text-[13px] border-b border-[#E8D2A6]/30 pb-2 mb-3">
                        <PhosphorIcon icon="clock-counter-clockwise" size={16} className="inline mr-1" />
                        Riwayat Penilaian (Terbaru)
                    </h3>
                    
                    {historySetoran.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-[11px] text-[#4A1C14]/60">Belum ada riwayat setoran.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {historySetoran.slice(0, 10).map(s => (
                                <div key={s.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-[#4A1C14] text-[12px]">{s.tholibah_name}</h4>
                                        <span className="text-[9px] text-gray-500">{new Date(s.tanggal).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-[#B88A44] mb-1.5">{s.surat_target}</p>
                                    <div className="bg-white p-2 rounded-lg border border-gray-100">
                                        <p className="text-[10px] text-[#4A1C14]/80 italic">"{s.catatan || 'Tidak ada catatan.'}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Beri Catatan */}
            <AnimatePresence>
                {activeActionId && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative"
                        >
                            <button onClick={() => {setActiveActionId(null); setCatatan('');}} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1">
                                <PhosphorIcon icon="x" size={20} weight="bold" />
                            </button>
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 shadow-sm border border-emerald-100">
                                <PhosphorIcon icon="check-circle" size={24} weight="fill" />
                            </div>
                            <h3 className="text-lg font-bold text-[#4A1C14] mb-1">Selesai Menyimak</h3>
                            <p className="text-[11px] text-[#4A1C14]/60 mb-5">Berikan catatan atau koreksi (opsional) untuk tholibah ini.</p>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Catatan Koreksi (Opsional)</label>
                                    <textarea 
                                        rows="4"
                                        value={catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                        placeholder="Cth: Perhatikan mad thobi'i di akhir ayat ke 3..." 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 transition-all resize-none"
                                    ></textarea>
                                </div>
                            </div>
                            <button 
                                onClick={handleSelesai}
                                className="w-full bg-emerald-600 text-white font-bold text-sm py-3.5 rounded-xl shadow-md hover:bg-emerald-700 transition-colors"
                            >
                                Simpan & Selesaikan
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SetorHafalanMaster;
