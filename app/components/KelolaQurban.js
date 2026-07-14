import React, { useState, useEffect, useRef } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const KelolaQurban = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('katalog'); // katalog, verifikasi, data
    const [dataCategory, setDataCategory] = useState('tabungan'); // tabungan, beli, penyaluran, patungan
    const [qurbanList, setQurbanList] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({ name: '', desc: '', price: '', type: 'domba' });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const [verifyModal, setVerifyModal] = useState(null); // { participant, historyIndex }
    const [verifyAmount, setVerifyAmount] = useState('');

    const loadData = async () => {
        setIsLoading(true);
        const [resAnimals, resParts] = await Promise.all([
            supabase.from('rqs_qurban').select('*').order('created_at', { ascending: false }),
            supabase.from('rqs_qurban_participants').select('*').order('created_at', { ascending: false })
        ]);
        if (resAnimals.data) setQurbanList(resAnimals.data);
        if (resParts.data) setParticipants(resParts.data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // -------- KATALOG LOGIC --------
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        let imageUrl = preview;
        if (image instanceof File) {
            const fileExt = image.name.split('.').pop();
            const fileName = `qurban-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('ecommerce').upload(fileName, image);
            if (!uploadError) {
                const { data } = supabase.storage.from('ecommerce').getPublicUrl(fileName);
                imageUrl = data.publicUrl;
            }
        }

        const dataToSave = { ...form, price: Number(form.price), image: imageUrl };
        if (editingId) {
            await supabase.from('rqs_qurban').update(dataToSave).eq('id', editingId);
        } else {
            await supabase.from('rqs_qurban').insert([dataToSave]);
        }
        
        setIsFormOpen(false);
        setEditingId(null);
        loadData();
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({ name: item.name, desc: item.desc, price: item.price.toString(), type: item.type });
        setImage(null);
        setPreview(item.image || null);
        setIsFormOpen(true);
    };

    const handleDelete = async (id, oldImageUrl) => {
        if (window.confirm('Hapus program hewan qurban ini?')) {
            setIsLoading(true);
            await supabase.from('rqs_qurban').delete().eq('id', id);
            if (oldImageUrl && oldImageUrl.includes('supabase.co')) {
                const fileName = oldImageUrl.split('/').pop();
                await supabase.storage.from('ecommerce').remove([fileName]);
            }
            loadData();
        }
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm({ name: '', desc: '', price: '', type: 'domba' });
        setImage(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsFormOpen(true);
    };

    // -------- VERIFIKASI LOGIC --------
    const getPendingVerifications = () => {
        let pending = [];
        participants.forEach(p => {
            if (p.payment_history && Array.isArray(p.payment_history)) {
                p.payment_history.forEach((hist, index) => {
                    if (hist.status === 'Menunggu Verifikasi') {
                        pending.push({ participant: p, history: hist, index });
                    }
                });
            }
        });
        return pending.sort((a, b) => new Date(b.history.date) - new Date(a.history.date));
    };

    const openVerifyModal = (item) => {
        setVerifyModal(item);
        setVerifyAmount(item.history.amount.toString());
    };

    const handleConfirmVerification = async () => {
        setIsLoading(true);
        const p = verifyModal.participant;
        const verifiedAmt = Number(verifyAmount);
        
        const newHistory = [...p.payment_history];
        newHistory[verifyModal.index].status = 'Terverifikasi';
        newHistory[verifyModal.index].amount = verifiedAmt;

        const newPaidAmount = p.paid_amount + verifiedAmt;

        const { error } = await supabase.from('rqs_qurban_participants').update({
            payment_history: newHistory,
            paid_amount: newPaidAmount
        }).eq('id', p.id);

        setIsLoading(false);
        if (error) {
            alert('Gagal konfirmasi: ' + error.message);
            return;
        }

        setVerifyModal(null);
        loadData();
    };

    const handleRejectVerification = async () => {
        if (!window.confirm('Tolak dan hapus data pembayaran ini?')) return;
        setIsLoading(true);
        const p = verifyModal.participant;
        
        const newHistory = [...p.payment_history];
        newHistory[verifyModal.index].status = 'Ditolak';

        await supabase.from('rqs_qurban_participants').update({
            payment_history: newHistory
        }).eq('id', p.id);

        setIsLoading(false);
        setVerifyModal(null);
        loadData();
    };

    const handleDeleteParticipant = async (id) => {
        if (!window.confirm('Hapus data peserta ini secara permanen? Semua riwayat pembayaran akan hilang.')) return;
        setIsLoading(true);
        await supabase.from('rqs_qurban_participants').delete().eq('id', id);
        loadData();
    };


    // -------- RENDER --------
    if (isFormOpen) {
        return (
            <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative">
                <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                    <button onClick={() => setIsFormOpen(false)} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                        <PhosphorIcon icon="arrow-left" size={24} />
                    </button>
                    <h2 className="text-lg font-bold text-[#4A1C14]">
                        {editingId ? "Edit Qurban" : "Tambah Qurban"}
                    </h2>
                </div>

                <form onSubmit={handleSave} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Foto Hewan (Opsional)</label>
                        <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 bg-amber-50 border-2 border-dashed border-amber-200 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative">
                            {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : (
                                <div className="text-amber-500 flex flex-col items-center">
                                    <PhosphorIcon icon="image" size={32} />
                                    <span className="text-[10px] font-bold mt-1">Upload Gambar</span>
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Jenis Hewan</label>
                        <select required name="type" value={form.type} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white">
                            <option value="domba">Domba</option>
                            <option value="kambing">Kambing</option>
                            <option value="sapi">Sapi</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Nama Program / Kelas</label>
                        <input required name="name" value={form.name} onChange={handleChange} type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm" placeholder="Contoh: Domba Standar" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Deskripsi Singkat</label>
                        <input required name="desc" value={form.desc} onChange={handleChange} type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm" placeholder="Contoh: Berat 20-24 Kg (Jantan)" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Harga (Rp)</label>
                        <input required name="price" value={form.price} onChange={handleChange} type="number" className="w-full border border-gray-200 rounded-xl p-3 text-sm" placeholder="Contoh: 2500000" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-amber-600 text-white font-bold rounded-xl p-3 mt-4 hover:bg-amber-700">
                        {isLoading ? "Menyimpan..." : "Simpan Data"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative">
            
            {/* Verify Modal */}
            {verifyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-5 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setVerifyModal(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500">
                            <PhosphorIcon icon="x" />
                        </button>
                        <h3 className="font-bold text-gray-800 text-lg mb-1">Verifikasi Pembayaran</h3>
                        <p className="text-xs text-gray-500 mb-4">Pastikan nominal transfer sesuai dengan bukti yang dilampirkan.</p>
                        
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded-xl text-blue-800 border border-blue-100 text-sm">
                                <p><strong>Nama:</strong> {verifyModal.participant.participant_name}</p>
                                <p><strong>Layanan:</strong> {verifyModal.participant.service_type}</p>
                                <p><strong>Tujuan:</strong> {verifyModal.history.bank_name}</p>
                                <p><strong>Tgl:</strong> {new Date(verifyModal.history.date).toLocaleString('id-ID')}</p>
                            </div>

                            {verifyModal.history.proof_url ? (
                                <div>
                                    <p className="text-xs font-bold text-gray-700 mb-2">Bukti Transfer:</p>
                                    <a href={verifyModal.history.proof_url} target="_blank" rel="noopener noreferrer">
                                        <img src={verifyModal.history.proof_url} alt="Bukti" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                                    </a>
                                </div>
                            ) : (
                                <p className="text-xs text-red-500 italic">Tidak ada lampiran bukti transfer.</p>
                            )}

                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-1 block">Revisi Nominal Terverifikasi (Rp)</label>
                                <input type="number" value={verifyAmount} onChange={e => setVerifyAmount(e.target.value)} className="w-full border border-gray-300 p-3 rounded-xl text-sm font-bold text-gray-800" />
                                <p className="text-[10px] text-gray-500 mt-1">Ubah jika nominal di bukti transfer berbeda dengan input pengguna.</p>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button disabled={isLoading} onClick={handleRejectVerification} className="flex-1 bg-red-100 text-red-600 font-bold p-3 rounded-xl hover:bg-red-200 transition">Tolak</button>
                                <button disabled={isLoading} onClick={handleConfirmVerification} className="flex-[2] bg-emerald-600 text-white font-bold p-3 rounded-xl hover:bg-emerald-700 transition">
                                    {isLoading ? 'Memproses...' : 'Konfirmasi Sah'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={onBack} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Qurban</h2>
                    <p className="text-[10px] text-amber-600">Manajemen Hewan & Verifikasi</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white border-b border-gray-100 overflow-x-auto hide-scrollbar">
                <button onClick={() => setActiveTab('katalog')} className={`px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'katalog' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400'}`}>
                    Katalog Hewan
                </button>
                <button onClick={() => setActiveTab('verifikasi')} className={`px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors relative ${activeTab === 'verifikasi' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400'}`}>
                    Verifikasi Pembayaran
                    {getPendingVerifications().length > 0 && (
                        <span className="absolute top-2 right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full">
                            {getPendingVerifications().length}
                        </span>
                    )}
                </button>
                <button onClick={() => setActiveTab('data')} className={`px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'data' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400'}`}>
                    Data Qurban
                </button>
            </div>

            <div className="p-4">
                {isLoading && <div className="text-center py-4"><PhosphorIcon icon="circle-notch" className="animate-spin text-amber-500 mx-auto" size={24}/></div>}
                
                {activeTab === 'katalog' && (
                    <div className="space-y-4">
                        <button onClick={openAddForm} className="w-full bg-amber-50 text-amber-600 font-bold p-3 rounded-xl flex items-center justify-center gap-2 border border-amber-100">
                            <PhosphorIcon icon="plus" size={20} weight="bold" /> Tambah Hewan Qurban
                        </button>
                        {qurbanList.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-3 relative group items-center">
                                <div className="w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 overflow-hidden">
                                    {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <PhosphorIcon icon="cow" size={32} className="text-amber-500" />}
                                </div>
                                <div className="flex-1 pr-16">
                                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                                    <p className="text-[10px] text-gray-500">{item.desc}</p>
                                    <p className="text-xs text-emerald-600 font-bold mt-1">{formatRupiah(item.price)}</p>
                                </div>
                                <div className="absolute top-1/2 -translate-y-1/2 right-3 flex flex-col gap-2">
                                    <button onClick={() => handleEdit(item)} className="w-7 h-7 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center"><PhosphorIcon icon="pencil-simple" size={14}/></button>
                                    <button onClick={() => handleDelete(item.id, item.image)} className="w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center"><PhosphorIcon icon="trash" size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'verifikasi' && (
                    <div className="space-y-3">
                        {getPendingVerifications().map((v, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{v.participant.participant_name}</h4>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">{v.participant.service_type}</p>
                                    </div>
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Menunggu Verifikasi</span>
                                </div>
                                <div className="flex justify-between items-end mt-3 border-t border-gray-100 pt-3">
                                    <div>
                                        <p className="text-[10px] text-gray-500">Nominal Transfer</p>
                                        <p className="text-sm font-bold text-emerald-600">{formatRupiah(v.history.amount)}</p>
                                    </div>
                                    <button onClick={() => openVerifyModal(v)} className="bg-emerald-50 text-emerald-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-100 transition">
                                        Cek & Konfirmasi
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!isLoading && getPendingVerifications().length === 0 && (
                            <div className="text-center py-10">
                                <PhosphorIcon icon="check-circle" size={48} className="text-emerald-300 mx-auto mb-2" weight="fill" />
                                <p className="text-gray-400 text-sm">Semua pembayaran sudah diverifikasi.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setDataCategory('tabungan')} className={`p-2 rounded-xl text-xs font-bold transition-colors ${dataCategory === 'tabungan' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Tabungan</button>
                            <button onClick={() => setDataCategory('beli')} className={`p-2 rounded-xl text-xs font-bold transition-colors ${dataCategory === 'beli' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Beli Kontan</button>
                            <button onClick={() => setDataCategory('penyaluran')} className={`p-2 rounded-xl text-xs font-bold transition-colors ${dataCategory === 'penyaluran' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Penyaluran</button>
                            <button onClick={() => setDataCategory('patungan')} className={`p-2 rounded-xl text-xs font-bold transition-colors ${dataCategory === 'patungan' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Patungan</button>
                        </div>

                        <div className="space-y-3 mt-4">
                            {participants.filter(p => p.service_type === dataCategory).map((p, i) => {
                                const animal = qurbanList.find(a => a.id === p.animal_id);
                                return (
                                    <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative">
                                        <div className="pr-10">
                                            <h4 className="font-bold text-gray-800 text-sm">{p.participant_name}</h4>
                                            <p className="text-[10px] text-gray-500 mb-1">Hewan: {animal?.name || 'Tidak diketahui'}</p>
                                            
                                            {dataCategory === 'patungan' && <p className="text-[10px] text-rose-600 font-bold mb-1">Grup: {p.group_name}</p>}
                                            {dataCategory === 'penyaluran' && <p className="text-[10px] text-purple-600 font-bold mb-1">Lokasi: {p.location}</p>}
                                            {dataCategory === 'beli' && <p className="text-[10px] text-emerald-600 font-bold mb-1">Tgl Kirim: {p.delivery_date}</p>}

                                            <div className="mt-2 bg-gray-50 p-2 rounded-lg inline-block">
                                                <p className="text-[10px] text-gray-500">Terkumpul / Target:</p>
                                                <p className="text-xs font-bold text-emerald-600">
                                                    {formatRupiah(p.paid_amount)} <span className="text-gray-400 font-normal">/ {formatRupiah(p.target_amount)}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteParticipant(p.id)} className="absolute top-4 right-4 w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition">
                                            <PhosphorIcon icon="trash" size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                            {!isLoading && participants.filter(p => p.service_type === dataCategory).length === 0 && (
                                <div className="text-center py-10">
                                    <PhosphorIcon icon="users-slash" size={48} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">Belum ada data peserta.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KelolaQurban;
