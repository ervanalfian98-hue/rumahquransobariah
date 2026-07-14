import React, { useState, useEffect, useRef } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';
import { getGlobalWhatsApp } from '../lib/sosmedConfig';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const Qurban = ({ setActiveTab }) => {
    const [view, setView] = useState('main'); // main, tabungan, beli, penyaluran, patungan
    const [animals, setAnimals] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [rekening, setRekening] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Join Modal States
    const [joinModal, setJoinModal] = useState(null); // { animal }
    const [joinStep, setJoinStep] = useState('select_service'); // select_service, fill_form, select_payment, upload_proof
    const [serviceType, setServiceType] = useState(''); // tabungan, beli, penyaluran, patungan
    const [form, setForm] = useState({
        name: '',
        initial_payment: '',
        delivery_date: '',
        location: ''
    });
    const [selectedRekening, setSelectedRekening] = useState(null);
    const [proofImage, setProofImage] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const proofInputRef = useRef(null);

    // Installment Flow States
    const [installmentModal, setInstallmentModal] = useState(null); // { participant }
    const [installmentAmount, setInstallmentAmount] = useState('');

    const loadData = async () => {
        setIsLoading(true);
        const [resAnimals, resParts, resRek] = await Promise.all([
            supabase.from('rqs_qurban').select('*').order('created_at', { ascending: false }),
            supabase.from('rqs_qurban_participants').select('*').order('created_at', { ascending: true }),
            supabase.from('rqs_rekening').select('*').order('created_at', { ascending: false })
        ]);
        if (resAnimals.data) setAnimals(resAnimals.data);
        if (resParts.data) setParticipants(resParts.data);
        if (resRek.data) setRekening(resRek.data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleProofChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProofImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setProofPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleFinishJoin = async () => {
        setIsLoading(true);
        const animal = joinModal;
        let target_amount = animal.price;
        let group_name = null;

        if (serviceType === 'patungan') {
            target_amount = animal.price / 7;
            const existingGroups = participants.filter(p => p.animal_id === animal.id && p.service_type === 'patungan');
            const groupMap = {};
            existingGroups.forEach(p => { groupMap[p.group_name] = (groupMap[p.group_name] || 0) + 1; });
            
            let foundGroup = null;
            for (const [gname, count] of Object.entries(groupMap)) {
                if (count < 7) { foundGroup = gname; break; }
            }
            if (!foundGroup) foundGroup = `${animal.name} - Kelompok ${Object.keys(groupMap).length + 1}`;
            group_name = foundGroup;
        }

        const paid = Number(form.initial_payment) || 0;
        let proofUrl = null;

        if (proofImage) {
            const fileExt = proofImage.name.split('.').pop();
            const fileName = `bukti-qurban-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('ecommerce').upload(fileName, proofImage);
            if (!uploadError) {
                const { data } = supabase.storage.from('ecommerce').getPublicUrl(fileName);
                proofUrl = data.publicUrl;
            }
        }

        const paymentHistory = paid > 0 ? [{ 
            date: new Date().toISOString(), 
            amount: paid, 
            status: 'Menunggu Verifikasi',
            proof_url: proofUrl,
            bank_name: selectedRekening?.bank_name || 'Manual'
        }] : [];

        const newPart = {
            animal_id: animal.id,
            service_type: serviceType,
            participant_name: form.name,
            target_amount: target_amount,
            paid_amount: 0, // Admin must verify first
            delivery_date: form.delivery_date || null,
            location: form.location || null,
            group_name: group_name,
            payment_history: paymentHistory
        };

        const { error } = await supabase.from('rqs_qurban_participants').insert([newPart]);
        setIsLoading(false);

        if (error) {
            alert('Gagal menyimpan pendaftaran: ' + error.message);
            return;
        }

        let msg = `Halo Admin RQS, saya telah mendaftar layanan Qurban dan melakukan pembayaran awal.%0A%0A`;
        msg += `*Layanan*: ${serviceType.toUpperCase()}%0A`;
        msg += `*Nama*: ${form.name}%0A`;
        msg += `*Hewan*: ${animal.name}%0A`;
        if (serviceType === 'patungan') msg += `*Kelompok*: ${group_name}%0A`;
        msg += `*Pembayaran Awal*: ${formatRupiah(paid)}%0A`;
        if (selectedRekening) msg += `*Tujuan Transfer*: ${selectedRekening.bank_name} (${selectedRekening.account_number})%0A`;
        if (proofUrl) msg += `*Bukti Transfer*: ${proofUrl}%0A%0A`;
        msg += `Mohon bantu verifikasi pembayaran saya. Terima kasih.`;

        window.open(`https://wa.me/${getGlobalWhatsApp()}?text=${msg}`, '_blank');
        closeJoinModal();
        loadData();
    };

    const closeJoinModal = () => {
        setJoinModal(null);
        setJoinStep('select_service');
        setServiceType('');
        setForm({ name: '', initial_payment: '', delivery_date: '', location: '' });
        setSelectedRekening(null);
        setProofImage(null);
        setProofPreview(null);
    };

    const handleFinishInstallment = async () => {
        if (!proofImage) {
            alert("Harap unggah bukti transfer!");
            return;
        }
        setIsLoading(true);
        const p = installmentModal;
        const amount = Number(installmentAmount);
        
        let proofUrl = null;
        const fileExt = proofImage.name.split('.').pop();
        const fileName = `bukti-qurban-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('ecommerce').upload(fileName, proofImage);
        
        if (!uploadError) {
            const { data } = supabase.storage.from('ecommerce').getPublicUrl(fileName);
            proofUrl = data.publicUrl;
        }

        const newHistoryItem = { 
            date: new Date().toISOString(), 
            amount: amount, 
            status: 'Menunggu Verifikasi',
            proof_url: proofUrl,
            bank_name: selectedRekening?.bank_name || 'Manual'
        };

        const newHistory = [...(p.payment_history || []), newHistoryItem];
        
        await supabase.from('rqs_qurban_participants').update({ 
            payment_history: newHistory
            // paid_amount is NOT updated here. Admin must verify.
        }).eq('id', p.id);

        setIsLoading(false);

        const msg = `Halo Admin RQS, saya telah melakukan pembayaran lanjutan untuk qurban.%0A%0A*Nama*: ${p.participant_name}%0A*Layanan*: ${p.service_type}%0A*Nominal Tambahan*: ${formatRupiah(amount)}%0A*Bukti Transfer*: ${proofUrl}%0A%0AMohon bantu verifikasi.`;
        window.open(`https://wa.me/${getGlobalWhatsApp()}?text=${msg}`, '_blank');
        
        setInstallmentModal(null);
        setInstallmentAmount('');
        setSelectedRekening(null);
        setProofImage(null);
        setProofPreview(null);
        loadData();
    };

    const renderHeader = (title) => (
        <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
            <button onClick={() => setView('main')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                <PhosphorIcon icon="arrow-left" size={24} />
            </button>
            <div className="flex-1 text-center pr-10">
                <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">{title}</h2>
            </div>
        </div>
    );

    if (view === 'tabungan') {
        const tabs = participants.filter(p => p.service_type === 'tabungan' && p.paid_amount > 0);
        return (
            <div className="pb-32 animate-in slide-in-from-right-4 duration-300 bg-[#FAFAFA] min-h-screen">
                {renderHeader('Daftar Tabungan Qurban')}
                <div className="p-4 space-y-4">
                    {tabs.map(t => {
                        const animal = animals.find(a => a.id === t.animal_id);
                        const progress = Math.min((t.paid_amount / t.target_amount) * 100, 100);
                        return (
                            <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-800">{t.participant_name}</h4>
                                <p className="text-[10px] text-gray-500 mb-2">Hewan: {animal?.name}</p>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
                                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-3">
                                    <span>Terkumpul: {formatRupiah(t.paid_amount)}</span>
                                    <span>Target: {formatRupiah(t.target_amount)}</span>
                                </div>
                                <button onClick={() => setInstallmentModal(t)} className="w-full py-2 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold">
                                    Tambah Tabungan
                                </button>
                            </div>
                        );
                    })}
                    {tabs.length === 0 && <p className="text-center text-xs text-gray-400 py-10">Belum ada peserta tabungan.</p>}
                </div>
            </div>
        );
    }

    if (view === 'beli') {
        const lists = participants.filter(p => p.service_type === 'beli' && p.paid_amount > 0);
        return (
            <div className="pb-32 animate-in slide-in-from-right-4 duration-300 bg-[#FAFAFA] min-h-screen">
                {renderHeader('Daftar Beli Langsung')}
                <div className="p-4 space-y-3">
                    {lists.map(t => {
                        const animal = animals.find(a => a.id === t.animal_id);
                        return (
                            <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-gray-800">{t.participant_name}</h4>
                                    <p className="text-[10px] text-gray-500">Hewan: {animal?.name}</p>
                                    <p className="text-[10px] text-amber-600 font-bold">Kirim: {t.delivery_date}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-emerald-600">{formatRupiah(t.paid_amount)}</span>
                                </div>
                            </div>
                        );
                    })}
                    {lists.length === 0 && <p className="text-center text-xs text-gray-400 py-10">Belum ada pembeli langsung.</p>}
                </div>
            </div>
        );
    }

    if (view === 'penyaluran') {
        const lists = participants.filter(p => p.service_type === 'penyaluran' && p.paid_amount > 0);
        return (
            <div className="pb-32 animate-in slide-in-from-right-4 duration-300 bg-[#FAFAFA] min-h-screen">
                {renderHeader('Daftar Penyaluran Qurban')}
                <div className="p-4 space-y-3">
                    {lists.map(t => {
                        const animal = animals.find(a => a.id === t.animal_id);
                        return (
                            <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-800">{t.participant_name}</h4>
                                <p className="text-[10px] text-gray-500 mb-1">Hewan: {animal?.name}</p>
                                <div className="flex items-start gap-1 bg-purple-50 text-purple-700 p-2 rounded-lg">
                                    <PhosphorIcon icon="map-pin" weight="fill" className="mt-0.5" />
                                    <span className="text-xs font-medium leading-tight">{t.location}</span>
                                </div>
                            </div>
                        );
                    })}
                    {lists.length === 0 && <p className="text-center text-xs text-gray-400 py-10">Belum ada data penyaluran.</p>}
                </div>
            </div>
        );
    }

    if (view === 'patungan') {
        const lists = participants.filter(p => p.service_type === 'patungan' && p.paid_amount > 0);
        const grouped = {};
        lists.forEach(p => {
            if (!grouped[p.group_name]) grouped[p.group_name] = [];
            grouped[p.group_name].push(p);
        });

        return (
            <div className="pb-32 animate-in slide-in-from-right-4 duration-300 bg-[#FAFAFA] min-h-screen">
                {renderHeader('Patungan Sapi (1/7)')}
                <div className="p-4 space-y-5">
                    {Object.keys(grouped).map(gname => {
                        const members = grouped[gname];
                        return (
                            <div key={gname} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-rose-50 p-3 border-b border-rose-100 flex justify-between items-center">
                                    <h4 className="font-bold text-rose-800 text-sm">{gname}</h4>
                                    <span className="text-xs font-bold text-rose-600">{members.length}/7 Penuh</span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {members.map((m, idx) => {
                                        const progress = Math.min((m.paid_amount / m.target_amount) * 100, 100);
                                        return (
                                            <div key={m.id} className="p-3 flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-gray-800">{m.participant_name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                            <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-gray-500">{formatRupiah(m.paid_amount)}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => setInstallmentModal(m)} className="p-2 text-rose-600 bg-rose-50 rounded-lg">
                                                    <PhosphorIcon icon="wallet" weight="fill" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {members.length < 7 && (
                                        <div className="p-3 bg-gray-50 text-center">
                                            <span className="text-[10px] text-gray-400 font-medium">Tersisa {7 - members.length} slot kosong</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {Object.keys(grouped).length === 0 && <p className="text-center text-xs text-gray-400 py-10">Belum ada kelompok patungan sapi.</p>}
                </div>
            </div>
        );
    }

    // MAIN VIEW
    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative">
            
            {/* Installment Modal */}
            {installmentModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-5 relative animate-in slide-in-from-bottom-10">
                        <button onClick={() => {setInstallmentModal(null); setJoinStep('select_payment');}} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full">
                            <PhosphorIcon icon="x" />
                        </button>
                        <h3 className="font-bold text-[#4A1C14] text-lg mb-1">Tambah Pembayaran</h3>
                        <p className="text-xs text-gray-500 mb-4">Untuk peserta: <strong>{installmentModal.participant_name}</strong></p>

                        {joinStep === 'select_payment' || joinStep === 'select_service' || joinStep === 'fill_form' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-700">Nominal Tambahan (Rp)</label>
                                    <input type="number" value={installmentAmount} onChange={e => setInstallmentAmount(e.target.value)} className="w-full border p-3 rounded-xl mt-1 text-sm bg-gray-50" placeholder="Cth: 100000" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-2 block">Pilih Rekening Pembayaran</label>
                                    <div className="space-y-2">
                                        {rekening.map(rek => (
                                            <div key={rek.id} onClick={() => setSelectedRekening(rek)} className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer transition ${selectedRekening?.id === rek.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex justify-center items-center"><PhosphorIcon icon="bank" weight="fill"/></div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-xs">{rek.bank_name}</h4>
                                                    <p className="text-[10px] text-gray-500">{rek.account_number} a.n {rek.account_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if(!installmentAmount) return alert("Isi nominal!");
                                        if(!selectedRekening) return alert("Pilih rekening!");
                                        setJoinStep('upload_proof');
                                    }} 
                                    className="w-full bg-amber-600 text-white font-bold p-3 rounded-xl hover:bg-amber-700"
                                >
                                    Lanjut Upload Bukti
                                </button>
                            </div>
                        ) : joinStep === 'upload_proof' ? (
                            <div className="space-y-4">
                                <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-200">
                                    <p className="text-[10px] text-gray-500">Total Transfer</p>
                                    <p className="font-bold text-amber-700 text-lg">{formatRupiah(installmentAmount)}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">ke {selectedRekening?.bank_name} ({selectedRekening?.account_number})</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">Upload Bukti Transfer</label>
                                    <div onClick={() => proofInputRef.current?.click()} className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                                        {proofPreview ? <img src={proofPreview} className="w-full h-full object-cover"/> : (
                                            <div className="text-gray-400 flex flex-col items-center">
                                                <PhosphorIcon icon="upload-simple" size={24}/>
                                                <span className="text-[10px] mt-1">Tap untuk upload gambar</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" ref={proofInputRef} onChange={handleProofChange} className="hidden" />
                                </div>
                                <button disabled={isLoading} onClick={handleFinishInstallment} className="w-full bg-green-600 text-white font-bold p-3 rounded-xl hover:bg-green-700 transition">
                                    {isLoading ? 'Mengupload...' : 'Selesai & Konfirmasi via WA'}
                                </button>
                                <button onClick={() => setJoinStep('select_payment')} className="w-full bg-gray-100 text-gray-600 font-bold p-3 rounded-xl text-sm">Kembali</button>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Join Qurban Modal */}
            {joinModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-5 relative max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10">
                        <button onClick={closeJoinModal} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full z-10">
                            <PhosphorIcon icon="x" />
                        </button>
                        
                        <h3 className="font-bold text-[#4A1C14] text-lg mb-1">
                            {joinStep === 'select_service' ? 'Pilih Layanan' : 
                             joinStep === 'fill_form' ? 'Isi Data Diri' : 
                             joinStep === 'select_payment' ? 'Pilih Pembayaran' : 'Bukti Transfer'}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">Untuk Qurban: <strong>{joinModal.name}</strong></p>

                        {joinStep === 'select_service' && (
                            <div className="space-y-3 mt-4">
                                <div onClick={() => {setServiceType('tabungan'); setJoinStep('fill_form');}} className="p-3 border border-gray-200 rounded-xl flex items-center gap-3 cursor-pointer hover:border-amber-500 hover:bg-amber-50">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex justify-center items-center"><PhosphorIcon icon="piggy-bank" size={24} weight="fill"/></div>
                                    <div><h4 className="font-bold text-sm">Tabungan Qurban</h4><p className="text-[10px] text-gray-500">Bayar bertahap semampunya</p></div>
                                </div>
                                <div onClick={() => {setServiceType('beli'); setJoinStep('fill_form');}} className="p-3 border border-gray-200 rounded-xl flex items-center gap-3 cursor-pointer hover:border-amber-500 hover:bg-amber-50">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex justify-center items-center"><PhosphorIcon icon="shopping-cart" size={24} weight="fill"/></div>
                                    <div><h4 className="font-bold text-sm">Beli Kontan</h4><p className="text-[10px] text-gray-500">Bayar lunas, atur jadwal kirim</p></div>
                                </div>
                                <div onClick={() => {setServiceType('penyaluran'); setJoinStep('fill_form');}} className="p-3 border border-gray-200 rounded-xl flex items-center gap-3 cursor-pointer hover:border-amber-500 hover:bg-amber-50">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex justify-center items-center"><PhosphorIcon icon="map-pin-line" size={24} weight="fill"/></div>
                                    <div><h4 className="font-bold text-sm">Beli & Salurkan</h4><p className="text-[10px] text-gray-500">RQS bantu distribusikan ke lokasi Anda</p></div>
                                </div>
                                <div 
                                    onClick={() => joinModal.type === 'sapi' ? (setServiceType('patungan'), setJoinStep('fill_form')) : alert('Patungan 1/7 hanya berlaku untuk hewan Sapi.')} 
                                    className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer ${joinModal.type === 'sapi' ? 'border-gray-200 hover:border-amber-500 hover:bg-amber-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex justify-center items-center"><PhosphorIcon icon="hand-heart" size={24} weight="fill"/></div>
                                    <div><h4 className="font-bold text-sm">Patungan Sapi 1/7</h4><p className="text-[10px] text-gray-500">Gabung grup 7 orang, iuran lebih ringan</p></div>
                                </div>
                            </div>
                        )}

                        {joinStep === 'fill_form' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-700">Nama Pendaftar</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1 text-sm bg-gray-50" placeholder="Nama lengkap..."/>
                                </div>
                                {serviceType === 'beli' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-700">Rencana Tanggal Pengiriman</label>
                                        <input type="date" name="delivery_date" value={form.delivery_date} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1 text-sm bg-gray-50"/>
                                    </div>
                                )}
                                {serviceType === 'penyaluran' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-700">Lokasi Penyaluran</label>
                                        <textarea name="location" value={form.location} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1 text-sm bg-gray-50" rows="2" placeholder="Cth: Panti Asuhan Amanah"></textarea>
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-bold text-gray-700">Nominal Bayar Awal (Rp)</label>
                                    <input type="number" name="initial_payment" value={form.initial_payment} onChange={handleChange} className="w-full border p-3 rounded-xl mt-1 text-sm bg-gray-50" placeholder="Contoh: 500000"/>
                                </div>
                                <button onClick={() => {
                                    if(!form.name || !form.initial_payment) return alert("Harap lengkapi form!");
                                    setJoinStep('select_payment');
                                }} className="w-full bg-amber-600 text-white font-bold p-3 rounded-xl hover:bg-amber-700">
                                    Lanjut Pilih Pembayaran
                                </button>
                                <button onClick={() => setJoinStep('select_service')} className="w-full bg-gray-100 text-gray-600 font-bold p-3 rounded-xl text-sm">Kembali</button>
                            </div>
                        )}

                        {joinStep === 'select_payment' && (
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-700 mb-2 block">Pilih Rekening Transfer</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {rekening.map(rek => (
                                        <div key={rek.id} onClick={() => setSelectedRekening(rek)} className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer transition ${selectedRekening?.id === rek.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex justify-center items-center"><PhosphorIcon icon="bank" weight="fill"/></div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-xs">{rek.bank_name}</h4>
                                                <p className="text-[10px] text-gray-500">{rek.account_number} a.n {rek.account_name}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {rekening.length === 0 && <p className="text-xs text-gray-500 italic">Belum ada rekening tersedia.</p>}
                                </div>
                                <button onClick={() => {
                                    if(!selectedRekening) return alert("Pilih rekening pembayaran!");
                                    setJoinStep('upload_proof');
                                }} className="w-full bg-amber-600 text-white font-bold p-3 rounded-xl hover:bg-amber-700">
                                    Lanjut Upload Bukti
                                </button>
                                <button onClick={() => setJoinStep('fill_form')} className="w-full bg-gray-100 text-gray-600 font-bold p-3 rounded-xl text-sm">Kembali</button>
                            </div>
                        )}

                        {joinStep === 'upload_proof' && (
                            <div className="space-y-4">
                                <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-200">
                                    <p className="text-[10px] text-gray-500">Total Transfer</p>
                                    <p className="font-bold text-amber-700 text-lg">{formatRupiah(form.initial_payment)}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">ke {selectedRekening?.bank_name} ({selectedRekening?.account_number})</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">Upload Bukti Transfer</label>
                                    <div onClick={() => proofInputRef.current?.click()} className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                                        {proofPreview ? <img src={proofPreview} className="w-full h-full object-cover"/> : (
                                            <div className="text-gray-400 flex flex-col items-center">
                                                <PhosphorIcon icon="upload-simple" size={24}/>
                                                <span className="text-[10px] mt-1">Tap untuk upload gambar</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" ref={proofInputRef} onChange={handleProofChange} className="hidden" />
                                </div>
                                <button disabled={isLoading} onClick={() => {
                                    if(!proofImage) return alert("Harap unggah bukti transfer!");
                                    handleFinishJoin();
                                }} className="w-full bg-green-600 text-white font-bold p-3 rounded-xl hover:bg-green-700 transition">
                                    {isLoading ? 'Memproses Data...' : 'Selesai & Konfirmasi via WA'}
                                </button>
                                <button onClick={() => setJoinStep('select_payment')} className="w-full bg-gray-100 text-gray-600 font-bold p-3 rounded-xl text-sm">Kembali</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Program Qurban</h2>
                    <p className="text-[10px] text-amber-600 font-bold">Transparan & Terbuka</p>
                </div>
            </div>

            {/* Banner */}
            <div className="mx-4 mt-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1">Qurban Transparan</h3>
                    <p className="text-xs text-white/90 mb-3 max-w-[80%]">Seluruh catatan pembayaran peserta qurban kami tampilkan secara terbuka untuk menjaga amanah.</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-white/20">
                    <PhosphorIcon icon="cow" weight="fill" size={100} />
                </div>
            </div>

            {/* Menu Layanan Qurban */}
            <div className="p-4 mt-2">
                <h3 className="font-bold text-[#4A1C14] mb-3 text-sm">Lihat Data Peserta</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div onClick={() => setView('tabungan')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 cursor-pointer hover:border-amber-200 transition-colors active:scale-95">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                            <PhosphorIcon icon="piggy-bank" size={24} weight="fill" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">Data Tabungan</h4>
                        <p className="text-[10px] text-gray-500 leading-tight">Lihat daftar penabung & nominal terkumpul</p>
                    </div>
                    
                    <div onClick={() => setView('beli')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 cursor-pointer hover:border-amber-200 transition-colors active:scale-95">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                            <PhosphorIcon icon="shopping-cart" size={24} weight="fill" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">Pembeli Kontan</h4>
                        <p className="text-[10px] text-gray-500 leading-tight">Daftar pemesan dan jadwal kirim</p>
                    </div>

                    <div onClick={() => setView('penyaluran')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 cursor-pointer hover:border-amber-200 transition-colors active:scale-95">
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                            <PhosphorIcon icon="map-pin-line" size={24} weight="fill" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">Data Penyaluran</h4>
                        <p className="text-[10px] text-gray-500 leading-tight">Daftar lokasi penyaluran donatur</p>
                    </div>

                    <div onClick={() => setView('patungan')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 cursor-pointer hover:border-amber-200 transition-colors active:scale-95">
                        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
                            <PhosphorIcon icon="hand-heart" size={24} weight="fill" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">Grup Patungan</h4>
                        <p className="text-[10px] text-gray-500 leading-tight">Lihat slot sapi 1/7 dan iuran peserta</p>
                    </div>
                </div>
            </div>

            {/* List Harga Hewan Qurban */}
            <div className="px-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#4A1C14] text-sm">Daftar Hewan & Mulai Qurban</h3>
                </div>
                
                <div className="flex flex-col gap-3">
                    {animals.map((item) => (
                        <div key={item.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 overflow-hidden relative border border-amber-100">
                                {item.image ? (
                                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                ) : (
                                    <PhosphorIcon icon={item.type === 'sapi' ? 'cow' : 'piggy-bank'} size={32} className="text-amber-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                                <p className="text-[10px] text-gray-500">{item.desc}</p>
                                <p className="text-sm font-bold text-emerald-600 mt-1">{formatRupiah(item.price)}</p>
                            </div>
                            <button onClick={() => setJoinModal(item)} className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 active:scale-90 transition-transform">
                                <PhosphorIcon icon="plus" weight="bold" />
                            </button>
                        </div>
                    ))}

                    {animals.length === 0 && (
                        <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-2xl">
                            <PhosphorIcon icon="cow" size={32} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-400">Belum ada katalog hewan qurban</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Qurban;
