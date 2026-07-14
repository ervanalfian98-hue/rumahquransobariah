import React, { useState } from 'react';
import PhosphorIcon from './PhosphorIcon';

const DZIKIR_DATA = {
    pagi: [
        {
            id: 'p1',
            title: "Ayat Kursi",
            arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
            latin: "Allahu laa ilaaha illaa huwal hayyul qayyuum, laa ta'khudzuhuu sinatuw walaa nauum, lahuu maa fissamaawaati wamaa fil ardh...",
            translation: "Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang terus menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan di bumi...",
            count: "Dibaca 1x",
            fadhilah: "Barangsiapa membacanya di pagi hari, ia akan dilindungi dari gangguan jin hingga petang."
        },
        {
            id: 'p2',
            title: "Sayyidul Istighfar (Raja Istighfar)",
            arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
            latin: "Allahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa anaa 'abduka wa anaa 'alaa 'ahdika wa wa'dika mastatha'tu...",
            translation: "Ya Allah, Engkau adalah Tuhanku, tidak ada Tuhan yang berhak disembah kecuali Engkau. Engkaulah yang menciptakan aku dan aku adalah hamba-Mu. Aku akan setia pada perjanjianku dengan-Mu semampuku...",
            count: "Dibaca 1x",
            fadhilah: "Barangsiapa membacanya dengan yakin di pagi hari, lalu ia meninggal pada hari itu, maka ia masuk surga."
        },
        {
            id: 'p3',
            title: "Dzikir Perlindungan",
            arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
            latin: "Bismillahilladzii laa yadhurru ma'asmihii syai'un fil ardhi wa laa fis samaa'i wahuwas samii'ul 'aliim",
            translation: "Dengan nama Allah yang bila disebut, segala sesuatu di bumi dan langit tidak akan berbahaya, Dia-lah Yang Maha Mendengar lagi Maha Mengetahui.",
            count: "Dibaca 3x",
            fadhilah: "Barangsiapa membacanya tiga kali, maka tidak akan ada sesuatu pun yang membahayakannya."
        },
        {
            id: 'p4',
            title: "Surah Al-Ikhlas, Al-Falaq, & An-Nas",
            arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ... | قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... | قُلْ أَعُوذُ بِرَبِّ النَّاسِ...",
            latin: "Qul huwallahu ahad... | Qul a'uudzu birabbil falaq... | Qul a'uudzu birabbinnaas...",
            translation: "Katakanlah: Dialah Allah, Yang Maha Esa... | Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh... | Katakanlah: Aku berlindung kepada Tuhan manusia...",
            count: "Masing-masing dibaca 3x",
            fadhilah: "Membacanya 3 kali di pagi dan petang sudah mencukupimu dari segala sesuatu (melindungimu dari keburukan)."
        }
    ],
    petang: [
        {
            id: 'pt1',
            title: "Ayat Kursi",
            arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
            latin: "Allahu laa ilaaha illaa huwal hayyul qayyuum...",
            translation: "Allah, tidak ada tuhan selain Dia. Yang Mahahidup...",
            count: "Dibaca 1x",
            fadhilah: "Barangsiapa membacanya di petang hari, ia akan dilindungi dari jin hingga pagi."
        },
        {
            id: 'pt2',
            title: "Sayyidul Istighfar",
            arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي...",
            latin: "Allahumma anta rabbii laa ilaaha illaa anta khalaqtanii...",
            translation: "Ya Allah, Engkau adalah Tuhanku, tidak ada Tuhan yang berhak disembah kecuali Engkau...",
            count: "Dibaca 1x",
            fadhilah: "Barangsiapa membacanya dengan yakin di waktu petang, lalu meninggal malam itu, maka ia masuk surga."
        },
        {
            id: 'pt3',
            title: "Dzikir Syukur Sore",
            arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ...",
            latin: "Amsainaa wa amsal mulku lillah, walhamdulillah, laa ilaaha illallah wahdahu laa syariikalah...",
            translation: "Kami dapati waktu petang dan kerajaan milik Allah, segala puji bagi Allah, tidak ada Tuhan selain Allah semata, tiada sekutu bagi-Nya...",
            count: "Dibaca 1x",
            fadhilah: "Berdzikir mengagungkan Allah dan memohon perlindungan dari keburukan malam tersebut."
        },
        {
            id: 'pt4',
            title: "Memohon Keselamatan",
            arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ...",
            latin: "Allahumma innii as-alukal 'aafiyah fid dunyaa wal aakhirah...",
            translation: "Ya Allah, sesungguhnya aku memohon keselamatan di dunia dan akhirat...",
            count: "Dibaca 1x",
            fadhilah: "Doa memohon perlindungan total atas agama, dunia, keluarga, dan harta dari segala arah."
        }
    ],
    setelah_shalat: [
        {
            id: 'ss1',
            title: "Istighfar dan Pujian",
            arabic: "أَسْتَغْفِرُ اللَّهَ (٣×) اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
            latin: "Astaghfirullah (3x). Allahumma antas salaam waminkas salaam, tabaarakta yaa dzal jalaali wal ikraam.",
            translation: "Aku memohon ampun kepada Allah (3x). Ya Allah, Engkau Maha Sejahtera, dan dari-Mu kesejahteraan, Maha Suci Engkau wahai Tuhan Pemilik Kebesaran dan Kemuliaan.",
            count: "Setelah salam",
            fadhilah: "Sunnah Nabi SAW sesaat setelah menyelesaikan shalat fardhu."
        },
        {
            id: 'ss2',
            title: "Tasbih, Tahmid, Takbir",
            arabic: "سُبْحَانَ اللَّهِ (٣٣×) الْحَمْدُ لِلَّهِ (٣٣×) اللَّهُ أَكْبَرُ (٣٣×)",
            latin: "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (33x)",
            translation: "Maha Suci Allah (33x), Segala Puji bagi Allah (33x), Allah Maha Besar (33x).",
            count: "Masing-masing dibaca 33x",
            fadhilah: "Digabungkan dengan penutup dzikir ke-100, akan mengampuni dosa walau sebanyak buih di lautan."
        },
        {
            id: 'ss3',
            title: "Penutup Dzikir 100",
            arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
            latin: "Laa ilaaha illallah wahdahu laa syariikalah, lahul mulku walahul hamdu wahuwa 'alaa kulli syai-in qadiir.",
            translation: "Tidak ada Tuhan selain Allah semata, tiada sekutu bagi-Nya, milik-Nya kerajaan dan segala puji, dan Dia Maha Kuasa atas segala sesuatu.",
            count: "Dibaca 1x (melengkapi yang ke-100)",
            fadhilah: "Penyempurna tasbih 33x menjadi seratus."
        }
    ],
    harian: [
        {
            id: 'h1',
            title: "Dua Kalimat Ringan (Tasbih)",
            arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
            latin: "Subhanallahi wa bihamdih, Subhanallahil 'Azhiim.",
            translation: "Maha Suci Allah dan segala puji bagi-Nya, Maha Suci Allah yang Maha Agung.",
            count: "Dibaca kapan saja",
            fadhilah: "Dua kalimat yang ringan di lisan, berat di timbangan (mizan), dan dicintai oleh Allah Ar-Rahman."
        },
        {
            id: 'h2',
            title: "Hauqalah (Simpanan Surga)",
            arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
            latin: "Laa hawla wa laa quwwata illaa billaah.",
            translation: "Tiada daya dan tiada kekuatan kecuali dengan pertolongan Allah.",
            count: "Perbanyak bacaan",
            fadhilah: "Merupakan salah satu perbendaharaan (simpanan berharga) di surga dan penawar berbagai kesusahan."
        },
        {
            id: 'h3',
            title: "Dzikir Menghapus Dosa",
            arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
            latin: "Subhanallahi wa bihamdih.",
            translation: "Maha Suci Allah dan segala puji bagi-Nya.",
            count: "Dibaca 100x sehari",
            fadhilah: "Barangsiapa membacanya 100x sehari, akan dihapuskan dosa-dosanya walau sebanyak buih di lautan."
        },
        {
            id: 'h4',
            title: "Wirid Sebelum Shalat Subuh",
            arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ، أَسْتَغْفِرُ اللَّهَ",
            latin: "Subhanallahi wa bihamdih, subhanallahil 'azhiim, astaghfirullah.",
            translation: "Maha Suci Allah dan segala puji bagi-Nya, Maha Suci Allah yang Maha Agung, aku memohon ampun kepada Allah.",
            count: "Dibaca 100x (Antara Adzan & Iqamah)",
            fadhilah: "Amalan dari Rasulullah SAW yang sangat masyhur untuk mendatangkan kelapangan rezeki dan kemudahan hidup."
        },
        {
            id: 'h5',
            title: "Wirid Menjelang Tidur",
            arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ... (٣×) ثُمَّ سُبْحَانَ اللَّهِ (٣٣×) وَالْحَمْدُ لِلَّهِ (٣٣×) وَاللَّهُ أَكْبَرُ (٣٤×)",
            latin: "Astaghfirullahal 'azhiim... (3x). Lanjut: Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (34x).",
            translation: "Aku memohon ampun kepada Allah Yang Maha Agung... (3x). Maha Suci Allah (33x), Segala Puji bagi Allah (33x), Allah Maha Besar (34x).",
            count: "Dibaca saat berbaring di tempat tidur",
            fadhilah: "Istighfar menghapus dosa sebelum tidur, dan Tasbih Fatimah memberikan kekuatan fisik saat bangun esok harinya."
        },
        {
            id: 'h6',
            title: "Wirid Setelah Shalat Jumat",
            arabic: "الْفَاتِحَة (٧×) الْإِخْلَاص (٧×) الْفَلَق (٧×) النَّاس (٧×)",
            latin: "Al-Fatihah (7x), Al-Ikhlas (7x), Al-Falaq (7x), An-Nas (7x)",
            translation: "Membaca surah Al-Fatihah, Al-Ikhlas, Al-Falaq, dan An-Nas masing-masing sebanyak 7 kali.",
            count: "Dibaca sebelum merubah posisi kaki",
            fadhilah: "Barangsiapa membacanya seusai salam shalat Jumat, Allah akan mengampuni dosanya dan menjaga agamanya."
        }
    ],
    istighotsah: [
        {
            id: 'is1',
            title: "Istighotsah (KH Romli Tamim)",
            arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ (٣×). لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ (٣×)...",
            latin: "Bismillahir rahmaanir rahiim. Astaghfirullahal 'azhiim (3x). Laa hawla wa laa quwwata illaa billaahil 'aliyyil 'azhiim (3x)...",
            translation: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Aku memohon ampun kepada Allah Yang Maha Agung (3x). Tiada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi dan Maha Agung (3x)...",
            count: "Wirid Utama NU",
            fadhilah: "Istighotsah susunan KH. Romli Tamim (Peterongan, Jombang) yang sangat masyhur dibaca oleh warga Nahdliyin untuk menolak bala dan memohon hajat."
        },
        {
            id: 'is2',
            title: "Istighotsah (KH M. Hasyim Asy'ari)",
            arabic: "يَا أَرْحَمَ الرَّاحِمِينَ، يَا أَرْحَمَ الرَّاحِمِينَ، يَا أَرْحَمَ الرَّاحِمِينَ، فَرِّجْ عَلَى الْمُسْلِمِينَ...",
            latin: "Yaa Arhamar Raahimiin, Yaa Arhamar Raahimiin, Yaa Arhamar Raahimiin, farrij 'alal muslimiin...",
            translation: "Wahai Dzat Yang Maha Penyayang di antara para penyayang (3x), berikanlah jalan keluar (kelegaan) bagi kaum muslimin...",
            count: "Wirid Muassis NU",
            fadhilah: "Amalan istighotsah dan munajat dari Hadratussyaikh KH. Hasyim Asy'ari untuk memohon keselamatan umat dan bangsa."
        },
        {
            id: 'is3',
            title: "Dzikrul Ghafilin",
            arabic: "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ... ثُمَّ إِلَى أَرْوَاحِ أَوْلِيَاءِ اللَّهِ تَعَالَى...",
            latin: "Ilaa hadhratin nabiyyil musthafaa Muhammadin SAW... tsumma ilaa arwaahi auliyaa-illahi ta'aalaa...",
            translation: "Kehadirat Nabi Pilihan Muhammad SAW... kemudian kepada ruh para wali Allah Ta'ala...",
            count: "Tawasul & Wirid",
            fadhilah: "Kumpulan dzikir susunan KH. Hamim Djazuli (Gus Miek) dkk, sebagai pengingat bagi orang-orang yang lalai akan akhirat."
        },
        {
            id: 'is4',
            title: "Mujahadah (KH Bisri Syansuri)",
            arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ. يَا اللَّهُ يَا قَدِيمُ...",
            latin: "Allahumma shalli 'alaa sayyidinaa Muhammad wa 'alaa aali sayyidinaa Muhammad. Yaa Allahu Yaa Qadiim...",
            translation: "Ya Allah, limpahkanlah rahmat kepada junjungan kami Muhammad dan keluarganya. Wahai Allah, Wahai Dzat Yang Maha Terdahulu...",
            count: "Wirid Perjuangan",
            fadhilah: "Amalan mujahadah dari KH. Bisri Syansuri (Denanyar, Jombang) yang sering dibaca untuk memohon kekuatan dan pertolongan Allah dalam perjuangan."
        },
        {
            id: 'is5',
            title: "Sayyidul Istighfar",
            arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ...",
            latin: "Allahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa anaa 'abduka...",
            translation: "Ya Allah, Engkau adalah Tuhanku, tiada Tuhan selain Engkau. Engkau yang menciptakanku dan aku adalah hamba-Mu...",
            count: "Raja Istighfar",
            fadhilah: "Penghulu segala istighfar. Membacanya dengan yakin akan menjamin masuk surga jika wafat di hari/malam tersebut."
        },
        {
            id: 'is6',
            title: "I'tiraf (Syair Abu Nawas)",
            arabic: "إِلَهِي لَسْتُ لِلْفِرْدَوْسِ أَهْلًا ¤ وَلَا أَقْوَى عَلَى نَارِ الْجَحِيمِ",
            latin: "Ilaahii lastu lil firdausi ahlaa, wa laa aqwaa 'alaa naaril jahiimi. Fahab lii taubatan waghfir dzunuubii, fa-innaka ghaafirudz dzambil 'azhiimi.",
            translation: "Wahai Tuhanku, aku bukanlah ahli surga Firdaus, namun aku juga tidak kuat menahan siksa neraka Jahim. Maka berilah aku taubat dan ampunilah dosaku...",
            count: "Munajat Doa",
            fadhilah: "Syair pengakuan dosa (I'tiraf) yang sangat menyentuh hati, masyhur dibaca di masjid-masjid dan pesantren untuk memohon ampunan."
        }
    ],
    dalail: [
        {
            id: 'dl1',
            title: "Tawasul Dalailul Khairat",
            arabic: "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ... ثُمَّ إِلَى رُوحِ مُؤَلِّفِ هَذَا الْكِتَابِ الشَّيْخِ سُلَيْمَانَ الْجَزُولِيِّ... الْفَاتِحَةُ",
            latin: "Ilaa hadhratin nabiyyil musthafaa Muhammadin SAW... tsumma ilaa ruuhi mu-allifi haadzal kitaab asy-Syaikh Sulaiman al-Jazuuliy... Al-Fatihah.",
            translation: "Kehadirat Nabi Pilihan Muhammad SAW... kemudian kepada ruh penyusun kitab ini Syekh Sulaiman Al-Jazuli... (Bacalah) Al-Fatihah.",
            count: "Dibaca sebelum memulai wirid",
            fadhilah: "Menyambungkan sanad batin kepada Rasulullah dan penyusun kitab agar mendapat keberkahan."
        },
        {
            id: 'dl2',
            title: "Wirid Hari Senin (Hizb Ke-1)",
            arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَأَزْوَاجِهِ وَذُرِّيَّتِهِ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ...",
            latin: "Allahumma shalli 'alaa Muhammadin wa azwaajihii wa dzurriyyatihii kamaa shallaita 'alaa Ibraahiima...",
            translation: "Ya Allah, limpahkanlah rahmat kepada Muhammad, istri-istri, dan keturunannya, sebagaimana Engkau melimpahkan rahmat kepada Ibrahim...",
            count: "Dibaca pada hari Senin",
            fadhilah: "Awal dimulainya membaca kitab Dalailul Khairat (Permulaan Wirid)."
        },
        {
            id: 'dl3',
            title: "Wirid Hari Selasa (Hizb Ke-2)",
            arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ نَبِيِّ الْأُمِّيِّ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ...",
            latin: "Allahumma shalli 'alaa sayyidinaa Muhammadinin nabiyyil ummiyyi wa 'alaa aali sayyidinaa Muhammad...",
            translation: "Ya Allah, limpahkanlah rahmat kepada junjungan kami Muhammad sang nabi yang ummi, dan kepada keluarga junjungan kami Muhammad...",
            count: "Dibaca pada hari Selasa",
            fadhilah: "Mengandung lafaz shalawat yang menyebut keluhuran sifat-sifat kenabian."
        },
        {
            id: 'dl4',
            title: "Wirid Hari Rabu (Hizb Ke-3)",
            arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ عَبْدِكَ وَنَبِيِّكَ وَرَسُولِكَ النَّبِيِّ الْأُمِّيِّ...",
            latin: "Allahumma shalli 'alaa sayyidinaa Muhammadin 'abdika wa nabiyyika wa rasuulikan nabiyyil ummiyyi...",
            translation: "Ya Allah, berikanlah rahmat kepada junjungan kami Muhammad, hamba, nabi, dan rasul-Mu, nabi yang ummi...",
            count: "Dibaca pada hari Rabu",
            fadhilah: "Mengingat pengakuan sebagai hamba dan utusan yang paling dicintai Allah."
        },
        {
            id: 'dl5',
            title: "Wirid Hari Kamis (Hizb Ke-4)",
            arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ فِي الْأَوَّلِينَ، وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ فِي الْآخِرِينَ...",
            latin: "Allahumma shalli 'alaa sayyidinaa Muhammadin fil awwaliin, wa shalli 'alaa sayyidinaa Muhammadin fil aakhiriin...",
            translation: "Ya Allah, limpahkanlah rahmat kepada junjungan kami Muhammad di kalangan orang-orang terdahulu, dan di kalangan orang-orang kemudian...",
            count: "Dibaca pada hari Kamis",
            fadhilah: "Memohon curahan rahmat tanpa batas waktu, meliputi seluruh alam dan zaman."
        },
        {
            id: 'dl6',
            title: "Wirid Hari Jumat (Hizb Ke-5)",
            arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِينَا بِهَا مِنْ جَمِيعِ الْأَهْوَالِ وَالْآفَاتِ...",
            latin: "Allahumma shalli 'alaa sayyidinaa Muhammadin shalaatan tunjiinaa bihaa min jamii'il ahwaali wal aafaat...",
            translation: "Ya Allah, limpahkanlah rahmat kepada junjungan kami Muhammad, dengan rahmat yang dengannya Engkau menyelamatkan kami dari segala kepanikan dan bencana...",
            count: "Dibaca pada hari Jumat",
            fadhilah: "Membaca rentetan shalawat pengabul hajat, keselamatan, dan keberkahan (seperti Munjiyat)."
        },
        {
            id: 'dl7',
            title: "Wirid Hari Sabtu (Hizb Ke-6)",
            arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بَحْرِ أَنْوَارِكَ وَمَعْدِنِ أَسْرَارِكَ...",
            latin: "Allahumma shalli 'alaa sayyidinaa Muhammadin bahri anwaarika wa ma'dini asraarika...",
            translation: "Ya Allah, limpahkanlah rahmat kepada junjungan kami Muhammad, lautan cahaya-Mu dan tambang rahasia-Mu...",
            count: "Dibaca pada hari Sabtu",
            fadhilah: "Pujian atas keagungan rohani dan nur kenabian Rasulullah."
        },
        {
            id: 'dl8',
            title: "Wirid Hari Ahad (Hizb Ke-7)",
            arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ مِلْءَ السَّمَاوَاتِ وَمِلْءَ الْأَرْضِ وَمِلْءَ مَا بَيْنَهُمَا...",
            latin: "Allahumma shalli 'alaa sayyidinaa Muhammadin mil-as samaawaati wa mil-al ardhi wa mil-a maa bainahumaa...",
            translation: "Ya Allah, limpahkanlah rahmat kepada junjungan kami Muhammad sepenuh langit, sepenuh bumi, dan sepenuh apa yang ada di antara keduanya...",
            count: "Dibaca pada hari Ahad",
            fadhilah: "Pujian rahmat yang tak terhingga jumlahnya untuk menyempurnakan bacaan."
        },
        {
            id: 'dl9',
            title: "Doa Penutup Dalailul Khairat",
            arabic: "اللَّهُمَّ اغْفِرْ لِمُؤَلِّفِ هَذَا الْكِتَابِ الشَّيْخِ سُلَيْمَانَ الْجَزُولِيِّ وَلِمَنْ قَرَأَهُ وَلِمَنْ حَفِظَهُ...",
            latin: "Allahummaghfir limu-allifi haadzal kitaab Asy-Syaikh Sulaiman al-Jazuuliy wa liman qara-ahu wa liman hafizhah...",
            translation: "Ya Allah, ampunilah penyusun kitab ini (Syekh Sulaiman Al-Jazuli), serta siapa saja yang membacanya dan menghafalkannya...",
            count: "Dibaca setelah selesai wirid hizb",
            fadhilah: "Doa pamungkas memohon syafaat dan terkabulnya hajat melalui keberkahan Dalailul Khairat."
        }
    ],
    shalawat: [
        {
            id: 'sl1',
            title: "Shalawat Jibril",
            arabic: "صَلَّى اللَّهُ عَلَى مُحَمَّدٍ",
            latin: "Shallallahu 'alaa Muhammad.",
            translation: "Semoga Allah memberikan rahmat kepada Nabi Muhammad.",
            count: "Bisa dibaca 1.000x / 10.000x",
            fadhilah: "Dipercaya sebagai shalawat pembuka pintu rezeki terkuat dari segala arah."
        },
        {
            id: 'sl2',
            title: "Shalawat Ibrahimiyah",
            arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
            latin: "Allahumma shalli 'alaa Muhammad wa 'alaa aali Muhammad, kamaa shallaita 'alaa Ibraahiima wa 'alaa aali Ibraahiima, innaka Hamiidum Majiid.",
            translation: "Ya Allah, limpahkanlah rahmat kepada Muhammad dan keluarga Muhammad, sebagaimana Engkau telah melimpahkan rahmat kepada Ibrahim dan keluarga Ibrahim. Sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.",
            count: "Dibaca minimal setiap Tasyahud Shalat",
            fadhilah: "Shalawat paling utama yang langsung diajarkan oleh Rasulullah SAW."
        },
        {
            id: 'sl3',
            title: "Shalawat Nariyah",
            arabic: "اللَّهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ...",
            latin: "Allahumma shalli shalaatan kaamilatan wa sallim salaaman taamman 'alaa sayyidinaa Muhammadin alladzii tanhallu bihil 'uqadu wa tanfariju bihil kurabu...",
            translation: "Ya Allah, limpahkanlah shalawat yang sempurna dan keselamatan yang paripurna kepada junjungan kami Muhammad, yang dengan perantaraannya terurai segala ikatan, lenyap segala kesedihan...",
            count: "11x / 41x / 4444x untuk hajat besar",
            fadhilah: "Dapat memudahkan segala urusan, melepaskan dari kesempitan, dan mengabulkan hajat."
        },
        {
            id: 'sl4',
            title: "Shalawat Thibbil Qulub",
            arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ طِبِّ الْقُلُوبِ وَدَوَائِهَا وَعَافِيَةِ الْأَبْدَانِ وَشِفَائِهَا وَنُورِ الْأَبْصَارِ وَضِيَائِهَا...",
            latin: "Allahumma shalli 'alaa sayyidinaa Muhammadin thibbil quluubi wa dawaa-ihaa, wa 'aafiyatil abdaani wa syifaa-ihaa, wa nuuril abshaari wa dhiyaa-ihaa...",
            translation: "Ya Allah, berikanlah rahmat kepada junjungan kami Nabi Muhammad, sebagai penyembuh hati dan obatnya, penyehat badan dan kesembuhannya, serta cahaya penglihatan dan sinarnya...",
            count: "Sesuai kebutuhan",
            fadhilah: "Sebagai obat penawar hati yang gelisah dan wasilah kesembuhan dari berbagai penyakit fisik."
        }
    ]
};

