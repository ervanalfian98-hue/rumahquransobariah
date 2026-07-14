import React, { useState, useEffect, useRef } from 'react';
import PhosphorIcon from './PhosphorIcon';
import KelolaTholibah from './KelolaTholibah';
import KelolaPengajar from './KelolaPengajar';
import KurikulumMateri from './KurikulumMateri';
import LaporanKeuangan from './LaporanKeuangan';
import VerifikasiPendaftaran from './VerifikasiPendaftaran';
import BroadcastPengumuman from './BroadcastPengumuman';
import TentangRqs from './TentangRqs';
import GaleriDokumentasi from './GaleriDokumentasi';
import KelolaArtikel from './KelolaArtikel';
import KelolaRenungan from './KelolaRenungan';
import KelolaKepengurusan from './KelolaKepengurusan';
import SetorHafalanMaster from './SetorHafalanMaster';
import KelolaRqsBerdaya from './KelolaRqsBerdaya';
import KelolaMerchandise from './KelolaMerchandise';
import KelolaRqsHerbal from './KelolaRqsHerbal';
import KelolaTamyiz from './KelolaTamyiz';
import KelolaQurban from './KelolaQurban';
import KelolaRekening from './KelolaRekening';
import KelolaSosmed from './KelolaSosmed';

const MasterScreen = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const activeMenuRef = useRef(activeMenu);
    
    const [stats, setStats] = useState({
        totalTholibah: 0,
        totalManagement: 0,
        attendancePercentage: 0
    });

    useEffect(() => {
        activeMenuRef.current = activeMenu;
    }, [activeMenu]);

    useEffect(() => {
        const loadStats = () => {
            // Load Total Tholibah and Total Management
            const allUsers = JSON.parse(localStorage.getItem('rqs_users') || '[]');
            const totalTholibah = allUsers.filter(u => u.role === 'tholibah' && u.verified !== false).length;
            const totalManagement = allUsers.filter(u => u.role === 'management' && u.verified !== false).length;

            // Load Attendance (checking rqs_jadwal if any)
            const jadwalData = JSON.parse(localStorage.getItem('rqs_jadwal') || '[]');
            let totalHadir = 0;
            let totalExpected = 0;
            
            jadwalData.forEach(j => {
                if (j.absensi && j.absensi.length > 0) {
                    totalHadir += j.absensi.length;
                    // We don't have total expected per session easily available, so we'll just mock a percentage based on presence vs total tholibah
                    // Or if we want a realistic percentage:
                    totalExpected += (totalTholibah > 0 ? totalTholibah : 10); 
                }
            });
            
            let attendancePercentage = 0;
            if (totalExpected > 0) {
                attendancePercentage = Math.round((totalHadir / totalExpected) * 100);
                if (attendancePercentage > 100) attendancePercentage = 100;
            }

            setStats({
                totalTholibah,
                totalManagement,
                attendancePercentage: attendancePercentage > 0 ? attendancePercentage : 0 // 0 means no data yet
            });
        };

        loadStats();
        window.addEventListener('storage', loadStats);
        return () => window.removeEventListener('storage', loadStats);
    }, []);

    useEffect(() => {
        const handleBack = (e) => {
            if (activeMenuRef.current) {
                setActiveMenu(null);
                e.preventDefault();
            }
        };
        window.addEventListener('app-back-pressed', handleBack);
        return () => window.removeEventListener('app-back-pressed', handleBack);
    }, []);

    const handleMenuClick = (menu) => {
        window.history.pushState({ menu }, '');
        setActiveMenu(menu);
    };

    const goBack = () => {
        window.history.back();
    };

    // If a sub-menu is active, render it instead of the main Master screen
    if (activeMenu === 'tholibah') return <KelolaTholibah onBack={goBack} />;
    if (activeMenu === 'pengajar') return <KelolaPengajar onBack={goBack} />;
    if (activeMenu === 'kurikulum') return <KurikulumMateri onBack={goBack} />;
    if (activeMenu === 'keuangan') return <LaporanKeuangan onBack={goBack} />;
    if (activeMenu === 'verifikasi') return <VerifikasiPendaftaran onBack={goBack} />;
    if (activeMenu === 'broadcast') return <BroadcastPengumuman onBack={goBack} />;
    if (activeMenu === 'tentang') return <TentangRqs onBack={goBack} />;
    if (activeMenu === 'galeri') return <GaleriDokumentasi onBack={goBack} />;
    if (activeMenu === 'artikel') return <KelolaArtikel onBack={goBack} />;
    if (activeMenu === 'renungan') return <KelolaRenungan onBack={goBack} />;
    if (activeMenu === 'setorHafalan') return <SetorHafalanMaster onBack={goBack} />;
    if (activeMenu === 'kepengurusan') return <KelolaKepengurusan onBack={goBack} />;
    if (activeMenu === 'rqsBerdaya') return <KelolaRqsBerdaya onBack={goBack} />;
    if (activeMenu === 'merchandise') return <KelolaMerchandise onBack={goBack} />;
    if (activeMenu === 'rqsHerbal') return <KelolaRqsHerbal onBack={goBack} />;
    if (activeMenu === 'tamyiz') return <KelolaTamyiz onBack={goBack} />;
    if (activeMenu === 'qurban') return <KelolaQurban onBack={goBack} />;
    if (activeMenu === 'rekening') return <KelolaRekening onBack={goBack} />;
    if (activeMenu === 'sosmed') return <KelolaSosmed onBack={goBack} />;

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-[#E8D2A6]/30">
                <div className="flex-1 text-center">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">RQS Management Center</h2>
                </div>
            </div>

            {/* Top Stats */}
            <div className="px-5 mt-5">
                <div className="grid grid-cols-3 gap-3">
                    {/* Stat 1 */}
                    <div className="bg-white border border-[#E8D2A6] rounded-[1.25rem] p-3 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-[10px] font-semibold text-[#4A1C14]/70 mb-1 leading-tight">Total<br />Tholibah</span>
                        <span className="text-xl font-bold text-[#B88A44]">{stats.totalTholibah}</span>
                        <span className="text-[10px] text-[#4A1C14]/60 mt-0.5">Tholibah</span>
                    </div>
                    {/* Stat 2 */}
                    <div className="bg-white border border-[#E8D2A6] rounded-[1.25rem] p-3 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-[10px] font-semibold text-[#4A1C14]/70 mb-1 leading-tight">Total<br />Management</span>
                        <span className="text-xl font-bold text-[#B88A44]">{stats.totalManagement}</span>
                        <span className="text-[10px] text-[#4A1C14]/60 mt-0.5">Pengurus</span>
                    </div>
                    {/* Stat 3 */}
                    <div className="bg-white border border-[#E8D2A6] rounded-[1.25rem] p-3 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-[10px] font-semibold text-[#4A1C14]/70 mb-1 leading-tight">Monthly<br />Attendance</span>
                        <span className="text-xl font-bold text-[#B88A44]">{stats.attendancePercentage}%</span>
                        <span className="text-[10px] text-[#4A1C14]/60 mt-0.5">Kehadiran</span>
                    </div>
                </div>
            </div>

            {/* Management Master Section */}
            <div className="px-5 mt-6">
                <h3 className="font-bold text-[#4A1C14] text-lg mb-3">Management Master</h3>

                <div className="grid grid-cols-2 gap-3">
                    {/* Card 1 */}
                    <div onClick={() => handleMenuClick('tholibah')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="user-plus" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola Tholibah</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Atur data, kehadiran, dan progres hafalan para tholibah</p>
                    </div>

                    {/* Card 2 */}
                    <div onClick={() => handleMenuClick('pengajar')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="chalkboard-teacher" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola Pengajar</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Pantau jadwal mengajar, evaluasi, dan data asatidz</p>
                    </div>

                    {/* Card 3: Kelola Kepengurusan */}
                    <div onClick={() => handleMenuClick('kepengurusan')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="users-three" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola Pengurus</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Kelola struktur pimpinan dan divisi kepengurusan RQS</p>
                    </div>

                    {/* Card 4 */}
                    <div onClick={() => handleMenuClick('kurikulum')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="book-open-text" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kurikulum & Materi</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Susun materi pembelajaran dan struktur kurikulum kelas</p>
                    </div>

                    {/* Card 4 */}
                    <div onClick={() => handleMenuClick('keuangan')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="chart-line-up" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Laporan Keuangan</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Pantau arus kas, donasi, dan pengeluaran operasional</p>
                    </div>

                    {/* Card 5 */}
                    <div onClick={() => handleMenuClick('verifikasi')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="seal-check" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Verifikasi Pendaftaran</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Tinjau dan setujui pendaftaran calon tholibah baru</p>
                    </div>

                    {/* Card 6 */}
                    <div onClick={() => handleMenuClick('broadcast')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="megaphone" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Broadcast Pengumuman</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Kirim informasi dan pengumuman massal ke semua anggota</p>
                    </div>

                    {/* Card 7 */}
                    <div onClick={() => handleMenuClick('tentang')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="info" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Tentang RQS</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Kelola profil, visi misi, dan budaya RQS di beranda</p>
                    </div>
                    {/* Card 8: Kelola Renungan */}
                    <div onClick={() => handleMenuClick('renungan')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="lightbulb" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola Renungan</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Tambahkan dan hapus artikel renungan harian</p>
                    </div>
                    {/* Card 9: Kelola Artikel */}
                    <div onClick={() => handleMenuClick('artikel')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="newspaper" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola Artikel</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Tulis, edit, dan kelola postingan blog/artikel inspiratif</p>
                    </div>



                    {/* Card 8 */}
                    <div onClick={() => handleMenuClick('galeri')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="images" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Galeri Dokumentasi</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Upload atau hapus foto untuk galeri dokumentasi kegiatan</p>
                    </div>

                    {/* Card 9: Setor Hafalan */}
                    <div onClick={() => handleMenuClick('setorHafalan')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="microphone-stage" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Setor Hafalan</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Simak dan beri catatan hafalan para tholibah</p>
                    </div>



                    {/* Card 11: Kelola RQS Berdaya */}
                    <div onClick={() => handleMenuClick('rqsBerdaya')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="handshake" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola RQS Berdaya</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Atur produk komunitas dan jemaah di RQS Berdaya</p>
                    </div>

                    {/* Card 12: Kelola Merchandise */}
                    <div onClick={() => handleMenuClick('merchandise')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="t-shirt" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola Merchandise</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Tambah dan edit produk atribut resmi RQS Store</p>
                    </div>

                    {/* Card 13: Kelola RQS Herbal */}
                    <div onClick={() => handleMenuClick('rqsHerbal')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="leaf" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola RQS Herbal</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Atur produk herbal dan thibbun nabawi RQS</p>
                    </div>

                    {/* Card 14: Kelola Tamyiz */}
                    <div onClick={() => handleMenuClick('tamyiz')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="certificate" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola Tamyiz</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Kelola materi dan video pembelajaran Tamyiz</p>
                    </div>

                    {/* Card 15: Kelola Qurban */}
                    <div onClick={() => handleMenuClick('qurban')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="cow" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola Qurban</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Kelola paket hewan qurban & tabungan qurban</p>
                    </div>

                    {/* Card 16: Kelola Rekening */}
                    <div onClick={() => handleMenuClick('rekening')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="bank" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola Rekening</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Kelola metode pembayaran dan nomor rekening</p>
                    </div>

                    {/* Card 17: Kelola Sosial Media */}
                    <div onClick={() => handleMenuClick('sosmed')} className="bg-white border border-[#E8D2A6]/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#B88A44]/50 cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#FCF7E8] flex items-center justify-center mb-3 text-[#B88A44]">
                            <PhosphorIcon icon="share-network" size={28} />
                        </div>
                        <h4 className="text-[12px] font-bold text-[#4A1C14] mb-1">Kelola Sosial Media</h4>
                        <p className="text-[9px] text-[#4A1C14]/60 leading-tight">Atur link sosial media & nomor WA utama</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MasterScreen;
