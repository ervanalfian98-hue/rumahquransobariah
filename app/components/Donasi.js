import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const initialDonations = [
    { id: 1, name: "Hamba Allah", program: "Santri Yatim & Dhuafa", amount: 500000, date: new Date(Date.now() - 10 * 60000).toISOString(), desc: "Semoga berkah" },
    { id: 2, name: "Bpk. Ahmad", program: "Wakaf Al-Quran", amount: 150000, date: new Date(Date.now() - 60 * 60000).toISOString(), desc: "" },
    { id: 3, name: "Ibu Siti", program: "Operasional RQS", amount: 100000, date: new Date(Date.now() - 24 * 3600000).toISOString(), desc: "Bismillah" },
    { id: 4, name: "Hamba Allah", program: "Pengembangan Aplikasi", amount: 50000, date: new Date(Date.now() - 48 * 3600000).toISOString(), desc: "" },
    { id: 5, name: "Rizky", program: "Santri Yatim & Dhuafa", amount: 250000, date: new Date(Date.now() - 72 * 3600000).toISOString(), desc: "" },
    { id: 6, name: "Donatur Anonim", program: "Wakaf Al-Quran", amount: 300000, date: new Date(Date.now() - 96 * 3600000).toISOString(), desc: "" },
    { id: 7, name: "Keluarga Bpk. Budi", program: "Operasional RQS", amount: 1000000, date: new Date(Date.now() - 120 * 3600000).toISOString(), desc: "Al-Fatihah untuk almarhum ayah" },
    { id: 8, name: "Hamba Allah", program: "Pengembangan Aplikasi", amount: 25000, date: new Date(Date.now() - 144 * 3600000).toISOString(), desc: "" },
    { id: 9, name: "Lestari", program: "Santri Yatim & Dhuafa", amount: 150000, date: new Date(Date.now() - 168 * 3600000).toISOString(), desc: "" },
    { id: 10, name: "Fajar", program: "Wakaf Al-Quran", amount: 75000, date: new Date(Date.now() - 192 * 3600000).toISOString(), desc: "" },
    { id: 11, name: "Hamba Allah", program: "Operasional RQS", amount: 500000, date: new Date(Date.now() - 216 * 3600000).toISOString(), desc: "" },
    { id: 12, name: "Agus", program: "Pengembangan Aplikasi", amount: 100000, date: new Date(Date.now() - 240 * 3600000).toISOString(), desc: "Semangat ngoding" }
];

const banks = [
    { id: 'bsi', name: 'BSI (Bank Syariah Indonesia)', account: '1234567890', owner: 'Yayasan Rumah Quran Sobariah' },
    { id: 'bca', name: 'BCA Syariah', account: '0987654321', owner: 'Yayasan RQS' },
    { id: 'mandiri', name: 'Bank Mandiri', account: '1122334455', owner: 'Rumah Quran Sobariah' }
];

const formatTimeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return `Baru saja`;
    if (minutes < 60) return `${minutes} mnt lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
};

const Donasi = ({ setActiveTab }) => {
    const [step, setStep] = useState(0); 
    const [donations, setDonations] = useState([]);
    const [showAllDonors, setShowAllDonors] = useState(false);
    
    // Load donations from Supabase
    useEffect(() => {
        const fetchDonations = async () => {
            const { data, error } = await supabase
                .from('rqs_donasi')
                .select('*')
                .order('date', { ascending: false });
            
            if (!error && data) {
                if (data.length === 0) {
                    // Seed initial data if empty
                    const mappedInitial = initialDonations.map(d => ({
                        name: d.name,
                        program: d.program,
                        amount: d.amount,
                        date: d.date,
                        description: d.desc
                    }));
                    const { data: insertedData, error: insertError } = await supabase
                        .from('rqs_donasi')
                        .insert(mappedInitial)
                        .select();
                    
                    if (!insertError && insertedData) {
                        const sorted = insertedData.sort((a,b) => new Date(b.date) - new Date(a.date));
                        setDonations(sorted);
                    }
                } else {
                    setDonations(data);
                }
            }
        };
        fetchDonations();
    }, []);
    
    const [formData, setFormData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        program: '',
        bank: null
    });

    const handleDonasiClick = (programName) => {
        setFormData({
            name: '',
            date: new Date().toISOString().split('T')[0],
            amount: '',
            description: '',
            program: programName,
            bank: null
        });
        setStep(1);
    };

    const closeModal = () => {
        setStep(0);
    };

    const processDonation = async () => {
        const newDonation = {
            name: formData.name.trim() || 'Hamba Allah',
            program: formData.program,
            amount: parseInt(formData.amount),
            date: new Date().toISOString(), // Use real submit time for sorting
            description: formData.description
        };
        
        const { data, error } = await supabase
            .from('rqs_donasi')
            .insert([newDonation])
            .select();
            
        if (!error && data) {
            const updatedDonations = [data[0], ...donations];
            setDonations(updatedDonations);
        } else {
            // Fallback for UI if error
            const fallbackDonation = { id: Date.now(), ...newDonation };
            setDonations([fallbackDonation, ...donations]);
        }
        setStep(5);
    };

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Donasi RQS</h2>
                    <p className="text-[10px] text-emerald-600 font-bold">Sedekah Jariyah</p>
                </div>
            </div>

            {/* Banner */}
            <div className="mx-4 mt-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1">Berbagi Kebaikan</h3>
                    <p className="text-xs text-white/90 mb-3 max-w-[80%]">Salurkan sedekah dan infaq terbaik Anda untuk mendukung program Rumah Quran Sobariah.</p>
                    <button 
                        onClick={() => handleDonasiClick('Donasi Umum RQS')}
                        className="bg-white text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm active:scale-95 transition-transform"
                    >
                        Donasi Sekarang
                    </button>
                </div>
                <div className="absolute -right-4 -bottom-4 text-white/20">
                    <PhosphorIcon icon="money" weight="fill" size={100} />
                </div>
            </div>

            {/* Menu Layanan Donasi */}
            <div className="p-4 mt-2">
                <h3 className="font-bold text-[#4A1C14] mb-3 text-sm">Program Pilihan</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div 
                        onClick={() => handleDonasiClick('Santri Yatim & Dhuafa')}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                            <PhosphorIcon icon="users" size={24} weight="fill" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">Santri Yatim & Dhuafa</h4>
                        <p className="text-[10px] text-gray-500 leading-tight">Beasiswa untuk para penghafal Al-Quran.</p>
                    </div>
                    
                    <div 
                        onClick={() => handleDonasiClick('Pengembangan Aplikasi')}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                            <PhosphorIcon icon="code" size={24} weight="fill" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">Pengembangan Aplikasi</h4>
                        <p className="text-[10px] text-gray-500 leading-tight">Dukungan operasional developer aplikasi RQS.</p>
                    </div>

                    <div 
                        onClick={() => handleDonasiClick('Wakaf Al-Quran')}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                            <PhosphorIcon icon="book-open" size={24} weight="fill" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">Wakaf Al-Quran</h4>
                        <p className="text-[10px] text-gray-500 leading-tight">Distribusi Al-Quran ke pelosok desa.</p>
                    </div>

                    <div 
                        onClick={() => handleDonasiClick('Operasional RQS')}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
                            <PhosphorIcon icon="heart" size={24} weight="fill" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">Operasional RQS</h4>
                        <p className="text-[10px] text-gray-500 leading-tight">Dukungan operasional dakwah harian.</p>
                    </div>
                </div>
            </div>
            
            {/* Riwayat / Info Transparansi */}
            <div className="px-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#4A1C14] text-sm">Donatur Terbaru</h3>
                    <span onClick={() => setShowAllDonors(true)} className="text-[10px] font-bold text-emerald-600 cursor-pointer hover:underline">Lihat Semua</span>
                </div>
                
                <div className="flex flex-col gap-3">
                    {donations.slice(0, 10).map((donatur) => (
                        <div key={donatur.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <PhosphorIcon icon="user" weight="fill" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm">{donatur.name}</h4>
                                    <p className="text-[10px] text-gray-500">{donatur.program}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-emerald-600">Rp {donatur.amount.toLocaleString('id-ID')}</p>
                                    <p className="text-[9px] text-gray-400">{formatTimeAgo(donatur.date)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Flow Donasi */}
            {step > 0 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header Modal */}
                        {step < 5 && (
                            <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
                                <div className="flex items-center gap-3">
                                    {step > 1 && (
                                        <button onClick={() => setStep(step - 1)} className="text-gray-500 hover:text-gray-800 bg-gray-50 p-1.5 rounded-full transition-colors">
                                            <PhosphorIcon icon="arrow-left" size={18} weight="bold" />
                                        </button>
                                    )}
                                    <h3 className="font-bold text-gray-800 text-lg">
                                        {step === 1 ? 'Formulir Donasi' : step === 2 ? 'Pilih Rekening' : step === 3 ? 'Instruksi Transfer' : 'Upload Bukti'}
                                    </h3>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-full transition-colors">
                                    <PhosphorIcon icon="x" size={20} weight="bold" />
                                </button>
                            </div>
                        )}
                        
                        {/* Body Modal */}
                        <div className="p-5 overflow-y-auto hide-scrollbar">
                            
                            {/* Step 1: Input Data */}
                            {step === 1 && (
                                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="flex flex-col gap-4">
                                    {/* Program (Readonly Display) */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Program Pilihan</label>
                                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 text-sm font-semibold text-emerald-800 flex items-center gap-2">
                                            <PhosphorIcon icon="check-circle" weight="fill" className="text-emerald-500" />
                                            {formData.program}
                                        </div>
                                    </div>
                                    {/* Tanggal */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Tanggal</label>
                                        <input 
                                            type="date" 
                                            value={formData.date}
                                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                            required
                                        />
                                    </div>
                                    {/* Nama */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Nama Donatur (Opsional)</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="Hamba Allah"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                    {/* Nominal */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Nominal Donasi (Rp)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                                            <input 
                                                type="number" 
                                                value={formData.amount}
                                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                                placeholder="0"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:font-normal placeholder:text-gray-400"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {[25000, 50000, 100000].map(val => (
                                                <button 
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, amount: val.toString()})}
                                                    className={`text-xs font-bold py-2.5 rounded-xl border transition-all ${formData.amount === val.toString() ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {val.toLocaleString('id-ID')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Pesan/Deskripsi */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Pesan Doa / Deskripsi (Opsional)</label>
                                        <textarea 
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            placeholder="Tulis doa atau pesan Anda..."
                                            rows={2}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none placeholder:text-gray-400"
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-2xl mt-2 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all"
                                    >
                                        Selanjutnya
                                    </button>
                                </form>
                            )}

                            {/* Step 2: Pilih Rekening */}
                            {step === 2 && (
                                <div className="flex flex-col gap-3 animate-in slide-in-from-right-4 duration-300">
                                    <p className="text-sm text-gray-600 mb-2">Pilih rekening tujuan transfer donasi Anda:</p>
                                    {banks.map(bank => (
                                        <button 
                                            key={bank.id}
                                            onClick={() => { setFormData({...formData, bank: bank}); setStep(3); }}
                                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
                                        >
                                            <div className="w-12 h-12 bg-gray-50 group-hover:bg-white border border-gray-100 group-hover:border-emerald-100 rounded-full flex items-center justify-center shrink-0 transition-colors">
                                                <PhosphorIcon icon="bank" size={24} className="text-gray-600 group-hover:text-emerald-600" weight="duotone" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm group-hover:text-emerald-700 transition-colors">{bank.name}</h4>
                                                <p className="text-[11px] text-gray-500 mt-0.5">Proses otomatis</p>
                                            </div>
                                            <div className="ml-auto text-gray-300 group-hover:text-emerald-500 transition-colors">
                                                <PhosphorIcon icon="caret-right" size={20} weight="bold" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Step 3: Instruksi Transfer */}
                            {step === 3 && formData.bank && (
                                <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
                                    <div className="bg-amber-50 p-5 rounded-3xl border border-amber-200 w-full text-left relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <PhosphorIcon icon="wallet" size={100} weight="fill" />
                                        </div>
                                        <p className="text-xs text-amber-800 font-bold mb-1 relative z-10">Silakan transfer ke:</p>
                                        <p className="text-sm font-bold text-gray-800 relative z-10">{formData.bank.name}</p>
                                        <div className="flex justify-between items-center mt-2 mb-1 relative z-10">
                                            <p className="text-2xl font-mono text-gray-900 tracking-wider font-bold">{formData.bank.account}</p>
                                        </div>
                                        <p className="text-[11px] text-gray-600 relative z-10">a.n. {formData.bank.owner}</p>
                                        
                                        <button 
                                            onClick={(e) => {
                                                navigator.clipboard.writeText(formData.bank.account);
                                                e.target.innerText = "✓ Tersalin!";
                                                setTimeout(() => { e.target.innerHTML = `<i class="ph-bold ph-copy mr-2"></i> Salin Nomor Rekening`; }, 2000);
                                            }}
                                            className="mt-5 w-full text-emerald-700 text-xs font-bold bg-emerald-100/80 hover:bg-emerald-200 py-3 rounded-xl flex items-center justify-center transition"
                                        >
                                            <PhosphorIcon icon="copy" size={16} weight="bold" className="mr-2" />
                                            Salin Nomor Rekening
                                        </button>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 text-center flex flex-col justify-center items-center">
                                        <p className="text-xs text-gray-500 mb-1">Nominal Donasi</p>
                                        <p className="text-2xl font-bold text-emerald-600">Rp {parseInt(formData.amount).toLocaleString('id-ID')}</p>
                                    </div>

                                    <button 
                                        onClick={() => setStep(4)}
                                        className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-2xl mt-2 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all"
                                    >
                                        Donasi Sekarang
                                    </button>
                                </div>
                            )}

                            {/* Step 4: Upload Bukti */}
                            {step === 4 && (
                                <div className="flex flex-col gap-4 text-center animate-in slide-in-from-right-4 duration-300">
                                    <p className="text-sm text-gray-600 mb-2">Silakan unggah tangkapan layar (screenshot) bukti transfer Anda.</p>
                                    
                                    <label className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors group">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <PhosphorIcon icon="upload-simple" size={32} className="text-emerald-500" weight="bold" />
                                        </div>
                                        <span className="text-sm font-bold text-emerald-700">Pilih File Bukti Pembayaran</span>
                                        <span className="text-[11px] text-emerald-600/70 mt-1.5">Mendukung file JPG & PNG</span>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                if(e.target.files && e.target.files[0]){
                                                    // Process simulated upload
                                                    setTimeout(() => processDonation(), 800);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            )}

                            {/* Step 5: Sukses */}
                            {step === 5 && (
                                <div className="text-center flex flex-col items-center py-6 animate-in zoom-in-95 duration-500">
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                                        <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping opacity-20"></div>
                                        <PhosphorIcon icon="check-circle" size={56} weight="fill" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Jazakumullah Khairan!</h3>
                                    <p className="text-sm text-gray-600 mb-8 px-2 leading-relaxed">
                                        Semoga donasi Anda untuk program <strong>{formData.program}</strong> menjadi amal jariyah yang terus mengalir pahalanya. Aamiin.
                                    </p>
                                    
                                    <button 
                                        onClick={closeModal}
                                        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/30"
                                    >
                                        Selesai
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Semua Donatur */}
            {showAllDonors && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#FAFAFA] rounded-t-3xl sm:rounded-3xl w-full max-w-md h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-5 bg-white border-b border-gray-100 shrink-0 shadow-sm z-10">
                            <h3 className="font-bold text-gray-800 text-lg">Semua Donatur</h3>
                            <button onClick={() => setShowAllDonors(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-full transition-colors">
                                <PhosphorIcon icon="x" size={20} weight="bold" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 hide-scrollbar">
                            {donations.map(donatur => (
                                <div key={donatur.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                            <PhosphorIcon icon="user" weight="fill" size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-sm">{donatur.name}</h4>
                                            <p className="text-[10px] text-gray-500">{donatur.program}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-emerald-600">Rp {donatur.amount.toLocaleString('id-ID')}</p>
                                            <p className="text-[9px] text-gray-400">{new Date(donatur.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'})}</p>
                                        </div>
                                    </div>
                                    {donatur.description && (
                                        <div className="mt-1.5 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[11px] text-gray-600 italic">"{donatur.description}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="text-center py-6 text-xs text-gray-400">
                                - Akhir daftar donatur -
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Donasi;
