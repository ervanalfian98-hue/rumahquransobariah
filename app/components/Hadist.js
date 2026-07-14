import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';

const API_BASE = 'https://hadis-api-id.vercel.app/hadith';

const HadistScreen = ({ setActiveTab }) => {
    const [books, setBooks] = useState([]);
    const [loadingBooks, setLoadingBooks] = useState(true);
    
    const [selectedBook, setSelectedBook] = useState(null);
    const [hadiths, setHadiths] = useState([]);
    const [loadingHadiths, setLoadingHadiths] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchNumber, setSearchNumber] = useState('');
    const [searchedHadith, setSearchedHadith] = useState(null);
    const [searchError, setSearchError] = useState('');

    // Fetch list of books (perawi)
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetch(API_BASE);
                const data = await res.json();
                setBooks(data);
            } catch (error) {
                console.error("Gagal mengambil data perawi hadis:", error);
            } finally {
                setLoadingBooks(false);
            }
        };
        fetchBooks();
    }, []);

    // Fetch hadiths when book or page changes
    useEffect(() => {
        if (!selectedBook) return;

        const fetchHadiths = async () => {
            setLoadingHadiths(true);
            try {
                const res = await fetch(`${API_BASE}/${selectedBook.slug}?page=${page}&limit=20`);
                const data = await res.json();
                setHadiths(data.items || []);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                }
            } catch (error) {
                console.error("Gagal mengambil data hadis:", error);
            } finally {
                setLoadingHadiths(false);
            }
        };

        fetchHadiths();
        // Scroll to top of hadith list
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [selectedBook, page]);

    const handleBack = () => {
        if (selectedBook) {
            setSelectedBook(null);
            setHadiths([]);
            setPage(1);
            setSearchNumber('');
            setSearchedHadith(null);
            setSearchError('');
        } else {
            setActiveTab('kategori');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchNumber.trim()) {
            setSearchedHadith(null);
            setSearchError('');
            return;
        }

        setLoadingHadiths(true);
        setSearchError('');
        try {
            const res = await fetch(`${API_BASE}/${selectedBook.slug}/${searchNumber}`);
            if (!res.ok) throw new Error('Hadis tidak ditemukan');
            const data = await res.json();
            
            // API returns error status in body sometimes
            if (data.error || !data.number) {
                throw new Error('Hadis tidak ditemukan');
            }
            
            setSearchedHadith(data);
        } catch (error) {
            setSearchError('Hadis tidak ditemukan. Pastikan nomor yang dimasukkan benar.');
            setSearchedHadith(null);
        } finally {
            setLoadingHadiths(false);
        }
    };

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={handleBack} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">
                        {selectedBook ? selectedBook.name : 'Kumpulan Hadis'}
                    </h2>
                    <p className="text-[10px] text-[#B88A44]">
                        {selectedBook ? `Total ${selectedBook.total} Hadis` : 'Pilih Perawi Hadis'}
                    </p>
                </div>
            </div>

            <div className="p-5">
                {!selectedBook ? (
                    // Tampilan Daftar Perawi
                    <div>
                        {loadingBooks ? (
                            <div className="flex justify-center items-center py-20">
                                <PhosphorIcon icon="spinner-gap" size={32} className="animate-spin text-[#B88A44]" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {books.map((book, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedBook(book)}
                                        className="bg-white p-4 rounded-2xl shadow-sm border border-[#E8D2A6]/40 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:border-[#B88A44] transition-colors relative overflow-hidden group"
                                    >
                                        <PhosphorIcon icon="book-bookmark" size={40} className="text-[#FCF7E8] absolute -right-3 -bottom-3 opacity-50 group-hover:scale-110 transition-transform" weight="fill" />
                                        <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mb-1 z-10">
                                            <PhosphorIcon icon="book-open-text" size={20} weight="duotone" />
                                        </div>
                                        <div className="z-10">
                                            <h3 className="font-bold text-[#4A1C14] text-[13px]">{book.name}</h3>
                                            <p className="text-[10px] text-[#B88A44] mt-0.5">{book.total} Hadis</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Tampilan Daftar Hadis
                    <div className="space-y-4">
                        {/* Kolom Pencarian */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4 bg-white p-2 rounded-2xl shadow-sm border border-[#E8D2A6]/40">
                            <input 
                                type="number" 
                                value={searchNumber}
                                onChange={(e) => setSearchNumber(e.target.value)}
                                placeholder={`Cari nomor (1 - ${selectedBook.total})`}
                                className="flex-1 bg-transparent border-none text-xs text-[#4A1C14] px-3 py-2 outline-none"
                            />
                            {searchNumber && (
                                <button type="button" onClick={() => { setSearchNumber(''); setSearchedHadith(null); setSearchError(''); }} className="p-1 text-gray-400 hover:text-red-500">
                                    <PhosphorIcon icon="x-circle" size={16} weight="fill" />
                                </button>
                            )}
                            <button type="submit" className="bg-[#FCF7E8] text-[#B88A44] p-2 rounded-xl flex items-center justify-center hover:bg-[#E8D2A6]/50 transition-colors">
                                <PhosphorIcon icon="magnifying-glass" size={18} weight="bold" />
                            </button>
                        </form>

                        {searchError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-medium text-center">
                                {searchError}
                            </div>
                        )}

                        {loadingHadiths ? (
                            <div className="flex justify-center items-center py-20">
                                <PhosphorIcon icon="spinner-gap" size={32} className="animate-spin text-[#B88A44]" />
                            </div>
                        ) : (
                            <>
                                {(searchedHadith ? [searchedHadith] : hadiths).map((hadith, idx) => (
                                    <div key={idx} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-[#E8D2A6]/40 relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-[#FCF7E8] px-3 py-1 rounded-lg border border-[#E8D2A6]/50 inline-flex items-center gap-1.5">
                                                <PhosphorIcon icon="hash" size={12} className="text-[#B88A44]" weight="bold" />
                                                <span className="text-xs font-bold text-[#4A1C14]">{hadith.number}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <p className="text-right text-lg md:text-xl font-arabic leading-[2.5] text-[#4A1C14]" dir="rtl">
                                                {hadith.arab}
                                            </p>
                                        </div>
                                        
                                        <div className="border-t border-[#E8D2A6]/30 pt-4">
                                            <p className="text-xs text-[#4A1C14]/80 leading-relaxed text-justify">
                                                <span className="font-bold text-[#B88A44] mr-1">Artinya:</span>
                                                {hadith.id}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {!searchedHadith && totalPages > 1 && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-[#E8D2A6]/40 mt-6">
                                        <button 
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#FCF7E8] text-[#4A1C14] disabled:opacity-50 text-xs font-bold hover:bg-[#E8D2A6]/50 transition-colors"
                                        >
                                            <PhosphorIcon icon="caret-left" size={14} weight="bold" />
                                            Prev
                                        </button>
                                        <span className="text-xs font-bold text-[#B88A44]">
                                            Hal {page} dari {totalPages}
                                        </span>
                                        <button 
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#FCF7E8] text-[#4A1C14] disabled:opacity-50 text-xs font-bold hover:bg-[#E8D2A6]/50 transition-colors"
                                        >
                                            Next
                                            <PhosphorIcon icon="caret-right" size={14} weight="bold" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HadistScreen;
