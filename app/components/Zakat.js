import React, { useState } from 'react';
import PhosphorIcon from './PhosphorIcon';

const Zakat = ({ setActiveTab }) => {
    const [zakatType, setZakatType] = useState('fitrah'); // 'fitrah' | 'profesi' | 'harta'

    // Zakat Fitrah
    const [numPeople, setNumPeople] = useState('');
    const [ricePrice, setRicePrice] = useState(45000);

    // Zakat Profesi
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [otherIncome, setOtherIncome] = useState('');
    const [debt, setDebt] = useState('');

    // Zakat Harta (Tabungan & Emas)
    const [savings, setSavings] = useState('');
    const [goldGrams, setGoldGrams] = useState('');
    
    // Harga Emas saat ini (Asumsi IDR 1.200.000 / gram)
    const goldPrice = 1200000;
    
    const formatCurrency = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
    };

    const parseNumber = (val) => {
        const parsed = parseInt(val.toString().replace(/[^0-9]/g, ''));
        return isNaN(parsed) ? 0 : parsed;
    };

    const handleInput = (setter) => (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setter(val);
    };

    // Kalkulasi
    const calculateFitrah = () => {
        const people = parseNumber(numPeople);
        const price = parseNumber(ricePrice);
        return people * price;
    };

    const calculateProfesi = () => {
        const income = parseNumber(monthlyIncome) + parseNumber(otherIncome);
        const currentDebt = parseNumber(debt);
        const netto = income - currentDebt;
        
        // Nishab Profesi per bulan = 85 gram emas / 12
        const nishabProfesi = (85 * goldPrice) / 12;
        
        if (netto >= nishabProfesi) {
            return netto * 0.025;
        }
        return 0;
    };

    const calculateHarta = () => {
        const totalSavings = parseNumber(savings);
        const totalGoldValue = parseNumber(goldGrams) * goldPrice;
        const totalWealth = totalSavings + totalGoldValue;
        
        // Nishab Harta = 85 gram emas
        const nishabHarta = 85 * goldPrice;
        
        if (totalWealth >= nishabHarta) {
            return totalWealth * 0.025;
        }
        return 0;
    };

    const getProfesiStatus = () => {
        const netto = (parseNumber(monthlyIncome) + parseNumber(otherIncome)) - parseNumber(debt);
        const nishab = (85 * goldPrice) / 12;
        return {
            netto,
            nishab,
            wajib: netto >= nishab
        };
    };

    const getHartaStatus = () => {
        const totalWealth = parseNumber(savings) + (parseNumber(goldGrams) * goldPrice);
        const nishab = 85 * goldPrice;
        return {
            totalWealth,
            nishab,
            wajib: totalWealth >= nishab
        };
    };

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kalkulator Zakat</h2>
                    <p className="text-[10px] text-amber-500 font-bold">Hitung Zakat Anda</p>
                </div>
            </div>

            {/* Banner */}
            <div className="mx-4 mt-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1">Tunaikan Kewajiban</h3>
                    <p className="text-xs text-white/90 mb-3 max-w-[85%]">Sucikan harta dengan berzakat. Hitung nisab dan bayar zakat Anda dengan mudah sesuai syariat.</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-white/20">
                    <PhosphorIcon icon="hand-coins" weight="fill" size={100} />
                </div>
            </div>

            {/* Tab Navigasi Zakat */}
            <div className="flex px-4 mt-6 gap-2">
                <button 
                    onClick={() => setZakatType('fitrah')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${zakatType === 'fitrah' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-100'}`}
                >
                    Zakat Fitrah
                </button>
                <button 
                    onClick={() => setZakatType('profesi')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${zakatType === 'profesi' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-100'}`}
                >
                    Zakat Profesi
                </button>
                <button 
                    onClick={() => setZakatType('harta')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${zakatType === 'harta' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-100'}`}
                >
                    Zakat Maal
                </button>
            </div>

            {/* Form Area */}
            <div className="px-4 mt-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    {zakatType === 'fitrah' && (
                        <div className="space-y-4 animate-in fade-in">
                            <h3 className="font-bold text-[#4A1C14] text-sm mb-4 flex items-center gap-2">
                                <PhosphorIcon icon="users" size={18} className="text-amber-500" />
                                Kalkulator Zakat Fitrah
                            </h3>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">Jumlah Anggota Keluarga (Jiwa)</label>
                                <div className="relative">
                                    <input 
                                        type="tel" 
                                        value={numPeople} 
                                        onChange={handleInput(setNumPeople)} 
                                        placeholder="Contoh: 4"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
                                    />
                                    <span className="absolute right-4 top-3 text-sm text-gray-400 font-bold">Jiwa</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">Harga Beras (2.5 Kg / 3.5 Liter)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-sm text-gray-400 font-bold">Rp</span>
                                    <input 
                                        type="tel" 
                                        value={parseNumber(ricePrice).toLocaleString('id-ID')} 
                                        onChange={handleInput(setRicePrice)} 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
                                    />
                                </div>
                                <p className="text-[9px] text-gray-400 mt-1">*Ubah sesuai harga beras yang biasa Anda konsumsi.</p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Total Zakat Fitrah Anda:</p>
                                <h2 className="text-2xl font-bold text-amber-600">{formatCurrency(calculateFitrah())}</h2>
                            </div>
                        </div>
                    )}

                    {zakatType === 'profesi' && (
                        <div className="space-y-4 animate-in fade-in">
                            <h3 className="font-bold text-[#4A1C14] text-sm mb-4 flex items-center gap-2">
                                <PhosphorIcon icon="briefcase" size={18} className="text-amber-500" />
                                Zakat Penghasilan / Profesi
                            </h3>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">Penghasilan Bulanan (Gaji, dll)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-sm text-gray-400 font-bold">Rp</span>
                                    <input 
                                        type="tel" 
                                        value={monthlyIncome ? parseNumber(monthlyIncome).toLocaleString('id-ID') : ''} 
                                        onChange={handleInput(setMonthlyIncome)} 
                                        placeholder="0"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">Penghasilan Tambahan (Bulan Ini)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-sm text-gray-400 font-bold">Rp</span>
                                    <input 
                                        type="tel" 
                                        value={otherIncome ? parseNumber(otherIncome).toLocaleString('id-ID') : ''} 
                                        onChange={handleInput(setOtherIncome)} 
                                        placeholder="0"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">Hutang / Cicilan Jatuh Tempo</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-sm text-gray-400 font-bold">Rp</span>
                                    <input 
                                        type="tel" 
                                        value={debt ? parseNumber(debt).toLocaleString('id-ID') : ''} 
                                        onChange={handleInput(setDebt)} 
                                        placeholder="0"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <div className="bg-amber-50 rounded-xl p-3 mb-4 text-[10px]">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-600">Total Penghasilan Netto:</span>
                                        <span className="font-bold text-gray-800">{formatCurrency(getProfesiStatus().netto)}</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-600">Nishab Profesi (85g emas / 12):</span>
                                        <span className="font-bold text-gray-800">{formatCurrency(getProfesiStatus().nishab)}</span>
                                    </div>
                                    <div className="flex justify-between mt-2 pt-2 border-t border-amber-200/50">
                                        <span className="text-gray-600">Status Wajib Zakat:</span>
                                        <span className={`font-bold ${getProfesiStatus().wajib ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {getProfesiStatus().wajib ? 'WAJIB ZAKAT' : 'BELUM WAJIB'}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mb-1">Zakat Profesi (2.5%):</p>
                                <h2 className="text-2xl font-bold text-amber-600">{formatCurrency(calculateProfesi())}</h2>
                            </div>
                        </div>
                    )}

                    {zakatType === 'harta' && (
                        <div className="space-y-4 animate-in fade-in">
                            <h3 className="font-bold text-[#4A1C14] text-sm mb-4 flex items-center gap-2">
                                <PhosphorIcon icon="bank" size={18} className="text-amber-500" />
                                Zakat Maal (Tabungan & Emas)
                            </h3>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">Saldo Tabungan / Kas (Telah Haul 1 Tahun)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-sm text-gray-400 font-bold">Rp</span>
                                    <input 
                                        type="tel" 
                                        value={savings ? parseNumber(savings).toLocaleString('id-ID') : ''} 
                                        onChange={handleInput(setSavings)} 
                                        placeholder="0"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">Jumlah Emas Yang Dimiliki</label>
                                <div className="relative">
                                    <input 
                                        type="tel" 
                                        value={goldGrams ? parseNumber(goldGrams).toLocaleString('id-ID') : ''} 
                                        onChange={handleInput(setGoldGrams)} 
                                        placeholder="0"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
                                    />
                                    <span className="absolute right-4 top-3 text-sm text-gray-400 font-bold">Gram</span>
                                </div>
                                <p className="text-[9px] text-gray-400 mt-1">*Nilai Emas Asumsi Rp 1.200.000 / gram</p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <div className="bg-amber-50 rounded-xl p-3 mb-4 text-[10px]">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-600">Total Harta Keseluruhan:</span>
                                        <span className="font-bold text-gray-800">{formatCurrency(getHartaStatus().totalWealth)}</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-600">Nishab Harta (85g Emas):</span>
                                        <span className="font-bold text-gray-800">{formatCurrency(getHartaStatus().nishab)}</span>
                                    </div>
                                    <div className="flex justify-between mt-2 pt-2 border-t border-amber-200/50">
                                        <span className="text-gray-600">Status Wajib Zakat:</span>
                                        <span className={`font-bold ${getHartaStatus().wajib ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {getHartaStatus().wajib ? 'WAJIB ZAKAT' : 'BELUM WAJIB'}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mb-1">Zakat Maal (2.5%):</p>
                                <h2 className="text-2xl font-bold text-amber-600">{formatCurrency(calculateHarta())}</h2>
                            </div>
                        </div>
                    )}
                </div>
                
                <button className="w-full mt-4 bg-emerald-600 text-white rounded-xl py-3.5 font-bold text-sm shadow-md active:scale-[0.98] transition-transform hover:bg-emerald-700 flex items-center justify-center gap-2">
                    <PhosphorIcon icon="money" weight="fill" size={20} />
                    Bayar Zakat Sekarang
                </button>
            </div>
            
            <div className="mt-8 text-center px-4">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                    "Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka..." (QS. At-Taubah: 103)
                </p>
            </div>
        </div>
    );
};

export default Zakat;
