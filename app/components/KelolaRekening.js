import React, { useState, useEffect } from 'react';
import PhosphorIcon from './PhosphorIcon';
import { supabase } from '../lib/supabaseClient';

const KelolaRekening = ({ onBack }) => {
    const [rekening, setRekening] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        bank_name: '',
        account_number: '',
        account_name: ''
    });

    const loadData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('rqs_rekening')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error && data) {
            setRekening(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        if (editingId) {
            await supabase.from('rqs_rekening').update(form).eq('id', editingId);
        } else {
            await supabase.from('rqs_rekening').insert([form]);
        }
        
        setIsFormOpen(false);
        setEditingId(null);
        loadData();
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({
            bank_name: item.bank_name,
            account_number: item.account_number,
            account_name: item.account_name
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus rekening ini?')) {
            setIsLoading(true);
            await supabase.from('rqs_rekening').delete().eq('id', id);
            loadData();
        }
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm({ bank_name: '', account_number: '', account_name: '' });
        setIsFormOpen(true);
    };

    if (isFormOpen) {
        return (
            <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative">
                <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                    <button onClick={() => setIsFormOpen(false)} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                        <PhosphorIcon icon="arrow-left" size={24} />
                    </button>
                    <h2 className="text-lg font-bold text-[#4A1C14]">
                        {editingId ? "Edit Rekening" : "Tambah Rekening"}
                    </h2>
                </div>

                <form onSubmit={handleSave} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Nama Bank / E-Wallet</label>
                        <input required name="bank_name" value={form.bank_name} onChange={handleChange} type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-green-500" placeholder="Contoh: BSI (Bank Syariah Indonesia)" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Nomor Rekening</label>
                        <input required name="account_number" value={form.account_number} onChange={handleChange} type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-green-500" placeholder="Contoh: 7123456789" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#4A1C14] mb-1">Atas Nama (Pemilik Rekening)</label>
                        <input required name="account_name" value={form.account_name} onChange={handleChange} type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-green-500" placeholder="Contoh: Yayasan Rumah Quran Sobariah" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white font-bold rounded-xl p-3 mt-4 hover:bg-green-700 transition-colors shadow-md">
                        {isLoading ? "Menyimpan..." : "Simpan Rekening"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen relative">
            <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={onBack} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                    <PhosphorIcon icon="arrow-left" size={24} />
                </button>
                <div className="flex-1 text-center pr-2">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kelola Rekening</h2>
                    <p className="text-[10px] text-green-600">Metode Pembayaran RQS</p>
                </div>
                <button onClick={openAddForm} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-full transition">
                    <PhosphorIcon icon="plus" size={24} />
                </button>
            </div>

            <div className="p-5 space-y-4">
                {isLoading && <div className="text-center py-4"><PhosphorIcon icon="circle-notch" className="animate-spin text-green-500 mx-auto" size={24}/></div>}
                
                {rekening.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 relative group items-center">
                        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <PhosphorIcon icon="bank" size={24} weight="fill" />
                        </div>
                        <div className="flex-1 pr-12">
                            <h4 className="font-bold text-gray-800 text-sm">{item.bank_name}</h4>
                            <p className="text-sm font-mono font-bold text-gray-600 mt-0.5 tracking-wider">{item.account_number}</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase">A.N. {item.account_name}</p>
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2">
                            <button onClick={() => handleEdit(item)} className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-100">
                                <PhosphorIcon icon="pencil-simple" size={16} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100">
                                <PhosphorIcon icon="trash" size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {!isLoading && rekening.length === 0 && (
                    <div className="text-center text-gray-400 py-10 text-sm">Belum ada data rekening pembayaran.</div>
                )}
            </div>
        </div>
    );
};

export default KelolaRekening;
