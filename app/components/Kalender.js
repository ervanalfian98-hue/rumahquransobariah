import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';

const KalenderScreen = ({ setActiveTab, currentUser }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [notes, setNotes] = useState({});
    const [noteInput, setNoteInput] = useState('');

    useEffect(() => {
        const userKey = currentUser ? (currentUser.username || currentUser.id) : '';
        const notesKey = userKey ? `rqs_calendar_notes_${userKey}` : 'rqs_calendar_notes';
        const savedNotes = localStorage.getItem(notesKey);
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        }
    }, [currentUser]);

    const getHijriDate = (date) => {
        try {
            const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
            });
            const parts = formatter.formatToParts(date);
            
            const dayStr = parts.find(p => p.type === 'day')?.value || '1';
            const monthStr = parts.find(p => p.type === 'month')?.value || '1';
            const yearStr = parts.find(p => p.type === 'year')?.value || '1446';
            
            const day = parseInt(dayStr.replace(/[^0-9]/g, '')) || 1;
            const monthNum = parseInt(monthStr.replace(/[^0-9]/g, '')) || 1;
            const yearNum = parseInt(yearStr.replace(/[^0-9]/g, '')) || 1446;
            
            if (yearNum > 2000) return { day: 1, month: 'Muharram', year: '1446' };
            
            const hijriMonths = ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Syaban', 'Ramadhan', 'Syawal', 'Dzulqaidah', 'Dzulhijjah'];
            return { day, month: hijriMonths[monthNum - 1] || 'Muharram', year: yearNum.toString() };
        } catch (e) {
            return { day: 1, month: 'Muharram', year: '1446' };
        }
    };

    const isFastingDay = (date, hijri) => {
        const dayOfWeek = date.getDay();
        const types = [];
        const month = (hijri.month || '').toLowerCase();
        
        // Senin Kamis
        if (dayOfWeek === 1 || dayOfWeek === 4) {
            types.push({
                name: dayOfWeek === 1 ? 'Puasa Sunnah Senin' : 'Puasa Sunnah Kamis',
                desc: 'Amal perbuatan manusia dilaporkan pada hari Senin dan Kamis. Rasulullah ﷺ senang saat amalnya dilaporkan dalam keadaan berpuasa.'
            });
        }
        
        // Ayyamul Bidh
        if (hijri.day === 13 || hijri.day === 14 || hijri.day === 15) {
            // Note: tidak boleh puasa pada 13 Dzulhijjah (Tasyriq)
            if (!month.includes('zulhij') && !month.includes('dzulhij')) {
                types.push({
                    name: `Puasa Ayyamul Bidh (${hijri.day} ${hijri.month})`,
                    desc: 'Berpuasa tiga hari setiap bulan (tanggal 13, 14, 15 Hijriah) nilainya seolah-olah berpuasa sepanjang tahun.'
                });
            }
        }
        
        // Muharram (Tasu'a & Asyura)
        if (month.includes('muharam') || month.includes('muharram')) {
            if (hijri.day === 9) {
                types.push({ name: "Puasa Tasu'a (9 Muharram)", desc: 'Disunnahkan berpuasa pada tanggal 9 Muharram untuk menyelisihi puasanya kaum Yahudi.' });
            }
            if (hijri.day === 10) {
                types.push({ name: 'Puasa Asyura (10 Muharram)', desc: 'Keutamaannya dapat menghapus dosa-dosa kecil setahun yang lalu.' });
            }
        }
        
        // Rajab
        if (month.includes('rajab')) {
            if (hijri.day === 1) {
                types.push({ name: 'Puasa Sunnah Bulan Rajab', desc: 'Rajab adalah salah satu bulan haram (mulia). Sangat dianjurkan memperbanyak amal shalih, termasuk berpuasa.' });
            }
            if (hijri.day === 27) {
                types.push({ name: 'Peringatan Isra Mi\'raj', desc: 'Walaupun tidak ada puasa khusus Isra Mi\'raj, memperbanyak ibadah (termasuk puasa sunnah) di bulan Rajab sangat dianjurkan.' });
            }
        }
        
        // Sya'ban
        if (month.includes('syakban') || month.includes('sya\'ban') || month.includes('syaban')) {
            if (hijri.day === 15) {
                types.push({ name: 'Puasa Nisfu Sya\'ban', desc: 'Dianjurkan berpuasa di pertengahan bulan Sya\'ban. Rasulullah ﷺ juga sangat memperbanyak puasa sunnah di bulan ini.' });
            }
        }

        // Dzulhijjah
        if (month.includes('zulhij') || month.includes('dzulhij')) {
            if (hijri.day >= 1 && hijri.day <= 7) {
                types.push({ name: 'Puasa Awal Dzulhijjah', desc: 'Tidak ada hari dimana amal shalih lebih dicintai Allah melebihi 10 hari pertama bulan Dzulhijjah.' });
            }
            if (hijri.day === 8) {
                types.push({ name: 'Puasa Tarwiyah (8 Dzulhijjah)', desc: 'Sangat dianjurkan bagi umat muslim yang tidak sedang melaksanakan ibadah haji.' });
            }
            if (hijri.day === 9) {
                types.push({ name: 'Puasa Arafah (9 Dzulhijjah)', desc: 'Keutamaannya luar biasa: menghapus dosa setahun yang lalu dan dosa setahun yang akan datang.' });
            }
            if (hijri.day >= 11 && hijri.day <= 13) {
                return [{ name: 'Hari Tasyriq (Haram Berpuasa)', desc: 'Hari Tasyriq (11, 12, 13 Dzulhijjah) adalah hari-hari untuk makan, minum, dan mengingat Allah. Diharamkan berpuasa.', isHaram: true }];
            }
            if (hijri.day === 10) {
                return [{ name: 'Idul Adha (Haram Berpuasa)', desc: 'Diharamkan berpuasa pada hari raya Idul Adha (10 Dzulhijjah).', isHaram: true }];
            }
        }

        // Syawal
        if (month.includes('syawal')) {
            if (hijri.day === 1) {
                return [{ name: 'Idul Fitri (Haram Berpuasa)', desc: 'Diharamkan berpuasa pada hari raya Idul Fitri (1 Syawal).', isHaram: true }];
            }
            if (hijri.day >= 2 && hijri.day <= 7) {
                types.push({ name: 'Puasa 6 Hari di Bulan Syawal', desc: 'Barangsiapa berpuasa Ramadhan kemudian mengiringinya dengan puasa 6 hari di bulan Syawal, pahalanya seperti berpuasa setahun penuh.' });
            }
        }
        
        return types;
    };

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const startingDay = firstDay.getDay(); // 0 = Sunday
        const totalDays = lastDay.getDate();
        
        const days = [];
        const daysInWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        
        // Headers
        const headerCells = daysInWeek.map((day, idx) => (
            <div key={`header-${idx}`} className={`text-center text-[10px] font-bold py-2 ${idx === 0 ? 'text-red-500' : 'text-[#4A1C14]/70'}`}>
                {day}
            </div>
        ));

        // Empty cells for starting day offset
        for (let i = 0; i < startingDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-12 border border-transparent"></div>);
        }

        const today = new Date();
        const isToday = (d) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        const isSelected = (d) => d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();

        // Actual days
        for (let i = 1; i <= totalDays; i++) {
            const date = new Date(year, month, i);
            const hijri = getHijriDate(date);
            const fastingTypes = isFastingDay(date, hijri);
            const isHaram = fastingTypes.some(t => t.isHaram);
            const isFasting = fastingTypes.length > 0 && !isHaram;
            const dateString = date.toISOString().split('T')[0];
            const hasNote = !!notes[dateString];
            
            let bgClass = 'bg-white';
            if (isSelected(date)) bgClass = 'bg-[#B88A44] text-white shadow-md ring-2 ring-[#E8D2A6] scale-105 z-10 relative';
            else if (isToday(date)) bgClass = 'bg-[#FCF7E8] text-[#4A1C14] ring-1 ring-[#B88A44]';
            else if (isHaram) bgClass = 'bg-red-50 text-red-900 border border-red-200/50';
            else if (isFasting) bgClass = 'bg-emerald-50 text-emerald-900 border border-emerald-200/50';

            days.push(
                <div 
                    key={`day-${i}`} 
                    onClick={() => setSelectedDate(date)}
                    className={`h-[3.25rem] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${bgClass} ${date.getDay() === 0 && !isSelected(date) ? 'text-red-500' : ''}`}
                >
                    <span className={`text-[13px] font-black leading-none ${isSelected(date) ? 'text-white' : ''}`}>{i}</span>
                    <span className={`text-[8px] font-medium mt-1 leading-none ${isSelected(date) ? 'text-white/90' : (isFasting ? 'text-emerald-700 font-bold' : 'text-[#4A1C14]/50')}`}>
                        {hijri.day} {hijri.month.substring(0,3)}
                    </span>
                    <div className="flex gap-0.5 mt-0.5">
                        {isFasting && <div className={`w-1.5 h-1.5 rounded-full ${isSelected(date) ? 'bg-white' : 'bg-emerald-500'}`}></div>}
                        {isHaram && <div className={`w-1.5 h-1.5 rounded-full ${isSelected(date) ? 'bg-white' : 'bg-red-500'}`}></div>}
                        {hasNote && <div className={`w-1.5 h-1.5 rounded-full ${isSelected(date) ? 'bg-[#FCF7E8]' : 'bg-[#B88A44]'}`}></div>}
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#E8D2A6]/40">
                {/* Controls */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 bg-[#FCF7E8] text-[#B88A44] hover:bg-[#E8D2A6] rounded-full transition-colors">
                        <PhosphorIcon icon="caret-left" size={16} weight="bold" />
                    </button>
                    <div className="text-center">
                        <h3 className="font-bold text-[#4A1C14] text-sm leading-tight">
                            {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </h3>
                        <p className="text-[10px] text-[#B88A44] font-medium">
                            {getHijriDate(new Date(year, month, 1)).month} - {getHijriDate(new Date(year, month, totalDays)).month}
                        </p>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 bg-[#FCF7E8] text-[#B88A44] hover:bg-[#E8D2A6] rounded-full transition-colors">
                        <PhosphorIcon icon="caret-right" size={16} weight="bold" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                    {headerCells}
                    {days}
                </div>
                
                {/* Legenda */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#E8D2A6]/30 justify-center">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[9px] font-bold text-[#4A1C14]/70">Puasa Sunnah</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <span className="text-[9px] font-bold text-[#4A1C14]/70">Haram Berpuasa</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#B88A44]"></div>
                        <span className="text-[9px] font-bold text-[#4A1C14]/70">Ada Catatan</span>
                    </div>
                </div>
            </div>
        );
    };

    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const hijriSelected = getHijriDate(selectedDate);
    const fastingToday = isFastingDay(selectedDate, hijriSelected);

    const handleSaveNote = () => {
        const dateKey = selectedDateString;
        const newNotes = { ...notes };
        if (noteInput.trim()) {
            newNotes[dateKey] = noteInput;
        } else {
            delete newNotes[dateKey];
        }
        setNotes(newNotes);
        
        const userKey = currentUser ? (currentUser.username || currentUser.id) : '';
        const notesKey = userKey ? `rqs_calendar_notes_${userKey}` : 'rqs_calendar_notes';
        localStorage.setItem(notesKey, JSON.stringify(newNotes));
        setNoteInput('');
    };

    const handleDeleteNote = () => {
        const userKey = currentUser ? (currentUser.username || currentUser.id) : '';
        const notesKey = userKey ? `rqs_calendar_notes_${userKey}` : 'rqs_calendar_notes';
        const newNotes = { ...notes };
        delete newNotes[selectedDateString];
        setNotes(newNotes);
        localStorage.setItem(notesKey, JSON.stringify(newNotes));
    };

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('beranda')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kalender Hijriah</h2>
                    <p className="text-[10px] text-[#B88A44]">Jadwal Puasa & Catatan</p>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {renderCalendarGrid()}

                {/* Detail Tanggal Terpilih */}
                <motion.div 
                    key={selectedDateString}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#E8D2A6]/40 relative overflow-hidden"
                >
                    <PhosphorIcon icon="moon-stars" size={100} weight="fill" className="absolute -right-6 -top-6 text-[#FCF7E8] opacity-80" />
                    
                    <div className="relative z-10 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <PhosphorIcon icon="calendar-check" size={20} className="text-[#B88A44]" weight="duotone" />
                            <h3 className="font-bold text-[#4A1C14] text-sm">
                                {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>
                        </div>
                        <p className="text-xs font-bold text-[#B88A44] ml-7">
                            {hijriSelected.day} {hijriSelected.month} {hijriSelected.year} H
                        </p>
                    </div>

                    {fastingToday.length > 0 && (
                        <div className="flex flex-col gap-3 mb-4">
                            {fastingToday.map((fast, idx) => (
                                <div key={idx} className={`${fast.isHaram ? 'bg-red-50 border border-red-200/50' : 'bg-emerald-50 border border-emerald-200/50'} rounded-xl p-3 flex items-start gap-3 relative z-10 shadow-sm`}>
                                    <div className={`${fast.isHaram ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'} p-2 rounded-lg shrink-0`}>
                                        {fast.isHaram ? (
                                            <PhosphorIcon icon="warning-circle" size={20} weight="fill" />
                                        ) : (
                                            <PhosphorIcon icon="moon" size={20} weight="fill" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={`text-[12px] font-bold ${fast.isHaram ? 'text-red-800' : 'text-emerald-800'} tracking-wide mb-1`}>{fast.name}</h4>
                                        <p className={`text-[10px] ${fast.isHaram ? 'text-red-700/90' : 'text-emerald-700/90'} leading-relaxed font-medium`}>{fast.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Catatan Area */}
                    <div className="relative z-10 border-t border-[#E8D2A6]/30 pt-4 mt-2">
                        <h4 className="font-bold text-[#4A1C14] text-xs mb-2 flex items-center gap-1.5">
                            <PhosphorIcon icon="notebook" size={16} className="text-[#B88A44]" />
                            Catatan Tanggal Ini
                        </h4>
                        
                        {notes[selectedDateString] ? (
                            <div className="bg-[#FCF7E8] rounded-xl p-3 border border-[#E8D2A6]/50">
                                <p className="text-xs text-[#4A1C14]/80 whitespace-pre-wrap">{notes[selectedDateString]}</p>
                                <div className="flex justify-end mt-2">
                                    <button onClick={handleDeleteNote} className="text-[10px] font-bold text-red-500 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors">
                                        <PhosphorIcon icon="trash" size={12} weight="bold" /> Hapus
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder="Tambahkan catatan/pengingat..."
                                    className="flex-1 bg-[#FDFBF7] border border-[#E8D2A6]/80 rounded-xl px-3 py-2 text-xs text-[#4A1C14] outline-none focus:border-[#B88A44] transition-colors"
                                />
                                <button onClick={handleSaveNote} className="bg-[#4A1C14] text-white px-3 rounded-xl flex items-center justify-center hover:bg-[#3A140E] transition-colors shadow-sm">
                                    <PhosphorIcon icon="paper-plane-tilt" size={16} weight="fill" />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default KalenderScreen;
