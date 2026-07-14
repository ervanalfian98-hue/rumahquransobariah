import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { PRAYER_TIMES, CLASSES, QUICK_MENU, CATEGORY_GROUPS } from './MockData';
import Navbar from './Navbar';

const KategoriScreen = ({ setActiveTab }) => {
    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Header Ala Kategori Screenshot */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={() => setActiveTab('beranda')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Layanan RQS</h2>
                    <p className="text-[10px] text-[#B88A44]">Rumah Quran Sobariah</p>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {CATEGORY_GROUPS.map((group, gIdx) => (
                    <div key={gIdx}>
                        <h3 className="font-bold text-[#4A1C14] mb-3 text-[13px]">{group.title}</h3>

                        {/* Grid 4 Kolom dengan Vektor Warna-Warni */}
                        <div className="grid grid-cols-4 gap-3">
                            {group.items.map((item, iIdx) => (
                                <motion.div
                                    key={iIdx}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (item.name === 'Kalender') {
                                            setActiveTab('kalender');
                                        } else if (item.name === 'Pengajar') {
                                            setActiveTab('pengajar');
                                        } else if (item.name === 'Kiblat') {
                                            setActiveTab('kiblat');
                                        } else if (item.name === 'Hadist') {
                                            setActiveTab('hadist');
                                        } else if (item.name === 'Zakat') {
                                            setActiveTab('zakat');
                                        } else if (item.name === 'Merchandise') {
                                            setActiveTab('merchandise');
                                        } else if (item.name === 'Adzan') {
                                            setActiveTab('adzan');
                                        } else if (item.name === 'Asbabun Nuzul') {
                                            setActiveTab('asbabun-nuzul');
                                        } else if (item.name === 'Susunan Kepengurusan') {
                                            setActiveTab('kepengurusan');
                                        } else if (item.name === 'RQS Berdaya') {
                                            setActiveTab('rqs-berdaya');
                                        } else if (item.name === 'Herbal') {
                                            setActiveTab('rqs-herbal');
                                        } else if (item.name === 'MLP') {
                                            setActiveTab('rqs-mlp');
                                        } else if (item.name === 'Tafsir') {
                                            setActiveTab('tafsir');
                                        } else if (item.name === 'Bacaan Sholat') {
                                            setActiveTab('bacaan-sholat');
                                        } else if (item.name === 'Tasbih') {
                                            setActiveTab('tasbih');
                                        } else if (item.name === 'Sirah Nabi') {
                                            setActiveTab('sirah-nabi');
                                        } else if (item.name === 'Asmaul Husna') {
                                            setActiveTab('asmaul-husna');
                                        } else if (item.name === 'Kisah 25 Nabi') {
                                            setActiveTab('kisah-25-nabi');
                                        } else if (item.name === 'Tamyiz') {
                                            setActiveTab('tamyiz');
                                        } else if (item.name === 'Amal') {
                                            setActiveTab('amal');
                                        } else if (item.name === 'Dzikir') {
                                            setActiveTab('dzikir');
                                        } else if (item.name === 'Iqra') {
                                            setActiveTab('iqra');
                                        } else if (item.name === 'Artikel') {
                                            setActiveTab('artikel');
                                        } else if (item.name === 'Renungan') {
                                            setActiveTab('renungan');
                                        } else if (item.name === 'Doa') {
                                            setActiveTab('doa');
                                        } else if (item.name === 'Qurban') {
                                            setActiveTab('qurban');
                                        } else if (item.name === 'Donasi') {
                                            setActiveTab('donasi');
                                        } else if (item.name === 'Sosial Media') {
                                            setActiveTab('sosmed');
                                        }
                                    }}
                                    className="bg-white p-2 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:border-[#E8D2A6]/50 transition-colors"
                                >
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-[14px] ${item.bg} ${item.color}`}>
                                        <PhosphorIcon icon={item.icon} size={28} />
                                    </div>
                                    <span className="text-[9.5px] font-bold text-[#4A1C14] leading-tight line-clamp-2 px-1">
                                        {item.name}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KategoriScreen;
