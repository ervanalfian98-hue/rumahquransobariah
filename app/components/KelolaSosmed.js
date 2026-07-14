import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { getSosmedConfig, formatWhatsAppNumber } from '../lib/sosmedConfig';

const KelolaSosmed = ({ onBack }) => {
    const [config, setConfig] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setConfig(getSosmedConfig());
    }, []);

    const handleChange = (platform, field, value) => {
        setConfig(prev => ({
            ...prev,
            [platform]: {
                ...prev[platform],
                [field]: value
            }
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Format the WhatsApp number before saving
        const finalConfig = {
            ...config,
            whatsapp: {
                ...config.whatsapp,
                formatted: formatWhatsAppNumber(config.whatsapp.number)
            }
        };

        localStorage.setItem('rqs_sosmed_settings', JSON.stringify(finalConfig));
        setConfig(finalConfig);

        setTimeout(() => {
            setIsSaving(false);
            alert('Pengaturan Sosial Media berhasil disimpan!');
        }, 500);
    };

    if (!config) return null;

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-screen z-30 relative">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Sosial Media</h2>
                    <p className="text-[10px] text-[#B88A44] font-bold">Pengaturan Link & WhatsApp</p>
                </div>
            </div>

            <div className="p-5">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-1">Pusat Informasi</h3>
                        <p className="text-xs text-white/90">Atur link sosial media dan nomor WhatsApp utama aplikasi.</p>
                    </div>
                    <PhosphorIcon icon="share-network" size={48} className="text-white/30" weight="fill"/>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    {/* Instagram */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-pink-600">
                            <PhosphorIcon icon="instagram-logo" size={20} weight="fill" />
                            <h4 className="font-bold text-sm text-gray-800">Instagram</h4>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Username</label>
                                <input required type="text" value={config.instagram.username} onChange={e => handleChange('instagram', 'username', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-pink-400" placeholder="@username" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Link URL</label>
                                <input required type="url" value={config.instagram.url} onChange={e => handleChange('instagram', 'url', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-pink-400" placeholder="https://instagram.com/..." />
                            </div>
                        </div>
                    </div>

                    {/* YouTube */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-red-600">
                            <PhosphorIcon icon="youtube-logo" size={20} weight="fill" />
                            <h4 className="font-bold text-sm text-gray-800">YouTube</h4>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Channel</label>
                                <input required type="text" value={config.youtube.username} onChange={e => handleChange('youtube', 'username', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-red-400" placeholder="Nama Channel" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Link URL</label>
                                <input required type="url" value={config.youtube.url} onChange={e => handleChange('youtube', 'url', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-red-400" placeholder="https://youtube.com/..." />
                            </div>
                        </div>
                    </div>

                    {/* Facebook */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-blue-600">
                            <PhosphorIcon icon="facebook-logo" size={20} weight="fill" />
                            <h4 className="font-bold text-sm text-gray-800">Facebook</h4>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Halaman/Username</label>
                                <input required type="text" value={config.facebook.username} onChange={e => handleChange('facebook', 'username', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-blue-400" placeholder="Nama Halaman" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Link URL</label>
                                <input required type="url" value={config.facebook.url} onChange={e => handleChange('facebook', 'url', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-blue-400" placeholder="https://facebook.com/..." />
                            </div>
                        </div>
                    </div>

                    {/* TikTok */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-gray-800">
                            <PhosphorIcon icon="tiktok-logo" size={20} weight="fill" />
                            <h4 className="font-bold text-sm text-gray-800">TikTok</h4>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Username</label>
                                <input required type="text" value={config.tiktok.username} onChange={e => handleChange('tiktok', 'username', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-gray-500" placeholder="@username" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Link URL</label>
                                <input required type="url" value={config.tiktok.url} onChange={e => handleChange('tiktok', 'url', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-gray-500" placeholder="https://tiktok.com/..." />
                            </div>
                        </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <PhosphorIcon icon="whatsapp-logo" size={80} weight="fill" />
                        </div>
                        <div className="flex items-center gap-2 mb-3 text-emerald-600 relative z-10">
                            <PhosphorIcon icon="whatsapp-logo" size={20} weight="fill" />
                            <h4 className="font-bold text-sm text-emerald-800">WhatsApp Center</h4>
                        </div>
                        <p className="text-[10px] text-emerald-700 mb-3 relative z-10 leading-tight">
                            Nomor ini akan digunakan sebagai nomor admin utama untuk seluruh pesanan (E-Commerce, Qurban, dll). Masukkan dengan format biasa (Cth: 081234567890).
                        </p>
                        <div className="relative z-10">
                            <input 
                                required 
                                type="tel" 
                                value={config.whatsapp.number} 
                                onChange={e => handleChange('whatsapp', 'number', e.target.value)} 
                                className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm font-bold text-emerald-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                                placeholder="08..." 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full bg-[#4A1C14] text-white font-bold py-4 rounded-2xl hover:bg-[#5C2319] active:scale-[0.98] transition-all shadow-lg flex justify-center items-center gap-2"
                    >
                        {isSaving ? <PhosphorIcon icon="circle-notch" className="animate-spin" size={20} /> : <PhosphorIcon icon="floppy-disk" size={20} />}
                        Simpan Pengaturan
                    </button>
                </form>
            </div>
        </div>
    );
};

export default KelolaSosmed;
