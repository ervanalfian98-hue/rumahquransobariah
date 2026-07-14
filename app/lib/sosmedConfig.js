export const DEFAULT_SOSMED = {
    instagram: { url: 'https://instagram.com/rumahquransobariah', username: '@rumahquransobariah' },
    youtube: { url: 'https://youtube.com/@rqstvofficial', username: 'RQS TV Official' },
    facebook: { url: 'https://facebook.com/YayasanRumahQuranSobariah', username: 'Yayasan Rumah Quran Sobariah' },
    tiktok: { url: 'https://tiktok.com/@rqsobariah', username: '@rqsobariah' },
    whatsapp: { number: '08562041390', formatted: '628562041390' }
};

export const getSosmedConfig = () => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('rqs_sosmed_settings');
        if (saved) {
            return JSON.parse(saved);
        }
    }
    return DEFAULT_SOSMED;
};

export const getGlobalWhatsApp = () => {
    return getSosmedConfig().whatsapp.formatted;
};

export const formatWhatsAppNumber = (number) => {
    // Remove all non-numeric characters
    let cleaned = number.replace(/\D/g, '');
    
    // Convert leading 0 to 62
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    }
    
    return cleaned;
};
