import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { CLASSES } from './MockData';

const KelolaTholibah = ({ onBack }) => {
    const [tholibahList, setTholibahList] = useState([]);
    const [viewMode, setViewMode] = useState('main'); // 'main', 'class_detail', 'student_detail'
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [studentToAssign, setStudentToAssign] = useState(null);

    // Dummy Setoran & Absensi untuk detail tholibah (mocking)
    const [dummyStats, setDummyStats] = useState({ absensi: 85, setoranCount: 12 });

    const loadTholibah = () => {
        const savedTholibah = JSON.parse(localStorage.getItem('rqs_tholibah') || '[]');
        const savedUsers = JSON.parse(localStorage.getItem('rqs_users') || '[]');

        let updated = false;
        const currentList = [...savedTholibah];

        savedUsers.forEach(u => {
            if (u.role === 'tholibah' && u.verified !== false) {
                const exists = currentList.find(t => t.id === u.id || t.phone === u.phone || t.name === u.nama);
                if (!exists) {
                    currentList.push({
                        id: u.id,
                        name: u.nama,
                        phone: u.phone,
                        classId: null,
                        joined: new Date().toISOString().split('T')[0],
                        tanggalLahir: u.tanggalLahir,
                        tempatLahir: u.tempatLahir
                    });
                    updated = true;
                }
            }
        });

        if (currentList.length === 0) {
            const initialData = [
                { id: '1', name: 'Aisyah Putri', phone: '081234567890', classId: null, joined: '2026-06-20', tempatLahir: 'Bogor', tanggalLahir: '2000-01-12' },
                { id: '2', name: 'Siti Aminah', phone: '081298765432', classId: null, joined: '2026-06-25', tempatLahir: 'Jakarta', tanggalLahir: '2001-05-20' },
                { id: '3', name: 'Fatimah Az-Zahra', phone: '081311112222', classId: 'tahsin_pemula', joined: '2026-01-10', tempatLahir: 'Depok', tanggalLahir: '1998-11-05' },
                { id: '4', name: 'Khadijah', phone: '081333334444', classId: 'tahsin_teori', joined: '2026-02-15', tempatLahir: 'Bekasi', tanggalLahir: '1995-08-17' },
                { id: '5', name: 'Zainab', phone: '081455556666', classId: 'tahfidz', joined: '2025-10-05', tempatLahir: 'Bandung', tanggalLahir: '2002-03-30' },
            ];
            currentList.push(...initialData);
            updated = true;
        }

        if (updated) {
            localStorage.setItem('rqs_tholibah', JSON.stringify(currentList));
        }
        
        setTholibahList(currentList);
    };

    const calculateAge = (dob) => {
        if (!dob) return '-';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age + ' Tahun';
    };

    useEffect(() => {
        loadTholibah();
    }, []);

    const saveTholibah = (newList) => {
        setTholibahList(newList);
        localStorage.setItem('rqs_tholibah', JSON.stringify(newList));
    };

    const handleAssignClass = (classId) => {
        if (!studentToAssign) return;
        const newList = tholibahList.map(t => 
            t.id === studentToAssign.id ? { ...t, classId: classId } : t
        );
        saveTholibah(newList);
        setIsAssignModalOpen(false);
        setStudentToAssign(null);
    };

    const openAssignModal = (student) => {
        setStudentToAssign(student);
        setIsAssignModalOpen(true);
    };

    const getUnassignedTholibah = () => tholibahList.filter(t => !t.classId);
    const getTholibahByClass = (classId) => tholibahList.filter(t => t.classId === classId);

    const renderMainView = () => (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 mt-4 space-y-6">
            {/* Unassigned Students Section */}
            {getUnassignedTholibah().length > 0 && (
                <div>
                    <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2 border-b border-red-200 pb-2">
                        <PhosphorIcon icon="warning-circle" size={18} weight="fill" />
                        Pendaftar Baru (Belum Masuk Kelas)
                    </h3>
                    <div className="space-y-3">
                        {getUnassignedTholibah().map(student => (
                            <div key={student.id} className="bg-white p-3 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-bold">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#4A1C14] text-sm">{student.name}</h4>
                                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <PhosphorIcon icon="phone" size={12} /> {student.phone}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => openAssignModal(student)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                                >
                                    Masukkan Kelas
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Classes Section */}
            <div>
                <h3 className="font-bold text-[#4A1C14] mb-3 flex items-center gap-2 border-b border-[#E8D2A6]/50 pb-2">
                    <PhosphorIcon icon="books" size={18} className="text-[#B88A44]" />
                    Daftar Kelas RQS
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {CLASSES.map(cls => {
                        const studentsInClass = getTholibahByClass(cls.id).length;
                        return (
                            <div 
                                key={cls.id}
                                onClick={() => {
                                    setSelectedClass(cls);
                                    setViewMode('class_detail');
                                }}
                                className={`p-4 rounded-2xl shadow-sm border cursor-pointer hover:scale-[1.02] transition-transform ${cls.color.split(' ')[0]} border-[#E8D2A6]/30 flex flex-col items-center justify-center text-center h-28 relative overflow-hidden`}
                            >
                                <PhosphorIcon icon="chalkboard-teacher" size={32} className="opacity-20 absolute -right-2 -bottom-2" />
                                <h4 className={`font-bold text-[13px] leading-tight mb-1 z-10 ${cls.color.split(' ')[1]}`}>{cls.name}</h4>
                                <div className="bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-md mt-1 z-10 border border-white/50">
                                    <span className="text-[10px] font-bold text-[#4A1C14]">{studentsInClass} Tholibah</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );

    const renderClassDetail = () => {
        if (!selectedClass) return null;
        const students = getTholibahByClass(selectedClass.id);

        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 mt-4">
                <div className={`p-5 rounded-3xl mb-5 shadow-sm border border-[#E8D2A6]/30 ${selectedClass.color.split(' ')[0]} ${selectedClass.color.split(' ')[1]} flex items-center justify-between`}>
                    <div>
                        <h3 className="font-bold text-lg mb-1">{selectedClass.name}</h3>
                        <p className="text-[11px] opacity-80">{selectedClass.desc}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <PhosphorIcon icon="users" size={24} />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-3 border-b border-[#E8D2A6]/30 pb-2">
                    <h4 className="font-bold text-[#4A1C14] text-sm">Daftar Tholibah ({students.length})</h4>
                </div>

                {students.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-[#E8D2A6]">
                        <PhosphorIcon icon="users-slash" size={32} className="mx-auto text-[#B88A44]/50 mb-2" />
                        <p className="text-[#4A1C14]/60 text-[11px]">Belum ada tholibah di kelas ini.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {students.map(student => (
                            <div key={student.id} className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#FCF7E8] text-[#B88A44] rounded-full flex items-center justify-center font-bold">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#4A1C14] text-[13px]">{student.name}</h4>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{student.phone}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedStudent(student);
                                        // Randomize mock stats slightly for realism
                                        setDummyStats({ absensi: 75 + Math.floor(Math.random() * 25), setoranCount: Math.floor(Math.random() * 20) });
                                        setViewMode('student_detail');
                                    }}
                                    className="text-[10px] font-bold text-[#B88A44] bg-[#FCF7E8] px-3 py-1.5 rounded-lg border border-[#E8D2A6] hover:bg-[#B88A44] hover:text-white transition-colors flex items-center gap-1"
                                >
                                    Kelola <PhosphorIcon icon="caret-right" size={12} weight="bold" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        );
    };

    const renderStudentDetail = () => {
        if (!selectedStudent) return null;
        
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 mt-4 pb-10">
                {/* Profile Card */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#E8D2A6]/50 relative overflow-hidden mb-5">
                    <div className="absolute top-0 left-0 w-full h-16 bg-[#B88A44]"></div>
                    <div className="relative z-10 flex flex-col items-center mt-4">
                        <div className="w-20 h-20 bg-white border-4 border-white rounded-full shadow-md flex items-center justify-center text-3xl font-bold text-[#B88A44] bg-gradient-to-br from-[#FCF7E8] to-[#E8D2A6]">
                            {selectedStudent.name.charAt(0)}
                        </div>
                        <h3 className="font-bold text-[#4A1C14] text-lg mt-3">{selectedStudent.name}</h3>
                        <p className="text-xs text-gray-500">{selectedStudent.phone}</p>
                        {selectedStudent.tanggalLahir && (
                            <p className="text-[11px] font-bold text-[#B88A44] bg-[#FCF7E8] px-2 py-0.5 mt-1 rounded border border-[#E8D2A6]/50">
                                Usia: {calculateAge(selectedStudent.tanggalLahir)} ({selectedStudent.tempatLahir})
                            </p>
                        )}
                        
                        <div className="mt-4 flex gap-2 w-full">
                            <button 
                                onClick={() => openAssignModal(selectedStudent)}
                                className="flex-1 bg-white border border-[#E8D2A6] py-2 rounded-xl text-[11px] font-bold text-[#4A1C14] flex items-center justify-center gap-1 hover:bg-gray-50"
                            >
                                <PhosphorIcon icon="arrows-left-right" size={14} /> Pindah Kelas
                            </button>
                            <button className="flex-1 bg-white border border-red-200 py-2 rounded-xl text-[11px] font-bold text-red-600 flex items-center justify-center gap-1 hover:bg-red-50">
                                <PhosphorIcon icon="trash" size={14} /> Keluarkan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <h4 className="font-bold text-[#4A1C14] text-sm mb-3">Statistik Tholibah</h4>
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                        <PhosphorIcon icon="calendar-check" size={24} className="text-blue-500 mb-1" weight="duotone" />
                        <span className="text-2xl font-bold text-blue-700">{dummyStats.absensi}%</span>
                        <span className="text-[10px] font-bold text-blue-600/70">Kehadiran</span>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                        <PhosphorIcon icon="books" size={24} className="text-emerald-500 mb-1" weight="duotone" />
                        <span className="text-2xl font-bold text-emerald-700">{dummyStats.setoranCount}</span>
                        <span className="text-[10px] font-bold text-emerald-600/70">Kali Setoran</span>
                    </div>
                </div>

                {/* Action Menus */}
                <h4 className="font-bold text-[#4A1C14] text-sm mb-3">Menu Kelola</h4>
                <div className="space-y-3">
                    <button className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                                <PhosphorIcon icon="list-checks" size={20} weight="fill" />
                            </div>
                            <div className="text-left">
                                <h5 className="font-bold text-[#4A1C14] text-sm">Lihat Detail Absensi</h5>
                                <p className="text-[10px] text-gray-500">Riwayat kehadiran per pertemuan</p>
                            </div>
                        </div>
                        <PhosphorIcon icon="caret-right" size={16} className="text-gray-400" />
                    </button>
                    
                    <button className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <PhosphorIcon icon="microphone-stage" size={20} weight="fill" />
                            </div>
                            <div className="text-left">
                                <h5 className="font-bold text-[#4A1C14] text-sm">Lihat Riwayat Setoran</h5>
                                <p className="text-[10px] text-gray-500">Nilai dan catatan hafalan</p>
                            </div>
                        </div>
                        <PhosphorIcon icon="caret-right" size={16} className="text-gray-400" />
                    </button>

                    <button className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                                <PhosphorIcon icon="money" size={20} weight="fill" />
                            </div>
                            <div className="text-left">
                                <h5 className="font-bold text-[#4A1C14] text-sm">Catatan Infaq/SPP</h5>
                                <p className="text-[10px] text-gray-500">Status pembayaran bulanan</p>
                            </div>
                        </div>
                        <PhosphorIcon icon="caret-right" size={16} className="text-gray-400" />
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button 
                    onClick={() => {
                        if (viewMode === 'student_detail') {
                            setViewMode('class_detail');
                            setSelectedStudent(null);
                        } else if (viewMode === 'class_detail') {
                            setViewMode('main');
                            setSelectedClass(null);
                        } else {
                            onBack();
                        }
                    }} 
                    className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors"
                >
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">
                        {viewMode === 'main' && 'Kelola Tholibah'}
                        {viewMode === 'class_detail' && 'Detail Kelas'}
                        {viewMode === 'student_detail' && 'Profil Tholibah'}
                    </h2>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'main' && <motion.div key="main">{renderMainView()}</motion.div>}
                {viewMode === 'class_detail' && <motion.div key="class">{renderClassDetail()}</motion.div>}
                {viewMode === 'student_detail' && <motion.div key="student">{renderStudentDetail()}</motion.div>}
            </AnimatePresence>

            {/* Modal Masukkan Kelas */}
            <AnimatePresence>
                {isAssignModalOpen && studentToAssign && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center backdrop-blur-sm sm:items-center p-4"
                    >
                        <motion.div 
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
                        >
                            <div className="p-5 bg-white border-b border-[#E8D2A6]/30 flex flex-col sticky top-0 z-10">
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden"></div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-[#4A1C14]">Pilih Kelas</h3>
                                        <p className="text-[11px] text-gray-500 mt-0.5">Untuk {studentToAssign.name}</p>
                                    </div>
                                    <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-2">
                                        <PhosphorIcon icon="x" size={16} weight="bold" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-5 overflow-y-auto bg-[#FDFBF7] flex-1 space-y-3">
                                {CLASSES.map(cls => (
                                    <button 
                                        key={cls.id}
                                        onClick={() => handleAssignClass(cls.id)}
                                        className={`w-full text-left p-4 rounded-xl border border-[#E8D2A6]/50 hover:border-[#B88A44] hover:bg-[#FCF7E8] transition-all flex items-center justify-between bg-white shadow-sm`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cls.color.split(' ')[0]} ${cls.color.split(' ')[1]}`}>
                                                <PhosphorIcon icon="books" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#4A1C14] text-sm">{cls.name}</h4>
                                                <p className="text-[10px] text-gray-500 line-clamp-1">{cls.desc}</p>
                                            </div>
                                        </div>
                                        <PhosphorIcon icon="caret-right" size={16} className="text-[#B88A44]" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KelolaTholibah;
