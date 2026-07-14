import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const getColorClasses = (color) => {
    const classes = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
        green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    };
    return classes[color] || classes.blue;
};

const LaporanKeuangan = ({ onBack }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [financialData, setFinancialData] = useState({});
    const [pengeluaran, setPengeluaran] = useState([]);
    const [grandTotalIncome, setGrandTotalIncome] = useState(0);
    const [grandTotalExpense, setGrandTotalExpense] = useState(0);

    const [selectedCategory, setSelectedCategory] = useState(null); // 'berdaya', 'donasi', dll.
    const [selectedSubModule, setSelectedSubModule] = useState(null); // nama produk / program

    const [expenseForm, setExpenseForm] = useState({ description: '', amount: '' });

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch E-commerce Orders
            const { data: ordersData } = await supabase.from('rqs_orders').select('*').in('status', ['Selesai', 'Terverifikasi']);
            
            // Fetch Qurban Participants & Qurban Animals
            const { data: qurbanParts } = await supabase.from('rqs_qurban_participants').select('*');
            const { data: qurbanAnimals } = await supabase.from('rqs_qurban').select('*');
            
            // Fetch Donasi from LocalStorage (fallback since no supabase table yet)
            const donasiLocal = JSON.parse(localStorage.getItem('rqs_donasi_local') || '[]');
            
            // Fetch Pengeluaran from LocalStorage
            const pengeluaranLocal = JSON.parse(localStorage.getItem('rqs_pengeluaran_local') || '[]');
            setPengeluaran(pengeluaranLocal);

            // Grouping logic
            const dataStruct = {
                'berdaya': { title: 'RQS Berdaya', icon: 'handshake', color: 'blue', subModules: {} },
                'herbal': { title: 'RQS Herbal', icon: 'leaf', color: 'green', subModules: {} },
                'merchandise': { title: 'Merchandise', icon: 't-shirt', color: 'orange', subModules: {} },
                'qurban': { title: 'Qurban', icon: 'cow', color: 'amber', subModules: {} },
                'donasi': { title: 'Donasi', icon: 'money', color: 'emerald', subModules: {} },
            };

            // Process Orders
            if (ordersData) {
                ordersData.forEach(order => {
                    const moduleKey = order.module; // 'berdaya', 'herbal', 'merchandise'
                    if (dataStruct[moduleKey] && order.items) {
                        order.items.forEach(item => {
                            const subName = item.name;
                            if (!dataStruct[moduleKey].subModules[subName]) {
                                dataStruct[moduleKey].subModules[subName] = { name: subName, totalIncome: 0, totalExpense: 0, transactions: [] };
                            }
                            const amount = item.price * item.qty;
                            dataStruct[moduleKey].subModules[subName].totalIncome += amount;
                            dataStruct[moduleKey].subModules[subName].transactions.push({
                                id: order.id + '-' + subName,
                                originalId: order.id,
                                source: 'order',
                                date: order.created_at,
                                name: order.customer_name,
                                desc: `Varian: ${item.variantName} x${item.qty}`,
                                amount: amount,
                                type: 'income'
                            });
                        });
                    }
                });
            }

            // Process Qurban
            if (qurbanParts) {
                qurbanParts.forEach(p => {
                    const animal = qurbanAnimals?.find(a => a.id === p.animal_id);
                    const subName = animal ? animal.name : (p.service_type === 'tabungan' ? 'Tabungan Qurban' : p.service_type);
                    if (!dataStruct['qurban'].subModules[subName]) {
                        dataStruct['qurban'].subModules[subName] = { name: subName, totalIncome: 0, totalExpense: 0, transactions: [] };
                    }
                    dataStruct['qurban'].subModules[subName].totalIncome += p.paid_amount;
                    dataStruct['qurban'].subModules[subName].transactions.push({
                        id: p.id,
                        originalId: p.id,
                        source: 'qurban',
                        date: p.created_at,
                        name: p.participant_name,
                        desc: `Layanan: ${p.service_type}`,
                        amount: p.paid_amount,
                        type: 'income'
                    });
                });
            }

            // Process Donasi
            donasiLocal.forEach(d => {
                const subName = d.program;
                if (!dataStruct['donasi'].subModules[subName]) {
                    dataStruct['donasi'].subModules[subName] = { name: subName, totalIncome: 0, totalExpense: 0, transactions: [] };
                }
                dataStruct['donasi'].subModules[subName].totalIncome += d.amount;
                dataStruct['donasi'].subModules[subName].transactions.push({
                    id: d.id,
                    originalId: d.id,
                    source: 'donasi',
                    date: d.date,
                    name: d.name,
                    desc: d.desc,
                    amount: d.amount,
                    type: 'income'
                });
            });

            // Process Pengeluaran
            pengeluaranLocal.forEach(ex => {
                const cat = dataStruct[ex.category];
                if (cat && cat.subModules[ex.subModule]) {
                    cat.subModules[ex.subModule].totalExpense += ex.amount;
                    cat.subModules[ex.subModule].transactions.push({
                        id: ex.id,
                        originalId: ex.id,
                        source: 'pengeluaran',
                        date: ex.date,
                        name: 'Pengeluaran',
                        desc: ex.description,
                        amount: ex.amount,
                        type: 'expense'
                    });
                }
            });

            // Calculate Grand Totals
            let gIncome = 0;
            let gExpense = 0;

            Object.keys(dataStruct).forEach(key => {
                let catIncome = 0;
                let catExpense = 0;
                Object.values(dataStruct[key].subModules).forEach(sub => {
                    catIncome += sub.totalIncome;
                    catExpense += sub.totalExpense;
                    // Sort transactions by date descending
                    sub.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                });
                dataStruct[key].totalIncome = catIncome;
                dataStruct[key].totalExpense = catExpense;
                dataStruct[key].totalKas = catIncome - catExpense;
                
                gIncome += catIncome;
                gExpense += catExpense;
            });

            setFinancialData(dataStruct);
            setGrandTotalIncome(gIncome);
            setGrandTotalExpense(gExpense);

        } catch (error) {
            console.error("Error loading financial data:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Effect to prevent crash if a selected sub module/category is deleted completely
    useEffect(() => {
        if (selectedCategory && financialData[selectedCategory]) {
            if (selectedSubModule && !financialData[selectedCategory].subModules[selectedSubModule]) {
                setSelectedSubModule(null);
            }
        } else if (selectedCategory && !financialData[selectedCategory]) {
            setSelectedCategory(null);
        }
    }, [financialData, selectedCategory, selectedSubModule]);

    const handleAddExpense = (e) => {
        e.preventDefault();
        const amt = parseInt(expenseForm.amount);
        if (!amt || !expenseForm.description) return;

        const newExpense = {
            id: 'EXP-' + Date.now(),
            category: selectedCategory,
            subModule: selectedSubModule,
            description: expenseForm.description,
            amount: amt,
            date: new Date().toISOString()
        };

        const updatedPengeluaran = [newExpense, ...pengeluaran];
        localStorage.setItem('rqs_pengeluaran_local', JSON.stringify(updatedPengeluaran));
        setExpenseForm({ description: '', amount: '' });
        loadData(); // Reload to recalculate
    };

    const handleDeleteTransaction = async (trx) => {
        if (!window.confirm('Yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan.')) return;
        
        setIsLoading(true);
        try {
            if (trx.source === 'order') {
                await supabase.from('rqs_orders').delete().eq('id', trx.originalId);
            } else if (trx.source === 'qurban') {
                await supabase.from('rqs_qurban_participants').delete().eq('id', trx.originalId);
            } else if (trx.source === 'donasi') {
                const donasiLocal = JSON.parse(localStorage.getItem('rqs_donasi_local') || '[]');
                const updated = donasiLocal.filter(d => d.id !== trx.originalId);
                localStorage.setItem('rqs_donasi_local', JSON.stringify(updated));
            } else if (trx.source === 'pengeluaran') {
                const updated = pengeluaran.filter(ex => ex.id !== trx.originalId);
                localStorage.setItem('rqs_pengeluaran_local', JSON.stringify(updated));
            }
            await loadData();
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Gagal menghapus transaksi.");
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7]">
                <PhosphorIcon icon="circle-notch" className="animate-spin text-emerald-500 mb-2" size={32}/>
                <p className="text-gray-500 text-sm">Memuat Data Keuangan...</p>
            </div>
        );
    }

    const grandTotalKas = grandTotalIncome - grandTotalExpense;

    return (
        <div className="pb-28 animate-in fade-in duration-300 bg-[#FDFBF7] min-h-screen relative z-30">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-50 shadow-sm border-b border-[#E8D2A6]/30">
                <button 
                    onClick={() => {
                        if (selectedSubModule) setSelectedSubModule(null);
                        else if (selectedCategory) setSelectedCategory(null);
                        else onBack();
                    }} 
                    className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors"
                >
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">
                        {(selectedSubModule && financialData[selectedCategory]?.subModules[selectedSubModule]) 
                            ? selectedSubModule 
                            : (selectedCategory && financialData[selectedCategory] 
                                ? financialData[selectedCategory]?.title 
                                : 'Laporan Keuangan')}
                    </h2>
                    {(selectedCategory || selectedSubModule) && <p className="text-[10px] text-[#B88A44] font-bold">Data Real-time Transaksi & Kas</p>}
                </div>
            </div>

            {!selectedCategory ? (
                // --- LEVEL 1: MENU UTAMA ---
                <div className="p-5 animate-in slide-in-from-left-4 duration-300">
                    <div className="bg-[#4A1C14] rounded-2xl p-5 text-[#FCF7E8] shadow-lg mb-6 relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 text-white/10">
                            <PhosphorIcon icon="chart-line-up" size={120} weight="fill" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs text-white/70 font-semibold mb-1">Total Kas Tersedia</p>
                            <h3 className="text-3xl font-bold mb-1 break-words">
                                {formatRupiah(grandTotalKas)}
                            </h3>
                            <div className="flex justify-between mt-3 text-[10px] font-bold">
                                <div className="bg-emerald-500/20 px-2 py-1 rounded-lg">Pemasukan: {formatRupiah(grandTotalIncome)}</div>
                                <div className="bg-red-500/20 px-2 py-1 rounded-lg text-red-200">Pengeluaran: {formatRupiah(grandTotalExpense)}</div>
                            </div>
                        </div>
                    </div>

                    <h3 className="font-bold text-[#4A1C14] text-sm mb-3">Sumber Keuangan</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {Object.keys(financialData).map((key) => {
                            const item = financialData[key];
                            const cols = getColorClasses(item.color);
                            return (
                                <div 
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-4 active:scale-[0.98]"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cols.bg} ${cols.text}`}>
                                        <PhosphorIcon icon={item.icon} size={28} weight="duotone" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                        <p className="text-[11px] text-gray-500">{Object.keys(item.subModules).length} Bagian</p>
                                    </div>
                                    <div className="text-right flex items-center">
                                        <div>
                                            <p className="text-[10px] text-gray-500">Kas</p>
                                            <p className="text-sm font-bold text-gray-800">{formatRupiah(item.totalKas)}</p>
                                        </div>
                                        <PhosphorIcon icon="caret-right" size={16} className="text-gray-400 ml-2" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (!selectedSubModule || !financialData[selectedCategory]?.subModules[selectedSubModule]) ? (
                // --- LEVEL 2: KATEGORI (List Sub-Modules / Produk / Program) ---
                <div className="p-5 animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-6 flex flex-col items-center justify-center text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${getColorClasses(financialData[selectedCategory].color).bg} ${getColorClasses(financialData[selectedCategory].color).text}`}>
                            <PhosphorIcon icon={financialData[selectedCategory].icon} size={32} weight="duotone" />
                        </div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Total Kas {financialData[selectedCategory].title}</p>
                        <h3 className="text-2xl font-bold text-gray-800 break-words">
                            {formatRupiah(financialData[selectedCategory].totalKas)}
                        </h3>
                    </div>

                    <h3 className="font-bold text-[#4A1C14] text-sm mb-3">Pilih Bagian / Produk</h3>
                    <div className="flex flex-col gap-3">
                        {Object.values(financialData[selectedCategory].subModules).length === 0 && (
                            <div className="text-center p-6 bg-white rounded-2xl border border-gray-100">
                                <p className="text-sm text-gray-500">Belum ada data pemasukan di kategori ini.</p>
                            </div>
                        )}
                        {Object.values(financialData[selectedCategory].subModules).map((sub) => (
                            <div 
                                key={sub.name} 
                                onClick={() => setSelectedSubModule(sub.name)}
                                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-emerald-300 cursor-pointer flex items-center justify-between group transition-all"
                            >
                                <div className="flex-1 pr-2">
                                    <h4 className="font-bold text-gray-800 text-sm mb-1">{sub.name}</h4>
                                    <div className="flex gap-2 text-[10px] font-bold">
                                        <span className="text-emerald-600">In: {formatRupiah(sub.totalIncome)}</span>
                                        <span className="text-red-500">Out: {formatRupiah(sub.totalExpense)}</span>
                                    </div>
                                </div>
                                <div className="text-right flex items-center">
                                    <p className="text-xs font-bold text-gray-800">{formatRupiah(sub.totalIncome - sub.totalExpense)}</p>
                                    <PhosphorIcon icon="caret-right" size={16} className="text-gray-300 group-hover:text-emerald-500 ml-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // --- LEVEL 3: RINCIAN SUB-MODULE (Pemasukan, Pengeluaran, Form) ---
                <div className="p-5 animate-in slide-in-from-right-4 duration-300">
                    
                    {/* Ringkasan Sub-Module */}
                    <div className="bg-gradient-to-br from-[#4A1C14] to-[#713125] rounded-3xl p-5 shadow-lg mb-6 text-white text-center relative overflow-hidden">
                        <p className="text-xs text-white/70 font-bold mb-1">Kas {selectedSubModule}</p>
                        <h3 className="text-3xl font-bold mb-3 break-words">
                            {formatRupiah(financialData[selectedCategory].subModules[selectedSubModule].totalIncome - financialData[selectedCategory].subModules[selectedSubModule].totalExpense)}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold bg-black/20 rounded-xl p-2">
                            <div className="flex flex-col items-center">
                                <span className="text-emerald-300">Pemasukan</span>
                                <span>{formatRupiah(financialData[selectedCategory].subModules[selectedSubModule].totalIncome)}</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-white/20">
                                <span className="text-red-300">Pengeluaran</span>
                                <span>{formatRupiah(financialData[selectedCategory].subModules[selectedSubModule].totalExpense)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Input Pengeluaran */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-6">
                        <h4 className="font-bold text-sm text-[#4A1C14] mb-3 flex items-center gap-2">
                            <PhosphorIcon icon="minus-circle" weight="fill" className="text-red-500" />
                            Catat Pengeluaran
                        </h4>
                        <form onSubmit={handleAddExpense} className="space-y-3">
                            <div>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="Deskripsi pengeluaran (Cth: Modal cetak, Honor pengajar)" 
                                    value={expenseForm.description}
                                    onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-400"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">Rp</span>
                                    <input 
                                        required 
                                        type="number" 
                                        placeholder="0" 
                                        value={expenseForm.amount}
                                        onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-9 pr-3 text-sm font-bold focus:outline-none focus:border-red-400"
                                    />
                                </div>
                                <button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 rounded-xl transition text-sm">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-[#4A1C14] text-sm">Riwayat Transaksi</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                        {financialData[selectedCategory].subModules[selectedSubModule].transactions.length === 0 && (
                            <p className="text-xs text-gray-500 text-center py-4 bg-white rounded-xl border border-gray-100">Belum ada riwayat transaksi.</p>
                        )}
                        {financialData[selectedCategory].subModules[selectedSubModule].transactions.map((trx, idx) => (
                            <div key={trx.id + idx} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${trx.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                    <PhosphorIcon icon={trx.type === 'income' ? "arrow-down-left" : "arrow-up-right"} size={20} weight="bold" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{trx.name}</h4>
                                    {trx.desc && <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{trx.desc}</p>}
                                    <p className="text-[9px] text-gray-400 mt-1">{new Date(trx.date).toLocaleString('id-ID')}</p>
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end justify-between">
                                    <p className={`text-xs font-bold ${trx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {trx.type === 'income' ? '+' : '-'}{formatRupiah(trx.amount)}
                                    </p>
                                    <button 
                                        onClick={() => handleDeleteTransaction(trx)}
                                        className="mt-1 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex items-center justify-center"
                                        title="Hapus Transaksi"
                                    >
                                        <PhosphorIcon icon="trash" size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaporanKeuangan;
