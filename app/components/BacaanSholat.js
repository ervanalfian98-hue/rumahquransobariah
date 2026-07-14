import React, { useState } from 'react';
import PhosphorIcon from './PhosphorIcon';

const BACAAN_SHOLAT_DATA = [
    {
        id: 1,
        title: "Niat Sholat Subuh",
        arabic: "أُصَلِّي فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى",
        latin: "Ushalli fardhos subhi rak'ataini mustaqbilal qiblati adaa-an lillaahi ta'aalaa.",
        terjemahan: "Aku berniat sholat fardu Subuh dua rakaat menghadap kiblat karena Allah Ta'ala."
    },
    {
        id: 2,
        title: "Niat Sholat Dzuhur",
        arabic: "أُصَلِّي فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى",
        latin: "Ushalli fardhodl dhuhri arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aalaa.",
        terjemahan: "Aku berniat sholat fardu Dzuhur empat rakaat menghadap kiblat karena Allah Ta'ala."
    },
    {
        id: 3,
        title: "Niat Sholat Ashar",
        arabic: "أُصَلِّي فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى",
        latin: "Ushalli fardhol 'ashri arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aalaa.",
        terjemahan: "Aku berniat sholat fardu Ashar empat rakaat menghadap kiblat karena Allah Ta'ala."
    },
    {
        id: 4,
        title: "Niat Sholat Maghrib",
        arabic: "أُصَلِّي فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى",
        latin: "Ushalli fardhol maghribi tsalaatsa raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aalaa.",
        terjemahan: "Aku berniat sholat fardu Maghrib tiga rakaat menghadap kiblat karena Allah Ta'ala."
    },
    {
        id: 5,
        title: "Niat Sholat Isya",
        arabic: "أُصَلِّي فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى",
        latin: "Ushalli fardhol 'isyaa-i arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aalaa.",
        terjemahan: "Aku berniat sholat fardu Isya empat rakaat menghadap kiblat karena Allah Ta'ala."
    },
    {
        id: 6,
        title: "Takbiratul Ihram",
        arabic: "اللّٰهُ أَكْبَرُ",
        latin: "Allahu Akbar.",
        terjemahan: "Allah Maha Besar."
    },
    {
        id: 7,
        title: "Doa Iftitah",
        arabic: "اللّٰهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلّٰهِ كَثِيرًا، وَسُبْحَانَ اللّٰهِ بُكْرَةً وَأَصِيلًا. إِنِّي وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّمَاوَاتِ وَالْأَرْضَ حَنِيفًا مُسْلِمًا وَمَا أَنَا مِنَ الْمُشْرِكِينَ. إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلّٰهِ رَبِّ الْعَالَمِينَ. لَا شَرِيكَ لَهُ وَبِذٰلِكَ أُمِرْتُ وَأَنَا مِنَ الْمُسْلِمِينَ",
        latin: "Allahu akbar kabiiraa walhamdu lillaahi katsiiraa, wa subhaanallaahi bukratan wa'ashiilaa. Innii wajjahtu wajhiya lilladzii fatharas samaawaati wal ardha haniifan musliman wamaa anaa minal musyrikiin. Inna shalaatii wa nusukii wa mahyaaya wa mamaatii lillaahi rabbil 'aalamiin. Laa syariika lahu wa bidzaalika umirtu wa anaa minal muslimiin.",
        terjemahan: "Allah Maha Besar lagi Sempurna Kebesaran-Nya, segala puji bagi-Nya dan Maha Suci Allah sepanjang pagi dan sore. Kuhadapkan muka hatiku kepada Dzat yang menciptakan langit dan bumi dengan keadaan lurus dan menyerahkan diri dan aku bukanlah dari golongan kaum musyrikin. Sesungguhnya sholatku, ibadahku, hidupku dan matiku semata-mata untuk Allah, Tuhan seru sekalian alam. Tidak ada sekutu bagi-Nya dan dengan demikian aku diperintahkan dan aku dari golongan kaum muslimin."
    },
    {
        id: 8,
        title: "Al-Fatihah",
        arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ. الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ. الرَّحْمٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        latin: "Bismillaahirrahmaanirrahiim. Alhamdulillaahi rabbil 'aalamiin. Arrahmaanirrahiim. Maaliki yaumiddiin. Iyyaaka na'budu wa iyyaaka nasta'iin. Ihdinash shiraathal mustaqiim. Shiraathal ladziina an'amta 'alaihim ghairil maghdhuubi 'alaihim waladh dhaalliin.",
        terjemahan: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam. Maha Pengasih lagi Maha Penyayang. Pemilik hari pembalasan. Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan. Tunjukilah kami jalan yang lurus, (yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat."
    },
    {
        id: 9,
        title: "Ruku",
        arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ",
        latin: "Subhaana rabbiyal 'adziimi wa bihamdih. (3x)",
        terjemahan: "Maha Suci Tuhanku Yang Maha Agung dan dengan memuji-Nya."
    },
    {
        id: 10,
        title: "I'tidal",
        arabic: "سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ. رَبَّنَا لَكَ الْحَمْدُ مِلْءَ السَّمَاوَاتِ وَمِلْءَ الْأَرْضِ وَمِلْءَ مَا شِئْتَ مِنْ شَيْءٍ بَعْدُ",
        latin: "Sami'allaahu liman hamidah. Rabbanaa lakal hamdu mil'us samaawaati wa mil'ul ardhi wa mil'u maa syi'ta min syai'in ba'du.",
        terjemahan: "Allah mendengar orang yang memuji-Nya. Ya Allah Tuhan kami, bagi-Mu segala puji sepenuh langit dan bumi, dan sepenuh barang yang Kau kehendaki sesudah itu."
    },
    {
        id: 11,
        title: "Sujud",
        arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ",
        latin: "Subhaana rabbiyal a'laa wa bihamdih. (3x)",
        terjemahan: "Maha Suci Tuhanku Yang Maha Tinggi dan dengan memuji-Nya."
    },
    {
        id: 12,
        title: "Duduk Diantara Dua Sujud",
        arabic: "رَبِّ اغْفِرْ لِي، وَارْحَمْنِي، وَاجْبُرْنِي، وَارْفَعْنِي، وَارْزُقْنِي، وَاهْدِنِي، وَعَافِنِي، وَاعْفُ عَنِّي",
        latin: "Rabbighfirlii, warhamnii, wajburnii, warfa'nii, warzuqnii, wahdinii, wa 'aafinii, wa'fu 'annii.",
        terjemahan: "Ya Tuhanku ampunilah dosaku, belas kasihanilah aku, cukupkanlah segala kekuranganku, angkatlah derajatku, berilah rezeki kepadaku, berilah aku petunjuk, berilah kesehatan kepadaku, dan berilah ampunan kepadaku."
    },
    {
        id: 13,
        title: "Tasyahud Awal",
        arabic: "التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلّٰهِ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللّٰهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللّٰهِ. اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ",
        latin: "Attahiyyaatul mubaarakaatush shalawaatuth thayyibaatu lillaah, assalaamu 'alaika ayyuhan nabiyyu wa rahmatullaahi wa barakaatuh, assalaamu 'alainaa wa 'alaa 'ibaadillaahish shaalihiin. Ashyhadu an laa ilaaha illallaah, wa asyhadu anna Muhammadar rasuulullaah. Allahumma shalli 'alaa sayyidinaa Muhammad.",
        terjemahan: "Segala penghormatan, keberkahan, rahmat dan kebaikan adalah milik Allah. Semoga keselamatan, rahmat Allah dan berkah-Nya tetap tercurahkan atasmu, wahai Nabi. Semoga keselamatan tetap terlimpahkan atas kami dan atas hamba-hamba Allah yang saleh. Aku bersaksi bahwa tidak ada Tuhan selain Allah, dan aku bersaksi bahwa Muhammad adalah utusan Allah. Ya Allah, limpahkanlah rahmat kepada penghulu kami, Nabi Muhammad."
    },
    {
        id: 14,
        title: "Tasyahud Akhir",
        arabic: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ، وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ، وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ، وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ، وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ، وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ، فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
        latin: "Wa 'alaa aali sayyidinaa Muhammad. Kamaa shallaita 'alaa sayyidinaa Ibraahiim, wa 'alaa aali sayyidinaa Ibraahiim. Wa baarik 'alaa sayyidinaa Muhammad, wa 'alaa aali sayyidinaa Muhammad. Kamaa baarakta 'alaa sayyidinaa Ibraahiim, wa 'alaa aali sayyidinaa Ibraahiim. Fil 'aalamiina innaka hamiidum majiid.",
        terjemahan: "Dan kepada keluarga penghulu kami Nabi Muhammad. Sebagaimana Engkau telah memberikan rahmat kepada penghulu kami Nabi Ibrahim, dan kepada keluarga penghulu kami Nabi Ibrahim. Dan berikanlah keberkahan kepada penghulu kami Nabi Muhammad, dan kepada keluarga penghulu kami Nabi Muhammad. Sebagaimana Engkau telah memberikan keberkahan kepada penghulu kami Nabi Ibrahim, dan kepada keluarga penghulu kami Nabi Ibrahim. Di seluruh alam semesta, sesungguhnya Engkau Maha Terpuji lagi Maha Mulia."
    },
    {
        id: 15,
        title: "Salam",
        arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ",
        latin: "Assalaamu 'alaikum wa rahmatullaah.",
        terjemahan: "Semoga keselamatan dan rahmat Allah terlimpah kepada kalian."
    }
];

const BacaanSholatScreen = ({ setActiveTab }) => {
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const filteredBacaan = BACAAN_SHOLAT_DATA.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.terjemahan.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('kategori')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Bacaan Sholat</h2>
                    <p className="text-[10px] text-[#B88A44]">Tuntunan lengkap sholat fardu</p>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Search */}
                <div className="relative">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari bacaan (contoh: Niat, Ruku, Sujud)..."
                        className="w-full bg-white border border-[#E8D2A6]/60 rounded-2xl py-3 pl-10 pr-4 text-sm text-[#4A1C14] placeholder:text-[#B88A44]/60 focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30 shadow-sm"
                    />
                    <PhosphorIcon icon="magnifying-glass" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B88A44]" />
                </div>

                <div className="space-y-3">
                    {filteredBacaan.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-[#E8D2A6]/40 overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FCF7E8]/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#FCF7E8] text-[#4A1C14] font-black flex items-center justify-center shrink-0 border border-[#E8D2A6]/50 shadow-inner">
                                        {item.id}
                                    </div>
                                    <h3 className="font-bold text-[#4A1C14] text-sm">{item.title}</h3>
                                </div>
                                <PhosphorIcon 
                                    icon="caret-down" 
                                    size={16} 
                                    weight="bold"
                                    className={`text-[#B88A44] transition-transform duration-300 ${expandedId === item.id ? 'rotate-180' : ''}`} 
                                />
                            </button>
                            
                            {expandedId === item.id && (
                                <div className="p-5 pt-0 border-t border-[#E8D2A6]/20 bg-[#FAFAFA] animate-in slide-in-from-top-2 duration-300">
                                    {/* Arabic */}
                                    <div className="mt-4 mb-4 text-right">
                                        <p className="text-2xl font-serif text-[#4A1C14] leading-[2.5rem]">{item.arabic}</p>
                                    </div>
                                    
                                    {/* Latin & Terjemahan Container */}
                                    <div className="bg-white p-4 rounded-xl border border-[#E8D2A6]/40 shadow-sm space-y-3">
                                        <div>
                                            <span className="text-[10px] font-bold text-[#B88A44] uppercase tracking-wider mb-1 block">Latin</span>
                                            <p className="text-[13px] text-[#4A1C14]/90 italic leading-relaxed">
                                                "{item.latin}"
                                            </p>
                                        </div>
                                        <div className="h-px w-full bg-[#E8D2A6]/30"></div>
                                        <div>
                                            <span className="text-[10px] font-bold text-[#B88A44] uppercase tracking-wider mb-1 block">Terjemahan</span>
                                            <p className="text-[13px] text-[#4A1C14]/80 leading-relaxed text-justify">
                                                {item.terjemahan}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {filteredBacaan.length === 0 && (
                        <div className="text-center py-10 flex flex-col items-center gap-2">
                            <PhosphorIcon icon="file-search" size={32} className="text-[#B88A44]/50" />
                            <p className="text-gray-500 text-sm">Bacaan sholat tidak ditemukan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BacaanSholatScreen;
