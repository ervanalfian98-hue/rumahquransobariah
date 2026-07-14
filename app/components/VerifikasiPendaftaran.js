import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';

const VerifikasiPendaftaran = ({ onBack }) => {
    const [pendingUsers, setPendingUsers] = useState([]);

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = () => {
        const users = JSON.parse(localStorage.getItem('rqs_users') || '[]');
        const pending = users.filter(u => u.role === 'tholibah' && u.verified === false);
        setPendingUsers(pending);
    };

    const handleVerify = (userId) => {
        const users = JSON.parse(localStorage.getItem('rqs_users') || '[]');
        const updatedUsers = users.map(u => {
            if (u.id === userId) {
                return { ...u, verified: true };
            }
            return u;
        });
        localStorage.setItem('rqs_users', JSON.stringify(updatedUsers));
        
        alert("Pendaftaran berhasil diverifikasi! Tholibah sekarang sudah bisa Login.");
        loadPendingUsers();
    };

    const handleReject = (userId) => {
        const confirmDelete = window.confirm("Apakah Anda yakin ingin menolak dan menghapus pendaftaran ini?");
        if (confirmDelete) {
            const users = JSON.parse(localStorage.getItem('rqs_users') || '[]');
            const updatedUsers = users.filter(u => u.id !== userId);
            localStorage.setItem('rqs_users', JSON.stringify(updatedUsers));
            loadPendingUsers();
        }
    };

    return (
        <div className="pb-28 animate-in fade-in duration-300 bg-[#FDFBF7] min-h-screen relative z-30">
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Verifikasi Pendaftaran</h2>
                </div>
            </div>
            
            <div className="p-5">
                {pendingUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 opacity-70">
                        <PhosphorIcon icon="check-circle" size={64} className="text-emerald-500 mb-4" />
                        <p className="text-center text-[#4A1C14] font-medium">Tidak ada pendaftaran baru.</p>
                        <p className="text-center text-[11px] text-[#4A1C14]/60 mt-1">Semua pendaftaran telah diverifikasi.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingUsers.map(user => (
                            <div key={user.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/50">
                                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#E8D2A6]/30">
                                    <div className="w-12 h-12 bg-[#FCF7E8] text-[#B88A44] rounded-full flex items-center justify-center font-bold text-lg">
                                        {user.nama.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#4A1C14]">{user.nama}</h4>
                                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                            <PhosphorIcon icon="phone" size={12} /> {user.phone}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4A1C14]/70 mb-4">
                                    <div>
                                        <span className="font-semibold block text-[#4A1C14]">Email</span>
                                        {user.email}
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-[#4A1C14]">Tempat, Tgl Lahir</span>
                                        {user.tempatLahir}, {user.tanggalLahir}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleVerify(user.id)}
                                        className="flex-1 bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm hover:bg-emerald-600 transition-colors"
                                    >
                                        <PhosphorIcon icon="check" size={16} weight="bold" /> Terima
                                    </button>
                                    <button 
                                        onClick={() => handleReject(user.id)}
                                        className="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm border border-red-200 hover:bg-red-100 transition-colors"
                                    >
                                        <PhosphorIcon icon="x" size={16} weight="bold" /> Tolak
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifikasiPendaftaran;
