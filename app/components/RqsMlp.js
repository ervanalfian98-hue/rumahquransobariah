import React, { useState } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { getGlobalWhatsApp } from '../lib/sosmedConfig';

const RqsMlp = ({ setActiveTab }) => {
    const [activeMenu, setActiveMenu] = useState('tanya'); // tanya | mitra | undang | saran
    
    // Form States
    const [name, setName] = useState('');
    const [instansi, setInstansi] = useState('');
    const [topik, setTopik] = useState('');
    const [pesan, setPesan] = useState('');
    const [tanggal, setTanggal] = useState('');

    // Form Pengajuan Produk
    const [targetPlatform, setTargetPlatform] = useState('RQS Berdaya');
    const [namaPenjual, setNamaPenjual] = useState('');
    const [namaProduk, setNamaProduk] = useState('');
    const [descProduk, setDescProduk] = useState('');
    const [varianProduk, setVarianProduk] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [productImagePreview, setProductImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const imageInputRef = React.useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setProductImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSendWA = async () => {
        if (!name || !pesan) {
            alert('Mohon lengkapi Nama dan Pesan/Detail.');
            return;
        }

        let message = '';
        if (activeMenu === 'tanya') {
            message = `Halo Humas RQS (MLP), saya ${name}.%0A%0ASaya ingin bertanya seputar informasi program:%0A"${pesan}"`;
        } else if (activeMenu === 'mitra') {
            message = `Halo Humas RQS (MLP), saya ${name} dari ${instansi || 'Personal'}.%0A%0ASaya tertarik untuk menjalin kerja sama / kemitraan dalam bentuk:%0A"${pesan}"%0A%0AMohon arahannya.`;
        } else if (activeMenu === 'undang') {
            message = `Halo Humas RQS (MLP), saya ${name} dari ${instansi}.%0A%0AKami bermaksud mengundang Asatidz RQS untuk mengisi acara / kajian.%0ATanggal: ${tanggal}%0ATopik/Tema: ${topik}%0ADetail: ${pesan}%0A%0AMohon konfirmasi kesediaannya.`;
        } else if (activeMenu === 'saran') {
            message = `Halo Humas RQS (MLP), saya ${name}.%0A%0ASaya ingin menyampaikan kritik/saran membangun untuk RQS:%0A"${pesan}"%0A%0ATerima kasih.`;
        } else if (activeMenu === 'ajukan') {
            if (!namaPenjual || !namaProduk || !descProduk) {
                alert('Lengkapi Nama Penjual, Nama Produk, dan Deskripsi.');
                return;
            }
            setIsSubmitting(true);
            let imageUrl = '';
            if (productImage) {
                const { supabase } = require('../lib/supabaseClient');
                const fileExt = productImage.name.split('.').pop();
                const fileName = `pengajuan-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('ecommerce').upload(fileName, productImage);
                if (!uploadError) {
                    const { data } = supabase.storage.from('ecommerce').getPublicUrl(fileName);
                    imageUrl = data.publicUrl;
                }
            }
            setIsSubmitting(false);

            message = `Halo Admin Management RQS,%0A%0ASaya ingin mengajukan produk untuk dijual di platform *${targetPlatform}*.%0A%0A*Nama Penjual/Perusahaan*: ${namaPenjual}%0A*Nama Produk*: ${namaProduk}%0A*Deskripsi*: ${descProduk}%0A*Varian*: ${varianProduk || '-'}`;
            if (imageUrl) message += `%0A*Link Gambar Produk*: ${imageUrl}`;
            message += `%0A%0AMohon bantuannya untuk ditinjau dan di-posting. Terima kasih.`;
        }

        window.open(`https://wa.me/${getGlobalWhatsApp()}?text=${message}`, '_blank');
    };

    const resetForm = (menu) => {
        setActiveMenu(menu);
        setName('');
        setInstansi('');
        setTopik('');
        setPesan('');
        setTanggal('');
        setNamaPenjual('');
        setNamaProduk('');
        setDescProduk('');
        setVarianProduk('');
        setProductImage(null);
        setProductImagePreview(null);
    };

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">MLP RQS</h2>
                    <p className="text-[10px] text-emerald-600 font-bold">Media & Layanan Publik (Humas)</p>
                </div>
            </div>

            {/* Banner Edukasi */}
            <div className="mx-4 mt-4 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-2 leading-tight">Layanan Terpadu RQS</h3>
                    <p className="text-xs text-white/90 mb-3 max-w-[90%]">
                        Divisi Hubungan Masyarakat (Humas) RQS siap melayani pertanyaan program, pengajuan kemitraan, hingga undangan penceramah dengan ramah & profesional.
                    </p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-white/20 transform -rotate-12">
                    <PhosphorIcon icon="headset" weight="fill" size={120} />
                </div>
            </div>

            {/* Menu Navigasi Layanan */}
            <div className="px-4 mt-6">
                <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
                    <button 
                        onClick={() => resetForm('tanya')}
                        className={`min-w-[70px] flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all shrink-0 ${activeMenu === 'tanya' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        <PhosphorIcon icon="chat-circle-dots" weight={activeMenu === 'tanya' ? 'fill' : 'regular'} size={24} className="mb-1" />
                        <span className="text-[9px] font-bold text-center leading-tight">Tanya<br/>Info</span>
                    </button>
                    <button 
                        onClick={() => resetForm('undang')}
                        className={`min-w-[70px] flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all shrink-0 ${activeMenu === 'undang' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        <PhosphorIcon icon="microphone-stage" weight={activeMenu === 'undang' ? 'fill' : 'regular'} size={24} className="mb-1" />
                        <span className="text-[9px] font-bold text-center leading-tight">Undang<br/>Ustaz</span>
                    </button>
                    <button 
                        onClick={() => resetForm('mitra')}
                        className={`min-w-[70px] flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all shrink-0 ${activeMenu === 'mitra' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        <PhosphorIcon icon="handshake" weight={activeMenu === 'mitra' ? 'fill' : 'regular'} size={24} className="mb-1" />
                        <span className="text-[9px] font-bold text-center leading-tight">Kerja<br/>Sama</span>
                    </button>
                    <button 
                        onClick={() => resetForm('ajukan')}
                        className={`min-w-[70px] flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all shrink-0 ${activeMenu === 'ajukan' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        <PhosphorIcon icon="storefront" weight={activeMenu === 'ajukan' ? 'fill' : 'regular'} size={24} className="mb-1" />
                        <span className="text-[9px] font-bold text-center leading-tight">Ajukan<br/>Produk</span>
                    </button>
                    <button 
                        onClick={() => resetForm('saran')}
                        className={`min-w-[70px] flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all shrink-0 ${activeMenu === 'saran' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        <PhosphorIcon icon="envelope-open" weight={activeMenu === 'saran' ? 'fill' : 'regular'} size={24} className="mb-1" />
                        <span className="text-[9px] font-bold text-center leading-tight">Kritik &<br/>Saran</span>
                    </button>
                </div>
            </div>

            {/* Dynamic Form Area */}
            <div className="px-4 mt-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-in fade-in">
                    
                    <h3 className="font-bold text-[#4A1C14] text-sm mb-4 border-b border-gray-100 pb-2">
                        {activeMenu === 'tanya' && 'Form Pusat Bantuan & Info'}
                        {activeMenu === 'undang' && 'Form Pengajuan Penceramah'}
                        {activeMenu === 'mitra' && 'Form Kemitraan & Sponsorship'}
                        {activeMenu === 'ajukan' && 'Form Pengajuan Produk'}
                        {activeMenu === 'saran' && 'Kotak Kritik & Saran'}
                    </h3>

                    <div className="space-y-4">
                        {activeMenu !== 'ajukan' && (
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Masukkan nama Anda"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                                />
                            </div>
                        )}

                        {(activeMenu === 'mitra' || activeMenu === 'undang') && (
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">Nama Instansi / DKM Masjid</label>
                                <input 
                                    type="text" 
                                    value={instansi}
                                    onChange={(e) => setInstansi(e.target.value)}
                                    placeholder="Nama lembaga Anda"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                                />
                            </div>
                        )}

                        {activeMenu === 'undang' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Tanggal Acara</label>
                                    <input 
                                        type="date" 
                                        value={tanggal}
                                        onChange={(e) => setTanggal(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Tema / Topik</label>
                                    <input 
                                        type="text" 
                                        value={topik}
                                        onChange={(e) => setTopik(e.target.value)}
                                        placeholder="Contoh: Fiqih"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        {activeMenu !== 'ajukan' && (
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                    {activeMenu === 'tanya' && 'Apa yang ingin Anda tanyakan?'}
                                    {activeMenu === 'undang' && 'Detail Acara & Alamat Lengkap'}
                                    {activeMenu === 'mitra' && 'Bentuk Kerja Sama yang Ditawarkan'}
                                    {activeMenu === 'saran' && 'Tuliskan Kritik / Saran Anda'}
                                </label>
                                <textarea 
                                    value={pesan}
                                    onChange={(e) => setPesan(e.target.value)}
                                    rows="4"
                                    placeholder="Ketik pesan Anda di sini..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors resize-none"
                                ></textarea>
                            </div>
                        )}

                        {activeMenu === 'ajukan' && (
                            <>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Pilih Platform Penjualan</label>
                                    <select 
                                        value={targetPlatform}
                                        onChange={(e) => setTargetPlatform(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-bold text-gray-800 outline-none focus:border-emerald-400"
                                    >
                                        <option value="RQS Berdaya">RQS Berdaya</option>
                                        <option value="RQS Herbal">RQS Herbal</option>
                                        <option value="Merchandise">Merchandise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Nama Penjual / Perusahaan</label>
                                    <input type="text" value={namaPenjual} onChange={(e) => setNamaPenjual(e.target.value)} placeholder="Nama toko / perusahaan Anda" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 outline-none focus:border-emerald-400" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Nama Produk</label>
                                    <input type="text" value={namaProduk} onChange={(e) => setNamaProduk(e.target.value)} placeholder="Nama produk yang ditawarkan" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 outline-none focus:border-emerald-400" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Deskripsi Produk</label>
                                    <textarea value={descProduk} onChange={(e) => setDescProduk(e.target.value)} rows="3" placeholder="Jelaskan spesifikasi dan keunggulan produk..." className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 outline-none focus:border-emerald-400 resize-none"></textarea>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Varian Produk (Opsional)</label>
                                    <input type="text" value={varianProduk} onChange={(e) => setVarianProduk(e.target.value)} placeholder="Contoh: Merah, Kuning, M, L, XL" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 outline-none focus:border-emerald-400" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Foto / Gambar Produk</label>
                                    <div onClick={() => imageInputRef.current?.click()} className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-gray-100 transition">
                                        {productImagePreview ? (
                                            <img src={productImagePreview} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-gray-400 flex flex-col items-center">
                                                <PhosphorIcon icon="upload-simple" size={24} />
                                                <span className="text-[10px] mt-1">Tap untuk upload gambar</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                                </div>
                            </>
                        )}

                        <button 
                            disabled={isSubmitting}
                            onClick={handleSendWA}
                            className={`w-full mt-2 text-white rounded-xl py-3 font-bold text-sm shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2 ${isSubmitting ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                            {isSubmitting ? <PhosphorIcon icon="circle-notch" className="animate-spin" size={18} /> : <PhosphorIcon icon="paper-plane-right" weight="fill" size={18} />}
                            {isSubmitting ? 'Memproses...' : 'Kirim ke Humas via WA'}
                        </button>
                    </div>

                </div>
            </div>
            
            <div className="mt-8 text-center px-4">
                <p className="text-[10px] text-gray-400">Tim Humas RQS akan segera membalas pesan Anda pada jam kerja.</p>
            </div>
        </div>
    );
};

export default RqsMlp;
