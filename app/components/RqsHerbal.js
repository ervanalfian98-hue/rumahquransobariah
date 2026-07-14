import React, { useState, useEffect, useRef } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';
import { getGlobalWhatsApp } from '../lib/sosmedConfig';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const RqsHerbal = ({ setActiveTab }) => {
    const [cart, setCart] = useState({});
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedVariants, setSelectedVariants] = useState({});

    // Checkout states
    const [checkoutStep, setCheckoutStep] = useState('cart'); 
    const [form, setForm] = useState({ name: '', phone: '', address: '' });
    const [rekening, setRekening] = useState([]);
    const [selectedRekening, setSelectedRekening] = useState(null);
    const [proofImage, setProofImage] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const proofInputRef = useRef(null);

    // My Orders
    const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
    const [myOrders, setMyOrders] = useState([]);

    const loadMyOrders = async () => {
        const savedIds = JSON.parse(localStorage.getItem('my_orders') || '[]');
        if (savedIds.length === 0) return;
        const { data } = await supabase.from('rqs_orders').select('*').in('id', savedIds).eq('module', 'herbal').order('created_at', { ascending: false });
        if (data) setMyOrders(data);
    };

    const loadProducts = async () => {
        const { data, error } = await supabase.from('rqs_herbal').select('*').order('created_at', { ascending: false });
        if (!error && data) setProducts(data);
        const { data: rekData } = await supabase.from('rqs_rekening').select('*').order('created_at', { ascending: false });
        if (rekData) setRekening(rekData);
    };

    useEffect(() => { loadProducts(); loadMyOrders(); }, []);

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.seller.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleVariantChange = (productId, variantId) => setSelectedVariants(prev => ({ ...prev, [productId]: variantId }));

    const getSelectedVariant = (product) => {
        if (!product.variants || product.variants.length === 0) return null;
        const variantId = selectedVariants[product.id] || product.variants[0].id;
        return product.variants.find(v => String(v.id) === String(variantId)) || product.variants[0];
    };

    const addToCart = (productId, variantId) => {
        const cartKey = `${productId}_${variantId}`;
        setCart(prev => ({ ...prev, [cartKey]: (prev[cartKey] || 0) + 1 }));
    };

    const removeFromCart = (productId, variantId) => {
        const cartKey = `${productId}_${variantId}`;
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[cartKey] > 1) newCart[cartKey]--;
            else delete newCart[cartKey];
            if (Object.keys(newCart).length === 0) setIsCartOpen(false);
            return newCart;
        });
    };

    const getQtyInCart = (productId, variantId) => cart[`${productId}_${variantId}`] || 0;
    const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
    const cartTotal = Object.entries(cart).reduce((total, [cartKey, qty]) => {
        const [productId, variantId] = cartKey.split('_');
        const product = products.find(p => String(p.id) === String(productId));
        if (!product) return total;
        const variant = product.variants.find(v => String(v.id) === String(variantId));
        return variant ? total + (variant.price * qty) : total;
    }, 0);

    const handleProofChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProofImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setProofPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleFinishCheckout = async () => {
        setIsLoading(true);
        let proofUrl = null;
        if (proofImage) {
            const fileExt = proofImage.name.split('.').pop();
            const fileName = `bukti-herbal-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('ecommerce').upload(fileName, proofImage);
            if (!uploadError) {
                const { data } = supabase.storage.from('ecommerce').getPublicUrl(fileName);
                proofUrl = data.publicUrl;
            }
        }

        const orderItems = [];
        Object.entries(cart).forEach(([cartKey, qty]) => {
            const [productId, variantId] = cartKey.split('_');
            const product = products.find(p => String(p.id) === String(productId));
            if (product) {
                const variant = product.variants.find(v => String(v.id) === String(variantId));
                if (variant) orderItems.push({ productId, variantId, qty, price: variant.price, name: product.name, variantName: variant.name, seller: product.seller, image: product.image });
            }
        });

        const orderData = {
            module: 'herbal',
            customer_name: form.name,
            customer_phone: form.phone,
            address: form.address,
            items: orderItems,
            total_amount: cartTotal,
            selected_rekening: selectedRekening,
            proof_url: proofUrl,
            status: 'Menunggu Verifikasi'
        };

        const { data, error } = await supabase.from('rqs_orders').insert([orderData]).select();
        setIsLoading(false);

        if (error) {
            alert('Gagal membuat pesanan: ' + error.message);
            return;
        }

        if (data && data[0]) {
            const savedIds = JSON.parse(localStorage.getItem('my_orders') || '[]');
            localStorage.setItem('my_orders', JSON.stringify([...savedIds, data[0].id]));
            loadMyOrders();
        }

        let message = `Halo Admin RQS Herbal, saya telah melakukan pemesanan:%0A%0A`;
        message += `*Nama*: ${form.name}%0A`;
        message += `*No. HP*: ${form.phone}%0A`;
        message += `*Alamat Pengiriman*: ${form.address}%0A%0A`;
        message += `*Rincian Pesanan*:%0A`;
        orderItems.forEach(item => { message += `- ${item.name} (${item.variantName}) x${item.qty} = ${formatRupiah(item.price * item.qty)}%0A`; });
        message += `%0A*Total Transfer*: ${formatRupiah(cartTotal)}%0A`;
        if (selectedRekening) message += `*Tujuan*: ${selectedRekening.bank_name} (${selectedRekening.account_number})%0A`;
        if (proofUrl) message += `*Bukti Transfer*: ${proofUrl}%0A%0A`;
        message += `Mohon bantu verifikasi pesanan saya. Terima kasih.`;

        const msg = encodeURIComponent(message);
        window.open(`https://wa.me/${getGlobalWhatsApp()}?text=${msg}`, '_blank');
        
        setCart({}); setIsCartOpen(false); setCheckoutStep('cart'); setForm({ name: '', phone: '', address: '' }); setSelectedRekening(null); setProofImage(null); setProofPreview(null);
    };

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative">
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition"><PhosphorIcon icon="arrow-left" size={24} /></button>
                <div className="flex-1 text-center">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">RQS Herbal</h2>
                    <p className="text-[10px] text-green-600 font-bold">Sehat Sesuai Sunnah</p>
                </div>
                <button onClick={() => { loadMyOrders(); setIsMyOrdersOpen(true); }} className="p-2 ml-2 text-green-600 hover:bg-green-50 rounded-xl transition flex flex-col items-center">
                    <PhosphorIcon icon="receipt" size={20} weight="fill" />
                    <span className="text-[8px] font-bold mt-0.5">Pesanan</span>
                </button>
            </div>

            <div className="mx-4 mt-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-2 leading-tight">Sehat & Berkah</h3>
                    <p className="text-xs text-white/90 mb-3 max-w-[90%]">Temukan produk herbal berkualitas dan Thibbun Nabawi. Sebagian keuntungan disalurkan untuk RQS.</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-white/20 transform -rotate-12"><PhosphorIcon icon="leaf" weight="fill" size={120} /></div>
            </div>

            <div className="px-4 mt-4">
                <div className="bg-white rounded-xl border border-gray-200 flex items-center px-4 py-3 shadow-sm">
                    <PhosphorIcon icon="magnifying-glass" size={20} className="text-gray-400 mr-2" />
                    <input type="text" placeholder="Cari produk herbal..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-sm outline-none bg-transparent"/>
                </div>
            </div>

            <div className="p-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map(product => {
                        const selectedVariant = getSelectedVariant(product);
                        if (!selectedVariant) return null;
                        const qtyInCart = getQtyInCart(product.id, selectedVariant.id);
                        return (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                <div className="h-32 bg-green-50 relative overflow-hidden border-b border-gray-100">
                                    {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-green-300"><PhosphorIcon icon="image" size={32} /></div>}
                                </div>
                                <div className="p-3 flex flex-col flex-1">
                                    <h4 className="font-bold text-gray-800 text-xs mb-1 line-clamp-1">{product.name}</h4>
                                    <p className="text-[9px] text-gray-500 mb-2 line-clamp-2">{product.desc}</p>
                                    <div className="mt-auto">
                                        {product.variants && product.variants.length > 1 && (
                                            <div className="mb-2">
                                                <select className="w-full text-[10px] bg-gray-50 border border-gray-200 rounded-lg p-1.5 outline-none font-bold text-gray-700" value={selectedVariant.id} onChange={(e) => handleVariantChange(product.id, e.target.value)}>
                                                    {product.variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <p className="text-[13px] font-bold text-green-600 mb-2">{formatRupiah(selectedVariant.price)}</p>
                                        {qtyInCart > 0 ? (
                                            <div className="flex items-center justify-between bg-green-50 rounded-lg p-1">
                                                <button onClick={() => removeFromCart(product.id, selectedVariant.id)} className="w-7 h-7 bg-white rounded-md flex items-center justify-center text-green-600 font-bold">-</button>
                                                <span className="text-xs font-bold text-green-800">{qtyInCart}</span>
                                                <button onClick={() => addToCart(product.id, selectedVariant.id)} className="w-7 h-7 bg-green-600 rounded-md flex items-center justify-center text-white font-bold">+</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => addToCart(product.id, selectedVariant.id)} className="w-full bg-white border border-green-500 text-green-600 rounded-lg py-1.5 text-[11px] font-bold">Beli Sekarang</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                    <div className="bg-white rounded-t-3xl p-5 pb-28 relative z-10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-800">
                                {checkoutStep === 'cart' ? 'Keranjang Herbal' : checkoutStep === 'fill_form' ? 'Info Pengiriman' : checkoutStep === 'select_payment' ? 'Pembayaran' : 'Bukti Transfer'}
                            </h3>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600"><PhosphorIcon icon="x" weight="bold" /></button>
                        </div>
                        
                        {checkoutStep === 'cart' && (
                            <>
                                <div className="space-y-3 mb-4">
                                    {Object.entries(cart).map(([cartKey, qty]) => {
                                        const [productId, variantId] = cartKey.split('_');
                                        const product = products.find(p => String(p.id) === String(productId));
                                        if (!product) return null;
                                        const variant = product.variants.find(v => String(v.id) === String(variantId));
                                        return (
                                            <div key={cartKey} className="flex gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="w-16 h-16 bg-green-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                                    {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-green-300"><PhosphorIcon icon="image" size={24}/></div>}
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <h4 className="font-bold text-sm text-gray-800 leading-tight line-clamp-1">{product.name}</h4>
                                                    <p className="text-[10px] text-gray-500 font-bold mb-0.5">Varian: {variant.name}</p>
                                                    <p className="text-xs text-green-600 font-bold mt-1">{formatRupiah(variant.price * qty)}</p>
                                                </div>
                                                <div className="flex flex-col justify-center px-1">
                                                    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                                        <button onClick={() => removeFromCart(product.id, variant.id)} className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold bg-white rounded shadow-sm">-</button>
                                                        <span className="text-xs font-bold w-4 text-center">{qty}</span>
                                                        <button onClick={() => addToCart(product.id, variant.id)} className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold bg-white rounded shadow-sm">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex justify-between items-center mb-4"><span className="text-sm font-bold text-gray-600">Total Belanja</span><span className="text-xl font-bold text-green-600">{formatRupiah(cartTotal)}</span></div>
                                    <button onClick={() => setCheckoutStep('fill_form')} className="w-full bg-green-600 text-white rounded-xl py-3.5 font-bold text-sm shadow-md hover:bg-green-700">Lanjut Pengiriman</button>
                                </div>
                            </>
                        )}
                        {checkoutStep === 'fill_form' && (
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-gray-700">Nama Penerima</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-3 rounded-xl mt-1 text-sm bg-gray-50" placeholder="Nama lengkap..."/></div>
                                <div><label className="text-xs font-bold text-gray-700">No. WhatsApp</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border p-3 rounded-xl mt-1 text-sm bg-gray-50" placeholder="08..."/></div>
                                <div><label className="text-xs font-bold text-gray-700">Alamat Lengkap</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border p-3 rounded-xl mt-1 text-sm bg-gray-50" rows="3" placeholder="Jalan, RT/RW..."></textarea></div>
                                <button onClick={() => { if(!form.name || !form.phone || !form.address) return alert('Lengkapi data!'); setCheckoutStep('select_payment'); }} className="w-full bg-green-600 text-white font-bold p-3 rounded-xl">Lanjut Pilih Pembayaran</button>
                                <button onClick={() => setCheckoutStep('cart')} className="w-full bg-gray-100 text-gray-600 font-bold p-3 rounded-xl text-sm">Kembali</button>
                            </div>
                        )}
                        {checkoutStep === 'select_payment' && (
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-700 block mb-2">Pilih Rekening</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {rekening.map(rek => (
                                        <div key={rek.id} onClick={() => setSelectedRekening(rek)} className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer transition ${selectedRekening?.id === rek.id ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex justify-center items-center"><PhosphorIcon icon="bank" weight="fill"/></div>
                                            <div className="flex-1"><h4 className="font-bold text-xs">{rek.bank_name}</h4><p className="text-[10px] text-gray-500">{rek.account_number} a.n {rek.account_name}</p></div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => { if(!selectedRekening) return alert("Pilih rekening!"); setCheckoutStep('upload_proof'); }} className="w-full bg-green-600 text-white font-bold p-3 rounded-xl">Lanjut Upload Bukti</button>
                                <button onClick={() => setCheckoutStep('fill_form')} className="w-full bg-gray-100 text-gray-600 font-bold p-3 rounded-xl text-sm">Kembali</button>
                            </div>
                        )}
                        {checkoutStep === 'upload_proof' && (
                            <div className="space-y-4">
                                <div className="bg-green-50 p-3 rounded-xl text-center border border-green-200">
                                    <p className="text-[10px] text-gray-500">Total Transfer</p>
                                    <p className="font-bold text-green-700 text-lg">{formatRupiah(cartTotal)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">Upload Bukti Transfer</label>
                                    <div onClick={() => proofInputRef.current?.click()} className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                                        {proofPreview ? <img src={proofPreview} className="w-full h-full object-cover"/> : ( <div className="text-gray-400 flex flex-col items-center"><PhosphorIcon icon="upload-simple" size={24}/><span className="text-[10px] mt-1">Tap upload gambar</span></div> )}
                                    </div>
                                    <input type="file" accept="image/*" ref={proofInputRef} onChange={handleProofChange} className="hidden" />
                                </div>
                                <button disabled={isLoading} onClick={() => { if(!proofImage) return alert("Upload bukti!"); handleFinishCheckout(); }} className="w-full bg-blue-600 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2">
                                    {isLoading ? 'Memproses...' : <><PhosphorIcon icon="whatsapp-logo" weight="fill" size={20} /> Konfirmasi via WA</>}
                                </button>
                                <button onClick={() => setCheckoutStep('select_payment')} className="w-full bg-gray-100 text-gray-600 font-bold p-3 rounded-xl text-sm">Kembali</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {!isCartOpen && cartCount > 0 && (
                <div className="fixed bottom-24 left-0 right-0 z-40 px-4 flex justify-center animate-in slide-in-from-bottom-4 duration-300">
                    <button onClick={() => setIsCartOpen(true)} className="bg-gray-900 text-white rounded-2xl py-3 px-5 shadow-2xl flex items-center gap-4 w-full max-w-sm border border-gray-800">
                        <div className="relative shrink-0"><PhosphorIcon icon="shopping-cart" weight="fill" size={24} className="text-green-400" /><span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-gray-900">{cartCount}</span></div>
                        <div className="flex-1 text-left"><p className="text-[10px] text-gray-400 mb-1">Total</p><p className="text-sm font-bold text-white">{formatRupiah(cartTotal)}</p></div>
                        <div className="text-xs font-bold text-gray-900 bg-green-400 py-1.5 px-3 rounded-xl flex items-center gap-1">Checkout <PhosphorIcon icon="caret-right" weight="bold" /></div>
                    </button>
                </div>
            )}

            {/* My Orders Sheet */}
            {isMyOrdersOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMyOrdersOpen(false)}></div>
                    <div className="bg-white rounded-t-3xl p-5 pb-28 relative z-10 h-[85vh] flex flex-col animate-in slide-in-from-bottom-full shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-800">Pesanan Saya</h3>
                            <button onClick={() => setIsMyOrdersOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600"><PhosphorIcon icon="x" weight="bold" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 hide-scrollbar">
                            {myOrders.length === 0 ? (
                                <div className="text-center py-10">
                                    <PhosphorIcon icon="receipt" size={48} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Belum ada pesanan.</p>
                                </div>
                            ) : (
                                myOrders.map(order => (
                                    <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                                            <div>
                                                <p className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                                                <p className="font-bold text-gray-800 text-sm mt-0.5">{order.customer_name}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                                order.status === 'Menunggu Verifikasi' ? 'bg-amber-50 text-amber-600' :
                                                order.status === 'Ditolak' ? 'bg-red-50 text-red-600' :
                                                order.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex gap-2 items-center text-xs">
                                                    {item.image ? <img src={item.image} className="w-8 h-8 rounded border object-cover" /> : <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center"><PhosphorIcon icon="image"/></div>}
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-700 line-clamp-1">{item.name}</p>
                                                        <p className="text-[10px] text-gray-500">{item.variantName} x{item.qty}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                            <span className="text-xs text-gray-600 font-bold">Total:</span>
                                            <span className="text-sm font-bold text-green-600">{formatRupiah(order.total_amount)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RqsHerbal;
