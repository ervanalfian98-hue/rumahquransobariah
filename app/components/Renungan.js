import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import html2canvas from 'html2canvas';
import { supabase } from '../lib/supabaseClient';

const Renungan = ({ setActiveTab }) => {
    const [renunganList, setRenunganList] = useState([]);
    const [processingItem, setProcessingItem] = useState(null);
    const [processAction, setProcessAction] = useState(null);
    const downloadRef = useRef(null);

    useEffect(() => {
        const fetchRenungan = async () => {
            const { data, error } = await supabase.from('rqs_renungan').select('*').order('created_at', { ascending: false });
            if (data && !error) {
                setRenunganList(data);
            }
        };
        fetchRenungan();
    }, []);

    const handleProcessImage = async (item, action) => {
        setProcessingItem(item);
        setProcessAction(action);
        
        // Wait for React to render the hidden component
        setTimeout(async () => {
            if (downloadRef.current) {
                try {
                    const canvas = await html2canvas(downloadRef.current, {
                        scale: 2, // High quality
                        useCORS: true,
                        backgroundColor: '#FFFFFF',
                    });

                    if (action === 'download') {
                        const image = canvas.toDataURL("image/png");
                        const link = document.createElement('a');
                        link.href = image;
                        link.download = `Renungan_RQS_${item.id}.png`;
                        link.click();
                    } else if (action === 'share') {
                        canvas.toBlob(async (blob) => {
                            if (blob) {
                                const file = new File([blob], `Renungan_RQS_${item.id}.png`, { type: 'image/png' });
                                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                    try {
                                        await navigator.share({
                                            title: item.title,
                                            text: 'Renungan Harian dari Rumah Quran Sobariah.',
                                            files: [file]
                                        });
                                    } catch (err) {
                                        console.log('Share canceled or failed', err);
                                    }
                                } else {
                                    alert("Browser Anda tidak mendukung fitur share gambar secara langsung. Gambar akan diunduh sebagai gantinya.");
                                    const image = canvas.toDataURL("image/png");
                                    const link = document.createElement('a');
                                    link.href = image;
                                    link.download = `Renungan_RQS_${item.id}.png`;
                                    link.click();
                                }
                            }
                        }, 'image/png');
                    }
                    
                    setProcessingItem(null);
                    setProcessAction(null);
                } catch (error) {
                    console.error("Failed to generate image", error);
                    setProcessingItem(null);
                    setProcessAction(null);
                    alert("Gagal memproses gambar.");
                }
            }
        }, 300); // 300ms delay to ensure layout is complete
    };

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Renungan</h2>
                    <p className="text-[10px] text-[#B88A44]">Muhasabah & Nasihat Diri</p>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="bg-[#4A1C14] text-white rounded-2xl p-5 relative overflow-hidden mb-6 shadow-md">
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-1">Muhasabah Harian</h3>
                        <p className="text-xs text-white/80 max-w-[80%]">Mari luangkan waktu sejenak untuk merenungi ayat-ayat Allah dan memperbaiki diri.</p>
                    </div>
                    <PhosphorIcon icon="lightbulb" size={80} className="absolute -right-4 -bottom-4 text-white/10" />
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#4A1C14]">Daftar Renungan</h3>
                    <span className="text-xs text-[#B88A44] font-medium">{renunganList.length} Artikel</span>
                </div>

                {renunganList.map((item, idx) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#B88A44]/60"></div>
                        
                        <div className="flex justify-between items-start mb-2 pl-2">
                            <h3 className="font-bold text-[#4A1C14] text-sm pr-20">{item.title}</h3>
                            {/* Action Buttons Container */}
                            <div className="absolute top-3 right-3 flex items-center space-x-2">
                                {/* Share Button */}
                                <button 
                                    onClick={() => handleProcessImage(item, 'share')}
                                    disabled={processingItem !== null}
                                    className="text-blue-500 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                                    title="Bagikan Renungan"
                                >
                                    <PhosphorIcon 
                                        icon={processingItem?.id === item.id && processAction === 'share' ? "spinner" : "share-network"} 
                                        size={16} 
                                        className={processingItem?.id === item.id && processAction === 'share' ? "animate-spin" : ""} 
                                    />
                                </button>
                                {/* Download Button */}
                                <button 
                                    onClick={() => handleProcessImage(item, 'download')}
                                    disabled={processingItem !== null}
                                    className="text-[#B88A44] bg-[#FDF9F1] hover:bg-[#E8D2A6] p-1.5 rounded-lg transition-colors"
                                    title="Download Gambar 1:1"
                                >
                                    <PhosphorIcon 
                                        icon={processingItem?.id === item.id && processAction === 'download' ? "spinner" : "download-simple"} 
                                        size={16} 
                                        className={processingItem?.id === item.id && processAction === 'download' ? "animate-spin" : ""} 
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="pl-2 mb-2">
                            <span className="text-[9px] text-[#B88A44] font-semibold bg-[#FDF9F1] border border-[#E8D2A6] px-2 py-1 rounded-full whitespace-nowrap">
                                {item.date}
                            </span>
                        </div>
                        <p className="text-xs font-medium text-[#B88A44] italic mb-3 pl-2">
                            "{item.excerpt}"
                        </p>
                        <p className="text-[11.5px] text-gray-600 leading-relaxed text-justify pl-2">
                            {item.content}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Hidden DOM element for 1:1 Image Generation */}
            {processingItem && (
                <div style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}>
                    <div 
                        ref={downloadRef}
                        style={{
                            width: '1080px',
                            height: '1080px',
                            backgroundColor: '#FAFAFA',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '80px',
                            boxSizing: 'border-box',
                            position: 'relative'
                        }}
                    >
                        {/* Background Decorations */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '20px', backgroundColor: '#4A1C14' }}></div>
                        <div style={{ position: 'absolute', top: 20, left: 0, width: '100%', height: '5px', backgroundColor: '#B88A44' }}></div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '15px', backgroundColor: '#4A1C14' }}></div>
                        
                        {/* Header: RQS Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '15px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="/logorqs.png" alt="Logo RQS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
                                </div>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#4A1C14', letterSpacing: '-1px' }}>Rumah Quran Sobariah</h1>
                                    <p style={{ margin: 0, fontSize: '20px', color: '#B88A44', fontWeight: '500' }}>Muhasabah & Renungan Harian</p>
                                </div>
                            </div>
                            <div style={{ backgroundColor: '#FDF9F1', border: '2px solid #E8D2A6', padding: '10px 25px', borderRadius: '50px', fontSize: '22px', fontWeight: 'bold', color: '#B88A44' }}>
                                {processingItem.date}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
                            <h2 style={{ fontSize: '64px', fontWeight: '800', color: '#4A1C14', marginBottom: '30px', lineHeight: '1.2' }}>
                                {processingItem.title}
                            </h2>
                            
                            <div style={{ display: 'flex', gap: '30px' }}>
                                <div style={{ width: '8px', backgroundColor: '#B88A44', borderRadius: '10px' }}></div>
                                <div>
                                    <p style={{ fontSize: '34px', fontStyle: 'italic', color: '#B88A44', fontWeight: '600', marginBottom: '40px', lineHeight: '1.4' }}>
                                        "{processingItem.excerpt}"
                                    </p>
                                    <p style={{ fontSize: '32px', color: '#444444', lineHeight: '1.7', textAlign: 'justify' }}>
                                        {processingItem.content}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '40px' }}>
                            <span style={{ fontSize: '24px', fontWeight: '600', color: '#4A1C14' }}>@rumahquransobariah</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Renungan;
