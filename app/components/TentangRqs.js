import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const defaultData = {
    visi: "Menjadi lembaga pendidikan Al-Qur'an terdepan yang mencetak generasi Qur'ani, berakhlak mulia, dan berdaya guna bagi umat.",
    misi: "Menyelenggarakan pembelajaran Al-Qur'an yang sistematis dan mudah dipahami.\nMembentuk karakter Tholibah yang sesuai dengan nilai-nilai Islam.\nMemberdayakan potensi Tholibah untuk kemanfaatan sosial.",
    latarBelakang: "Rumah Quran Sobariah (RQS) didirikan atas dasar kepedulian terhadap pentingnya membumikan Al-Qur'an di tengah masyarakat modern. Kami hadir sebagai wadah yang nyaman, profesional, dan bersahabat bagi siapa saja yang ingin memperbaiki bacaan, menghafal, dan memahami isi kandungan Al-Qur'an, dari tingkat pemula hingga lanjutan.",
    budaya: "Disiplin, Sinergi, Istiqomah, Ikhlas, Berdaya"
};

const TentangRqs = ({ onBack }) => {
    const [formData, setFormData] = useState(defaultData);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchTentang = async () => {
            const { data, error } = await supabase.from('rqs_tentang').select('*').eq('id', 1).single();
            if (data && !error) {
                setFormData({
                    visi: data.visi || defaultData.visi,
                    misi: data.misi || defaultData.misi,
                    latarBelakang: data.latarBelakang || defaultData.latarBelakang,
                    budaya: data.budaya || defaultData.budaya
                });
            }
        };
        fetchTentang();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setIsSaved(false);
    }

    const handleSave = async () => {
        const payload = {
            id: 1,
            visi: formData.visi,
            misi: formData.misi,
            latarBelakang: formData.latarBelakang,
            budaya: formData.budaya
        };
        const { error } = await supabase.from('rqs_tentang').upsert([payload]);
        
        if (error) {
            console.error('Error saving:', error);
            alert('Gagal menyimpan data.');
            return;
        }

        setIsSaved(true);
        window.dispatchEvent(new Event('rqs-content-updated'));
        setTimeout(() => setIsSaved(false), 3000);
    }

    return (
        <div className="pb-28 animate-in fade-in duration-300 bg-[#FDFBF7] min-h-screen relative z-30">
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Tentang RQS</h2>
                </div>
            </div>

            <div className="p-5 space-y-5">
                {/* Info Card */}
                <div className="bg-[#FCF7E8] p-3 rounded-xl border border-[#E8D2A6] flex gap-3 items-start">
                    <PhosphorIcon icon="info" size={20} className="text-[#B88A44] shrink-0 mt-0.5" weight="fill" />
                    <p className="text-[11px] text-[#4A1C14] leading-tight">
                        Perubahan pada form ini akan langsung mengubah teks di bagian "Tentang RQS" pada halaman Beranda. Pastikan penulisan sudah benar.
                    </p>
                </div>

                <div className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-[#E8D2A6]/50">
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1.5">Visi RQS</label>
                        <textarea 
                            name="visi"
                            value={formData.visi}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-[#FDFBF7] border border-[#E8D2A6] rounded-xl p-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] transition-colors resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1.5">Misi RQS <span className="text-[9px] font-normal text-gray-400">(Pisahkan dengan enter/baris baru)</span></label>
                        <textarea 
                            name="misi"
                            value={formData.misi}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-[#FDFBF7] border border-[#E8D2A6] rounded-xl p-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] transition-colors resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1.5">Latar Belakang</label>
                        <textarea 
                            name="latarBelakang"
                            value={formData.latarBelakang}
                            onChange={handleChange}
                            rows={5}
                            className="w-full bg-[#FDFBF7] border border-[#E8D2A6] rounded-xl p-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] transition-colors resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1.5">Budaya RQS <span className="text-[9px] font-normal text-gray-400">(Pisahkan dengan koma)</span></label>
                        <input 
                            type="text"
                            name="budaya"
                            value={formData.budaya}
                            onChange={handleChange}
                            className="w-full bg-[#FDFBF7] border border-[#E8D2A6] rounded-xl p-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] transition-colors"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    className="w-full bg-[#B88A44] text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-[#A37936] transition-colors flex items-center justify-center gap-2"
                >
                    <PhosphorIcon icon={isSaved ? "check-circle" : "floppy-disk"} size={20} weight={isSaved ? "fill" : "regular"} />
                    {isSaved ? "Tersimpan!" : "Simpan Perubahan"}
                </button>
            </div>
        </div>
    );
};

export default TentangRqs;