const CATEGORIES = [
    { id: 'pagi', label: 'Dzikir Pagi', icon: 'sun' },
    { id: 'petang', label: 'Dzikir Petang', icon: 'moon' },
    { id: 'setelah_shalat', label: 'Usai Shalat', icon: 'mosque' },
    { id: 'harian', label: 'Harian', icon: 'infinity' },
    { id: 'istighotsah', label: 'Istighotsah', icon: 'users' },
    { id: 'dalail', label: 'Dalailul Khairat', icon: 'book-bookmark' },
    { id: 'shalawat', label: 'Shalawat', icon: 'star' }
];

const DzikirScreen = ({ setActiveTab }) => {
    const [activeCategory, setActiveCategory] = useState('pagi');
    const [search, setSearch] = useState('');

    const currentData = DZIKIR_DATA[activeCategory];
    const filteredData = currentData.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) || 
        item.latin.toLowerCase().includes(search.toLowerCase()) ||
        item.translation.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('kategori')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Dzikir Lengkap</h2>
                    <p className="text-[10px] text-[#B88A44]">Kumpulan Dzikir & Wirid Pilihan</p>
                </div>
            </div>
            
            {/* Custom Banner */}
            <div className="bg-[#4A1C14] text-white pt-6 pb-8 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#B88A44] opacity-20 rounded-bl-full blur-2xl"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold font-serif mb-1">Tenangkan Hati</h2>
                        <p className="text-xs text-[#E8D2A6]/90 font-medium max-w-[200px]">
                            "Ketahuilah, hanya dengan mengingat Allah hati menjadi tenteram." (Ar-Ra'd: 28)
                        </p>
                    </div>
                    <PhosphorIcon icon="hands-praying" size={56} className="text-[#E8D2A6] opacity-90" weight="duotone" />
                </div>
            </div>

            {/* Category Tabs (Sticky) */}
            <div className="bg-white sticky top-[68px] z-10 shadow-sm border-b border-[#E8D2A6]/30 overflow-x-auto hide-scrollbar">
                <div className="flex p-3 gap-2 min-w-max">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                                activeCategory === cat.id 
                                ? 'bg-[#4A1C14] text-white shadow-md' 
                                : 'bg-gray-100 text-gray-500 hover:bg-[#FCF7E8] hover:text-[#B88A44]'
                            }`}
                        >
                            <PhosphorIcon icon={cat.icon} size={16} weight={activeCategory === cat.id ? 'fill' : 'regular'} />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5">
                {/* Search Bar */}
                <div className="relative mb-6">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Cari dzikir ${CATEGORIES.find(c => c.id === activeCategory).label.toLowerCase()}...`}
                        className="w-full bg-white border border-[#E8D2A6]/60 rounded-2xl py-3 pl-11 pr-4 text-sm text-[#4A1C14] placeholder:text-[#B88A44]/60 focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30 shadow-sm"
                    />
                    <PhosphorIcon icon="magnifying-glass" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B88A44]" />
                </div>

                {/* Dzikir List */}
                <div className="space-y-4">
                    {filteredData.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="bg-white rounded-2xl p-5 border border-[#E8D2A6]/40 shadow-sm hover:border-[#B88A44]/30 transition-all duration-300 animate-in slide-in-from-bottom-2"
                            style={{ animationDelay: `${(index % 10) * 50}ms`, animationFillMode: 'both' }}
                        >
                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                                <h3 className="font-bold text-[#4A1C14] text-[15px]">{item.title}</h3>
                                <span className="bg-[#FCF7E8] text-[#B88A44] text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap border border-[#E8D2A6]/30">
                                    {item.count}
                                </span>
                            </div>
                            
                            <div className="text-right mb-4">
                                <p className="text-2xl font-serif text-[#4A1C14] leading-loose break-words" dir="rtl">
                                    {item.arabic}
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                                <p className="text-[12px] text-[#4A1C14]/80 italic leading-relaxed mb-2">
                                    <span className="font-bold not-italic text-[#4A1C14]">Latin: </span>
                                    {item.latin}
                                </p>
                                <p className="text-[12px] text-[#4A1C14] leading-relaxed">
                                    <span className="font-bold text-[#4A1C14]">Arti: </span>
                                    {item.translation}
                                </p>
                            </div>
                            
                            {item.fadhilah && (
                                <div className="flex gap-2 items-start bg-[#FCF7E8]/50 p-3 rounded-xl border border-[#E8D2A6]/30">
                                    <PhosphorIcon icon="info" size={16} className="text-[#B88A44] shrink-0 mt-0.5" weight="fill" />
                                    <p className="text-[11px] text-[#4A1C14]/90 font-medium leading-relaxed">
                                        <span className="font-bold">Keutamaan: </span>{item.fadhilah}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredData.length === 0 && (
                        <div className="text-center py-10 flex flex-col items-center gap-2">
                            <PhosphorIcon icon="file-search" size={32} className="text-[#B88A44]/50" />
                            <p className="text-gray-500 text-sm">Dzikir tidak ditemukan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DzikirScreen;
