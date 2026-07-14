import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import SetorHafalanMaster from './SetorHafalanMaster';

const KELAS_LIST = [
    { id: 'tahsin_pemula', name: 'Tahsin Pemula' },
    { id: 'tahsin_teori', name: 'Tahsin Teori' },
    { id: 'pra_tahfidz', name: 'Pra Tahfidz' },
    { id: 'tahfidz', name: 'Tahfidz' },
    { id: 'b_arab_tamyiz', name: 'B. Arab Tamyiz' },
    { id: 'ulc', name: 'ULC' },
    { id: 'matan', name: 'Matan' }
];

const Pengajar = ({ setActiveTab }) => {
    const [pengajarList, setPengajarList] = useState([]);
    const [selectedUstadz, setSelectedUstadz] = useState(null);

    const loadPengajar = () => {
        const saved = localStorage.getItem('rqs_pengajar');
        if (saved) {
            setPengajarList(JSON.parse(saved));
        } else {
            // Default mock data if empty
            const initialData = [
                { id: '1', name: 'Lia', gender: 'ustadzah', classes: ['tahsin_teori'] }
            ];
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

    const getClassName = (id) => {
        const cls = KELAS_LIST.find(c => c.id === id);
        return cls ? cls.name : id;
    };

    // Jika ada guru yang dipilih, buka SetorHafalanMaster
    if (selectedUstadz) {
        return (
            <SetorHafalanMaster 
                onBack={() => setSelectedUstadz(null)} 
                ustadzName={`${selectedUstadz.gender === 'ustadz' ? 'Ustadz' : 'Ustadzah'} ${selectedUstadz.name}`}
            />
        );
    }

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Pengajar</h2>
                    <p className="text-[10px] text-teal-600 font-bold">Asatidz Rumah Quran</p>
                </div>
            </div>

            {/* Banner */}
            <div className="mx-4 mt-4 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1">Daftar Pengajar RQS</h3>
                    <p className="text-xs text-white/90 mb-3 max-w-[85%]">Pilih profil pengajar untuk membuka halaman kelola setoran hafalan (Mode Guru).</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-white/20">
                    <PhosphorIcon icon="chalkboard-teacher" weight="fill" size={100} />
                </div>
            </div>

            {/* List Pengajar */}
            <div className="px-4 mt-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#4A1C14] text-sm">Ustaz & Ustazah</h3>
                    <span className="text-[10px] font-bold text-teal-600 px-2 py-1 bg-teal-50 rounded-lg">Aktif Mengajar</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    {pengajarList.length === 0 ? (
                        <div className="col-span-2 text-center p-6 bg-white border border-gray-200 rounded-2xl border-dashed">
                            <p className="text-sm text-gray-500">Belum ada pengajar. Tambahkan di menu Master.</p>
                        </div>
                    ) : (
                        pengajarList.map((p) => (
                            <div 
                                key={p.id} 
                                onClick={() => setSelectedUstadz(p)}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center cursor-pointer hover:border-teal-200 hover:shadow-md transition-all active:scale-95 group relative"
                            >
                                <div className="absolute top-2 right-2 bg-emerald-50 text-emerald-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PhosphorIcon icon="sign-in" size={14} weight="bold" />
                                </div>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 mb-2 border-2 ${p.gender === 'ustadz' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-teal-50 border-teal-100 text-teal-600'} text-xl font-bold`}>
                                    {p.name.charAt(0).toUpperCase()}
                                </div>
                                <h4 className="font-bold text-gray-800 text-[13px] text-center leading-tight mb-2">
                                    {p.gender === 'ustadz' ? 'Ust. ' : 'Usth. '}{p.name}
                                </h4>
                                <div className="w-full mt-auto flex flex-col gap-1.5 pt-2 border-t border-gray-100">
                                    {p.classes.map(id => (
                                        <div key={id} className="w-full bg-teal-50 border border-teal-100 text-teal-700 text-[9px] font-bold py-1.5 px-2 rounded-lg text-center leading-tight">
                                            {getClassName(id)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Program Sertifikasi */}
            <div className="px-4 mt-6 mb-4">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                        <PhosphorIcon icon="certificate" weight="fill" size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#4A1C14] text-sm">Pengajar Bersanad</h4>
                        <p className="text-[10px] text-gray-600 mt-0.5">Asatidz RQS memiliki sanad keilmuan Al-Quran yang muttasil (bersambung) hingga ke Rasulullah ﷺ.</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center px-4">
                <p className="text-[10px] text-gray-400">Semoga Allah menjaga para asatidz kita semua.</p>
            </div>
        </div>
    );
};

export default Pengajar;
