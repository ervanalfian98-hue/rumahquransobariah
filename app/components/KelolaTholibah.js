import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { CLASSES as INITIAL_CLASSES } from './MockData';
import { supabase } from '../lib/supabaseClient';

const KelolaTholibah = ({ onBack }) => {
    const [tholibahList, setTholibahList] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [viewMode, setViewMode] = useState('main'); // 'main', 'class_detail', 'student_detail', 'absen_detail', 'setoran_detail', 'infaq_detail'
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [studentToAssign, setStudentToAssign] = useState(null);
    const [selectedClassesForAssign, setSelectedClassesForAssign] = useState([]);

    const [studentStats, setStudentStats] = useState({ absensiList: [], setoranList: [] });

    useEffect(() => {
        const loadTholibah = async () => {
            const { data: savedTholibah } = await supabase.from('rqs_tholibah').select('*');
            const { data: savedUsers } = await supabase.from('profiles').select('*').in('role', ['tholibah', 'alumni']).eq('verified', true);

            const currentList = savedTholibah ? savedTholibah.map(t => ({...t, tanggalLahir: t.tanggal_lahir, tempatLahir: t.tempat_lahir})) : [];
            let updatedList = [...currentList];
            let hasNew = false;

            savedUsers?.forEach(u => {
                const exists = updatedList.find(t => t.id === u.id);
                let changed = false;
                
                if (!exists) {
                    updatedList.push({
                        id: u.id,
                        name: u.nama,
                        phone: u.phone,
                        email: u.email,
                        classes: u.role === 'alumni' ? ['alumni'] : [],
                        joined: new Date().toISOString().split('T')[0],
                        tanggalLahir: u.tanggalLahir,
                        tempatLahir: u.tempatLahir,
                        role: u.role
                    });
                    hasNew = true;
                } else {
                    if (exists.role !== u.role) {
                        exists.role = u.role;
                        if (u.role === 'alumni') exists.classes = ['alumni'];
                        changed = true;
                    }
                    if (!exists.email && u.email) {
                        exists.email = u.email;
                        changed = true;
                    }
                    if (!exists.tempatLahir && u.tempatLahir) {
                        exists.tempatLahir = u.tempatLahir;
                        changed = true;
                    }
                    if (!exists.tanggalLahir && u.tanggalLahir) {
                        exists.tanggalLahir = u.tanggalLahir;
                        changed = true;
                    }
                    if (changed) hasNew = true;
                }
            });

            if (hasNew) {
                const toUpsert = updatedList.map(t => ({
                    id: t.id, name: t.name, phone: t.phone, classes: t.classes, joined: t.joined, role: t.role
                }));
                const { error } = await supabase.from('rqs_tholibah').upsert(toUpsert);
                if (error) console.error("Error upserting new tholibah:", error);
            }
            setTholibahList(updatedList);
        };

        const loadClasses = async () => {
            const { data } = await supabase.from('rqs_classes').select('*');
            if (data) {
                setClassesList(data.length > 0 ? data : INITIAL_CLASSES);
            } else {
                setClassesList(INITIAL_CLASSES);
            }
        };

        loadTholibah();
        loadClasses();

        window.addEventListener('storage', () => {
            loadTholibah();
            loadClasses();
        });
        window.addEventListener('rqs-classes-updated', loadClasses);
        
        return () => {
            window.removeEventListener('storage', loadTholibah);
            window.removeEventListener('rqs-classes-updated', loadClasses);
        };
    }, []);

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

    const fetchStudentStats = async (student) => {
        const absensiList = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('rqs_absen_')) {
                const date = key.replace('rqs_absen_', '');
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data[student.id]) {
                        const isHadir = Array.isArray(data[student.id]) ? data[student.id].length > 0 : !!data[student.id];
                        if (isHadir) {
                            if (Array.isArray(data[student.id])) {
                                data[student.id].forEach(cId => {
                                    absensiList.push({ date, classId: cId });
                                });
                            } else {
                                absensiList.push({ date, classId: null });
                            }
                        }
                    }
                } catch(e) {}
            }
        }
        absensiList.sort((a,b) => new Date(b.date) - new Date(a.date));

        try {
            const { data: allSetoran } = await supabase.from('rqs_setoran_hafalan').select('*').or(`tholibah_id.eq.${student.id},user_id.eq.${student.id}`);
            if (allSetoran) {
                setoranList.push(...allSetoran);
            }
        } catch(e) {}
        setoranList.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));

        setStudentStats({ absensiList, setoranList });
    };

    const saveTholibah = async (newList) => {
        setTholibahList(newList);
        const toUpsert = newList.map(t => ({
            id: t.id, name: t.name, phone: t.phone, classes: t.classes, joined: t.joined, role: t.role
        }));
        const { error } = await supabase.from('rqs_tholibah').upsert(toUpsert);
        if (error) {
            console.error("Error saving tholibah classes:", error);
            alert("Gagal menyimpan ke Supabase!");
        }
        window.dispatchEvent(new Event('rqs-tholibah-updated'));
    };

    const handleSaveAssignClasses = async () => {
        if (!studentToAssign) return;

        let shouldUpdateUserRole = studentToAssign.role === 'alumni';
        
        if (shouldUpdateUserRole) {
            await supabase.from('profiles').update({ role: 'tholibah' }).eq('id', studentToAssign.id);
        }

        const newList = tholibahList.map(t => 
            t.id === studentToAssign.id ? { ...t, classes: selectedClassesForAssign, role: shouldUpdateUserRole ? 'tholibah' : t.role } : t
        );
        saveTholibah(newList);

        if (selectedStudent && selectedStudent.id === studentToAssign.id) {
            setSelectedStudent({ ...selectedStudent, classes: selectedClassesForAssign, role: shouldUpdateUserRole ? 'tholibah' : selectedStudent.role });
        }

        setIsAssignModalOpen(false);
        setStudentToAssign(null);
    };

    const toggleClassForAssign = (cId) => {
        setSelectedClassesForAssign(prev => prev.includes(cId) ? prev.filter(id => id !== cId) : [...prev, cId]);
    };

    const openAssignModal = (student) => {
        setStudentToAssign(student);
        setSelectedClassesForAssign(student.classes || []);
        setIsAssignModalOpen(true);
    };

    const getUnassignedTholibah = () => tholibahList.filter(t => (!t.classes || t.classes.length === 0) && t.role !== 'alumni');
    const getTholibahByClass = (classId) => {
        if (classId === 'all_active') return tholibahList.filter(t => t.role !== 'alumni');
        return tholibahList.filter(t => t.classes && t.classes.includes(classId));
    };

    const handleMakeAlumni = async () => {
        if (!selectedStudent) return;
        if (!window.confirm(`Apakah Anda yakin ingin menjadikan ${selectedStudent.name} sebagai Alumni? Mereka akan dikeluarkan dari kelas saat ini.`)) return;

        await supabase.from('profiles').update({ role: 'alumni' }).eq('id', selectedStudent.id);

        const newList = tholibahList.map(t => 
            t.id === selectedStudent.id ? { ...t, role: 'alumni', classes: ['alumni'] } : t
        );
        saveTholibah(newList);
        
        setViewMode('main');
        setSelectedStudent(null);
        alert(`${selectedStudent.name} berhasil diubah menjadi Alumni.`);
    };

    const handlePermanentDelete = async () => {
        if (!selectedStudent) return;
        if (!window.confirm(`PERINGATAN 1: Apakah Anda yakin ingin MENGHAPUS PERMANEN akun ${selectedStudent.name}?`)) return;
        if (!window.confirm(`PERINGATAN 2: Tindakan ini tidak bisa dibatalkan! Semua data absen, setoran, dan progress akun ${selectedStudent.name} akan musnah sampai ke akarnya. Lanjutkan?`)) return;

        const finalDeleteId = selectedStudent.id;
        const targetName = selectedStudent.name;

        await supabase.from('profiles').delete().eq('id', finalDeleteId);
        
        const newList = tholibahList.filter(t => t.id !== finalDeleteId);
        setTholibahList(newList);
        await supabase.from('rqs_tholibah').delete().eq('id', finalDeleteId);

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (key.startsWith('rqs_absen_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data[finalDeleteId] !== undefined) {
                        delete data[finalDeleteId];
                        localStorage.setItem(key, JSON.stringify(data));
                    }
                } catch(e) {}
            }
            if (key.includes(finalDeleteId)) {
                localStorage.removeItem(key);
            }
        }

        await supabase.from('rqs_setoran_hafalan').delete().or(`user_id.eq.${finalDeleteId},tholibah_id.eq.${finalDeleteId}`);

        setViewMode('main');
        setSelectedStudent(null);
        window.dispatchEvent(new Event('rqs-tholibah-updated'));
        alert(`Akun ${targetName} telah dibersihkan secara permanen.`);
    };

    const renderMainView = () => (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 mt-4 space-y-6">
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

            <div>
                <h3 className="font-bold text-[#4A1C14] mb-3 flex items-center gap-2 border-b border-[#E8D2A6]/50 pb-2">
                    <PhosphorIcon icon="books" size={18} className="text-[#B88A44]" />
                    Daftar Kelas RQS
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {classesList.map(cls => {
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

            <div className="mt-8">
                <h3 className="font-bold text-[#4A1C14] mb-3 flex items-center gap-2 border-b border-[#E8D2A6]/50 pb-2">
                    <PhosphorIcon icon="graduation-cap" size={18} className="text-[#B88A44]" />
                    Daftar Alumni RQS
                </h3>
                <div 
                    onClick={() => {
                        setSelectedClass({ id: 'alumni', name: 'Daftar Alumni RQS', desc: 'Tholibah yang telah menyelesaikan pendidikan atau berpindah status', color: 'bg-emerald-50 text-emerald-700' });
                        setViewMode('class_detail');
                    }}
                    className="p-4 rounded-2xl shadow-sm border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 flex flex-col items-center justify-center text-center h-24 relative overflow-hidden"
                >
                    <PhosphorIcon icon="certificate" size={40} className="opacity-10 absolute -right-2 -bottom-2 text-emerald-700" />
                    <h4 className="font-bold text-[14px] leading-tight mb-1 z-10 text-emerald-800">Alumni RQS</h4>
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md mt-1 z-10 border border-white/50">
                        <span className="text-[11px] font-bold text-emerald-700">{getTholibahByClass('alumni').length} Alumni Terdaftar</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="font-bold text-[#4A1C14] mb-3 flex items-center gap-2 border-b border-[#E8D2A6]/50 pb-2">
                    <PhosphorIcon icon="users" size={18} className="text-[#B88A44]" />
                    Data Tholibah Aktif
                </h3>
                <div 
                    onClick={() => {
                        setSelectedClass({ id: 'all_active', name: 'Data Tholibah Aktif', desc: 'Seluruh tholibah yang masih aktif di RQS', color: 'bg-blue-50 text-blue-700' });
                        setViewMode('class_detail');
                    }}
                    className="p-4 rounded-2xl shadow-sm border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 flex flex-col items-center justify-center text-center h-24 relative overflow-hidden"
                >
                    <PhosphorIcon icon="users-three" size={40} className="opacity-10 absolute -right-2 -bottom-2 text-blue-700" />
                    <h4 className="font-bold text-[14px] leading-tight mb-1 z-10 text-blue-800">Semua Tholibah Aktif</h4>
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md mt-1 z-10 border border-white/50">
                        <span className="text-[11px] font-bold text-blue-700">{tholibahList.filter(t => t.role !== 'alumni').length} Tholibah Terdaftar</span>
                    </div>
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
                    <h4 className="font-bold text-[#4A1C14] text-sm">
                        {selectedClass.id === 'alumni' ? 'Daftar Alumni' : 'Daftar Tholibah'} ({students.length})
                    </h4>
                </div>

                {students.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-[#E8D2A6]">
                        <PhosphorIcon icon="users-slash" size={32} className="mx-auto text-[#B88A44]/50 mb-2" />
                        <p className="text-[#4A1C14]/60 text-[11px]">
                            {selectedClass.id === 'alumni' ? 'Belum ada alumni.' : selectedClass.id === 'all_active' ? 'Belum ada tholibah.' : 'Belum ada tholibah di kelas ini.'}
                        </p>
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
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {student.classes && student.classes.map(cId => {
                                                const c = classesList.find(x => x.id === cId);
                                                return c ? <span key={cId} className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${c.color.split(' ')[0]} ${c.color.split(' ')[1]}`}>{c.name}</span> : null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedStudent(student);
                                        fetchStudentStats(student);
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
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#E8D2A6]/50 relative overflow-hidden mb-5">
                    <div className="absolute top-0 left-0 w-full h-16 bg-[#B88A44]"></div>
                    <div className="relative z-10 flex flex-col items-center mt-4">
                        <div className="w-20 h-20 bg-white border-4 border-white rounded-full shadow-md flex items-center justify-center text-3xl font-bold text-[#B88A44] bg-gradient-to-br from-[#FCF7E8] to-[#E8D2A6]">
                            {selectedStudent.name.charAt(0)}
                        </div>
                        <h3 className="font-bold text-[#4A1C14] text-lg mt-3">{selectedStudent.name}</h3>
                        
                        <div className="flex flex-col items-center mt-2 space-y-1.5 w-full">
                            {selectedStudent.email && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <PhosphorIcon icon="envelope-simple" size={14} />
                                    <span>{selectedStudent.email}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <PhosphorIcon icon="phone" size={14} />
                                <span>{selectedStudent.phone}</span>
                            </div>
                            
                            {(selectedStudent.tempatLahir || selectedStudent.tanggalLahir) && (
                                <div className="flex flex-col items-center gap-1 mt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <PhosphorIcon icon="map-pin" size={14} />
                                        <span>
                                            {selectedStudent.tempatLahir || '-'}, {selectedStudent.tanggalLahir ? new Date(selectedStudent.tanggalLahir).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-[#B88A44] bg-[#FCF7E8] px-2 py-0.5 mt-0.5 rounded border border-[#E8D2A6]/50">
                                        Usia: {calculateAge(selectedStudent.tanggalLahir)}
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 flex gap-2 w-full">
                            <button 
                                onClick={() => openAssignModal(selectedStudent)}
                                className="flex-1 bg-white border border-[#E8D2A6] py-2 rounded-xl text-[11px] font-bold text-[#4A1C14] flex items-center justify-center gap-1 hover:bg-gray-50"
                            >
                                <PhosphorIcon icon="arrows-left-right" size={14} /> 
                                {selectedStudent.role === 'alumni' ? 'Masukkan ke Kelas' : 'Atur Kelas'}
                            </button>
                            {selectedStudent.role !== 'alumni' && (
                                <button className="flex-1 bg-white border border-red-200 py-2 rounded-xl text-[11px] font-bold text-red-600 flex items-center justify-center gap-1 hover:bg-red-50">
                                    <PhosphorIcon icon="trash" size={14} /> Keluarkan
                                </button>
                            )}
                            {selectedStudent.role === 'alumni' && (
                                <div className="flex-1 bg-emerald-50 border border-emerald-200 py-2 rounded-xl text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                                    <PhosphorIcon icon="graduation-cap" size={14} /> Status Alumni
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <h4 className="font-bold text-[#4A1C14] text-sm mb-3">Statistik Tholibah</h4>
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                        <PhosphorIcon icon="calendar-check" size={24} className="text-blue-500 mb-1" weight="duotone" />
                        <span className="text-2xl font-bold text-blue-700">{studentStats.absensiList.length}x</span>
                        <span className="text-[10px] font-bold text-blue-600/70">Kali Hadir</span>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                        <PhosphorIcon icon="books" size={24} className="text-emerald-500 mb-1" weight="duotone" />
                        <span className="text-2xl font-bold text-emerald-700">{studentStats.setoranList.length}x</span>
                        <span className="text-[10px] font-bold text-emerald-600/70">Kali Setoran</span>
                    </div>
                </div>

                <h4 className="font-bold text-[#4A1C14] text-sm mb-3">Menu Kelola</h4>
                <div className="space-y-3">
                    <button onClick={() => setViewMode('absen_detail')} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center justify-between hover:bg-gray-50 transition-colors">
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
                    
                    <button onClick={() => setViewMode('setoran_detail')} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center justify-between hover:bg-gray-50 transition-colors">
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

                    <button onClick={() => setViewMode('infaq_detail')} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center justify-between hover:bg-gray-50 transition-colors">
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

                <h4 className="font-bold text-red-600 text-sm mt-8 mb-3 flex items-center gap-2">
                    <PhosphorIcon icon="warning-circle" size={18} weight="fill" />
                    Zona Berbahaya
                </h4>
                <div className="space-y-3">
                    {selectedStudent.role !== 'alumni' && (
                        <button 
                            onClick={handleMakeAlumni}
                            className="w-full bg-white p-4 rounded-2xl shadow-sm border border-orange-200 flex items-center justify-between hover:bg-orange-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                                    <PhosphorIcon icon="graduation-cap" size={20} weight="fill" />
                                </div>
                                <div className="text-left">
                                    <h5 className="font-bold text-orange-700 text-sm">Jadikan Sebagai Alumni</h5>
                                    <p className="text-[10px] text-orange-600/70">Keluarkan dari kelas aktif</p>
                                </div>
                            </div>
                        </button>
                    )}

                    <button 
                        onClick={handlePermanentDelete}
                        className="w-full bg-white p-4 rounded-2xl shadow-sm border border-red-200 flex items-center justify-between hover:bg-red-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                                <PhosphorIcon icon="trash" size={20} weight="fill" />
                            </div>
                            <div className="text-left">
                                <h5 className="font-bold text-red-700 text-sm">Hapus Permanen Akun Ini</h5>
                                <p className="text-[10px] text-red-600/70">Hapus bersih dari database aplikasi</p>
                            </div>
                        </div>
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderAbsenDetail = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 mt-4 pb-10">
            <h3 className="font-bold text-[#4A1C14] mb-4">Riwayat Kehadiran: {selectedStudent?.name}</h3>
            {studentStats.absensiList.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-[#E8D2A6]">
                    <p className="text-[#4A1C14]/60 text-[11px]">Belum ada riwayat kehadiran.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {studentStats.absensiList.map((a, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50 flex items-center gap-3">
                            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                                <PhosphorIcon icon="calendar-check" size={24} weight="fill" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#4A1C14] text-sm">{new Date(a.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                                {(() => {
                                    const cls = classesList.find(c => c.id === a.classId);
                                    return cls ? (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${cls.color.split(' ')[0]} ${cls.color.split(' ')[1]}`}>
                                            {cls.name}
                                        </span>
                                    ) : (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-gray-100 text-gray-500`}>
                                            Kelas Dihapus
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );

    const renderSetoranDetail = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 mt-4 pb-10">
            <h3 className="font-bold text-[#4A1C14] mb-4">Riwayat Setoran: {selectedStudent?.name}</h3>
            {studentStats.setoranList.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-[#E8D2A6]">
                    <p className="text-[#4A1C14]/60 text-[11px]">Belum ada riwayat setoran hafalan.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {studentStats.setoranList.map(s => (
                        <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-[#4A1C14] text-sm">{s.surat_target}</h4>
                                <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${s.status === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FCF7E8] text-[#B88A44]'}`}>
                                    {s.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-2">{new Date(s.tanggal).toLocaleString('id-ID')}</p>
                            {s.catatan && (
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <p className="text-[11px] font-bold text-gray-600">Catatan Ustadz/ah:</p>
                                    <p className="text-[11px] text-gray-500">{s.catatan}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );

    const renderInfaqDetail = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 mt-4 pb-10">
            <h3 className="font-bold text-[#4A1C14] mb-4">Catatan Infaq/SPP: {selectedStudent?.name}</h3>
            <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-[#E8D2A6]">
                <PhosphorIcon icon="money" size={32} className="mx-auto text-[#B88A44]/50 mb-2" />
                <p className="text-[#4A1C14]/60 text-[11px]">Belum ada data infaq / SPP bulanan yang tercatat.</p>
            </div>
        </motion.div>
    );

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-screen">
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button 
                    onClick={() => {
                        if (['absen_detail', 'setoran_detail', 'infaq_detail'].includes(viewMode)) {
                            setViewMode('student_detail');
                        } else if (viewMode === 'student_detail') {
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
                        {viewMode === 'absen_detail' && 'Detail Absensi'}
                        {viewMode === 'setoran_detail' && 'Riwayat Setoran'}
                        {viewMode === 'infaq_detail' && 'Catatan Infaq'}
                    </h2>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'main' && <motion.div key="main">{renderMainView()}</motion.div>}
                {viewMode === 'class_detail' && <motion.div key="class">{renderClassDetail()}</motion.div>}
                {viewMode === 'student_detail' && <motion.div key="student">{renderStudentDetail()}</motion.div>}
                {viewMode === 'absen_detail' && <motion.div key="absen">{renderAbsenDetail()}</motion.div>}
                {viewMode === 'setoran_detail' && <motion.div key="setoran">{renderSetoranDetail()}</motion.div>}
                {viewMode === 'infaq_detail' && <motion.div key="infaq">{renderInfaqDetail()}</motion.div>}
            </AnimatePresence>

            <AnimatePresence>
                {isAssignModalOpen && studentToAssign && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center backdrop-blur-sm sm:items-center p-4 pb-24 sm:pb-4"
                        onClick={() => setIsAssignModalOpen(false)}
                    >
                        <motion.div 
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[80vh]"
                            onClick={(e) => e.stopPropagation()}
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
                            
                            <div className="p-5 overflow-y-auto bg-[#FDFBF7] flex-1">
                                <label className="block text-[11px] font-bold text-[#4A1C14]/70 mb-2">Pilih Kelas (Bisa Lebih Dari Satu)</label>
                                <div className="grid grid-cols-2 gap-2 hide-scrollbar">
                                    {classesList.map(cls => (
                                        <div key={cls.id} onClick={() => toggleClassForAssign(cls.id)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedClassesForAssign.includes(cls.id) ? 'bg-[#FCF7E8] border-[#B88A44] shadow-sm' : 'bg-white border-[#E8D2A6]/50 hover:bg-gray-50'}`}>
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedClassesForAssign.includes(cls.id) ? 'bg-[#B88A44] border-[#B88A44] text-white' : 'border-gray-300'}`}>
                                                {selectedClassesForAssign.includes(cls.id) && <PhosphorIcon icon="check" size={14} weight="bold" />}
                                            </div>
                                            <span className={`text-[11px] font-bold ${selectedClassesForAssign.includes(cls.id) ? 'text-[#4A1C14]' : 'text-[#4A1C14]/70'}`}>{cls.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-white border-t border-[#E8D2A6]/30">
                                <button 
                                    onClick={handleSaveAssignClasses}
                                    className="w-full bg-[#B88A44] hover:bg-[#9c7438] text-white font-bold py-3 rounded-xl shadow-md transition-colors text-[13px]"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KelolaTholibah;
