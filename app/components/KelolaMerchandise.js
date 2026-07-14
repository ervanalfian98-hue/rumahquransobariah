import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const KelolaMerchandise = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('katalog'); // katalog, verifikasi, proses
    const [productList, setProductList] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [image, setImage] = useState(''); 
    const [imagePreview, setImagePreview] = useState('');
    const [variants, setVariants] = useState([{ id: Date.now(), name: '', price: '' }]);

    // Verify Modal
    const [verifyModal, setVerifyModal] = useState(null); 

    const loadData = async () => {
        setIsLoading(true);
        const { data: prodData } = await supabase.from('rqs_merchandise').select('*').order('created_at', { ascending: false });
        if (prodData) setProductList(prodData);

        const { data: ordData } = await supabase.from('rqs_orders').select('*').eq('module', 'merchandise').order('created_at', { ascending: false });
        if (ordData) setOrders(ordData);
        setIsLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAddVariant = () => setVariants([...variants, { id: Date.now(), name: '', price: '' }]);
    const handleRemoveVariant = (id) => { if (variants.length > 1) setVariants(variants.filter(v => v.id !== id)); };
    const handleVariantChange = (id, field, value) => setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));

    const handleSave = async () => {
        if (!name.trim() || !desc.trim() || (!image && !imagePreview)) return alert("Semua kolom wajib diisi.");
        const validVariants = variants.filter(v => v.name.trim() && v.price);
        if (validVariants.length === 0) return alert("Minimal harus ada 1 varian dengan nama dan harga.");
        
        setIsLoading(true);
        let finalImageUrl = typeof image === 'string' ? image : '';

        if (typeof image !== 'string' && image instanceof File) {
            const fileExt = image.name.split('.').pop();
            const fileName = `merchandise-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('ecommerce').upload(fileName, image, { upsert: false });
            if (!uploadError) {
                const { data } = supabase.storage.from('ecommerce').getPublicUrl(fileName);
                finalImageUrl = data.publicUrl;
            }
        }

        const productData = { name, desc, image: finalImageUrl, seller: 'RQS Merchandise', variants: validVariants.map(v => ({ ...v, price: parseInt(v.price) })) };
        if (editingId) await supabase.from('rqs_merchandise').update(productData).eq('id', editingId);
        else await supabase.from('rqs_merchandise').insert([productData]);

        setIsLoading(false); setIsModalOpen(false); resetForm(); loadData();
    };

    const handleDelete = async (id, imageUrl) => {
        if (window.confirm("Yakin hapus produk ini?")) {
            setIsLoading(true);
            await supabase.from('rqs_merchandise').delete().eq('id', id);
            if (imageUrl && imageUrl.includes('supabase.co')) {
                const fileName = imageUrl.split('/').pop();
                await supabase.storage.from('ecommerce').remove([fileName]);
            }
            loadData();
        }
    };

    const openEdit = (item) => {
        setEditingId(item.id); setName(item.name); setDesc(item.desc); setImage(item.image); setImagePreview(item.image);
        setVariants(item.variants?.length ? item.variants : [{ id: Date.now(), name: 'Default', price: 0 }]); setIsModalOpen(true);
    };

    const openAdd = () => { resetForm(); setIsModalOpen(true); };
    const resetForm = () => { setEditingId(null); setName(''); setDesc(''); setImage(''); setImagePreview(''); setVariants([{ id: Date.now(), name: '', price: '' }]); };

    const pendingOrders = orders.filter(o => o.status === 'Menunggu Verifikasi');
    const processedOrders = orders.filter(o => o.status !== 'Menunggu Verifikasi' && o.status !== 'Ditolak');

    const handleConfirmVerification = async () => {
        setIsLoading(true);
        await supabase.from('rqs_orders').update({ status: 'Terverifikasi' }).eq('id', verifyModal.id);
        setIsLoading(false); setVerifyModal(null); loadData();
    };

    const handleRejectVerification = async () => {
        if (!window.confirm("Tolak pesanan ini?")) return;
        setIsLoading(true);
        await supabase.from('rqs_orders').update({ status: 'Ditolak' }).eq('id', verifyModal.id);
        setIsLoading(false); setVerifyModal(null); loadData();
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm("Hapus permanen pesanan ini?")) return;
        setIsLoading(true);
        await supabase.from('rqs_orders').delete().eq('id', id);
        loadData();
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setIsLoading(true);
        await supabase.from('rqs_orders').update({ status: newStatus }).eq('id', id);
        setIsLoading(false);
        loadData();
    };

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-screen relative">
            {isLoading && (
                <div className="fixed inset-0 bg-white/50 z-[100] flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                        <PhosphorIcon icon="circle-notch" className="animate-spin text-amber-600" size={24} />
                        <span className="font-bold text-gray-700 text-sm">Memproses...</span>
                    </div>
                </div>
            )}

            {verifyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-5 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setVerifyModal(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500"><PhosphorIcon icon="x" /></button>
                        <h3 className="font-bold text-gray-800 text-lg mb-1">Verifikasi Pesanan</h3>
                        <p className="text-xs text-gray-500 mb-4">Pastikan nominal transfer sesuai dengan bukti yang dilampirkan.</p>
                        
                        <div className="space-y-4">
                            <div className="bg-amber-50 p-3 rounded-xl text-amber-800 border border-amber-100 text-sm">
                                <p><strong>Nama:</strong> {verifyModal.customer_name}</p>
                                <p><strong>No. HP:</strong> {verifyModal.customer_phone}</p>
                                <p><strong>Alamat:</strong> {verifyModal.address}</p>
                                <p><strong>Tujuan:</strong> {verifyModal.selected_rekening?.bank_name}</p>
                                <p><strong>Tgl:</strong> {new Date(verifyModal.created_at).toLocaleString('id-ID')}</p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                                <p className="font-bold mb-1">Rincian Belanja:</p>
                                {verifyModal.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between border-b border-gray-200 py-1 last:border-0">
                                        <span>{item.name} ({item.variantName}) x{item.qty}</span>
                                        <span className="font-bold">{formatRupiah(item.price * item.qty)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between mt-2 pt-2 border-t border-gray-300 font-bold text-amber-600 text-sm">
                                    <span>Total Bayar:</span>
                                    <span>{formatRupiah(verifyModal.total_amount)}</span>
                                </div>
                            </div>

                            {verifyModal.proof_url ? (
                                <div>
                                    <p className="text-xs font-bold text-gray-700 mb-2">Bukti Transfer:</p>
                                    <a href={verifyModal.proof_url} target="_blank" rel="noopener noreferrer">
                                        <img src={verifyModal.proof_url} alt="Bukti" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                                    </a>
                                </div>
                            ) : (
                                <p className="text-xs text-red-500 italic">Tidak ada lampiran bukti transfer.</p>
                            )}

                            {verifyModal.status === 'Menunggu Verifikasi' && (
                                <div className="flex gap-2 mt-4">
                                    <button disabled={isLoading} onClick={handleRejectVerification} className="flex-1 bg-red-100 text-red-600 font-bold p-3 rounded-xl hover:bg-red-200 transition">Tolak</button>
                                    <button disabled={isLoading} onClick={handleConfirmVerification} className="flex-[2] bg-amber-500 text-white font-bold p-3 rounded-xl hover:bg-amber-600 transition">Konfirmasi Pembayaran</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={onBack} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition"><PhosphorIcon icon="arrow-left" size={24}/></button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Merchandise</h2>
                </div>
            </div>

            <div className="flex bg-white border-b border-gray-100 overflow-x-auto hide-scrollbar">
                <button onClick={() => setActiveTab('katalog')} className={`px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'katalog' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400'}`}>Katalog Produk</button>
                <button onClick={() => setActiveTab('verifikasi')} className={`px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors relative ${activeTab === 'verifikasi' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400'}`}>
                    Pesanan & Verifikasi
                    {pendingOrders.length > 0 && <span className="absolute top-2 right-0 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full">{pendingOrders.length}</span>}
                </button>
                <button onClick={() => setActiveTab('proses')} className={`px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors relative ${activeTab === 'proses' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400'}`}>
                    Proses Pesanan
                    {processedOrders.length > 0 && <span className="absolute top-2 right-0 w-4 h-4 bg-amber-500 text-white text-[9px] flex items-center justify-center rounded-full">{processedOrders.length}</span>}
                </button>
            </div>

            <div className="p-4">
                {activeTab === 'katalog' && (
                    <div className="space-y-4">
                        <button onClick={openAdd} className="w-full bg-amber-50 text-amber-600 font-bold p-3 rounded-xl flex items-center justify-center gap-2 border border-amber-100">
                            <PhosphorIcon icon="plus" size={20} weight="bold" /> Tambah Merchandise
                        </button>
                        {productList.map((p) => (
                            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 flex gap-3 relative">
                                <div className="absolute top-4 right-4 flex gap-1.5">
                                    <button onClick={() => openEdit(p)} className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg"><PhosphorIcon icon="pencil-simple" size={14} weight="bold" /></button>
                                    <button onClick={() => handleDelete(p.id, p.image)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><PhosphorIcon icon="trash" size={14} weight="bold" /></button>
                                </div>
                                <div className="w-20 h-20 rounded-xl bg-amber-50 overflow-hidden shrink-0 border border-gray-100">
                                    {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-amber-500"><PhosphorIcon icon="image" size={32} /></div>}
                                </div>
                                <div className="flex-1 pr-14">
                                    <h4 className="font-bold text-gray-800 text-[13px] leading-tight mb-1">{p.name}</h4>
                                    {p.variants && p.variants.length > 0 && <p className="text-sm font-bold text-amber-600 mb-1">{p.variants.length > 1 ? `${formatRupiah(p.variants[0].price)} - ${formatRupiah(p.variants[p.variants.length-1].price)}` : formatRupiah(p.variants[0].price)}</p>}
                                    <p className="text-[10px] text-gray-500 line-clamp-2">{p.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'verifikasi' && (
                    <div className="space-y-3">
                        {pendingOrders.map(o => (
                            <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 relative">
                                <div className="flex justify-between items-start mb-2 pr-6">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{o.customer_name}</h4>
                                        <p className="text-[10px] text-gray-500">{o.items.length} Macam Barang</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-600">
                                        {o.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end mt-3 border-t border-gray-100 pt-3">
                                    <div>
                                        <p className="text-[10px] text-gray-500">Total Transaksi</p>
                                        <p className="text-sm font-bold text-amber-600">{formatRupiah(o.total_amount)}</p>
                                    </div>
                                    <button onClick={() => setVerifyModal(o)} className="bg-amber-50 text-amber-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-amber-100 transition">
                                        Lihat Detail
                                    </button>
                                </div>
                                <button onClick={() => handleDeleteOrder(o.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><PhosphorIcon icon="trash" size={16}/></button>
                            </div>
                        ))}
                        {pendingOrders.length === 0 && <p className="text-center text-sm text-gray-400 py-10">Belum ada pesanan baru.</p>}
                    </div>
                )}

                {activeTab === 'proses' && (
                    <div className="space-y-3">
                        {processedOrders.map(o => (
                            <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 relative">
                                <div className="flex justify-between items-start mb-2 pr-6">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{o.customer_name}</h4>
                                        <p className="text-[10px] text-gray-500">{o.items.length} Macam Barang</p>
                                    </div>
                                    <select 
                                        value={o.status} 
                                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                        className={`text-[10px] font-bold px-2 py-1 rounded-lg outline-none ${
                                            o.status === 'Terverifikasi' ? 'bg-green-50 text-green-600 border border-green-200' :
                                            o.status === 'Diproses' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                            o.status === 'Dikirim' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                                            'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        }`}
                                    >
                                        <option value="Terverifikasi">Terverifikasi</option>
                                        <option value="Diproses">Diproses (Packing)</option>
                                        <option value="Dikirim">Dikirim</option>
                                        <option value="Selesai">Selesai</option>
                                    </select>
                                </div>
                                <div className="flex justify-between items-end mt-3 border-t border-gray-100 pt-3">
                                    <div>
                                        <p className="text-[10px] text-gray-500">Alamat</p>
                                        <p className="text-xs font-bold text-gray-700 line-clamp-1">{o.address}</p>
                                    </div>
                                    <button onClick={() => setVerifyModal(o)} className="bg-gray-50 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition whitespace-nowrap ml-2 border border-gray-200">
                                        Detail
                                    </button>
                                </div>
                                <button onClick={() => handleDeleteOrder(o.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><PhosphorIcon icon="trash" size={16}/></button>
                            </div>
                        ))}
                        {processedOrders.length === 0 && <p className="text-center text-sm text-gray-400 py-10">Belum ada pesanan yang diproses.</p>}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[75vh] mb-12">
                            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><PhosphorIcon icon={editingId ? "pencil-simple" : "plus-circle"} size={18} className="text-amber-600" />{editingId ? 'Edit Produk' : 'Tambah Produk'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1.5"><PhosphorIcon icon="x" size={16} weight="bold" /></button>
                            </div>
                            <div className="p-5 overflow-y-auto bg-[#FDFBF7] flex-1">
                                <div className="space-y-4">
                                    <div><label className="text-[10px] font-bold text-gray-600 uppercase block mb-1.5">Nama Produk</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" /></div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1.5">Foto Gambar Produk</label>
                                        <div className="flex gap-2">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">{imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><PhosphorIcon icon="image" className="text-gray-400" size={20} /></div>}</div>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none" />
                                        </div>
                                    </div>
                                    <div><label className="text-[10px] font-bold text-gray-600 uppercase block mb-1.5">Deskripsi Singkat</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows="2" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none"></textarea></div>
                                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-[10px] font-bold text-amber-800 uppercase">Varian & Harga</label>
                                            <button onClick={handleAddVariant} className="text-[10px] bg-amber-500 text-white px-2 py-1 rounded-lg font-bold flex items-center gap-1"><PhosphorIcon icon="plus" /> Tambah</button>
                                        </div>
                                        <div className="space-y-2">
                                            {variants.map((v) => (
                                                <div key={v.id} className="flex gap-2 items-center">
                                                    <input type="text" value={v.name} onChange={(e) => handleVariantChange(v.id, 'name', e.target.value)} placeholder="Varian" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none" />
                                                    <input type="number" value={v.price} onChange={(e) => handleVariantChange(v.id, 'price', e.target.value)} placeholder="Harga" className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none" />
                                                    <button onClick={() => handleRemoveVariant(v.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><PhosphorIcon icon="trash" weight="bold" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-white border-t border-gray-100"><button onClick={handleSave} className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-amber-600 transition-colors">Simpan Produk</button></div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KelolaMerchandise;
