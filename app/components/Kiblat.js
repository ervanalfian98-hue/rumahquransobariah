import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';

const KiblatScreen = ({ setActiveTab }) => {
    const [heading, setHeading] = useState(0);
    const [qiblaAngle, setQiblaAngle] = useState(295); // Default approximate Qibla angle for Indonesia
    const [isCalibrating, setIsCalibrating] = useState(true);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleOrientation = (e) => {
            let compassHeading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
            if (compassHeading) {
                setHeading(compassHeading);
                if (isCalibrating) setIsCalibrating(false);
            }
        };

        const requestAccess = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        setPermissionGranted(true);
                        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
                    } else {
                        setError('Izin akses kompas ditolak');
                    }
                } catch (err) {
                    setError('Gagal meminta akses sensor');
                }
            } else {
                setPermissionGranted(true);
                window.addEventListener('deviceorientationabsolute', handleOrientation, true);
                // Fallback for non-iOS or desktop
                setTimeout(() => setIsCalibrating(false), 2000);
            }
        };

        requestAccess();

        return () => {
            window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        };
    }, []);

    const compassRotation = -heading;
    const kaabaRotation = qiblaAngle - heading;
    const isFacingQibla = Math.abs(kaabaRotation % 360) < 5 || Math.abs(kaabaRotation % 360) > 355;

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FDFBF7] min-h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('beranda')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Arah Kiblat</h2>
                    <p className="text-[10px] text-[#B88A44]">Sukabumi, ID</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                {error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center border border-red-200">
                        <PhosphorIcon icon="warning-circle" size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="font-bold text-sm">Sensor Kompas Tidak Tersedia</p>
                        <p className="text-xs mt-1">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-10 text-center relative z-10">
                            <h3 className="text-3xl font-black text-[#4A1C14] tabular-nums tracking-tighter">
                                {Math.round(heading)}°
                            </h3>
                            <p className={`text-xs font-bold mt-1 uppercase tracking-widest px-3 py-1 rounded-full border transition-colors duration-500 ${isFacingQibla ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-[#FCF7E8] text-[#B88A44] border-[#E8D2A6]'}`}>
                                {isFacingQibla ? 'Anda Menghadap Kiblat' : 'Mencari Arah...'}
                            </p>
                        </div>

                        {/* Kompas Container */}
                        <div className="relative w-72 h-72">
                            {/* Glow when facing Qibla */}
                            <motion.div 
                                className="absolute inset-0 bg-emerald-400 rounded-full blur-3xl opacity-0"
                                animate={{ opacity: isFacingQibla ? 0.3 : 0 }}
                                transition={{ duration: 0.5 }}
                            />
                            
                            {/* Outer Ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-[#E8D2A6]/30 shadow-[0_0_40px_rgba(184,138,68,0.1)]"></div>
                            <div className="absolute inset-2 rounded-full border border-[#E8D2A6]/20 bg-white/50 backdrop-blur-sm"></div>

                            {/* Compass Inner */}
                            <motion.div 
                                className="absolute inset-4 rounded-full bg-white shadow-inner flex items-center justify-center border border-[#E8D2A6]/50 overflow-hidden"
                                animate={{ rotate: compassRotation }}
                                transition={{ type: "spring", damping: 30, stiffness: 100 }}
                            >
                                {/* N S E W Labels */}
                                <div className="absolute top-2 font-black text-red-500 text-lg">U</div>
                                <div className="absolute bottom-2 font-black text-[#4A1C14]/30 text-lg">S</div>
                                <div className="absolute right-3 font-black text-[#4A1C14]/30 text-lg">T</div>
                                <div className="absolute left-3 font-black text-[#4A1C14]/30 text-lg">B</div>

                                {/* Degree marks */}
                                {[...Array(24)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="absolute w-[2px] h-full"
                                        style={{ transform: `rotate(${i * 15}deg)` }}
                                    >
                                        <div className={`w-full ${i % 6 === 0 ? 'h-3 bg-[#4A1C14]/20' : 'h-1.5 bg-[#4A1C14]/10'}`}></div>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Kaaba Pointer */}
                            <motion.div 
                                className="absolute inset-0 pointer-events-none"
                                animate={{ rotate: kaabaRotation }}
                                transition={{ type: "spring", damping: 30, stiffness: 100 }}
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
                                    <div className="relative">
                                        <div className={`w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent transition-colors duration-500 ${isFacingQibla ? 'border-b-emerald-500' : 'border-b-[#B88A44]'}`}></div>
                                        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#2D2D2D] w-12 h-14 rounded shadow-xl flex flex-col items-center justify-center border-t-2 border-[#D4AF37]">
                                            {/* Minimalist Kaaba */}
                                            <div className="w-full h-1 bg-[#D4AF37] mb-1"></div>
                                            <div className="w-full h-px bg-[#D4AF37]/50 mt-1"></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Center Dot */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#4A1C14] rounded-full ring-4 ring-[#FCF7E8] shadow-md z-10"></div>
                        </div>

                        {isCalibrating && (
                            <p className="mt-12 text-[10px] text-[#4A1C14]/60 font-medium bg-[#FCF7E8] px-3 py-1.5 rounded-full animate-pulse border border-[#E8D2A6]/50">
                                Mengkalibrasi sensor kompas... Putar HP Anda membentuk angka 8
                            </p>
                        )}
                        {!isCalibrating && (
                            <div className="mt-12 flex flex-col items-center">
                                <PhosphorIcon icon="info" size={16} className="text-[#B88A44] mb-1" />
                                <p className="text-[10px] text-[#4A1C14]/60 font-medium text-center max-w-[200px]">
                                    Jauhkan perangkat dari benda magnetik atau logam berat untuk hasil yang akurat.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default KiblatScreen;
