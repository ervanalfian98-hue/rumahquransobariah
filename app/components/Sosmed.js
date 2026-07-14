import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { getSosmedConfig } from '../lib/sosmedConfig';

const Sosmed = ({ setActiveTab }) => {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        setConfig(getSosmedConfig());
    }, []);

    if (!config) return null;

    const handleLinkClick = (url) => {
        window.open(url, '_blank');
    };

    const handleWhatsAppClick = () => {
        window.open(`https://wa.me/${config.whatsapp.formatted}`, '_blank');
    };

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Sosial Media</h2>
                    <p className="text-[10px] text-blue-600 font-bold">Terhubung Dengan RQS</p>
                </div>
            </div>

            {/* Banner */}
            <div className="mx-4 mt-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1">Ikuti Kegiatan Kami</h3>
                    <p className="text-xs text-white/90 mb-3 max-w-[80%]">Dapatkan update terbaru, kajian online, dan dokumentasi kegiatan santri Rumah Quran Sobariah.</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-white/20">
                    <PhosphorIcon icon="share-network" weight="fill" size={100} />
                </div>
            </div>

            {/* List Akun Sosial Media */}
            <div className="px-4 mt-6">
                <h3 className="font-bold text-[#4A1C14] mb-3 text-sm">Platform Resmi</h3>
                <div className="flex flex-col gap-3">
                    
                    {/* Instagram */}
                    <div onClick={() => handleLinkClick(config.instagram.url)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-pink-200 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg" alt="Instagram Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">Instagram</h4>
                                <p className="text-[11px] text-gray-500">{config.instagram.username}</p>
                            </div>
                        </div>
                        <PhosphorIcon icon="caret-right" className="text-gray-400" />
                    </div>

                    {/* YouTube */}
                    <div onClick={() => handleLinkClick(config.youtube.url)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-200 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">YouTube</h4>
                                <p className="text-[11px] text-gray-500">{config.youtube.username}</p>
                            </div>
                        </div>
                        <PhosphorIcon icon="caret-right" className="text-gray-400" />
                    </div>

                    {/* Facebook */}
                    <div onClick={() => handleLinkClick(config.facebook.url)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-200 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">Facebook</h4>
                                <p className="text-[11px] text-gray-500">{config.facebook.username}</p>
                            </div>
                        </div>
                        <PhosphorIcon icon="caret-right" className="text-gray-400" />
                    </div>

                    {/* TikTok */}
                    <div onClick={() => handleLinkClick(config.tiktok.url)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-gray-300 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                <img src="https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg" alt="TikTok Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">TikTok</h4>
                                <p className="text-[11px] text-gray-500">{config.tiktok.username}</p>
                            </div>
                        </div>
                        <PhosphorIcon icon="caret-right" className="text-gray-400" />
                    </div>

                    {/* WhatsApp Center */}
                    <div onClick={handleWhatsAppClick} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-green-200 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">WhatsApp Layanan</h4>
                                <p className="text-[11px] text-gray-500">Hubungi admin RQS</p>
                            </div>
                        </div>
                        <PhosphorIcon icon="caret-right" className="text-gray-400" />
                    </div>

                </div>
            </div>
            
            <div className="mt-8 text-center px-4">
                <p className="text-[10px] text-gray-400">Ikuti kami untuk mendukung syiar dakwah Al-Quran</p>
            </div>
        </div>
    );
};

export default Sosmed;
