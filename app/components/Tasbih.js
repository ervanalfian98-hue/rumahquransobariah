import React, { useState, useEffect, useRef } from 'react';
import PhosphorIcon from './PhosphorIcon';

const TasbihScreen = ({ setActiveTab }) => {
    // States with synchronous localStorage initialization
    const [count, setCount] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('rqs_tasbih_count');
            return saved !== null ? parseInt(saved, 10) : 0;
        }
        return 0;
    });
    const [mode, setMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('rqs_tasbih_mode') || 'sholat';
        }
        return 'sholat';
    });
    const [customTarget, setCustomTarget] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('rqs_tasbih_custom_target');
            return saved !== null ? parseInt(saved, 10) : 100;
        }
        return 100;
    });
    
    const [isTargetReached, setIsTargetReached] = useState(false);
    
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const [tempTarget, setTempTarget] = useState('');

    // Save to localStorage whenever states change
    useEffect(() => {
        localStorage.setItem('rqs_tasbih_count', count.toString());
        localStorage.setItem('rqs_tasbih_mode', mode);
        localStorage.setItem('rqs_tasbih_custom_target', customTarget.toString());
    }, [count, mode, customTarget]);

    // Vibration helper
    const vibrate = (pattern) => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    };

    // Calculate progress and phase for Sholat mode
    let target = mode === 'custom' ? customTarget : 99;
    let phaseText = '';
    
    if (mode === 'sholat') {
        if (count < 33) phaseText = 'Subhanallah';
        else if (count < 66) phaseText = 'Alhamdulillah';
        else if (count < 99) phaseText = 'Allahu Akbar';
        else phaseText = 'Selesai';
    } else {
        phaseText = count >= target ? 'Target Tercapai!' : 'Dzikir...';
    }

    const progressPercent = Math.min((count / target) * 100, 100) || 0;

    const handleTap = () => {
        const newCount = count + 1;
        setCount(newCount);
        setIsTargetReached(false);

        if (mode === 'sholat') {
            if (newCount === 33 || newCount === 66) {
                vibrate(200); // Getar pendek
            } else if (newCount === 99) {
                vibrate([500, 200, 500]); // Getar panjang
                setIsTargetReached(true);
            } else {
                vibrate(50); // Getaran sangat halus untuk setiap tap
            }
        } else {
            if (newCount === customTarget) {
                vibrate([500, 200, 500]); // Getar panjang
                setIsTargetReached(true);
            } else if (newCount % 33 === 0 && newCount < customTarget) {
                vibrate(100); // Getar pengingat tiap kelipatan 33
            } else {
                vibrate(50);
            }
        }
    };

    const handleReset = () => {
        if (window.confirm('Yakin ingin mengulang hitungan tasbih?')) {
            setCount(0);
            setIsTargetReached(false);
            vibrate(100);
        }
    };

    const toggleMode = (newMode) => {
        if (newMode !== mode) {
            setMode(newMode);
            setCount(0);
            setIsTargetReached(false);
            vibrate(100);
        }
    };

    const saveCustomTarget = () => {
        const val = parseInt(tempTarget, 10);
        if (val > 0) {
            setCustomTarget(val);
            setCount(0);
            setIsEditingTarget(false);
            vibrate(100);
        } else {
            alert('Masukkan target angka yang valid (lebih dari 0).');
        }
    };

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('kategori')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Tasbih Digital</h2>
                    <p className="text-[10px] text-[#B88A44]">Otomatis tersimpan & dilengkapi fitur getar</p>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                
                {/* Mode Selector */}
                <div className="bg-white p-2 rounded-2xl flex gap-2 shadow-sm border border-[#E8D2A6]/40 mb-6 relative z-10">
                    <button 
                        onClick={() => toggleMode('sholat')}
                        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${mode === 'sholat' ? 'bg-[#4A1C14] text-white shadow-md' : 'text-[#4A1C14]/60 hover:bg-[#FCF7E8]'}`}
                    >
                        Tasbih Sholat
                    </button>
                    <button 
                        onClick={() => toggleMode('custom')}
                        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${mode === 'custom' ? 'bg-[#4A1C14] text-white shadow-md' : 'text-[#4A1C14]/60 hover:bg-[#FCF7E8]'}`}
                    >
                        Target Custom
                    </button>
                </div>

                {/* Info & Target Setup */}
                <div className="mb-8 text-center animate-in slide-in-from-bottom-4 duration-500">
                    {mode === 'sholat' ? (
                        <div className="bg-gradient-to-br from-[#FCF7E8] to-white p-4 rounded-2xl border border-[#E8D2A6]/60 shadow-sm inline-block min-w-[200px]">
                            <p className="text-[10px] text-[#B88A44] font-bold uppercase tracking-widest mb-1">Target Otomatis</p>
                            <h3 className="text-xl font-black text-[#4A1C14]">99</h3>
                            <p className="text-xs text-[#4A1C14]/70 mt-1">33x Subhanallah, 33x Alhamdulillah, 33x Allahu Akbar</p>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-[#FCF7E8] to-white p-4 rounded-2xl border border-[#E8D2A6]/60 shadow-sm inline-block min-w-[200px]">
                            <p className="text-[10px] text-[#B88A44] font-bold uppercase tracking-widest mb-1">Target Dzikir</p>
                            
                            {isEditingTarget ? (
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        value={tempTarget}
                                        onChange={(e) => setTempTarget(e.target.value)}
                                        placeholder="Target..."
                                        className="w-20 text-center bg-white border border-[#E8D2A6] rounded-xl py-1 text-sm font-bold text-[#4A1C14] focus:outline-none focus:border-[#B88A44]"
                                        autoFocus
                                    />
                                    <button onClick={saveCustomTarget} className="bg-[#4A1C14] text-white p-1.5 rounded-xl shadow-sm">
                                        <PhosphorIcon icon="check" size={16} weight="bold" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <h3 className="text-xl font-black text-[#4A1C14]">{customTarget}</h3>
                                    <button onClick={() => { setTempTarget(customTarget.toString()); setIsEditingTarget(true); }} className="text-[#B88A44] hover:bg-[#E8D2A6]/20 p-1.5 rounded-lg transition-colors">
                                        <PhosphorIcon icon="pencil-simple" size={16} weight="bold" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Display Area */}
                <div className="flex-1 flex flex-col items-center justify-center -mt-4 relative">
                    <div className="absolute inset-0 bg-[#E8D2A6]/10 rounded-full blur-[100px] w-64 h-64 mx-auto my-auto"></div>
                    
                    <h2 className="text-[11px] font-bold text-[#B88A44] uppercase tracking-[0.2em] mb-2">{phaseText}</h2>
                    
                    <div className="text-7xl font-black text-[#4A1C14] tabular-nums tracking-tighter drop-shadow-sm mb-6 transition-all duration-300">
                        {count}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-[200px] h-2 bg-[#E8D2A6]/30 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className="h-full bg-[#B88A44] transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-[#B88A44] font-medium mt-2">{Math.round(progressPercent)}% Selesai</p>
                </div>

                {/* Controls Area */}
                <div className="flex items-center justify-center gap-6 mt-8 mb-4">
                    <button 
                        onClick={handleReset}
                        className="w-14 h-14 bg-white border border-[#E8D2A6]/60 rounded-full flex items-center justify-center text-[#B88A44] shadow-sm active:scale-95 transition-all"
                        aria-label="Reset Tasbih"
                    >
                        <PhosphorIcon icon="arrow-counter-clockwise" size={24} weight="bold" />
                    </button>

                    <button 
                        onClick={handleTap}
                        className={`w-32 h-32 rounded-full flex items-center justify-center text-white shadow-xl shadow-[#4A1C14]/20 active:scale-90 active:shadow-md transition-all duration-150 relative group overflow-hidden ${isTargetReached ? 'bg-[#B88A44]' : 'bg-[#4A1C14]'}`}
                        aria-label="Tap Tasbih"
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-100 transition-opacity"></div>
                        <PhosphorIcon icon="fingerprint" size={56} weight="duotone" className={isTargetReached ? 'animate-pulse' : ''} />
                        
                        {/* Ripple effect rings */}
                        <div className="absolute inset-0 rounded-full border-2 border-white/20 opacity-0 group-active:animate-ping"></div>
                    </button>

                    {/* Placeholder to balance the reset button, or we can add a 'Save' button.
                        Actually, it's already autosaving via localStorage. 
                        Let's just show an info icon that it autosaves. */}
                    <div className="w-14 h-14 rounded-full flex flex-col items-center justify-center text-[#B88A44]/60">
                        <PhosphorIcon icon="floppy-disk" size={20} weight="duotone" />
                        <span className="text-[8px] font-bold mt-1">AUTO</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TasbihScreen;
