import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { CLASSES as INITIAL_CLASSES } from './MockData';

const KurikulumMateri = ({ onBack }) => {
    const [pengajarList, setPengajarList] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [activeTab, setActiveTab] = useState('active'); // active | history
    const [selectedClass, setSelectedClass] = useState(null);

    // Form states
    const [classId, setClassId] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [materi, setMateri] = useState('');
    
    // UI states
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const loadData = () => {
            const savedPengajar = localStorage.getItem('rqs_pengajar');
            if (savedPengajar) setPengajarList(JSON.parse(savedPengajar));

            const savedSchedules = localStorage.getItem('rqs_jadwal_kelas');
            if (savedSchedules) setSchedules(JSON.parse(savedSchedules));

            let currentClasses = INITIAL_CLASSES;
            const savedClasses = localStorage.getItem('rqs_classes');
            if (savedClasses) {
                currentClasses = JSON.parse(savedClasses);
            }
            setClassesList(currentClasses);
            
            if (currentClasses.length > 0 && !selectedClass) {
                setSelectedClass(currentClasses[0].id);
            }
        };

        loadData();
    }, []);

    const getClassTeachers = (cId) => {
        const teachers = pengajarList.filter(p => p.classes && p.classes.includes(cId));
        if (teachers.length === 0) return 'Belum ada pengajar';
        return teachers.map(p => (p.gender === 'ustadz' ? 'Ust. ' : 'Ustzh. ') + p.name).join(', ');
    };

    const handleSave = (e) => {
        e.preventDefault();
        
        if (startTime >= endTime) {
            alert('Jam Selesai harus lebih besar dari Jam Mulai');
            return;
        }

        const newSchedule = {
            id: Date.now().toString(),
            classId,
            className: classesList.find(c => c.id === classId)?.name,
            pengajar: getClassTeachers(classId),
            date,
            startTime,
            endTime,
            materi,
            createdAt: new Date().toISOString()
        };

        const updatedSchedules = [...schedules, newSchedule];
        setSchedules(updatedSchedules);
        localStorage.setItem('rqs_jadwal_kelas', JSON.stringify(updatedSchedules));

        // Reset form
        setClassId(''); setDate(''); setStartTime(''); setEndTime(''); setMateri('');
        setShowForm(false);
    };

    const handleDelete = (id) => {
        if(window.confirm('Yakin ingin menghapus jadwal ini?')) {
            const updated = schedules.filter(s => s.id !== id);
            setSchedules(updated);
            localStorage.setItem('rqs_jadwal_kelas', JSON.stringify(updated));
        }
    };

    // Separate active and history
    const now = new Date();
    const getLocalDateString = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const todayStr = getLocalDateString(now);
    const currentTimeStr = now.toTimeString().substring(0, 5); // "HH:MM"

    const isPast = (sch) => {
        if (sch.date < todayStr) return true;
        if (sch.date === todayStr && sch.endTime < currentTimeStr) return true;
        return false;
    };

    const activeSchedules = schedules.filter(s => !isPast(s)).filter(s => !selectedClass || s.classId === selectedClass).sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
    const historySchedules = schedules.filter(s => isPast(s)).filter(s => !selectedClass || s.classId === selectedClass).sort((a,b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)); // descending

    return (
        <div className="pb-32 animate-in fade-in duration-300 bg-[#FDFBF7] min-h-screen relative z-30">
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kurikulum & Materi</h2>
                    <p className="text-[10px] text-[#B88A44] font-bold">Atur Jadwal & Materi Kelas</p>
                </div>
            </div>

            <div className="p-5">
                {/* Classes Filter */}
                <div className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar">
                    {classesList.map(cls => (
                        <button
                            key={cls.id}
                            onClick={() => setSelectedClass(cls.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${selectedClass === cls.id ? 'bg-[#4A1C14] text-white border-[#4A1C14] shadow-md' : 'bg-white text-[#4A1C14] border-[#E8D2A6]/50 hover:bg-[#FCF7E8]'}`}
                        >
                            {cls.name}
                        </button>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-5 border border-gray-200">
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'active' ? 'bg-white text-[#4A1C14] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Jadwal Aktif ({activeSchedules.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-[#4A1C14] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Histori ({historySchedules.length})
                    </button>
                </div>

                {!showForm && activeTab === 'active' && (
                    <button 
                        onClick={() => setShowForm(true)}
                        className="w-full bg-[#FCF7E8] text-[#4A1C14] font-bold py-3.5 rounded-xl border border-[#B88A44] border-dashed hover:bg-[#F5EBE9] transition-colors flex items-center justify-center gap-2 mb-6"
                    >
                        <PhosphorIcon icon="plus" size={18} weight="bold" />
                        Buat Jadwal Baru
                    </button>
                )}

                {showForm && activeTab === 'active' && (
                    <div className="bg-white p-5 rounded-2xl border border-[#E8D2A6] shadow-md mb-6 animate-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[#4A1C14]">Form Jadwal & Materi</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 p-1">
                                <PhosphorIcon icon="x" size={16} weight="bold" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Pilih Kelas</label>
                                <select required value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-black font-semibold outline-none focus:border-[#B88A44]">
                                    <option value="" disabled>Pilih Kelas...</option>
                                    {classesList.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {classId && (
                                <div className="bg-[#FCF7E8] p-3 rounded-xl border border-[#E8D2A6]/50">
                                    <p className="text-[10px] text-gray-500">Pengajar:</p>
                                    <p className="font-bold text-[#4A1C14] text-xs">{getClassTeachers(classId)}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Tanggal</label>
                                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} min={todayStr} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-black outline-none focus:border-[#B88A44]" />
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Jam Masuk</label>
                                    <input required type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-black outline-none focus:border-[#B88A44]" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Jam Selesai</label>
                                    <input required type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-black outline-none focus:border-[#B88A44]" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Materi Yang Dipelajari</label>
                                <textarea required value={materi} onChange={(e) => setMateri(e.target.value)} rows="3" placeholder="Deskripsikan materi..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-black outline-none focus:border-[#B88A44] resize-none"></textarea>
                            </div>

                            <button type="submit" className="w-full bg-[#4A1C14] text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-[#3A140E] transition-colors">
                                Selesai
                            </button>
                        </form>
                    </div>
                )}

                {/* List Schedules */}
                <div className="space-y-3">
                    {(activeTab === 'active' ? activeSchedules : historySchedules).length === 0 ? (
                        <div className="text-center p-8 text-gray-400 text-xs">
                            Tidak ada data jadwal.
                        </div>
                    ) : (
                        (activeTab === 'active' ? activeSchedules : historySchedules).map(sch => (
                            <div key={sch.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-2 items-center">
                                        <div className="bg-[#FCF7E8] text-[#B88A44] w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                                            <PhosphorIcon icon="calendar-blank" size={20} weight="fill" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#4A1C14] text-sm">{sch.className}</h4>
                                            <p className="text-[10px] text-gray-500">{new Date(sch.date).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric'})}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(sch.id)} className="text-red-400 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                                        <PhosphorIcon icon="trash" size={16} />
                                    </button>
                                </div>
                                <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                            <PhosphorIcon icon="clock" size={12} /> {sch.startTime} - {sch.endTime}
                                        </span>
                                        <span className="text-[10px] font-bold bg-[#E8D2A6]/30 text-[#4A1C14] px-2 py-0.5 rounded-md">
                                            {sch.pengajar}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-800 border-t border-gray-200 pt-2 mt-1">
                                        <span className="text-blue-600 font-bold block mb-0.5 text-[9px] uppercase">Materi:</span>
                                        {sch.materi}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default KurikulumMateri;
