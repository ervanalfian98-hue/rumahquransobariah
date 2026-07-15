import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { CLASSES as INITIAL_CLASSES } from './MockData';
import { supabase } from '../lib/supabaseClient';

const getLocalDateString = (dateObj = new Date()) => {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
};

const PendidikanScreen = ({ currentUser }) => {
    const [classesList, setClassesList] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [pengajarList, setPengajarList] = useState([]);
    const [tholibahList, setTholibahList] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [progressMap, setProgressMap] = useState({});
    
    // View States
    const [inClassView, setInClassView] = useState(false);
    const [showNotRegisteredPopup, setShowNotRegisteredPopup] = useState(false);
    const [showAbsenPopup, setShowAbsenPopup] = useState(false);
    const [absenRecord, setAbsenRecord] = useState({});
    const [teacherPresentRecord, setTeacherPresentRecord] = useState({});

    useEffect(() => {
        const loadData = async () => {
            let currentClasses = INITIAL_CLASSES;
            const { data: dbClasses } = await supabase.from('rqs_classes').select('*').order('order_index', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true });
            if (dbClasses && dbClasses.length > 0) {
                currentClasses = dbClasses.map(c => ({...c, desc: c.description}));
            }
            setClassesList(currentClasses);
            
            setSelectedClass(prev => {
                if (!prev || !currentClasses.find(c => c.id === prev.id)) {
                    return currentClasses.length > 0 ? currentClasses[0] : null;
                }
                return currentClasses.find(c => c.id === prev.id);
            });

            const { data: pengajarData } = await supabase.from('rqs_pengajar').select('*');
            if (pengajarData) {
                setPengajarList(pengajarData.map(p => ({...p, userId: p.user_id})));
            }

            const { data: tholibahData } = await supabase.from('rqs_tholibah').select('*');
            if (tholibahData) {
                setTholibahList(tholibahData);
            }

            const { data: schedulesData } = await supabase.from('rqs_jadwal_kelas').select('*');
            if (schedulesData) {
                const formattedSchedules = schedulesData.map(s => ({
                    id: s.id,
                    classId: s.class_id,
                    className: s.class_name,
                    date: s.date,
                    startTime: s.start_time,
                    endTime: s.end_time,
                    materi: s.materi,
                    pengajar: s.pengajar
                }));
                setSchedules(formattedSchedules);
            }

            const today = getLocalDateString();
            const savedAbsen = localStorage.getItem(`rqs_absen_${today}`);
            if (savedAbsen) {
                setAbsenRecord(JSON.parse(savedAbsen));
            }

            const savedTeacherPresent = localStorage.getItem(`rqs_teacher_present_${today}`);
            if (savedTeacherPresent) {
                setTeacherPresentRecord(JSON.parse(savedTeacherPresent));
            }
        };

        loadData();
        window.addEventListener('storage', loadData);
        window.addEventListener('rqs-classes-updated', loadData);
        window.addEventListener('rqs-pengajar-updated', loadData);
        window.addEventListener('rqs-jadwal-updated', loadData);
        window.addEventListener('rqs-tholibah-updated', loadData);
        return () => {
            window.removeEventListener('storage', loadData);
            window.removeEventListener('rqs-classes-updated', loadData);
            window.removeEventListener('rqs-pengajar-updated', loadData);
            window.removeEventListener('rqs-jadwal-updated', loadData);
            window.removeEventListener('rqs-tholibah-updated', loadData);
        };
    }, []);

    const getClassTeachers = (classId) => {
        const teachers = pengajarList.filter(p => p.classes && p.classes.includes(classId));
        if (teachers.length === 0) return 'Belum ada pengajar';
        return teachers.map(p => (p.gender === 'ustadz' ? 'Ust. ' : 'Ustzh. ') + p.name).join(', ');
    };

    const getActiveSchedule = (clsId) => {
        const todayStr = getLocalDateString();
        const now = new Date();
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

        const classSchedules = schedules.filter(s => s.classId === clsId);
        if (classSchedules.length === 0) return null;
        
        let active = classSchedules.find(s => {
            if (s.date === todayStr) {
                const endParts = s.endTime.split(':');
                const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
                return currentTotalMinutes < endMin;
            }
            return false;
        });

        return active || null;
    };

    useEffect(() => {
        const updateProgress = () => {
            const now = new Date();
            const todayStr = getLocalDateString(now);
            const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

            let currentAbsen = null;
            let absenChanged = false;
            try {
                const saved = localStorage.getItem(`rqs_absen_${todayStr}`);
                if (saved) currentAbsen = JSON.parse(saved);
            } catch(e) {}

            const newProgressMap = {};

            classesList.forEach(cls => {
                // Find today's schedule explicitly for attendance clearing logic
                const todaySchedule = schedules.find(s => s.classId === cls.id && s.date === todayStr);
                
                if (todaySchedule) {
                    const endParts = todaySchedule.endTime.split(':');
                    const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

                    if (currentTotalMinutes >= endMin) {
                        newProgressMap[cls.id] = 0; // Class ended, reset to 0
                        // Class has ended, clear attendance for this class
                        if (currentAbsen) {
                            Object.keys(currentAbsen).forEach(userId => {
                                const userAbsen = currentAbsen[userId];
                                if (Array.isArray(userAbsen) && userAbsen.includes(cls.id)) {
                                    currentAbsen[userId] = userAbsen.filter(id => id !== cls.id);
                                    absenChanged = true;
                                }
                            });
                        }
                    } else {
                        const teacherArrivedStr = teacherPresentRecord[cls.id];
                        if (teacherArrivedStr) {
                            const startParts = teacherArrivedStr.split(':');
                            const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
                            
                            if (currentTotalMinutes <= startMin) {
                                newProgressMap[cls.id] = 1;
                            } else {
                                const totalDuration = endMin - startMin;
                                const elapsed = currentTotalMinutes - startMin;
                                let perc = Math.floor((elapsed / totalDuration) * 100);
                                if (perc < 1) perc = 1;
                                if (perc > 100) perc = 100;
                                newProgressMap[cls.id] = perc;
                            }
                        } else {
                            newProgressMap[cls.id] = 0;
                        }
                    }
                } else {
                    newProgressMap[cls.id] = 0;
                }
            });
            setProgressMap(newProgressMap);
            
            if (absenChanged && currentAbsen) {
                setAbsenRecord(currentAbsen);
                localStorage.setItem(`rqs_absen_${todayStr}`, JSON.stringify(currentAbsen));
            } else {
                // Sync absenRecord state with today's localStorage to handle midnight rollover efficiently
                setAbsenRecord(prev => {
                    const next = currentAbsen || {};
                    return JSON.stringify(prev) !== JSON.stringify(next) ? next : prev;
                });
            }

            // Sync teacherPresentRecord state with today's localStorage efficiently
            try {
                const savedTeacher = localStorage.getItem(`rqs_teacher_present_${todayStr}`);
                const parsedTeacher = savedTeacher ? JSON.parse(savedTeacher) : {};
                setTeacherPresentRecord(prev => {
                    return JSON.stringify(prev) !== JSON.stringify(parsedTeacher) ? parsedTeacher : prev;
                });
            } catch(e) {}
        };

        updateProgress();
        const interval = setInterval(updateProgress, 10000);
        return () => clearInterval(interval);
    }, [schedules, teacherPresentRecord, classesList]);

    const myTholibahData = tholibahList.find(t => t.id === currentUser?.id);
    const myClasses = myTholibahData?.classes || [];
    const isMyClass = currentUser?.role === 'management' ? true : myClasses.includes(selectedClass?.id);

    const handlePlayClick = () => {
        if (!isMyClass) {
            setShowNotRegisteredPopup(true);
            setTimeout(() => setShowNotRegisteredPopup(false), 3000);
            return;
        }

        const today = getLocalDateString();
        const activeSchedule = getActiveSchedule(selectedClass.id);
        
        if (!activeSchedule || activeSchedule.date !== today) {
            alert("Tidak ada jadwal kelas hari ini. Silakan periksa kembali nanti atau hubungi pengajar.");
            return;
        }

        const currentAbsen = JSON.parse(localStorage.getItem(`rqs_absen_${today}`) || '{}');
        const existing = currentAbsen[currentUser?.id];
        const hasAbsened = Array.isArray(existing) ? existing.includes(selectedClass.id) : !!existing;

        // Management automatically bypasses absen POPUP
        if (currentUser?.role === 'management' || hasAbsened) {
            setInClassView(true);
        } else {
            setShowAbsenPopup(true);
        }
    };

    const handleAbsenSubmit = () => {
        const today = getLocalDateString();
        const existing = absenRecord[currentUser?.id] || [];
        const newArr = Array.isArray(existing) ? existing : [];
        if (!newArr.includes(selectedClass.id)) newArr.push(selectedClass.id);
        const newAbsen = { ...absenRecord, [currentUser?.id]: newArr };
        
        setAbsenRecord(newAbsen);
        localStorage.setItem(`rqs_absen_${today}`, JSON.stringify(newAbsen));
        
        setShowAbsenPopup(false);
        setInClassView(true);
    };

    const handleManagementAbsen = () => {
        const today = getLocalDateString();
        const existing = absenRecord[currentUser?.id] || [];
        const newArr = Array.isArray(existing) ? existing : [];
        if (!newArr.includes(selectedClass.id)) newArr.push(selectedClass.id);
        const newAbsen = { ...absenRecord, [currentUser?.id]: newArr };
        
        setAbsenRecord(newAbsen);
        localStorage.setItem(`rqs_absen_${today}`, JSON.stringify(newAbsen));
        alert("Berhasil absen masuk di kelas ini.");
    };

    const handleTeacherPresent = () => {
        const today = getLocalDateString();
        const currentTime = new Date().toTimeString().substring(0, 5);
        const newRecord = { ...teacherPresentRecord, [selectedClass.id]: currentTime };
        setTeacherPresentRecord(newRecord);
        localStorage.setItem(`rqs_teacher_present_${today}`, JSON.stringify(newRecord));
    };

    const handleKickStudent = (studentId) => {
        if (!window.confirm("Keluarkan tholibah ini dari daftar hadir?")) return;
        const today = getLocalDateString();
        const existing = absenRecord[studentId] || [];
        const newArr = Array.isArray(existing) ? existing.filter(id => id !== selectedClass.id) : [];
        const newAbsen = { ...absenRecord, [studentId]: newArr };
        
        setAbsenRecord(newAbsen);
        localStorage.setItem(`rqs_absen_${today}`, JSON.stringify(newAbsen));
    };

    const renderClassDetail = () => {
        const allUsers = JSON.parse(localStorage.getItem('rqs_users') || '[]');
        const managementAttendees = allUsers
            .filter(u => u.role === 'management' && absenRecord[u.id] && (Array.isArray(absenRecord[u.id]) ? absenRecord[u.id].includes(selectedClass.id) : true))
            .map(u => ({ id: u.id, name: u.nama, role: 'Management' }));
            
        const studentsInClass = tholibahList
            .filter(t => t.classes && t.classes.includes(selectedClass.id))
            .map(t => ({ ...t, role: 'Tholibah' }));
            
        const allAttendees = [...managementAttendees, ...studentsInClass];
        const activeSchedule = getActiveSchedule(selectedClass.id);

        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="pb-28 min-h-screen bg-[#FDFBF7]">
                <div className="p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setInClassView(false)} className="p-2 -ml-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                            <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Ruang Kelas</h2>
                            <p className="text-[10px] text-[#B88A44] font-medium">{selectedClass.name}</p>
                        </div>
                    </div>
                </div>

                <div className="px-5 mt-6">
                    <div className={`p-5 rounded-3xl mb-6 shadow-sm border border-[#E8D2A6]/30 ${selectedClass.color.split(' ')[0]} ${selectedClass.color.split(' ')[1]} relative overflow-hidden`}>
                        <PhosphorIcon icon="books" size={80} className="absolute -right-5 -bottom-5 opacity-20" weight="fill" />
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-1">{selectedClass.name}</h3>
                            <p className="text-xs opacity-90 mb-2">{activeSchedule ? activeSchedule.materi : selectedClass.desc}</p>
                            {activeSchedule && (
                                <p className="text-[10px] bg-black/20 text-white inline-block px-2 py-1 rounded-md mb-3 font-medium">
                                    <PhosphorIcon icon="clock" className="inline mr-1" />
                                    {activeSchedule.startTime} - {activeSchedule.endTime}
                                </p>
                            )}
                            <br />
                            <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl inline-block border border-white/50 mt-1">
                                <p className="text-[10px] font-bold text-[#4A1C14] flex items-center gap-1.5">
                                    <PhosphorIcon icon="chalkboard-teacher" size={14} /> {getClassTeachers(selectedClass.id)}
                                </p>
                            </div>
                            
                            <div className="mt-3">
                                {!teacherPresentRecord[selectedClass.id] ? (
                                    <button onClick={handleTeacherPresent} className="bg-white text-[#4A1C14] hover:bg-gray-50 text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm border border-[#E8D2A6]/50 transition-colors active:scale-95">
                                        <PhosphorIcon icon="hand-waving" size={16} className="text-[#B88A44]" weight="fill" />
                                        Pengajar Hadir di Kelas Ini
                                    </button>
                                ) : (
                                    <div className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-2 inline-flex border border-emerald-400">
                                        <PhosphorIcon icon="check-circle" size={16} weight="fill" />
                                        Kelas Sedang Berjalan Sejak {teacherPresentRecord[selectedClass.id]}
                                    </div>
                                )}
                                
                                {currentUser?.role === 'management' && (
                                    <div className="mt-2">
                                        {Array.isArray(absenRecord[currentUser?.id]) && absenRecord[currentUser?.id].includes(selectedClass.id) ? (
                                            <div className="bg-blue-500/10 text-blue-700 text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-2 inline-flex border border-blue-200">
                                                <PhosphorIcon icon="check-circle" size={16} weight="fill" />
                                                Anda sudah absen di kelas ini
                                            </div>
                                        ) : (
                                            <button onClick={handleManagementAbsen} className="bg-[#B88A44] text-white hover:bg-[#9c7438] text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm border border-[#9c7438] transition-colors active:scale-95">
                                                <PhosphorIcon icon="hand-pointing" size={16} weight="fill" />
                                                Absen Masuk di Kelas Ini
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4 border-b border-[#E8D2A6]/30 pb-2">
                        <h4 className="font-bold text-[#4A1C14] text-sm flex items-center gap-2">
                            <PhosphorIcon icon="users" size={18} className="text-[#B88A44]" /> 
                            Daftar Hadir
                        </h4>
                        <span className="text-[10px] bg-[#FCF7E8] text-[#B88A44] font-bold px-2 py-1 rounded-md border border-[#E8D2A6]">
                            {allAttendees.filter(s => Array.isArray(absenRecord[s.id]) ? absenRecord[s.id].includes(selectedClass.id) : !!absenRecord[s.id]).length} / {allAttendees.length} Hadir
                        </span>
                    </div>

                    {allAttendees.length === 0 ? (
                        <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-[#E8D2A6]">
                            <p className="text-[11px] text-[#4A1C14]/60">Belum ada peserta yang terdaftar di kelas ini.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {allAttendees.map(student => {
                                const isPresent = Array.isArray(absenRecord[student.id]) ? absenRecord[student.id].includes(selectedClass.id) : !!absenRecord[student.id];
                                return (
                                    <div key={student.id} className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#FCF7E8] text-[#B88A44] rounded-full flex items-center justify-center font-bold overflow-hidden">
                                                {student.avatarData || student.avatar_url ? (
                                                    <img src={student.avatarData || student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    student.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#4A1C14] text-[13px] leading-tight flex items-center flex-wrap gap-1">
                                                    {student.name}
                                                    {student.id === currentUser?.id && (
                                                        <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Anda</span>
                                                    )}
                                                </h4>
                                                <p className="text-[9px] text-[#B88A44] font-semibold mt-0.5">{student.role}</p>
                                            </div>
                                        </div>
                                        <div>
                                            {isPresent ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-emerald-100 shadow-sm">
                                                        <PhosphorIcon icon="check-circle" size={14} weight="fill" /> Hadir
                                                    </div>
                                                    {currentUser?.role === 'management' && student.id !== currentUser?.id && (
                                                        <button onClick={() => handleKickStudent(student.id)} title="Keluarkan dari daftar hadir" className="bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1.5 rounded-lg border border-red-200 transition-colors">
                                                            <PhosphorIcon icon="x-circle" size={14} weight="fill" />
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 text-gray-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-gray-200">
                                                    <PhosphorIcon icon="minus-circle" size={14} /> Belum Hadir
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    if (!selectedClass) return <div className="p-5 text-center mt-10 text-gray-500">Memuat data kelas...</div>;

    if (inClassView) return renderClassDetail();

    const activeSchedule = getActiveSchedule(selectedClass.id);
    const todayStr = getLocalDateString();
    const currentProgress = progressMap[selectedClass.id] || 0;

    return (
        <div className="pb-28 h-full flex flex-col animate-in fade-in duration-500 bg-[#FDFBF7] overflow-x-hidden min-h-screen">
            <div className="p-5 bg-white shadow-sm sticky top-0 z-10 border-b border-[#E8D2A6]/30">
                <h2 className="text-xl font-bold text-[#4A1C14]">Pendidikan</h2>
                <p className="text-sm text-[#B88A44] font-medium">Temukan kelas dan materi Anda</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative mt-4">
                <PhosphorIcon icon="bird" size={32} weight="fill" className="absolute top-5 left-6 text-[#E8D2A6] transform -scale-x-100 rotate-12" />
                <PhosphorIcon icon="sparkle" size={24} weight="fill" className="absolute top-20 right-8 text-[#B88A44]" />

                <div className="relative w-full max-w-[260px] mt-6">
                    <div className="absolute inset-0 bg-[#F5EBE9] rounded-[2.5rem] transform -rotate-6 scale-95 shadow-inner"></div>
                    <motion.div 
                        key={selectedClass.id}
                        initial={{ scale: 0.9, y: 15, rotate: 0 }}
                        animate={{ scale: 1, y: 0, rotate: 3 }}
                        whileHover={{ rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                        className="relative w-full aspect-[3/4] rounded-[2.5rem] shadow-xl p-6 flex flex-col items-center justify-center text-center bg-white border border-[#F5EBE9]"
                    >
                        {/* Indicator Terdaftar / Bukan */}
                        <div className="absolute top-5 left-0 w-full flex justify-center z-20">
                            {isMyClass ? (
                                <div className="bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-white">
                                    <PhosphorIcon icon={currentUser?.role === 'management' ? "shield-check" : "check-circle"} size={14} weight="fill" /> 
                                    {currentUser?.role === 'management' ? 'Akses Management' : 'Kelas Anda'}
                                </div>
                            ) : (
                                <div className="bg-gray-100 text-gray-500 text-[9px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-gray-200">
                                    <PhosphorIcon icon="lock" size={14} weight="fill" /> Bukan Kelas Anda
                                </div>
                            )}
                        </div>

                        <div className={`absolute -top-10 w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 border-4 border-white ${selectedClass.color.split(' ')[0]} ${selectedClass.color.split(' ')[1]}`}>
                            <PhosphorIcon icon="book-bookmark" size={48} weight="duotone" />
                        </div>

                        <div className="mt-14 w-full">
                            <h3 className="text-xl font-bold text-[#4A1C14] leading-tight">{selectedClass.name}</h3>
                            <p className="text-[10px] text-[#B88A44] mt-1 uppercase tracking-widest font-semibold">Tingkat {selectedClass.tingkatan || 'Dasar'}</p>

                            <div className="w-full bg-[#FCF7E8] rounded-2xl p-3 mt-5 border border-[#E8D2A6]/50 text-left">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[11px] font-bold text-[#4A1C14]/70">Pengajar</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-right max-w-[120px] leading-tight ${selectedClass.color.split(' ')[0]} ${selectedClass.color.split(' ')[1]}`}>
                                        {getClassTeachers(selectedClass.id)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-[#4A1C14]/70">Tholibah Terdaftar</span>
                                    <span className="text-[10px] font-bold text-[#4A1C14] bg-white px-2 py-0.5 rounded-md shadow-sm border border-[#E8D2A6]/30">
                                        {tholibahList.filter(t => t.classes && t.classes.includes(selectedClass.id)).length} Orang
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center mt-2 border-t border-[#E8D2A6]/50 pt-2">
                                    <span className="text-[11px] font-bold text-[#4A1C14]/70">Jadwal Masuk</span>
                                    {activeSchedule ? (
                                        <span className="text-[9px] font-bold text-white bg-[#4A1C14] px-2 py-0.5 rounded-md shadow-sm text-right flex items-center gap-1">
                                            <PhosphorIcon icon="calendar-blank" size={10} />
                                            {activeSchedule.date === todayStr ? 'Hari Ini' : activeSchedule.date} • {activeSchedule.startTime}-{activeSchedule.endTime}
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md text-right">Belum Ada Jadwal</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 text-left w-full">
                                <div className="flex justify-between text-[10px] font-bold text-[#B88A44] mb-1.5">
                                    <span>Progres Kelas</span>
                                    <span>{currentProgress}%</span>
                                </div>
                                <div className="w-full bg-[#F5EBE9] h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-[#4A1C14] h-full rounded-full transition-all duration-1000" style={{ width: `${currentProgress}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handlePlayClick}
                            className="absolute -bottom-6 w-14 h-14 bg-[#B88A44] hover:bg-[#A37936] text-white rounded-full shadow-lg shadow-[#B88A44]/40 flex items-center justify-center transition-transform active:scale-95 border-4 border-[#FCF7E8]"
                        >
                            <PhosphorIcon icon="hand-waving" size={24} weight="fill" />
                        </button>
                    </motion.div>
                </div>
            </div>

            <div className="px-5 mt-6 relative">
                <h4 className="text-sm font-bold text-[#4A1C14] mb-2 px-1">Daftar Kelas RQS</h4>
                <div className="flex overflow-x-auto gap-4 pb-8 pt-4 px-1 hide-scrollbar snap-x items-center">
                    {classesList.map((cls, idx) => {
                        const rotations = ['-rotate-3', 'rotate-2', '-rotate-2', 'rotate-3', '-rotate-1', 'rotate-1', '-rotate-3'];
                        const translates = ['-translate-y-2', 'translate-y-3', '-translate-y-1', 'translate-y-2', '-translate-y-3', 'translate-y-1', '-translate-y-2'];

                        return (
                            <div
                                key={cls.id}
                                onClick={() => setSelectedClass(cls)}
                                className={`snap-start min-w-[120px] p-4 rounded-[1.25rem] border-2 cursor-pointer transition-all duration-300 transform ${rotations[idx % 7]} ${translates[idx % 7]} ${selectedClass.id === cls.id
                                    ? 'border-[#B88A44] bg-[#FCF7E8] shadow-md scale-105 z-10 rotate-0'
                                    : 'border-transparent bg-white shadow-sm hover:scale-105 hover:shadow-md hover:rotate-0'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm transform -rotate-3 ${cls.color.split(' ')[0]} ${cls.color.split(' ')[1]}`}>
                                    <PhosphorIcon icon="book-open" size={20} weight="duotone" />
                                </div>
                                <h5 className="font-bold text-[11px] text-[#4A1C14] leading-snug">{cls.name}</h5>
                                <p className="text-[9px] text-[#4A1C14]/60 mt-1 font-medium line-clamp-2 leading-tight">{cls.desc}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Popup Tidak Terdaftar */}
            <AnimatePresence>
                {showNotRegisteredPopup && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-24 left-5 right-5 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="bg-red-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border-2 border-white pointer-events-auto">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <PhosphorIcon icon="lock-key" size={20} weight="fill" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[13px] leading-tight">Akses Ditolak</h4>
                                <p className="text-[10px] text-white/90">Anda tidak terdaftar di kelas {selectedClass.name}.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Popup Absen Masuk */}
            <AnimatePresence>
                {showAbsenPopup && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PhosphorIcon icon="hand-palm" size={40} weight="duotone" />
                            </div>
                            <h3 className="text-xl font-bold text-[#4A1C14] mb-2">Absensi Kelas</h3>
                            <p className="text-xs text-gray-500 mb-6">Silakan ketuk tombol di bawah ini untuk mencatat kehadiran Anda di kelas <b>{selectedClass.name}</b> hari ini.</p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowAbsenPopup(false)}
                                    className="flex-1 py-3.5 rounded-xl border-2 border-[#E8D2A6] text-[#4A1C14] font-bold text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Nanti
                                </button>
                                <button 
                                    onClick={handleAbsenSubmit}
                                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                                >
                                    Absen Masuk
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PendidikanScreen;
