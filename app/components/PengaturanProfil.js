import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const PengaturanProfil = ({ currentUser, setActiveTab }) => {
    const [formData, setFormData] = useState({
        nama: '',
        phone: '',
        tanggalLahir: '',
        tempatLahir: '',
        email: ''
    });
    
    // Convert photo to display and store file for upload
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                nama: currentUser.nama || '',
                phone: currentUser.phone || '',
                tanggalLahir: currentUser.tanggalLahir || '',
                tempatLahir: currentUser.tempatLahir || '',
                email: currentUser.email || ''
            });
            if (currentUser.avatarData) {
                setProfilePhoto(currentUser.avatarData);
            }
        }
    }, [currentUser]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!currentUser) return;
        setIsUploading(true);
        
        let finalAvatarUrl = currentUser.avatarData; // Keep existing if no new photo

        // Upload to Supabase if there's a new file
        if (photoFile) {
            const fileExt = photoFile.name.split('.').pop();
            const fileName = `avatar_${currentUser.id}_${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, photoFile);
                
            if (uploadError) {
                console.error("Error uploading avatar:", uploadError);
                alert("Gagal mengunggah foto profil. Menyimpan perubahan lain...");
            } else {
                const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
                finalAvatarUrl = data.publicUrl;
            }
        }
        
        const allUsers = JSON.parse(localStorage.getItem('rqs_users') || '[]');
        const updatedUsers = allUsers.map(u => {
            if (u.id === currentUser.id) {
                return {
                    ...u,
                    nama: formData.nama,
                    phone: formData.phone,
                    tanggalLahir: formData.tanggalLahir,
                    tempatLahir: formData.tempatLahir,
                    avatarData: finalAvatarUrl
                };
            }
            return u;
        });

        localStorage.setItem('rqs_users', JSON.stringify(updatedUsers));
        
        const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
        localStorage.setItem('rqs_currentUser', JSON.stringify(updatedCurrentUser));
        
        setIsUploading(false);
        alert("Profil berhasil diperbarui!");
        window.location.reload(); // Refresh to update currentUser globally
    };

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('beranda')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1 text-center">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Pengaturan Profil</h2>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="p-5">
                {/* Photo Upload Section */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="relative mb-3">
                        <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#FCF7E8] flex items-center justify-center text-[#B88A44]">
                            {profilePhoto ? (
                                <img src={profilePhoto} alt="Profil" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold uppercase">{formData.nama?.charAt(0) || 'U'}</span>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 w-9 h-9 bg-[#B88A44] text-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-[#9a7338] transition-colors border-2 border-white">
                            <PhosphorIcon icon="camera" size={18} weight="fill" />
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                    </div>
                    <p className="text-[11px] text-gray-500">Ketuk ikon kamera untuk mengubah foto</p>
                </div>

                <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#E8D2A6]/50 space-y-4">
                    {/* Form Fields */}
                    <div>
                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Nama Lengkap</label>
                        <input 
                            type="text" 
                            value={formData.nama}
                            onChange={(e) => setFormData({...formData, nama: e.target.value})}
                            className="w-full bg-[#FDFBF7] border border-[#E8D2A6]/80 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44]"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Email (Tidak bisa diubah)</label>
                        <input 
                            type="email" 
                            value={formData.email}
                            disabled
                            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 outline-none cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Nomor Handphone</label>
                        <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-[#FDFBF7] border border-[#E8D2A6]/80 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44]"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Tempat Lahir</label>
                            <input 
                                type="text" 
                                value={formData.tempatLahir}
                                onChange={(e) => setFormData({...formData, tempatLahir: e.target.value})}
                                className="w-full bg-[#FDFBF7] border border-[#E8D2A6]/80 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44]"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Tanggal Lahir</label>
                            <input 
                                type="date" 
                                value={formData.tanggalLahir}
                                onChange={(e) => setFormData({...formData, tanggalLahir: e.target.value})}
                                className="w-full bg-[#FDFBF7] border border-[#E8D2A6]/80 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44]"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button onClick={handleSave} disabled={isUploading} className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-colors ${isUploading ? 'bg-gray-400 shadow-none cursor-not-allowed' : 'bg-[#B88A44] shadow-[#B88A44]/30 hover:bg-[#9a7338]'}`}>
                        {isUploading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PengaturanProfil;
