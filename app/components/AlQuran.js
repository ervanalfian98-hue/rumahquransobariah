import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';

const stripHtml = (html) => html?.replace(/<[^>]*>?/gm, '') || '';

export const playWordAudio = (audioPath) => {
    // AUDIO PER KATA DINONAKTIFKAN SECARA SILENT
    return;
};

// --- AI SPEECH RECOGNITION HELPERS ---
const stripArabicDiacritics = (text) => {
    if (!text) return '';
    return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');
};

const calculateSimilarity = (str1, str2) => {
    if (str1 === str2) return 100;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator
            );
        }
    }
    const distance = track[str2.length][str1.length];
    const maxLen = Math.max(str1.length, str2.length);
    return ((maxLen - distance) / maxLen) * 100;
};
// -------------------------------------

const QuranScreen = () => {
    const currentAudioRef = useRef(null);

    const playVerseAudio = (url) => {
        if (!url || url === 'null' || url === 'undefined') return alert('Audio tidak tersedia untuk ayat ini');
        
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
        }
        
        let audioUrl;
        if (url.startsWith('http')) {
            audioUrl = url;
        } else if (url.startsWith('//')) {
            audioUrl = `https:${url}`;
        } else {
            const cleanUrl = url.replace(/^\/+/, '');
            audioUrl = `https://audio.qurancdn.com/${cleanUrl}`;
        }
            
        currentAudioRef.current = new Audio(audioUrl);
        currentAudioRef.current.play().catch(err => {
            console.error("Verse Audio Error:", err);
            alert("Maaf, rekaman audio untuk ayat ini sedang gangguan dari server pusat.");
        });
    };

    const [mode, setMode] = useState('per-kata');
    const [surahs, setSurahs] = useState([]);
    
    const [activeAIVerse, setActiveAIVerse] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [aiStats, setAiStats] = useState({ average: 0, sessions: 0 });
    
    useEffect(() => {
        const storedStats = localStorage.getItem('aiReadingStats');
        if (storedStats) {
            setAiStats(JSON.parse(storedStats));
        }
    }, []);
    
    // Setor Hafalan States
    const [setoranList, setoranListState] = useState([]);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [targetHafalan, setTargetHafalan] = useState('');

    useEffect(() => {
        const loadSetoran = () => {
            const saved = localStorage.getItem('rqs_setoran_hafalan');
            if (saved) {
                const allSetoran = JSON.parse(saved);
                setoranListState(allSetoran.filter(s => s.tholibah_name === 'Aisyah').sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal)));
            }
        };
        loadSetoran();
        window.addEventListener('storage', loadSetoran);
        window.addEventListener('rqs-setoran-updated', loadSetoran);
        return () => {
            window.removeEventListener('storage', loadSetoran);
            window.removeEventListener('rqs-setoran-updated', loadSetoran);
        };
    }, []);

    const activeSetoran = setoranList.find(s => s.status === 'menunggu' || s.status === 'disimak');

    const handleSetor = () => {
        if (!targetHafalan.trim()) return alert("Isi target hafalan dulu (misal: Al-Mulk ayat 1-10)");
        const newSetoran = {
            id: Date.now().toString(),
            tholibah_name: 'Aisyah',
            status: 'menunggu',
            surat_target: targetHafalan,
            ustadz_name: '',
            catatan: '',
            tanggal: new Date().toISOString()
        };
        const saved = JSON.parse(localStorage.getItem('rqs_setoran_hafalan') || '[]');
        saved.push(newSetoran);
        localStorage.setItem('rqs_setoran_hafalan', JSON.stringify(saved));
        window.dispatchEvent(new Event('rqs-setoran-updated'));
        setIsSetorModalOpen(false);
        setTargetHafalan('');
    };

    // Web Speech API states
    const [wordColors, setWordColors] = useState({});
    const recognitionRef = useRef(null);
    const isRecordingRef = useRef(false);

    const handleStopRecordingVerse = (verseKey) => {
        if (!isRecordingRef.current) return;
        isRecordingRef.current = false;
        
        setActiveAIVerse(null);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        
        // Kalkulasi skor akhir
        setWordColors((prevColors) => {
            const wordsCount = Object.keys(prevColors).length;
            let greenCount = 0;
            let yellowCount = 0;
            Object.values(prevColors).forEach(color => {
                if (color === 'green') greenCount++;
                if (color === 'yellow') yellowCount++;
            });
            
            let score = 0;
            if (wordsCount > 0) {
                score = Math.round(((greenCount + (yellowCount * 0.5)) / wordsCount) * 100);
                
                // Simpan ke local storage untuk rata-rata progres
                const currentStats = JSON.parse(localStorage.getItem('aiReadingStats')) || { average: 0, sessions: 0 };
                const newSessions = currentStats.sessions + 1;
                // Hitung rata-rata dengan 1 desimal (contoh: 72.6)
                const newAverage = Number((((currentStats.average * currentStats.sessions) + score) / newSessions).toFixed(1));
                
                const newStats = { average: newAverage, sessions: newSessions };
                localStorage.setItem('aiReadingStats', JSON.stringify(newStats));
                setAiStats(newStats); 
            }
            
            setIsAnalyzing(true);
            setTimeout(() => {
                setIsAnalyzing(false);
                setAiResult({
                    verseKey: verseKey,
                    score: score > 0 ? score : 0,
                    feedback: score >= 85 ? "Makhraj huruf Anda sangat baik dan lancar! Terus pertahankan tartilnya." 
                             : score >= 70 ? "Bacaan Anda cukup baik. Beberapa huruf terdengar kurang pas, perhatikan lagi artikulasinya."
                             : "Banyak huruf yang belum tertangkap dengan tepat. Mari ulangi pelan-pelan dan perjelas makhraj hurufnya.",
                });
            }, 1500);

            return prevColors;
        });
    };

    const handleStartRecordingVerse = (targetVerse) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Browser Anda tidak mendukung fitur deteksi suara AI ini. Harap gunakan Google Chrome atau Microsoft Edge.");
            return;
        }

        // Jika ada yang sedang berjalan, matikan dulu
        if (isRecordingRef.current) {
            handleStopRecordingVerse(activeAIVerse);
        }

        setWordColors({});
        setAiResult(null);
        setActiveAIVerse(targetVerse.verse_key);
        isRecordingRef.current = true;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ar-SA';
        recognitionRef.current = recognition;
        
        // Buat daftar kata yang diharapkan dari SATU ayat ini saja
        const expectedWords = [];
        targetVerse.words.forEach(w => {
            if (w.char_type_name === 'word') {
                expectedWords.push({
                    id: w.id,
                    cleanText: stripArabicDiacritics(w.text_uthmani)
                });
            }
        });

        recognition.onresult = (event) => {
            if (!isRecordingRef.current) return;

            let fullTranscriptStr = '';
            for (let i = 0; i < event.results.length; ++i) {
                fullTranscriptStr += event.results[i][0].transcript + ' ';
            }
            
            const fullTranscript = fullTranscriptStr.trim().replace(/\s+/g, ' ');
            const spokenWords = fullTranscript.split(' ').filter(w => w.length > 0);
            
            let pageIdx = 0;
            let hasStarted = false; 
            let consecutiveReds = 0;
            const newColors = {};
            
            for (let sIdx = 0; sIdx < spokenWords.length; sIdx++) {
                if (pageIdx >= expectedWords.length) break;
                
                const spoken = stripArabicDiacritics(spokenWords[sIdx]);
                if (spoken.length < 2) continue; 

                let bestSim = 0;
                let bestIdx = pageIdx;

                if (consecutiveReds >= 3) {
                    hasStarted = false;
                    consecutiveReds = 0;
                }

                const searchLimit = hasStarted ? Math.min(expectedWords.length, pageIdx + 6) : expectedWords.length;
                
                for (let look = pageIdx; look < searchLimit; look++) {
                    const sim = calculateSimilarity(spoken, expectedWords[look].cleanText);
                    if (sim > bestSim) {
                        bestSim = sim;
                        bestIdx = look;
                    }
                    if (sim === 100) break;
                }

                if (bestSim >= 75) {
                    hasStarted = true;
                    consecutiveReds = 0; 
                    pageIdx = bestIdx;
                    newColors[expectedWords[pageIdx].id] = 'green';
                    pageIdx++;
                } else if (bestSim >= 50) {
                    hasStarted = true;
                    consecutiveReds = 0;
                    pageIdx = bestIdx;
                    newColors[expectedWords[pageIdx].id] = 'yellow';
                    pageIdx++;
                } else {
                    if (hasStarted) {
                        newColors[expectedWords[pageIdx].id] = 'red';
                        consecutiveReds++;
                        pageIdx++;
                    }
                }
            }
            
            setWordColors(newColors);

            // AUTO-STOP jika sudah mencapai kata terakhir dari ayat
            if (pageIdx >= expectedWords.length) {
                handleStopRecordingVerse(targetVerse.verse_key);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (isRecordingRef.current) handleStopRecordingVerse(targetVerse.verse_key);
        };
        
        recognition.onend = () => {
            if (isRecordingRef.current) handleStopRecordingVerse(targetVerse.verse_key);
        };

        recognition.start();
    };

    // Helper untuk warna kata
    const getWordColorClass = (word, verseKey) => {
        if (word.char_type_name !== 'word') return 'text-[#4A1C14]';
        
        if (activeAIVerse === verseKey) {
            if (wordColors[word.id] === 'green') return 'text-green-600 font-bold';
            if (wordColors[word.id] === 'yellow') return 'text-yellow-500 font-bold';
            if (wordColors[word.id] === 'red') return 'text-red-500 font-bold';
            return 'text-[#4A1C14] opacity-30'; // Abu-abu jika belum dibaca
        }
        
        return `text-[#4A1C14] ${word.audio_url ? 'group-hover:text-[#B88A44]' : ''}`;
    };
    const [activeSurah, setActiveSurah] = useState(null);
    const [verses, setVerses] = useState([]);
    const [loadingVerses, setLoadingVerses] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    
    // Font Size
    const [fontSizeOffset, setFontSizeOffset] = useState(0);
    
    // Navigation UI
    const [navSearch, setNavSearch] = useState('');
    const [navSurah, setNavSurah] = useState(null);
    const [navAyah, setNavAyah] = useState(1);
    const [navPage, setNavPage] = useState(1);
    
    // Bookmark
    const [bookmarks, setBookmarks] = useState({});

    const activeSurahRef = useRef(activeSurah);

    useEffect(() => {
        activeSurahRef.current = activeSurah;
    }, [activeSurah]);

    useEffect(() => {
        const handleBack = (e) => {
            if (activeSurahRef.current) {
                setActiveSurah(null);
                setVerses([]);
                e.preventDefault();
            }
        };
        window.addEventListener('app-back-pressed', handleBack);
        
        // Load bookmarks
        const saved = localStorage.getItem('rqs_bookmarks');
        if(saved) setBookmarks(JSON.parse(saved));
        
        return () => window.removeEventListener('app-back-pressed', handleBack);
    }, []);

    useEffect(() => {
        if (!activeSurah && surahs.length === 0) {
            fetch('https://api.quran.com/api/v4/chapters?language=id')
                .then(res => res.json())
                .then(data => {
                    if(data && data.chapters) {
                        setSurahs(data.chapters);
                        if (!navSurah) {
                            setNavSurah(data.chapters[0]);
                            setNavPage(data.chapters[0].pages[0]);
                        }
                    }
                })
                .catch(err => console.error("Error fetching surahs:", err));
        }
    }, [activeSurah, surahs.length, navSurah]);

    const handlePageChange = async (e) => {
        const page = parseInt(e.target.value);
        setNavPage(page);
        try {
            const res = await fetch(`https://api.quran.com/api/v4/verses/by_page/${page}?per_page=1`);
            const data = await res.json();
            if(data.verses && data.verses.length > 0) {
                const verseKey = data.verses[0].verse_key.split(':');
                const sId = parseInt(verseKey[0]);
                const aId = parseInt(verseKey[1]);
                const s = surahs.find(sur => sur.id === sId);
                if(s) setNavSurah(s);
                setNavAyah(aId);
            }
        } catch(err) { console.error(err); }
    };

    const startReading = (surah, page, selectedMode) => {
        window.history.pushState({ surah: surah.id }, '');
        setActiveSurah(surah);
        setCurrentPage(page);
        setMode(selectedMode);
        
        setLoadingVerses(true);
        fetch(`https://api.quran.com/api/v4/verses/by_page/${page}?language=id&words=true&word_fields=text_uthmani,translation,transliteration&translations=33&audio=7`)
            .then(res => res.json())
            .then(data => {
                if(data && data.verses) {
                    const filtered = data.verses.filter(v => v.verse_key.split(':')[0] === String(surah.id));
                    setVerses(filtered);
                }
                setLoadingVerses(false);
            })
            .catch(err => {
                console.error("Error fetching verses:", err);
                setLoadingVerses(false);
            });
    };

    const handleBukaQuran = async (selectedMode) => {
        try {
            const res = await fetch(`https://api.quran.com/api/v4/verses/by_key/${navSurah.id}:${navAyah}`);
            const data = await res.json();
            if(data.verse && data.verse.page_number) {
                startReading(navSurah, data.verse.page_number, selectedMode);
            } else {
                startReading(navSurah, navPage, selectedMode);
            }
        } catch (e) {
            startReading(navSurah, navPage, selectedMode);
        }
    };

    const handleSurahClickList = (surah) => {
        // Find exact start page and verse 1
        startReading(surah, surah.pages[0], 'per-kata');
    };
    
    const handleLoadNextPage = () => {
        const next = currentPage + 1;
        if (next <= activeSurah.pages[1]) {
            setLoadingMore(true);
            fetch(`https://api.quran.com/api/v4/verses/by_page/${next}?language=id&words=true&word_fields=text_uthmani,translation,transliteration&translations=33&audio=7`)
                .then(res => res.json())
                .then(data => {
                    if(data && data.verses) {
                        const filtered = data.verses.filter(v => v.verse_key.split(':')[0] === String(activeSurah.id));
                        setVerses(prev => [...prev, ...filtered]);
                    }
                    setCurrentPage(next);
                    setLoadingMore(false);
                })
                .catch(err => {
                    console.error("Error fetching next page:", err);
                    setLoadingMore(false);
                });
        }
    }

    const saveBookmark = (verse) => {
        setBookmarks(prev => {
            const existing = prev[activeSurah.id];
            let updated;
            
            if (existing && existing.verseKey === verse.verse_key) {
                // Remove bookmark
                updated = { ...prev };
                delete updated[activeSurah.id];
                alert(`Bookmark dihapus dari Surah ${activeSurah.name_simple}`);
            } else {
                // Add/Update bookmark
                const bookmarkData = {
                    surahId: activeSurah.id,
                    surahName: activeSurah.name_simple,
                    verseNumber: verse.verse_number,
                    verseKey: verse.verse_key,
                    page: currentPage,
                    timestamp: Date.now()
                };
                updated = { ...prev, [activeSurah.id]: bookmarkData };
                alert(`Disimpan: Surah ${activeSurah.name_simple} Ayat ${verse.verse_number}`);
            }
            
            localStorage.setItem('rqs_bookmarks', JSON.stringify(updated));
            return updated;
        });
    };



    const goBack = () => {
        window.history.back();
    };

    const bookmarkList = Object.values(bookmarks).sort((a,b) => b.timestamp - a.timestamp);
    const filteredSurahs = surahs.filter(s => s.name_simple.toLowerCase().includes(navSearch.toLowerCase()) || s.name_arabic.includes(navSearch));

    if (activeSurah) {
        return (
            <div className="pb-32 h-full flex flex-col animate-in fade-in duration-300 bg-[#FDFBF7] overflow-y-auto hide-scrollbar relative z-30">
                {/* Header Surah */}
                <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                    <button onClick={goBack} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                        <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Surah {activeSurah.name_simple}</h2>
                        <p className="text-[10px] text-[#B88A44]">{activeSurah.translated_name.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-[11px] font-bold text-[#B88A44] bg-[#FCF7E8] px-2.5 py-1 rounded-md border border-[#E8D2A6]/50 shadow-sm" title="Halaman Mushaf">
                            Hal. {currentPage}
                        </div>
                        <div className="flex items-center bg-[#FCF7E8] rounded-md border border-[#E8D2A6]/50 overflow-hidden shadow-sm">
                            <button onClick={() => setFontSizeOffset(prev => prev - 2)} className="px-2.5 py-1 text-[#4A1C14] hover:bg-[#E8D2A6] transition-colors border-r border-[#E8D2A6]/50" title="Perkecil Teks">
                                <span className="text-[11px] font-black">A-</span>
                            </button>
                            <button onClick={() => setFontSizeOffset(prev => prev + 2)} className="px-2.5 py-1 text-[#4A1C14] hover:bg-[#E8D2A6] transition-colors" title="Perbesar Teks">
                                <span className="text-[13px] font-black">A+</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Mode Toggle */}
                <div className="px-5 mt-4">
                    <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-[#E8D2A6]/40 relative z-10">
                        <button onClick={() => setMode('per-kata')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all duration-300 ${mode === 'per-kata' ? 'bg-[#4A1C14] text-[#FCF7E8] shadow-md' : 'text-[#4A1C14]/70 hover:bg-[#F5EBE9]'}`}>Qur'an Per Kata</button>
                        <button onClick={() => setMode('per-ayat')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all duration-300 ${mode === 'per-ayat' ? 'bg-[#4A1C14] text-[#FCF7E8] shadow-md' : 'text-[#4A1C14]/70 hover:bg-[#F5EBE9]'}`}>Qur'an Per Ayat</button>
                    </div>
                </div>



                {/* Verses Container */}
                <div className="px-5 mt-6 space-y-6">
                    {loadingVerses ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-60">
                            <PhosphorIcon icon="spinner" size={32} className="animate-spin text-[#B88A44] mb-3" />
                            <p className="text-xs font-medium text-[#4A1C14]">Memuat Mushaf Halaman {currentPage}...</p>
                        </div>
                    ) : (
                        <>
                            {verses.map((verse, index) => (
                                <div key={verse.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D2A6]/40 relative">
                                    {/* Header Ayat & Tombol */}
                                    <div className="flex justify-between items-center mb-6 border-b border-[#E8D2A6]/30 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex items-center justify-center w-11 h-11 shrink-0" title={`Ayat ${verse.verse_number}`}>
                                                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#B88A44] drop-shadow-sm">
                                                    <path fill="rgba(184, 138, 68, 0.15)" d="M50,3 C52,15 62,18 70,15 C68,26 75,32 85,30 C78,40 82,48 95,50 C82,52 78,60 85,70 C75,68 68,74 70,85 C62,82 52,85 50,97 C48,85 38,82 30,85 C32,74 25,68 15,70 C22,60 18,52 5,50 C18,48 22,40 15,30 C25,32 32,26 30,15 C38,18 48,15 50,3 Z" />
                                                    <path fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" d="M50,3 C52,15 62,18 70,15 C68,26 75,32 85,30 C78,40 82,48 95,50 C82,52 78,60 85,70 C75,68 68,74 70,85 C62,82 52,85 50,97 C48,85 38,82 30,85 C32,74 25,68 15,70 C22,60 18,52 5,50 C18,48 22,40 15,30 C25,32 32,26 30,15 C38,18 48,15 50,3 Z" />
                                                    <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4"/>
                                                    <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                                                </svg>
                                                <span className="relative z-10 text-[13px] font-black text-[#4A1C14] mt-0.5">
                                                    {verse.verse_number}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {mode === 'per-kata' && (
                                                <button 
                                                    onClick={() => activeAIVerse === verse.verse_key ? handleStopRecordingVerse(verse.verse_key) : handleStartRecordingVerse(verse)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm transition-all ${activeAIVerse === verse.verse_key ? 'bg-red-500 text-white animate-pulse' : 'bg-[#FCF7E8] text-[#B88A44] border border-[#B88A44]/50 hover:bg-[#B88A44] hover:text-white'}`}
                                                >
                                                    <PhosphorIcon icon={activeAIVerse === verse.verse_key ? "stop-circle" : "microphone-stage"} size={16} weight="fill" />
                                                    {activeAIVerse === verse.verse_key ? "Hentikan AI" : "Setor AI"}
                                                </button>
                                            )}
                                            <button onClick={() => playVerseAudio(verse.audio?.url)} className="flex items-center gap-1.5 bg-[#4A1C14] text-[#FCF7E8] px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-[#3A140E] transition-colors shadow-sm">
                                                <PhosphorIcon icon="play-circle" size={16} weight="fill" />
                                                Putar Ayat
                                            </button>
                                            <button 
                                                onClick={() => saveBookmark(verse)} 
                                                className="bg-[#FCF7E8] p-1.5 rounded-full hover:bg-[#E8D2A6] transition-colors border border-[#B88A44]/30" 
                                                title="Tandai Terakhir Dibaca"
                                            >
                                                <PhosphorIcon 
                                                    icon="bookmark-simple" 
                                                    size={20} 
                                                    weight={bookmarks[activeSurah.id]?.verseKey === verse.verse_key ? "fill" : "regular"} 
                                                    className={bookmarks[activeSurah.id]?.verseKey === verse.verse_key ? "text-[#B88A44]" : "text-[#4A1C14]/60"} 
                                                />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {mode === 'per-kata' ? (
                                        <div className="flex flex-wrap gap-y-10 gap-x-5 justify-start mt-2" dir="rtl">
                                            {verse.words.map((word, wIdx) => (
                                                <div 
                                                    key={`${word.id}-${wIdx}`} 
                                                    className={`flex flex-col items-center group w-auto ${word.audio_url ? 'cursor-pointer' : 'cursor-default'}`} 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        // PERHATIKAN BARIS INI: Kita kirim word.audio_url SECARA LANGSUNG
                                                        playWordAudio(word.audio_url); 
                                                    }} 
                                                    title={word.char_type_name !== 'end' && word.char_type_name !== 'waqaf' ? "Klik untuk putar audio kata" : "Tanda baca (tanpa audio)"}
                                                >
                                                    <span className={`font-amiri transition-colors leading-[1.8] ${getWordColorClass(word, verse.verse_key)}`} style={{ fontSize: `${36 + fontSizeOffset}px` }} dir="rtl">
                                                        {word.text_uthmani}
                                                    </span>
                                                    {word.char_type_name !== 'end' && (
                                                        <>
                                                            <span className="text-[11px] italic font-semibold text-[#B88A44] mt-1 text-center max-w-[80px] leading-tight" dir="ltr">
                                                                {stripHtml(word.transliteration?.text)}
                                                            </span>
                                                            <span className="text-[11px] font-medium text-[#4A1C14]/70 mt-1 text-center max-w-[80px] leading-tight" dir="ltr">
                                                                {stripHtml(word.translation?.text)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-5 mt-2">
                                            <div className="font-amiri text-[#4A1C14] leading-[2.5] text-right pr-2" style={{ fontSize: `${34 + fontSizeOffset}px` }} dir="rtl">
                                                {verse.words.map((w, idx) => (
                                                    <span key={idx} className="px-1 inline-block">
                                                        {w.text_uthmani}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-[13px] text-[#4A1C14]/80 leading-relaxed border-t border-[#E8D2A6]/30 pt-4" dir="ltr">
                                                <span className="text-[11px] italic text-[#B88A44] block mb-2">{stripHtml(verse.words.filter(w => w.char_type_name !== 'end').map(w => w.transliteration?.text).join(' '))}</span>
                                                {stripHtml(verse.translations?.[0]?.text)}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Hasil AI Per Ayat */}
                                    {mode === 'per-kata' && activeAIVerse === verse.verse_key && isAnalyzing && (
                                        <div className="mt-4 flex flex-col items-center justify-center py-4 bg-[#FCF7E8] rounded-xl border border-[#E8D2A6]">
                                            <PhosphorIcon icon="circle-notch" size={24} className="animate-spin text-[#B88A44] mb-2" />
                                            <p className="font-bold text-[#4A1C14] text-[11px] animate-pulse">AI sedang memproses...</p>
                                        </div>
                                    )}
                                    {mode === 'per-kata' && aiResult?.verseKey === verse.verse_key && (
                                        <div className="mt-4 bg-[#FCF7E8] rounded-xl p-4 border border-[#E8D2A6] shadow-inner">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-extrabold text-[#4A1C14] text-xs flex items-center gap-1">
                                                    <PhosphorIcon icon="robot" weight="fill" className="text-[#B88A44]" />
                                                    Nilai AI:
                                                </h4>
                                                <div className="text-[#B88A44] font-black text-lg">
                                                    {aiResult.score}<span className="text-[10px]">/100</span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-bold text-[#4A1C14] mb-1">
                                                Predikat: {aiResult.score >= 85 ? 'Sangat Baik' : aiResult.score >= 70 ? 'Baik' : 'Perlu Perbaikan'}
                                            </p>
                                            <p className="text-[10px] text-[#4A1C14]/80 leading-relaxed font-medium bg-white p-2 rounded-lg border border-[#E8D2A6]/50">
                                                "{aiResult.feedback}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {/* Load Next Page Button */}
                            {currentPage < activeSurah.pages[1] && (
                                <button 
                                    onClick={handleLoadNextPage}
                                    disabled={loadingMore}
                                    className="w-full bg-[#4A1C14] text-[#FCF7E8] font-bold text-xs py-4 rounded-xl shadow-md hover:bg-[#3A140E] transition-colors disabled:opacity-50"
                                >
                                    {loadingMore ? 'Memuat Halaman Berikutnya...' : `Muat Halaman ${currentPage + 1} (Sesuai Mushaf)`}
                                </button>
                            )}
                            {currentPage >= activeSurah.pages[1] && verses.length > 0 && (
                                <div className="text-center text-[#B88A44] text-[11px] font-bold py-4">
                                    Alhamdulillah, akhir dari surah {activeSurah.name_simple}.
                                </div>
                            )}
                        </>
                    )}
                </div>


            </div>
        );
    }

    return (
        <div className="bg-[#F5EBE9] min-h-screen pb-20">
            {/* Header */}
            <div className="bg-[#4A1C14] pt-12 pb-6 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#E8D2A6 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-white font-bold text-2xl mt-4">Al-Qur'an</h2>
                        <p className="text-[#E8D2A6] text-sm mt-1">Mushaf Utsmani & Pembelajaran</p>
                    </div>
                    <div className="w-12 h-12 bg-[#B88A44] rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                        <PhosphorIcon icon="book-open-text" size={24} weight="duotone" className="text-white" />
                    </div>
                </div>
            </div>
            
            <div className="px-5 space-y-6 relative z-10 mt-6">
                {/* AI Progress Card */}
                <div className="bg-gradient-to-r from-[#B88A44] to-[#4A1C14] rounded-[2rem] p-5 shadow-lg relative overflow-hidden text-white">
                    <PhosphorIcon icon="robot" size={80} weight="duotone" className="absolute -right-4 -bottom-4 text-white opacity-10" />
                    <h3 className="font-bold text-[14px] mb-1">Progress Bacaan AI</h3>
                    <p className="text-[10px] text-white/80 mb-3">
                        {aiStats.sessions > 0 ? `Rata-rata dari ${aiStats.sessions} kali evaluasi makhraj Anda` : 'Sistem AI menilai tajwid dan makhraj Anda'}
                    </p>
                    <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-2">
                        <div className="bg-[#FCF7E8] h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${aiStats.average || 0}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-white/90">
                        <span>Skor Rata-rata: {aiStats.average || 0}</span>
                        <span>Predikat: {aiStats.sessions === 0 ? 'Belum Ada Tes' : aiStats.average >= 85 ? 'Sangat Baik' : aiStats.average >= 70 ? 'Baik' : 'Perlu Latihan'}</span>
                    </div>
                </div>

                {/* Setor Hafalan Feature */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D2A6]/40 relative z-10">
                    <div className="flex items-center gap-3 mb-4 border-b border-[#E8D2A6]/30 pb-3">
                        <div className="bg-[#FCF7E8] p-2.5 rounded-xl text-[#B88A44]">
                            <PhosphorIcon icon="microphone-stage" size={24} weight="fill" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#4A1C14] text-[13px]">Setor Hafalan</h3>
                            <p className="text-[10px] text-[#4A1C14]/60">Setorkan hafalanmu langsung ke Ustadz/Ustadzah</p>
                        </div>
                    </div>

                    {!activeSetoran ? (
                        <button 
                            onClick={() => setIsSetorModalOpen(true)}
                            className="w-full bg-[#B88A44] text-white font-bold text-xs py-3.5 rounded-xl shadow-md hover:bg-[#A37936] transition-colors flex items-center justify-center gap-2"
                        >
                            <PhosphorIcon icon="paper-plane-tilt" size={18} weight="fill" />
                            Minta Jadwal Setoran
                        </button>
                    ) : (
                        <div className={`p-4 rounded-xl border ${activeSetoran.status === 'menunggu' ? 'bg-[#FCF7E8] border-[#E8D2A6]' : 'bg-emerald-50 border-emerald-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${activeSetoran.status === 'menunggu' ? 'bg-[#B88A44] text-white' : 'bg-emerald-500 text-white'}`}>
                                    {activeSetoran.status === 'menunggu' ? 'Menunggu Antrian' : 'Sedang Disimak'}
                                </span>
                                <span className="text-[9px] text-[#4A1C14]/60">{new Date(activeSetoran.tanggal).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                            <p className="text-xs font-bold text-[#4A1C14] mb-1">Target: {activeSetoran.surat_target}</p>
                            {activeSetoran.status === 'menunggu' ? (
                                <p className="text-[10px] text-[#4A1C14]/70 flex items-center gap-1 mt-2">
                                    <PhosphorIcon icon="hourglass-high" className="animate-spin" /> Menunggu ustadz/ustadzah menyimak...
                                </p>
                            ) : (
                                <p className="text-[10px] text-emerald-700 flex items-center gap-1 mt-2 font-medium">
                                    <PhosphorIcon icon="headphones" size={14} weight="fill" /> Disimak oleh: {activeSetoran.ustadz_name}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Riwayat Setoran */}
                    {setoranList.filter(s => s.status === 'selesai').length > 0 && (
                        <div className="mt-5 pt-4 border-t border-[#E8D2A6]/30">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-[#4A1C14] text-[11px] flex items-center gap-1.5">
                                    <PhosphorIcon icon="clock-counter-clockwise" size={14} /> Riwayat Setoran
                                </h4>
                                {setoranList.filter(s => s.status === 'selesai').length > 2 && (
                                    <button onClick={() => setIsHistoryModalOpen(true)} className="text-[9px] text-[#B88A44] font-bold hover:underline">
                                        Lihat semua histori
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {setoranList.filter(s => s.status === 'selesai').slice(0, 2).map(s => (
                                    <div key={s.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[11px] font-bold text-[#4A1C14]">{s.surat_target}</p>
                                            <span className="text-[9px] text-gray-500">{new Date(s.tanggal).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                        </div>
                                        <p className="text-[9px] text-[#B88A44] font-medium mb-1.5">Disimak oleh: {s.ustadz_name}</p>
                                        <div className="bg-white p-2 rounded-lg border border-gray-100">
                                            <p className="text-[10px] text-[#4A1C14]/80 italic">"{s.catatan || 'Sempurna! Tidak ada koreksi.'}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Histori Setoran */}
                <AnimatePresence>
                    {isHistoryModalOpen && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5 backdrop-blur-sm"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                                className="bg-[#FDFBF7] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[80vh]"
                            >
                                <div className="p-4 bg-white border-b border-[#E8D2A6]/30 flex items-center justify-between sticky top-0 z-10">
                                    <h3 className="text-sm font-bold text-[#4A1C14] flex items-center gap-2">
                                        <PhosphorIcon icon="clock-counter-clockwise" size={18} className="text-[#B88A44]" />
                                        Semua Histori Setoran
                                    </h3>
                                    <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1.5">
                                        <PhosphorIcon icon="x" size={16} weight="bold" />
                                    </button>
                                </div>
                                
                                <div className="p-5 overflow-y-auto space-y-3 bg-[#FDFBF7]">
                                    {setoranList.filter(s => s.status === 'selesai').map(s => (
                                        <div key={s.id} className="bg-white p-3.5 rounded-xl border border-[#E8D2A6]/50 shadow-sm">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <p className="text-[12px] font-bold text-[#4A1C14]">{s.surat_target}</p>
                                                <span className="text-[9px] text-[#B88A44] font-medium bg-[#FCF7E8] px-2 py-0.5 rounded-md">{new Date(s.tanggal).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                            <p className="text-[10px] text-emerald-700 font-medium mb-2 flex items-center gap-1">
                                                <PhosphorIcon icon="check-circle" size={12} weight="fill" /> Disimak oleh: {s.ustadz_name}
                                            </p>
                                            <div className="bg-[#FCF7E8] p-2.5 rounded-lg border border-[#E8D2A6]/30">
                                                <p className="text-[11px] text-[#4A1C14]/80 italic">"{s.catatan || 'Sempurna! Tidak ada koreksi.'}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modal Setor Hafalan */}
                <AnimatePresence>
                    {isSetorModalOpen && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5 backdrop-blur-sm"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative"
                            >
                                <button onClick={() => setIsSetorModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1">
                                    <PhosphorIcon icon="x" size={20} weight="bold" />
                                </button>
                                <div className="w-12 h-12 bg-[#FCF7E8] rounded-2xl flex items-center justify-center text-[#B88A44] mb-4 shadow-sm border border-[#E8D2A6]">
                                    <PhosphorIcon icon="microphone-stage" size={24} weight="fill" />
                                </div>
                                <h3 className="text-lg font-bold text-[#4A1C14] mb-1">Mulai Setor Hafalan</h3>
                                <p className="text-[11px] text-[#4A1C14]/60 mb-5">Masukkan target surah atau ayat yang ingin kamu setorkan hari ini.</p>
                                
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-[#4A1C14] uppercase tracking-wider block mb-1.5">Target Hafalan</label>
                                        <input 
                                            type="text" 
                                            value={targetHafalan}
                                            onChange={(e) => setTargetHafalan(e.target.value)}
                                            placeholder="Cth: Surah Al-Mulk ayat 1-10" 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#4A1C14] outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={handleSetor}
                                    className="w-full bg-[#B88A44] text-white font-bold text-sm py-3.5 rounded-xl shadow-md hover:bg-[#A37936] transition-colors"
                                >
                                    Kirim Permintaan
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pencarian dan Navigasi */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D2A6]/40 relative z-10">
                    <h3 className="font-bold text-[#4A1C14] mb-3 text-[13px]">Pilih Surah, Ayat & Halaman</h3>
                    
                    {/* Search Input */}
                    <div className="flex items-center bg-[#FDFBF7] border border-[#E8D2A6]/80 rounded-xl px-3 py-2.5 mb-3">
                        <PhosphorIcon icon="magnifying-glass" size={18} className="text-[#B88A44] mr-2" />
                        <input 
                            type="text" 
                            placeholder="Cari Surah (cth: Yasin, Al-Kahf)..." 
                            value={navSearch}
                            onChange={(e) => setNavSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs w-full text-[#4A1C14] placeholder-[#4A1C14]/40 font-medium" 
                        />
                    </div>

                    {/* Dropdowns */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Dropdown Surah */}
                        <select 
                            className="bg-[#FDFBF7] border border-[#E8D2A6]/80 rounded-xl px-3 py-2.5 text-[11px] text-[#4A1C14] font-semibold outline-none w-full"
                            value={navSurah ? navSurah.id : ''}
                            onChange={(e) => {
                                const s = surahs.find(sur => sur.id === parseInt(e.target.value));
                                if(s) {
                                    setNavSurah(s);
                                    setNavAyah(1);
                                    setNavPage(s.pages[0]);
                                }
                            }}
                        >
                            {filteredSurahs.map(s => (
                                <option key={s.id} value={s.id}>{s.id}. {s.name_simple}</option>
                            ))}
                        </select>

                        {/* Dropdown Ayat */}
                        <select 
                            className="bg-[#FDFBF7] border border-[#E8D2A6]/80 rounded-xl px-3 py-2.5 text-[11px] text-[#4A1C14] font-semibold outline-none w-full"
                            value={navAyah}
                            onChange={(e) => setNavAyah(parseInt(e.target.value))}
                            disabled={!navSurah}
                        >
                            {navSurah && Array.from({length: navSurah.verses_count}, (_, i) => i + 1).map(a => (
                                <option key={a} value={a}>Ayat {a}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dropdown Halaman */}
                    <div className="mb-4">
                        <select 
                            className="w-full bg-[#FDFBF7] border border-[#E8D2A6]/80 rounded-xl px-3 py-2.5 text-[11px] text-[#4A1C14] font-semibold outline-none"
                            value={navPage}
                            onChange={handlePageChange}
                        >
                            {Array.from({length: 604}, (_, i) => i + 1).map(p => (
                                <option key={p} value={p}>Halaman {p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Buka Quran Buttons */}
                    <div className="flex gap-2">
                        <button onClick={() => handleBukaQuran('per-kata')} className="flex-1 bg-[#FCF7E8] border border-[#B88A44]/50 rounded-xl py-3 text-[#4A1C14] font-bold text-xs hover:bg-[#B88A44] hover:text-white transition-colors shadow-sm">
                            Buka Per Kata
                        </button>
                        <button onClick={() => handleBukaQuran('per-ayat')} className="flex-1 bg-[#4A1C14] border border-[#4A1C14] rounded-xl py-3 text-[#FCF7E8] font-bold text-xs hover:bg-[#3A140E] transition-colors shadow-sm">
                            Buka Per Ayat
                        </button>
                    </div>
                </div>

                {/* Terakhir Dibaca */}
                <div>
                    <h3 className="font-bold text-[#4A1C14] mb-3 text-[13px]">Terakhir Dibaca</h3>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-1 snap-x">
                        {bookmarkList.length > 0 ? (
                            bookmarkList.map(bm => (
                                <div 
                                    key={bm.surahId}
                                    onClick={() => {
                                        const s = surahs.find(sur => sur.id === bm.surahId);
                                        if(s) startReading(s, bm.page, 'per-kata');
                                    }}
                                    className="snap-start min-w-[160px] bg-white border border-[#B88A44] rounded-2xl p-4 shadow-md relative cursor-pointer hover:bg-[#FCF7E8] transition-colors"
                                >
                                    <PhosphorIcon icon="bookmark-simple" weight="fill" size={20} className="absolute top-3 right-3 text-[#B88A44]" />
                                    <h4 className="font-bold text-sm text-[#4A1C14] mt-2">Surah {bm.surahName}</h4>
                                    <p className="text-[10px] font-bold text-[#4A1C14]/60 mt-1">Ayat {bm.verseNumber} (Hal {bm.page})</p>
                                    <span className="absolute bottom-3 right-3 text-[9px] text-white bg-[#B88A44] px-2 py-0.5 rounded-full">Lanjutkan</span>
                                </div>
                            ))
                        ) : (
                            <div className="snap-start w-full bg-white border border-dashed border-[#E8D2A6] rounded-2xl p-4 flex flex-col items-center justify-center opacity-60">
                                <PhosphorIcon icon="bookmark-simple" size={24} className="text-[#B88A44] mb-2" />
                                <p className="text-[10px] font-medium text-[#4A1C14]">Belum ada data terakhir dibaca</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Daftar Surah Full */}
                <div className="pt-2">
                    <h3 className="font-bold text-[#4A1C14] mb-4 text-[13px]">Daftar Surah (Lengkap)</h3>
                    <div className="space-y-3">
                        {surahs.length === 0 ? (
                            <div className="flex flex-col items-center py-10 opacity-60">
                                <PhosphorIcon icon="spinner" size={32} className="animate-spin text-[#B88A44] mb-3" />
                                <p className="text-xs text-[#4A1C14]">Memuat daftar surah...</p>
                            </div>
                        ) : (
                            surahs.map((surah) => (
                                <div key={surah.id} onClick={() => handleSurahClickList(surah)} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/40 cursor-pointer hover:border-[#B88A44]/50 hover:shadow-md transition-all active:scale-[0.98]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-[#FCF7E8] flex items-center justify-center font-bold text-[#4A1C14] text-[15px] shadow-inner">
                                            {surah.id}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#4A1C14] text-[15px] leading-tight mb-1">{surah.name_simple}</h4>
                                            <div className="flex items-center gap-1.5 text-[#4A1C14]/60 text-[9px] font-bold tracking-widest uppercase">
                                                <span>{surah.revelation_place === 'makkah' ? 'MAKKIYAH' : 'MADANIYAH'}</span>
                                                <span className="w-1 h-1 rounded-full bg-[#B88A44]"></span>
                                                <span>{surah.verses_count} Ayat</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-amiri text-2xl font-bold text-[#B88A44] leading-none pt-2" dir="rtl">
                                        {surah.name_arabic}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default QuranScreen;
