import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhosphorIcon from './PhosphorIcon';

// ============================================================
// CURRICULUM DATA - IQRA 1-6
// ============================================================

// Iqra 1: Stage 1-30 — Pengenalan huruf hijaiyah satu per satu
// Pertanyaan: lihat huruf -> pilih namanya (latin), atau lihat nama -> pilih hurufnya
const IQRA1_QUESTIONS = [
    // Stage 1-3: Alif, Ba, Ta
    { ar: 'أَ', lt: 'a', harakat: 'fathah', stage_min: 1, stage_max: 30 },
    { ar: 'بَ', lt: 'ba', harakat: 'fathah', stage_min: 1, stage_max: 30 },
    { ar: 'تَ', lt: 'ta', harakat: 'fathah', stage_min: 1, stage_max: 30 },
    { ar: 'ثَ', lt: 'tsa', harakat: 'fathah', stage_min: 1, stage_max: 30 },
    { ar: 'جَ', lt: 'ja', harakat: 'fathah', stage_min: 1, stage_max: 30 },
    { ar: 'حَ', lt: 'ha', harakat: 'fathah', stage_min: 1, stage_max: 30 },
    { ar: 'خَ', lt: 'kha', harakat: 'fathah', stage_min: 3, stage_max: 30 },
    { ar: 'دَ', lt: 'da', harakat: 'fathah', stage_min: 3, stage_max: 30 },
    { ar: 'ذَ', lt: 'dza', harakat: 'fathah', stage_min: 4, stage_max: 30 },
    { ar: 'رَ', lt: 'ra', harakat: 'fathah', stage_min: 4, stage_max: 30 },
    { ar: 'زَ', lt: 'za', harakat: 'fathah', stage_min: 5, stage_max: 30 },
    { ar: 'سَ', lt: 'sa', harakat: 'fathah', stage_min: 5, stage_max: 30 },
    { ar: 'شَ', lt: 'sya', harakat: 'fathah', stage_min: 6, stage_max: 30 },
    { ar: 'صَ', lt: 'sha', harakat: 'fathah', stage_min: 7, stage_max: 30 },
    { ar: 'ضَ', lt: 'dha', harakat: 'fathah', stage_min: 7, stage_max: 30 },
    { ar: 'طَ', lt: 'tha', harakat: 'fathah', stage_min: 8, stage_max: 30 },
    { ar: 'ظَ', lt: 'zha', harakat: 'fathah', stage_min: 8, stage_max: 30 },
    { ar: 'عَ', lt: 'a\'', harakat: 'fathah', stage_min: 9, stage_max: 30 },
    { ar: 'غَ', lt: 'gha', harakat: 'fathah', stage_min: 9, stage_max: 30 },
    { ar: 'فَ', lt: 'fa', harakat: 'fathah', stage_min: 10, stage_max: 30 },
    { ar: 'قَ', lt: 'qa', harakat: 'fathah', stage_min: 10, stage_max: 30 },
    { ar: 'كَ', lt: 'ka', harakat: 'fathah', stage_min: 11, stage_max: 30 },
    { ar: 'لَ', lt: 'la', harakat: 'fathah', stage_min: 11, stage_max: 30 },
    { ar: 'مَ', lt: 'ma', harakat: 'fathah', stage_min: 12, stage_max: 30 },
    { ar: 'نَ', lt: 'na', harakat: 'fathah', stage_min: 12, stage_max: 30 },
    { ar: 'وَ', lt: 'wa', harakat: 'fathah', stage_min: 13, stage_max: 30 },
    { ar: 'هَ', lt: 'ha', harakat: 'fathah', stage_min: 14, stage_max: 30 },
    { ar: 'يَ', lt: 'ya', harakat: 'fathah', stage_min: 14, stage_max: 30 },
];

// Iqra 2: Stage 1-10 harakat (2 huruf sambungan), 11-20 tanwin + panjang (3 huruf), 21-30 (4 huruf)
const IQRA2_QUESTIONS = {
    '1-10': [ // Harakat campur (fathah, kasrah, dhammah) — 2 huruf
        { ar: 'بَتِ', lt: 'ba-ti', stage_group: 1 },
        { ar: 'جُحَ', lt: 'ju-ha', stage_group: 1 },
        { ar: 'دِذُ', lt: 'di-dzu', stage_group: 1 },
        { ar: 'رَزِ', lt: 'ra-zi', stage_group: 1 },
        { ar: 'سُشَ', lt: 'su-sya', stage_group: 1 },
        { ar: 'صِضُ', lt: 'shi-dhu', stage_group: 1 },
        { ar: 'طَظِ', lt: 'tha-zhi', stage_group: 1 },
        { ar: 'عُغَ', lt: 'u\'-gha', stage_group: 1 },
        { ar: 'فِقُ', lt: 'fi-qu', stage_group: 1 },
        { ar: 'كَلِ', lt: 'ka-li', stage_group: 1 },
        { ar: 'مُنَ', lt: 'mu-na', stage_group: 1 },
        { ar: 'وِهَ', lt: 'wi-ha', stage_group: 1 },
        { ar: 'يُءِ', lt: 'yu-i', stage_group: 1 },
        { ar: 'قُبِ', lt: 'qu-bi', stage_group: 1 },
        { ar: 'رِتَ', lt: 'ri-ta', stage_group: 1 },
    ],
    '11-20': [ // Tanwin + mad — 3 huruf campur
        { ar: 'بَاتٍ', lt: 'baa-tin', stage_group: 2 },
        { ar: 'جُوحًا', lt: 'juu-han', stage_group: 2 },
        { ar: 'دِيرٌ', lt: 'dii-run', stage_group: 2 },
        { ar: 'سَمًا', lt: 'sa-man', stage_group: 2 },
        { ar: 'شِيظٌ', lt: 'syii-zhun', stage_group: 2 },
        { ar: 'صُوفٍ', lt: 'shuu-fin', stage_group: 2 },
        { ar: 'طِينًا', lt: 'thii-nan', stage_group: 2 },
        { ar: 'عُودٌ', lt: 'u\'-dun', stage_group: 2 },
        { ar: 'غَابٍ', lt: 'ghaa-bin', stage_group: 2 },
        { ar: 'فِيلًا', lt: 'fii-lan', stage_group: 2 },
        { ar: 'قَوْمٌ', lt: 'qaw-mun', stage_group: 2 },
        { ar: 'كَاسٍ', lt: 'kaa-sin', stage_group: 2 },
        { ar: 'لُوحًا', lt: 'luu-han', stage_group: 2 },
        { ar: 'مِينٌ', lt: 'mii-nun', stage_group: 2 },
        { ar: 'نَارٍ', lt: 'naa-rin', stage_group: 2 },
    ],
    '21-30': [ // 4 huruf campur harakat
        { ar: 'شَدِقُتِ', lt: 'sya-di-qu-ti', stage_group: 3 },
        { ar: 'صُدِقَتِ', lt: 'shu-di-qa-ti', stage_group: 3 },
        { ar: 'فُعِلَتِ', lt: 'fu-i\'-la-ti', stage_group: 3 },
        { ar: 'كُتِبَتُ', lt: 'ku-ti-ba-tu', stage_group: 3 },
        { ar: 'قُرِئَتِ', lt: 'qu-ri-a-ti', stage_group: 3 },
        { ar: 'رُزِقُتِ', lt: 'ru-zi-qu-ti', stage_group: 3 },
        { ar: 'عُلِمَتِ', lt: 'u\'-li-ma-ti', stage_group: 3 },
        { ar: 'نُصِرَتُ', lt: 'nu-shi-ra-tu', stage_group: 3 },
        { ar: 'حُشِرَتِ', lt: 'hu-syi-ra-ti', stage_group: 3 },
        { ar: 'سُئِلَتِ', lt: 'su-i-la-ti', stage_group: 3 },
    ],
};

// Iqra 3: Mad (tanda baca panjang)
// Stage 1-10: Tanda baca berdiri (mad asli/thobi'i) — 4 huruf
// Stage 11-20: Mad wajib mutasil / mad jaiz munfasil — 5-6 huruf
// Stage 21-30: Ayat pendek Al-Quran
const IQRA3_QUESTIONS = {
    '1-10': [ // Mad asli/thobi'i, tanda baca berdiri — 4 huruf
        { ar: 'بَاتَا', lt: 'baa-taa', hint: 'Mad Asli (Alif)' },
        { ar: 'بِيتِي', lt: 'bii-tii', hint: 'Mad Asli (Ya)' },
        { ar: 'بُوتُو', lt: 'buu-tuu', hint: 'Mad Asli (Wau)' },
        { ar: 'جَادَا', lt: 'jaa-daa', hint: 'Mad Asli (Alif)' },
        { ar: 'جِيدِي', lt: 'jii-dii', hint: 'Mad Asli (Ya)' },
        { ar: 'جُودُو', lt: 'juu-duu', hint: 'Mad Asli (Wau)' },
        { ar: 'رَازَا', lt: 'raa-zaa', hint: 'Mad Asli (Alif)' },
        { ar: 'سَاشَا', lt: 'saa-syaa', hint: 'Mad Asli (Alif)' },
        { ar: 'مَالَا', lt: 'maa-laa', hint: 'Mad Asli (Alif)' },
        { ar: 'كِيلِي', lt: 'kii-lii', hint: 'Mad Asli (Ya)' },
        { ar: 'نُومُو', lt: 'nuu-muu', hint: 'Mad Asli (Wau)' },
        { ar: 'هَايَا', lt: 'haa-yaa', hint: 'Mad Asli (Alif)' },
        { ar: 'فَاقَا', lt: 'faa-qaa', hint: 'Mad Asli (Alif)' },
        { ar: 'طَاظَا', lt: 'thaa-zhaa', hint: 'Mad Asli (Alif)' },
        { ar: 'عَاغَا', lt: 'aa-ghaa', hint: 'Mad Asli (Alif)' },
        { ar: 'صَاضَا', lt: 'shaa-dhaa', hint: 'Mad Asli (Alif)' },
        { ar: 'وَاءَا', lt: 'waa-aa', hint: 'Mad Asli (Alif)' },
        { ar: 'خَادَا', lt: 'khaa-daa', hint: 'Mad Asli (Alif)' },
        { ar: 'ثَاجَا', lt: 'tsaa-jaa', hint: 'Mad Asli (Alif)' },
        { ar: 'حَابَا', lt: 'haa-baa', hint: 'Mad Asli (Alif)' },
    ],
    '11-20': [ // Mad wajib mutasil / munfasil — 5-6 huruf
        { ar: 'جَاءَتْكُم', lt: 'jaa-a-at-kum', hint: 'Mad Wajib Mutasil' },
        { ar: 'سَاءَلْتَ', lt: 'saa-al-ta', hint: 'Mad Wajib Mutasil' },
        { ar: 'شَاءَ اللَّه', lt: 'syaa-al-laah', hint: 'Mad Jaiz Munfasil' },
        { ar: 'بِمَا أُنزِلَ', lt: 'bi-maa un-zi-la', hint: 'Mad Jaiz Munfasil' },
        { ar: 'فِي أَنفُسِهِم', lt: 'fii an-fu-si-him', hint: 'Mad Jaiz Munfasil' },
        { ar: 'هَذَا أَمْرُهُم', lt: 'haa-dzaa am-ru-hum', hint: 'Mad Jaiz Munfasil' },
        { ar: 'مِنَ السَّمَاء', lt: 'mi-nas-sa-maa', hint: 'Mad Wajib Mutasil' },
        { ar: 'قَالُوا آمَنَّا', lt: 'qoo-luu aa-man-naa', hint: 'Mad Jaiz Munfasil' },
        { ar: 'يَشَاءُ إِلَى', lt: 'ya-syaa-u i-laa', hint: 'Mad Wajib Mutasil' },
        { ar: 'أُولَئِكَ هُم', lt: 'u-laa-i-ka hum', hint: 'Mad Jaiz Munfasil' },
        { ar: 'لِكَيْلَا تَأْسَوْا', lt: 'li-kay-laa ta-sa-wuu', hint: 'Mad Wajib Mutasil' },
        { ar: 'وَإِن كَانَ ذُو', lt: 'wa-in kaa-na dzuu', hint: 'Mad Asli' },
        { ar: 'إِلَّا الَّذِينَ', lt: 'il-lal-la-dzii-na', hint: 'Mad Asli' },
        { ar: 'مِنَ الْمُؤْمِنِينَ', lt: 'mi-nal-mu-mi-niin', hint: 'Mad Wajib Mutasil' },
        { ar: 'كِتَابٌ أَنزَلْنَاهُ', lt: 'ki-taa-bun an-zal-naa-hu', hint: 'Mad Jaiz Munfasil' },
        { ar: 'وَاللَّهُ عَلِيمٌ', lt: 'wal-laa-hu a-liim', hint: 'Mad Asli' },
        { ar: 'وَقَالُوا لَن', lt: 'wa-qoo-luu lan', hint: 'Mad Asli' },
        { ar: 'قَدِيرٌ عَلَى', lt: 'qa-dii-run a-laa', hint: 'Mad Jaiz Munfasil' },
        { ar: 'عَظِيمٌ أَلَا', lt: 'a-zhii-mun a-laa', hint: 'Mad Jaiz Munfasil' },
        { ar: 'وَالسَّمَاءِ ذَاتِ', lt: 'was-sa-maa-i dzaa-ti', hint: 'Mad Wajib Mutasil' },
    ],
    '21-30': [ // Ayat pendek/potongan tanpa Qalqalah/Tasydid (fokus Mad)
        { ar: 'فِيهَا', lt: 'fii-haa', hint: 'Mad Asli' },
        { ar: 'قَالُوا', lt: 'qaa-luu', hint: 'Mad Asli' },
        { ar: 'عَلِيمٌ حَكِيمٌ', lt: 'a\'-lii-mun ha-kii-mun', hint: 'Mad Asli + Tanwin' },
        { ar: 'سَمِيعٌ بَصِيرٌ', lt: 'sa-mii-u\'n ba-shii-run', hint: 'Mad Asli + Tanwin' },
        { ar: 'بِمَا أُنزِلَ', lt: 'bi-maa un-zi-la', hint: 'Mad Jaiz Munfasil' },
        { ar: 'يَقُولُونَ', lt: 'ya-quu-luu-na', hint: 'Mad Asli' },
        { ar: 'مُؤْمِنُونَ', lt: 'mu\'-mi-nuu-na', hint: 'Mad Asli' },
        { ar: 'يَعْلَمُونَ', lt: 'ya\'-la-muu-na', hint: 'Mad Asli' },
        { ar: 'خَالِدُونَ', lt: 'khaa-li-duu-na', hint: 'Mad Asli' },
        { ar: 'وَقَالُوا كُونُوا', lt: 'wa qaa-luu kuu-nuu', hint: 'Mad Asli' },
        { ar: 'غَفُورٌ رَحِيمٌ', lt: 'gha-fuu-run ra-hii-mun', hint: 'Mad Asli' },
        { ar: 'آيَاتِنَا', lt: 'aa-yaa-ti-naa', hint: 'Mad Asli' },
        { ar: 'كَانُوا', lt: 'kaa-nuu', hint: 'Mad Asli' },
        { ar: 'أُولَئِكَ', lt: 'u-laa-i-ka', hint: 'Mad Wajib Mutasil' },
        { ar: 'رِسَالَاتِهِ', lt: 'ri-saa-laa-ti-hi', hint: 'Mad Asli' },
    ],
};

// Iqra 4: Huruf Lin/Mad Lin (au, ai) — stage 1-10: 5-6 huruf, 11-20: random + 6-8 huruf, 21-30: ayat quran sedang
const IQRA4_QUESTIONS = {
    '1-10': [
        { ar: 'خَوْفًا وَطَمَعًا', lt: 'khawfan wa thama\'an', hint: 'Mad Lin (Wau)' },
        { ar: 'مِنْ خَيْرٍ', lt: 'min khayr', hint: 'Mad Lin (Ya)' },
        { ar: 'الْقَوْلُ الْحَقُّ', lt: 'al-qawlul-haqq', hint: 'Mad Lin (Wau)' },
        { ar: 'وَالْبَيْتِ الْعَتِيقِ', lt: 'wal-baytil-atiiq', hint: 'Mad Lin (Ya)' },
        { ar: 'قَوْمٌ لَا يَعْلَمُونَ', lt: 'qawmun laa ya\'lamuun', hint: 'Mad Lin (Wau)' },
        { ar: 'خَيْرٌ لَكُم', lt: 'khayrun lakum', hint: 'Mad Lin (Ya)' },
        { ar: 'فَوْقَ كُلِّ ذِي', lt: 'fawqa kulli dzii', hint: 'Mad Lin (Wau)' },
        { ar: 'بِأَيِّكُمُ الْمَفْتُونُ', lt: 'bi-ayyikumul-maftuun', hint: 'Mad Lin (Ya)' },
        { ar: 'شَيْءٍ قَدِيرٌ', lt: 'syay-in qadiir', hint: 'Mad Lin (Ya)' },
        { ar: 'فَوْجًا دَخَلُوا', lt: 'fawjan dakhaluu', hint: 'Mad Lin (Wau)' },
        { ar: 'يَوْمَ الدِّينِ', lt: 'yawmad-diin', hint: 'Mad Lin (Wau)' },
        { ar: 'لَيْسَ لَهُم', lt: 'laysa lahum', hint: 'Mad Lin (Ya)' },
        { ar: 'أَوْلَادَكُمْ', lt: 'awlaadakum', hint: 'Mad Lin (Wau)' },
        { ar: 'بَيْنَكُمْ وَبَيْنَهُمُ', lt: 'baynakum wa baynahum', hint: 'Mad Lin (Ya)' },
        { ar: 'يَوْمَ لَا يَنفَعُ', lt: 'yawma laa yanfa', hint: 'Mad Lin (Wau)' },
        { ar: 'خَوْفٌ عَلَيْهِمْ', lt: 'khawfun alayhim', hint: 'Mad Lin (Wau) + (Ya)' },
        { ar: 'جَعَلَ الشَّيْطَانُ', lt: 'ja-alas-syaythaan', hint: 'Mad Lin (Ya)' },
        { ar: 'الْيَوْمَ أَكْمَلْتُ', lt: 'al-yawma ak-maltu', hint: 'Mad Lin (Wau)' },
        { ar: 'قَوْلًا سَدِيدًا', lt: 'qawlan sadiidan', hint: 'Mad Lin (Wau)' },
        { ar: 'بَيْنَ يَدَيِ اللَّهِ', lt: 'bayna yadayil-laah', hint: 'Mad Lin (Ya)' },
    ],
    '11-20': [ // Random gabungan dengan materi Iqra 1-3
        { ar: 'وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ', lt: 'wal-laahu bimaa ta\'maluuna bashiir', hint: 'Gabungan' },
        { ar: 'إِنَّ اللَّهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', lt: 'innal-laaha alaa kulli syay-in qadiir', hint: 'Mad Lin (Ya)' },
        { ar: 'وَهُوَ الْعَلِيمُ الْخَبِيرُ', lt: 'wa huwal-aliimul-khabiir', hint: 'Mad Asli' },
        { ar: 'وَمَا اللَّهُ بِغَافِلٍ عَمَّا تَعْمَلُونَ', lt: 'wa mal-laahu bighaafilin ammaa ta\'maluun', hint: 'Gabungan' },
        { ar: 'سُبْحَانَهُ وَتَعَالَى عَمَّا يُشْرِكُونَ', lt: 'subhaanahuu wa ta\'aalaa ammaa yusyrikuun', hint: 'Mad Asli' },
        { ar: 'إِنَّ الْمُتَّقِينَ فِي جَنَّاتٍ وَنَهَرٍ', lt: 'innal-muttaqiina fii jannaatin wa nahar', hint: 'Mad Asli' },
        { ar: 'وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ', lt: 'wal-laahu ya\'lamu wa antum laa ta\'lamuun', hint: 'Gabungan' },
        { ar: 'وَلَا تَقُولُوا لِمَن يُقْتَلُ فِي سَبِيلِ اللَّهِ', lt: 'wa laa taquuluu liman yuqtalu fii sabiilil-laah', hint: 'Mad Asli' },
        { ar: 'إِنَّ اللَّهَ لَا يُحِبُّ الْمُعْتَدِينَ', lt: 'innal-laaha laa yuhibbul-mu\'tadiin', hint: 'Gabungan' },
        { ar: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ', lt: 'alladzina yu\'minuuna bil-ghayb', hint: 'Mad Lin (Ya)' },
        { ar: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ', lt: 'wal-ladzina yu\'minuuna bimaa unzila ilayk', hint: 'Gabungan' },
        { ar: 'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ', lt: 'ulaaika alaa hudan min rabbihim', hint: 'Mad Jaiz Munfasil' },
        { ar: 'وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ', lt: 'wa ulaaika humul-muflihuun', hint: 'Gabungan' },
        { ar: 'إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ', lt: 'innal-ladzina kafaruu sawaaun alayhim', hint: 'Mad Wajib Mutasil' },
        { ar: 'خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ', lt: 'khatamal-laahu alaa quluubihim', hint: 'Mad Asli' },
        { ar: 'وَعَلَىٰ سَمْعِهِمْ وَعَلَىٰ أَبْصَارِهِمْ', lt: 'wa alaa sam\'ihim wa alaa absharihim', hint: 'Mad Asli' },
        { ar: 'وَلَهُمْ عَذَابٌ عَظِيمٌ', lt: 'wa lahum adzaabun azhiim', hint: 'Mad Asli' },
        { ar: 'وَمِنَ النَّاسِ مَن يَقُولُ آمَنَّا', lt: 'wa minan-naasi man yaquulu aamannaa', hint: 'Mad Jaiz Munfasil' },
        { ar: 'وَمَا هُم بِمُؤْمِنِينَ', lt: 'wa maa hum bimu\'miniin', hint: 'Mad Jaiz Munfasil' },
        { ar: 'يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا', lt: 'yukhaadi\'uunal-laaha wal-ladziina aamanuu', hint: 'Gabungan' },
    ],
    '21-30': [ // Ayat quran sedang
        { ar: 'وَمَا يَخْدَعُونَ إِلَّا أَنفُسَهُمْ وَمَا يَشْعُرُونَ', lt: 'wa maa yakhda\'uuna illaa anfusahum wa maa yasy\'uruun', hint: 'QS. Al-Baqarah: 9' },
        { ar: 'فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا', lt: 'fii quluubihim maradhun fa-zaadahumul-laahu maradhaa', hint: 'QS. Al-Baqarah: 10' },
        { ar: 'وَإِذَا قِيلَ لَهُمْ لَا تُفْسِدُوا فِي الْأَرْضِ', lt: 'wa idzaa qiila lahum laa tufsiduu fil-ardh', hint: 'QS. Al-Baqarah: 11' },
        { ar: 'أَلَا إِنَّهُمْ هُمُ الْمُفْسِدُونَ وَلَٰكِن لَّا يَشْعُرُونَ', lt: 'alaa innahum humul-mufsiduuna wa laakin laa yasy\'uruun', hint: 'QS. Al-Baqarah: 12' },
        { ar: 'وَإِذَا لَقُوا الَّذِينَ آمَنُوا قَالُوا آمَنَّا', lt: 'wa idzaa laqul-ladzina aamanuu qaaluuaamannaa', hint: 'QS. Al-Baqarah: 14' },
        { ar: 'إِنَّ مَثَلَهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا', lt: 'inna masalahum ka masalil-ladzi stawqada naaraa', hint: 'QS. Al-Baqarah: 17' },
        { ar: 'صُمٌّ بُكْمٌ عُمْيٌ فَهُمْ لَا يَرْجِعُونَ', lt: 'shummun bukmun umyun fahum laa yarji\'uun', hint: 'QS. Al-Baqarah: 18' },
        { ar: 'يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ', lt: 'yaa ayyuhan-naasu\'budu rabbakum', hint: 'QS. Al-Baqarah: 21' },
        { ar: 'الَّذِي خَلَقَكُمْ وَالَّذِينَ مِن قَبْلِكُمْ', lt: 'alladzii khalaqakum wal-ladzina min qablikum', hint: 'QS. Al-Baqarah: 21' },
        { ar: 'لَعَلَّكُمْ تَتَّقُونَ', lt: 'la\'allakum tattaquun', hint: 'QS. Al-Baqarah: 21' },
        { ar: 'الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا', lt: 'alladzii ja\'ala lakumul-ardha firasyaa', hint: 'QS. Al-Baqarah: 22' },
        { ar: 'وَالسَّمَاءَ بِنَاءً وَأَنزَلَ مِنَ السَّمَاءِ مَاءً', lt: 'was-samaa-a binaa-an wa anzala minas-samaa-i maa-an', hint: 'QS. Al-Baqarah: 22' },
        { ar: 'فَأَخْرَجَ بِهِ مِنَ الثَّمَرَاتِ رِزْقًا لَّكُمْ', lt: 'fa-akhrajabihii minat-tsamaraati rizqan lakum', hint: 'QS. Al-Baqarah: 22' },
        { ar: 'فَلَا تَجْعَلُوا لِلَّهِ أَندَادًا وَأَنتُمْ تَعْلَمُونَ', lt: 'fa laa taj\'aluu lillaahi andaadan wa antum ta\'lamuun', hint: 'QS. Al-Baqarah: 22' },
        { ar: 'وَبَشِّرِ الَّذِين آمَنُوا وَعَمِلُوا الصَّالِحَاتِ', lt: 'wa basysyiril-ladzina aamanuu wa amilush-shaalihaat', hint: 'QS. Al-Baqarah: 25' },
        { ar: 'أَنَّ لَهُمْ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ', lt: 'anna lahum jannaatin tajrii min tahtihal-anhaar', hint: 'QS. Al-Baqarah: 25' },
        { ar: 'كُلَّمَا رُزِقُوا مِنْهَا مِن ثَمَرَةٍ رِّزْقًا', lt: 'kullamaa ruziquu minhaa min tsamaratin rizqaa', hint: 'QS. Al-Baqarah: 25' },
        { ar: 'قَالُوا هَٰذَا الَّذِي رُزِقْنَا مِن قَبْلُ', lt: 'qaaluu haadzal-ladzii ruziqnaa min qabl', hint: 'QS. Al-Baqarah: 25' },
        { ar: 'وَأُتُوا بِهِ مُتَشَابِهًا وَلَهُمْ فِيهَا أَزْوَاجٌ', lt: 'wa utuu bihii mutasyaabihaa wa lahum fiihaa azwaaj', hint: 'QS. Al-Baqarah: 25' },
        { ar: 'مُّطَهَّرَةٌ وَهُمْ فِيهَا خَالِدُونَ', lt: 'muthahharatun wa hum fiihaa khaalidoon', hint: 'QS. Al-Baqarah: 25' },
    ],
};

// Iqra 5: Qalqalah — stage 1-10: 2-3 huruf, 11-20: 4-6 huruf + random, 21-30: ayat quran juz 30
const IQRA5_QUESTIONS = {
    '1-10': [
        { ar: 'قَبْ', lt: 'Qab', hint: 'Qalqalah: Qaf' },
        { ar: 'طَبْ', lt: 'Thab', hint: 'Qalqalah: Tha' },
        { ar: 'بَطْ', lt: 'Bath', hint: 'Qalqalah: Ba' },
        { ar: 'جَدْ', lt: 'Jad', hint: 'Qalqalah: Ja + Dal' },
        { ar: 'دُجْ', lt: 'Duj', hint: 'Qalqalah: Dal + Jim' },
        { ar: 'بِجْ', lt: 'Bij', hint: 'Qalqalah: Ba + Jim' },
        { ar: 'قَطْبَ', lt: 'Qath-ba', hint: 'Qalqalah: Qaf + Tha + Ba' },
        { ar: 'جَدْبَ', lt: 'Jad-ba', hint: 'Qalqalah: Jim + Dal + Ba' },
        { ar: 'طَبْقَ', lt: 'Thab-qa', hint: 'Qalqalah: Tha + Ba + Qaf' },
        { ar: 'بُطُولَ', lt: 'Bu-thu-la', hint: 'Qalqalah: Ba + Tha' },
        { ar: 'أَجْدَادُ', lt: 'Aj-daad', hint: 'Qalqalah: Jim + Dal' },
        { ar: 'قِطَار', lt: 'Qi-thaar', hint: 'Qalqalah: Qaf + Tha' },
        { ar: 'جَبَل', lt: 'Ja-bal', hint: 'Qalqalah: Jim + Ba' },
        { ar: 'بَقَر', lt: 'Ba-qar', hint: 'Qalqalah: Ba + Qaf' },
        { ar: 'دُبّ', lt: 'Dubb', hint: 'Qalqalah: Dal + Ba' },
        { ar: 'طَبَق', lt: 'Tha-baq', hint: 'Qalqalah: Tha + Ba + Qaf' },
        { ar: 'أَجَب', lt: 'A-jab', hint: 'Qalqalah: Jim + Ba' },
        { ar: 'قَدَر', lt: 'Qa-dar', hint: 'Qalqalah: Qaf + Dal' },
        { ar: 'بَدَل', lt: 'Ba-dal', hint: 'Qalqalah: Ba + Dal' },
        { ar: 'طُوق', lt: 'Thuuq', hint: 'Qalqalah: Qaf' },
    ],
    '11-20': [ // Random gabungan dengan materi sebelumnya + qalqalah lebih kompleks
        { ar: 'وَالسَّمَاءِ وَالطَّارِقِ', lt: 'was-samaa-i wath-thaariq', hint: 'QS. At-Thariq: 1, Qalqalah Qaf' },
        { ar: 'وَمَا أَدْرَاكَ مَا الطَّارِقُ', lt: 'wa maa adraaka math-thaariq', hint: 'QS. At-Thariq: 2, Qalqalah Qaf' },
        { ar: 'النَّجْمُ الثَّاقِبُ', lt: 'an-najmuts-tsaaqib', hint: 'QS. At-Thariq: 3, Qalqalah Ba' },
        { ar: 'إِن كُلُّ نَفْسٍ لَّمَّا عَلَيْهَا حَافِظٌ', lt: 'in kullu nafsin lammaa alayhaa haafizh', hint: 'QS. At-Thariq: 4' },
        { ar: 'فَلْيَنظُرِ الْإِنسَانُ مِمَّ خُلِقَ', lt: 'falyanzhuril-insaanu mimma khuliq', hint: 'QS. At-Thariq: 5, Qalqalah Qaf' },
        { ar: 'خُلِقَ مِن مَّاءٍ دَافِقٍ', lt: 'khulika min maa-in daafiq', hint: 'QS. At-Thariq: 6, Qalqalah Qaf' },
        { ar: 'يَخْرُجُ مِن بَيْنِ الصُّلْبِ وَالتَّرَائِبِ', lt: 'yakhruju min baynis-shulbi watt-taraa-ib', hint: 'QS. At-Thariq: 7, Qalqalah Ba' },
        { ar: 'إِنَّهُ عَلَىٰ رَجْعِهِ لَقَادِرٌ', lt: 'innahuu alaa raj\'ihii la-qaadir', hint: 'QS. At-Thariq: 8, Qalqalah Dal + Jim' },
        { ar: 'يَوْمَ تُبْلَى السَّرَائِرُ', lt: 'yawma tublas-saraair', hint: 'QS. At-Thariq: 9, Qalqalah Ba' },
        { ar: 'فَمَا لَهُ مِن قُوَّةٍ وَلَا نَاصِرٍ', lt: 'famaa lahuu min quwwatin wa laa naashir', hint: 'QS. At-Thariq: 10, Qalqalah Qaf' },
        { ar: 'وَالسَّمَاءِ ذَاتِ الرَّجْعِ', lt: 'was-samaa-i dzaatir-raj', hint: 'QS. At-Thariq: 11, Qalqalah Jim' },
        { ar: 'وَالْأَرْضِ ذَاتِ الصَّدْعِ', lt: 'wal-ardhi dzaatish-shad', hint: 'QS. At-Thariq: 12, Qalqalah Dal' },
        { ar: 'إِنَّهُ لَقَوْلٌ فَصْلٌ', lt: 'innahuu la-qawlun fashl', hint: 'QS. At-Thariq: 13, Qalqalah Qaf' },
        { ar: 'وَمَا هُوَ بِالْهَزْلِ', lt: 'wa maa huwa bil-hazl', hint: 'QS. At-Thariq: 14' },
        { ar: 'إِنَّهُمْ يَكِيدُونَ كَيْدًا', lt: 'innahum yakiiduuna kaydan', hint: 'QS. At-Thariq: 15, Mad Lin' },
        { ar: 'وَأَكِيدُ كَيْدًا', lt: 'wa akiidu kaydan', hint: 'QS. At-Thariq: 16' },
        { ar: 'فَمَهِّلِ الْكَافِرِينَ أَمْهِلْهُمْ رُوَيْدًا', lt: 'famahilil-kaafiriina am-hilhum ruwaydaa', hint: 'QS. At-Thariq: 17, Mad Asli' },
        { ar: 'سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى', lt: 'sabbihis-ma rabbikal-a\'laa', hint: 'QS. Al-Ala: 1, Qalqalah Ba' },
        { ar: 'الَّذِي خَلَقَ فَسَوَّىٰ', lt: 'alladzii khalaqa fa-sawwaa', hint: 'QS. Al-Ala: 2, Qalqalah Qaf' },
        { ar: 'وَالَّذِي قَدَّرَ فَهَدَىٰ', lt: 'wal-ladzii qaddara fa-hadaa', hint: 'QS. Al-Ala: 3, Qalqalah Qaf + Dal' },
    ],
    '21-30': [ // Ayat Al-Quran Juz 30
        { ar: 'وَاللَّيْلِ إِذَا يَغْشَىٰ', lt: 'wal-layli idzaa yaghsyaa', hint: 'QS. Al-Lail: 1' },
        { ar: 'وَالنَّهَارِ إِذَا تَجَلَّىٰ', lt: 'wan-nahaari idzaa tajallaa', hint: 'QS. Al-Lail: 2' },
        { ar: 'وَمَا خَلَقَ الذَّكَرَ وَالْأُنثَىٰ', lt: 'wa maa khalaqadz-dzakara wal-untsaa', hint: 'QS. Al-Lail: 3' },
        { ar: 'إِنَّ سَعْيَكُمْ لَشَتَّىٰ', lt: 'inna sa\'yakum la-syattaa', hint: 'QS. Al-Lail: 4' },
        { ar: 'فَأَمَّا مَنْ أَعْطَىٰ وَاتَّقَىٰ', lt: 'fa-ammaa man a\'thaa wattaqaa', hint: 'QS. Al-Lail: 5' },
        { ar: 'وَصَدَّقَ بِالْحُسْنَىٰ', lt: 'wa shaddaqa bil-husnaa', hint: 'QS. Al-Lail: 6' },
        { ar: 'فَسَنُيَسِّرُهُ لِلْيُسْرَىٰ', lt: 'fa-sanuyassiruhuu lil-yusraa', hint: 'QS. Al-Lail: 7' },
        { ar: 'وَأَمَّا مَنۢ بَخِلَ وَاسْتَغْنَىٰ', lt: 'wa ammaa man bakhila was-taghnaa', hint: 'QS. Al-Lail: 8' },
        { ar: 'وَكَذَّبَ بِالْحُسْنَىٰ', lt: 'wa kadzdzaba bil-husnaa', hint: 'QS. Al-Lail: 9' },
        { ar: 'فَسَنُيَسِّرُهُ لِلْعُسْرَىٰ', lt: 'fa-sanuyassiruhu lil-\'usraa', hint: 'QS. Al-Lail: 10' },
        { ar: 'وَمَا يُغْنِي عَنْهُ مَالُهُ إِذَا تَرَدَّىٰ', lt: 'wa maa yughnii anhu maaluhu idzaa taraddaa', hint: 'QS. Al-Lail: 11' },
        { ar: 'إِنَّ عَلَيْنَا لَلْهُدَىٰ', lt: 'inna alayinaa lal-hudaa', hint: 'QS. Al-Lail: 12' },
        { ar: 'وَإِنَّ لَنَا لَلْآخِرَةَ وَالْأُولَىٰ', lt: 'wa inna lanaa lal-aakhirata wal-uulaa', hint: 'QS. Al-Lail: 13' },
        { ar: 'فَأَنذَرْتُكُمْ نَارًا تَلَظَّىٰ', lt: 'fa-andzartukum naaran talazzhaa', hint: 'QS. Al-Lail: 14' },
        { ar: 'لَا يَصْلَاهَا إِلَّا الْأَشْقَى', lt: 'laa yashlaahaa illal-asyqaa', hint: 'QS. Al-Lail: 15' },
        { ar: 'الَّذِي كَذَّبَ وَتَوَلَّىٰ', lt: 'alladzii kadzdzaba wa tawallaa', hint: 'QS. Al-Lail: 16' },
        { ar: 'وَسَيُجَنَّبُهَا الْأَتْقَى', lt: 'wa sa-yujannabuhaal-atqaa', hint: 'QS. Al-Lail: 17' },
        { ar: 'الَّذِي يُؤْتِي مَالَهُ يَتَزَكَّىٰ', lt: 'alladzii yu-tii maalahu yatazakkaa', hint: 'QS. Al-Lail: 18' },
        { ar: 'وَمَا لِأَحَدٍ عِندَهُ مِن نِّعْمَةٍ تُجْزَىٰ', lt: 'wa maa li-ahadin indahu min ni\'matin tujzaa', hint: 'QS. Al-Lail: 19' },
        { ar: 'إِلَّا ابْتِغَاءَ وَجْهِ رَبِّهِ الْأَعْلَىٰ وَلَسَوْفَ يَرْضَىٰ', lt: 'illabtighaaa-a wajhi rabbihil-a\'laa wa la-sawfa yardhaa', hint: 'QS. Al-Lail: 20-21' },
    ],
};

// Iqra 6: Waqaf & Tasydid — stage 1-10: tanda waqaf, 11-20: tasydid+dengung, 21-30: ayat quran sulit
const IQRA6_QUESTIONS = {
    '1-10': [ // Tanda waqaf
        { ar: 'وَقَالُوا ۛ رَبَّنَا', lt: 'wa qaaluu rabbana', hint: 'Tanda Waqaf: Lazim (م)' },
        { ar: 'وَاللَّهُ ۚ وَاسِعٌ عَلِيمٌ', lt: 'wal-laahu waasi\'un aliim', hint: 'Tanda Waqaf: Jaiz (ج)' },
        { ar: 'إِنَّ اللَّهَ ۙ عَلَى كُلِّ', lt: 'innal-laaha alaa kull', hint: 'Tanda Waqaf: Mu\'anaqah (ۙ)' },
        { ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝', lt: 'bismillaahir-rahmaanir-rahiim', hint: 'Tanda Akhir Ayat' },
        { ar: 'فَإِن لَّمْ تَفْعَلُوا ۙ وَلَن تَفْعَلُوا', lt: 'fa-in lam taf\'aluu wa lan taf\'aluu', hint: 'Tanda Waqaf: Mujawwaz' },
        { ar: 'أَلَا إِنَّهُمْ ۛ هُمُ الْمُفْسِدُونَ', lt: 'alaa innahum humul-mufsiduun', hint: 'Tanda Waqaf: Mu\'anaqah' },
        { ar: 'وَمَا يُضِلُّ بِهِ ۗ إِلَّا الْفَاسِقِينَ', lt: 'wa maa yudhillu bihii illal-faasiqiin', hint: 'Tanda Waqaf: Jaiz Mutlaq' },
        { ar: 'قَالَ لَا تَثْرِيبَ ۗ عَلَيْكُمُ الْيَوْمَ', lt: 'qaala laa tsariba alaykumul-yawm', hint: 'Tanda Waqaf' },
        { ar: 'وَرَحْمَةُ اللَّهِ ۗ وَبَرَكَاتُهُ', lt: 'wa rahmatullaahi wa barakaatuh', hint: 'Tanda Waqaf: Jaiz Mutlaq' },
        { ar: 'قُل لَّا أَجِدُ ۗ فِي مَا أُوحِيَ', lt: 'qul laa ajidu fii maa uuhiya', hint: 'Tanda Waqaf: Jaiz Mutlaq' },
        { ar: 'وَلَا تَقُولَنَّ لِشَيْءٍ ۛ إِنِّي فَاعِلٌ', lt: 'wa laa taqulanna li-syay-in inni faa\'il', hint: 'Waqaf: Mu\'anaqah' },
        { ar: 'وَمَن يَتَّقِ اللَّهَ ۗ يَجْعَل لَّهُ مَخْرَجًا', lt: 'wa man yattaqil-laaha yaj\'al lahu makhrajan', hint: 'Waqaf: Jaiz Mutlaq' },
        { ar: 'وَيَرْزُقْهُ مِنْ حَيْثُ ۙ لَا يَحْتَسِبُ', lt: 'wa yarzuqhu min haytsu laa yahtasib', hint: 'Waqaf: Mujawwaz' },
        { ar: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ ۚ فَهُوَ حَسْبُهُ', lt: 'wa man yatawakkal alal-laahi fa-huwa hasbuh', hint: 'Waqaf: Jaiz' },
        { ar: 'إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ', lt: 'innal-laaha baalighu amrih qad ja\'alal-laah', hint: 'Waqaf: Jaiz' },
        { ar: 'لِكُلِّ شَيْءٍ قَدْرًا ۝', lt: 'likulli syay-in qadran', hint: 'Waqaf: Akhir Ayat' },
        { ar: 'وَاللَّاتِي يَأْتِينَ الْفَاحِشَةَ ۚ مِن نِّسَائِكُمْ', lt: 'wal-laatii ya-tiinal-faahisyata min nisaa-ikum', hint: 'Waqaf: Jaiz' },
        { ar: 'فَاسْتَشْهِدُوا عَلَيْهِنَّ ۛ أَرْبَعَةً مِّنكُمْ', lt: 'fastasyhduu alayhinna arba\'atan minkum', hint: 'Waqaf: Mu\'anaqah' },
        { ar: 'فَإِن شَهِدُوا ۚ فَأَمْسِكُوهُنَّ فِي الْبُيُوتِ', lt: 'fa-in syahiduu fa-amsiikuuhunna fil-buyuut', hint: 'Waqaf: Jaiz' },
        { ar: 'حَتَّىٰ يَتَوَفَّاهُنَّ الْمَوْتُ أَوْ يَجْعَلَ اللَّهُ لَهُنَّ سَبِيلًا ۝', lt: 'hattaa yatawaffaahunnal-mawtu aw yaj\'alal-laahu lahunna sabiilaa', hint: 'QS. An-Nisa: 15' },
    ],
    '11-20': [ // Tasydid dan dengung (ghunnah/idgham)
        { ar: 'إِنَّ اللَّهَ لَا يَظْلِمُ النَّاسَ', lt: 'innal-laaha laa yazhlimun-naas', hint: 'Tasydid: Nun + Lam' },
        { ar: 'وَلَٰكِنَّ النَّاسَ أَنفُسَهُمْ يَظْلِمُونَ', lt: 'wa laakinn-an-naasa anfusahum yazhlimun', hint: 'Tasydid: Nun' },
        { ar: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ', lt: 'allaahumma innaka afuww', hint: 'Tasydid: Mim + Nun + Wau' },
        { ar: 'تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', lt: 'tuhibbul-afwa fa\'fu anni', hint: 'Tasydid: Ba + Nun' },
        { ar: 'رَبَّنَا تَقَبَّلْ مِنَّا', lt: 'rabbanaa taqabbal minnaa', hint: 'Tasydid: Ba + Nun' },
        { ar: 'إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ', lt: 'innaka antas-samii\'ul-aliim', hint: 'Tasydid: Nun + Sin' },
        { ar: 'رَبَّنَا وَاجْعَلْنَا مُسْلِمَيْنِ لَكَ', lt: 'rabbanaa waj\'alnaa muslimayni lak', hint: 'Tasydid: Ba' },
        { ar: 'وَمِن ذُرِّيَّتِنَا أُمَّةً مُّسْلِمَةً لَّكَ', lt: 'wa min dzurriyyatinaa ummatam muslimatan lak', hint: 'Tasydid: Mim + Dhad' },
        { ar: 'وَأَرِنَا مَنَاسِكَنَا وَتُبْ عَلَيْنَا', lt: 'wa arinaa manaasikanaa wa tub alaynaa', hint: 'Ghunnah (dengung)' },
        { ar: 'إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ', lt: 'innaka antat-tawwaabur-rahiim', hint: 'Tasydid: Nun + Wau + Ra' },
        { ar: 'مَن يَّعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا', lt: 'man ya\'mal mitsqaala dzarratin khayraa', hint: 'Idgham: Nun+Ya + Ghunnah' },
        { ar: 'وَمَن يَّعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا', lt: 'wa man ya\'mal mitsqaala dzarratin syarraa', hint: 'Idgham: Nun+Ya + Ghunnah' },
        { ar: 'مَّن يَّعْمَلْ سُوءًا يُجْزَ بِهِ', lt: 'man ya\'mal suu-an yujza bih', hint: 'Idgham Bighunnah' },
        { ar: 'وَلَا يَجِدْ لَهُ مِن دُونِ اللَّهِ', lt: 'wa laa yajid lahu min duunil-laah', hint: 'Idgham Bilaa Ghunnah' },
        { ar: 'وَلِيًّا وَلَا نَصِيرًا', lt: 'waliyyan wa laa nashiiraa', hint: 'Tasydid: Ya + Wau' },
        { ar: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا', lt: 'innash-shalaata kaanat alal-mu\'miniina kitaaban mawquutaa', hint: 'Tasydid: Nun + Sin' },
        { ar: 'وَإِذَا كُنتَ فِيهِمْ فَأَقَمْتَ لَهُمُ الصَّلَاةَ', lt: 'wa idzaa kunta fiihim fa-aqamta lahumush-shalaah', hint: 'Tasydid: Nun (kunta)' },
        { ar: 'فَلْتَقُمْ طَائِفَةٌ مِّنْهُم مَّعَكَ', lt: 'faltaqum thaa-ifatun minhum ma\'ak', hint: 'Ikhfa + Idgham' },
        { ar: 'وَلْيَأْخُذُوا أَسْلِحَتَهُمْ فَإِذَا سَجَدُوا', lt: 'wal-ya-khudzuu aslihatahumfa idzaa sajaduu', hint: 'Ikhfa' },
        { ar: 'فَلْيَكُونُوا مِن وَرَائِكُمْ وَلْتَأْتِ طَائِفَةٌ أُخْرَىٰ', lt: 'fal-yakuunuu min waraa-ikum walta-ti thaa-ifatun ukhraa', hint: 'Ikhfa + Idgham' },
    ],
    '21-30': [ // Ayat quran agak panjang, sulit (1 ayat utuh)
        { ar: 'شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ قَائِمًا بِالْقِسْطِ', lt: 'syahidal-laahu annahuu laa ilaaha illaa huwa wal-malaa-ikatu wa ulul-ilmi qaa-iman bil-qisth', hint: 'QS. Ali Imran: 18' },
        { ar: 'لَا إِلَٰهَ إِلَّا هُوَ الْعَزِيزُ الْحَكِيمُ', lt: 'laa ilaaha illaa huwal-aziizul-hakiim', hint: 'QS. Ali Imran: 18' },
        { ar: 'إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ وَمَا اخْتَلَفَ الَّذِينَ أُوتُوا الْكِتَابَ', lt: 'innaddina indal-laahil-islaamu wa makhtalafal-ladzina uutul-kitaab', hint: 'QS. Ali Imran: 19' },
        { ar: 'إِلَّا مِن بَعْدِ مَا جَاءَهُمُ الْعِلْمُ بَغْيًا بَيْنَهُمْ وَمَن يَكْفُرْ بِآيَاتِ اللَّهِ', lt: 'illaa min ba\'di maa jaa-ahumul-ilmu baghyan baynahum wa man yakfur bi-aayaatil-laah', hint: 'QS. Ali Imran: 19' },
        { ar: 'فَإِنَّ اللَّهَ سَرِيعُ الْحِسَابِ', lt: 'fa-innal-laaha sarii\'ul-hisaab', hint: 'QS. Ali Imran: 19' },
        { ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ', lt: 'allaahu laa ilaaha illaa huwal-hayyul-qayyuum laa ta-khudhuhu sinatun wa laa nawm', hint: 'QS. Al-Baqarah: 255 (Ayat Kursi)' },
        { ar: 'لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ', lt: 'lahu maa fis-samaawaati wa maa fil-ardhi man dzal-ladzii yasyfa\'u indahu illaa bi-idznih', hint: 'QS. Al-Baqarah: 255 (Ayat Kursi)' },
        { ar: 'يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ', lt: 'ya\'lamu maa bayna aydiihim wa maa khalfahum wa laa yuhiithuuna bi-syay-in min ilmihi illaa bimaa syaa-a', hint: 'QS. Al-Baqarah: 255 (Ayat Kursi)' },
        { ar: 'وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ', lt: 'wasi\'a kursiyyuhus-samaawaati wal-ardha wa laa ya-uuduhu hifzhuhumaa wa huwal-aliyyul-azhiim', hint: 'QS. Al-Baqarah: 255 (Ayat Kursi)' },
        { ar: 'لَا إِكْرَاهَ فِي الدِّينِ قَد تَّبَيَّنَ الرُّشْدُ مِنَ الْغَيِّ', lt: 'laa ikraaha fid-diin qad tabayyanar-rusydu minal-ghayy', hint: 'QS. Al-Baqarah: 256' },
        { ar: 'فَمَن يَكْفُرْ بِالطَّاغُوتِ وَيُؤْمِن بِاللَّهِ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ', lt: 'faman yakfur bith-thaaghuuti wa yu-min billaahi fa-qadistamsaka bil-urwatil-wutsqaa', hint: 'QS. Al-Baqarah: 256' },
        { ar: 'لَا انفِصَامَ لَهَا وَاللَّهُ سَمِيعٌ عَلِيمٌ', lt: 'laa infishaama lahaa wal-laahu samii\'un aliim', hint: 'QS. Al-Baqarah: 256' },
        { ar: 'اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا يُخْرِجُهُم مِّنَ الظُّلُمَاتِ إِلَى النُّورِ', lt: 'allaahu waliyyul-ladzina aamanuu yukhrijuhum minazh-zhulumaati ilan-nuur', hint: 'QS. Al-Baqarah: 257' },
        { ar: 'وَالَّذِينَ كَفَرُوا أَوْلِيَاؤُهُمُ الطَّاغُوتُ يُخْرِجُونَهُم مِّنَ النُّورِ إِلَى الظُّلُمَاتِ', lt: 'wal-ladzina kafaruu awliyaa-uhumuth-thaaghuutu yukhrijuunahum minan-nuri ilazh-zhulumaati', hint: 'QS. Al-Baqarah: 257' },
        { ar: 'أُولَٰئِكَ أَصْحَابُ النَّارِ هُمْ فِيهَا خَالِدُونَ', lt: 'ulaa-ika ash-haabun-naari hum fiihaa khaaliduun', hint: 'QS. Al-Baqarah: 257' },
        { ar: 'إِنَّ اللَّهَ اشْتَرَىٰ مِنَ الْمُؤْمِنِينَ أَنفُسَهُمْ وَأَمْوَالَهُم بِأَنَّ لَهُمُ الْجَنَّةَ', lt: 'innal-laahash-taraa minal-mu\'miniina anfusahum wa amwaalahum bi-anna lahumul-jannah', hint: 'QS. At-Taubah: 111' },
        { ar: 'يُقَاتِلُونَ فِي سَبِيلِ اللَّهِ فَيَقْتُلُونَ وَيُقْتَلُونَ وَعْدًا عَلَيْهِ حَقًّا فِي التَّوْرَاةِ', lt: 'yuqaatiluuna fii sabiilil-laahi fa-yaqtuluuna wa yuqtalauna wa\'dan alayhi haqqan fit-tawraati', hint: 'QS. At-Taubah: 111' },
        { ar: 'وَالْإِنجِيلِ وَالْقُرْآنِ وَمَنْ أَوْفَىٰ بِعَهْدِهِ مِنَ اللَّهِ', lt: 'wal-injiili wal-qur-aani wa man awfaa bi-ahdihi minal-laah', hint: 'QS. At-Taubah: 111' },
        { ar: 'فَاسْتَبْشِرُوا بِبَيْعِكُمُ الَّذِي بَايَعْتُم بِهِ وَذَٰلِكَ هُوَ الْفَوْزُ الْعَظِيمُ', lt: 'fastabsyiruu bi-bay\'ikumul-ladzii baaya\'tum bihii wa dzaalika huwal-fawzul-azhiim', hint: 'QS. At-Taubah: 111' },
        { ar: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ', lt: 'yaa ayyuhal-ladzina aamanuttaqul-laaha wa kuunuu ma\'ash-shaadiqiin', hint: 'QS. At-Taubah: 119' },
        { ar: 'وَمَا كَانَ الْمُؤْمِنُونَ لِيَنفِرُوا كَافَّةً فَلَوْلَا نَفَرَ مِن كُلِّ فِرْقَةٍ مِّنْهُمْ طَائِفَةٌ لِّيَتَفَقَّهُوا فِي الدِّينِ', lt: 'wa maa kaanal-mu\'minuuna li-yanfiruu kaaffatan fa-lawlaa nafara min kulli firqatin minhum thaa-ifatun li-yatafaqqahuu fid-diin', hint: 'QS. At-Taubah: 122' },
    ],
};

// ============================================================
// HELPERS
// ============================================================

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Determine if a stage is a timed exam (every 10 stages: 10, 20, 30)
const isTimedExamStage = (stage) => stage % 10 === 0;

// Get questions for a given level and stage
const getQuestionsForLevel = (level, stage) => {
    if (level === 1) {
        // Filter questions available at this stage
        const pool = IQRA1_QUESTIONS.filter(q => stage >= q.stage_min && stage <= q.stage_max);
        return pool.length > 0 ? pool : IQRA1_QUESTIONS;
    }
    if (level === 2) {
        if (stage <= 10) return IQRA2_QUESTIONS['1-10'];
        if (stage <= 20) return IQRA2_QUESTIONS['11-20'];
        return IQRA2_QUESTIONS['21-30'];
    }
    if (level === 3) {
        if (stage <= 10) return IQRA3_QUESTIONS['1-10'];
        if (stage <= 20) return IQRA3_QUESTIONS['11-20'];
        return IQRA3_QUESTIONS['21-30'];
    }
    if (level === 4) {
        if (stage <= 10) return IQRA4_QUESTIONS['1-10'];
        if (stage <= 20) return IQRA4_QUESTIONS['11-20'];
        return IQRA4_QUESTIONS['21-30'];
    }
    if (level === 5) {
        if (stage <= 10) return IQRA5_QUESTIONS['1-10'];
        if (stage <= 20) return IQRA5_QUESTIONS['11-20'];
        return IQRA5_QUESTIONS['21-30'];
    }
    if (level === 6) {
        if (stage <= 10) return IQRA6_QUESTIONS['1-10'];
        if (stage <= 20) return IQRA6_QUESTIONS['11-20'];
        return IQRA6_QUESTIONS['21-30'];
    }
    return IQRA1_QUESTIONS;
};

// Generate lesson questions (5 questions for normal, 8 for timed exam)
const generateLesson = (level, stage) => {
    const pool = getQuestionsForLevel(level, stage);
    const numQ = isTimedExamStage(stage) ? 8 : 5;
    const shuffled = shuffle(pool);
    const selected = shuffled.slice(0, Math.min(numQ, shuffled.length));
    
    return selected.map((item, i) => {
        // Build wrong options from the same pool
        const wrongPool = pool.filter(p => p.ar !== item.ar);
        const distractors = shuffle(wrongPool).slice(0, 3);
        const options = shuffle([item, ...distractors]);
        
        let type = 'ar-to-lt';
        const rand = Math.random();
        // 20-30% chance for voice question on all levels
        if (level === 1) {
            type = rand > 0.7 ? 'voice' : (rand > 0.4 ? 'lt-to-ar' : 'ar-to-lt');
        } else {
            type = rand > 0.75 ? 'voice' : 'ar-to-lt';
        }
        
        return { id: i, type, target: item, options };
    });
};

const generatePlacementExam = (targetLevel) => {
    let pool = [];
    for (let l = 1; l < targetLevel; l++) {
        pool = pool.concat(getQuestionsForLevel(l, 10));
        pool = pool.concat(getQuestionsForLevel(l, 20));
        pool = pool.concat(getQuestionsForLevel(l, 30));
    }
    const shuffled = shuffle(pool);
    const selected = shuffled.slice(0, 15); // minimum 15 questions
    
    return selected.map((item, i) => {
        const wrongPool = pool.filter(p => p.ar !== item.ar);
        const distractors = shuffle(wrongPool).slice(0, 3);
        const options = shuffle([item, ...distractors]);
        
        let type = 'ar-to-lt';
        const rand = Math.random();
        if (targetLevel <= 2) {
            type = rand > 0.8 ? 'voice' : (rand > 0.5 ? 'lt-to-ar' : 'ar-to-lt');
        } else {
            type = rand > 0.85 ? 'voice' : 'ar-to-lt';
        }
        
        return { id: i, type, target: item, options };
    });
};

// ============================================================
// LEVEL METADATA
// ============================================================
const LEVEL_META = {
    1: { title: 'Iqra 1', desc: 'Huruf Hijaiyah', color: '#10B981', light: '#D1FAE5', border: '#6EE7B7' },
    2: { title: 'Iqra 2', desc: 'Harakat & Tanwin', color: '#3B82F6', light: '#DBEAFE', border: '#93C5FD' },
    3: { title: 'Iqra 3', desc: 'Mad & Panjang', color: '#8B5CF6', light: '#EDE9FE', border: '#C4B5FD' },
    4: { title: 'Iqra 4', desc: 'Mad Lin (Au/Ai)', color: '#F59E0B', light: '#FEF3C7', border: '#FCD34D' },
    5: { title: 'Iqra 5', desc: 'Qalqalah', color: '#EC4899', light: '#FCE7F3', border: '#F9A8D4' },
    6: { title: 'Iqra 6', desc: 'Waqaf & Tasydid', color: '#EF4444', light: '#FEE2E2', border: '#FCA5A5' },
};

// Removed STAGE_GROUP_DESC as requested

// ============================================================
// AUDIO ENGINE
// ============================================================
const playTone = (frequency, duration, type = 'sine', volume = 0.3) => {
    if (typeof window === 'undefined') return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        osc.type = type;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
};

const playCorrectSFX = () => {
    setTimeout(() => playTone(523.25, 0.15, 'sine', 0.3), 0);
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.3), 100);
    setTimeout(() => playTone(783.99, 0.2, 'sine', 0.3), 200);
};

const playWrongSFX = () => {
    setTimeout(() => playTone(200, 0.1, 'sawtooth', 0.15), 0);
    setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.15), 100);
};

// ============================================================
// PATH NODE COMPONENT (with zigzag connector lines)
// ============================================================

// Calculate zigzag position for each stage
const STAGE_HEIGHT = 90;
const ZIGZAG_WIDTH = 36;

const getZigzagPos = (stage) => {
    // 5-node pattern per row: center, right, far-right, right, center, left, far-left, left, center...
    const pattern = [0, 1, 2, 1, 0, -1, -2, -1]; // multipliers for X offset
    const idx = (stage - 1) % pattern.length;
    return pattern[idx];
};

const PathBackground = ({ currentUnlocked, levelColor }) => {
    let dLocked = "";
    let dUnlocked = "";
    
    for (let i = 1; i < 30; i++) {
        const fromX = 100 + getZigzagPos(i) * ZIGZAG_WIDTH;
        const toX = 100 + getZigzagPos(i + 1) * ZIGZAG_WIDTH;
        const fromY = (i - 1) * STAGE_HEIGHT + 28; // Center of 56px node
        const toY = i * STAGE_HEIGHT + 28;
        
        const midY = (fromY + toY) / 2;
        const curve = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY} `;
        
        dLocked += curve;
        if (i < currentUnlocked) {
            dUnlocked += curve;
        }
    }

    return (
        <svg 
            className="absolute top-0 left-1/2 -translate-x-1/2" 
            style={{ width: '200px', height: `${30 * STAGE_HEIGHT}px`, zIndex: 0 }}
        >
            <path d={dLocked} fill="none" stroke="#E5E7EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d={dUnlocked} fill="none" stroke={levelColor} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const PathNode = ({ stage, status, onClick, levelColor, isExam }) => {
    let bgStyle, icon;
    if (status === 'completed') {
        bgStyle = { background: levelColor, borderColor: levelColor, color: '#fff', boxShadow: `0 4px 0 rgba(0,0,0,0.2)` };
        icon = <PhosphorIcon icon="check-circle" size={22} weight="fill" />;
    } else if (status === 'current') {
        bgStyle = { background: levelColor, borderColor: levelColor, color: '#fff', boxShadow: `0 4px 0 rgba(0,0,0,0.2)` };
        icon = <PhosphorIcon icon="star" size={22} weight="fill" />;
    } else if (status === 'jump') {
        bgStyle = { background: '#FEF3C7', borderColor: '#F59E0B', color: '#B45309', boxShadow: '0 4px 0 #F59E0B' };
        icon = <PhosphorIcon icon="rocket-launch" size={22} weight="fill" />;
    } else {
        bgStyle = { background: '#E5E7EB', borderColor: '#D1D5DB', color: '#9CA3AF', boxShadow: '0 4px 0 #D1D5DB' };
        icon = <PhosphorIcon icon="lock" size={22} weight="fill" />;
    }

    return (
        <div className="flex flex-col items-center relative">
            {isExam && status !== 'locked' && status !== 'jump' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center z-10 shadow" title="Ujian Waktu">
                    <span className="text-[9px] font-bold text-yellow-900">⏱</span>
                </div>
            )}
            <button
                onClick={status !== 'locked' ? () => onClick(stage) : undefined}
                style={bgStyle}
                className={`w-14 h-14 rounded-full border-b-4 flex flex-col items-center justify-center transition-transform active:scale-95 relative ${status === 'current' || status === 'jump' ? 'animate-bounce' : ''} ${status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                {icon}
            </button>
            <span className="text-[10px] font-bold text-gray-500 mt-1 bg-white/80 px-1 rounded-md text-center">
                {status === 'jump' ? 'Ujian Loncat' : isExam ? `⏱ Ujian ${stage}` : `Stage ${stage}`}
            </span>
        </div>
    );
};

// ============================================================
// TIMED EXAM OVERLAY
// ============================================================
const EXAM_TIME = 45; // seconds per question

const TimedExamBanner = ({ timeLeft, totalTime }) => {
    const pct = (timeLeft / totalTime) * 100;
    const color = timeLeft > 15 ? '#10B981' : timeLeft > 8 ? '#F59E0B' : '#EF4444';
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-xl">
            <span className="text-yellow-600 text-sm font-bold">⏱</span>
            <div className="flex-1 h-2 bg-yellow-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
            <span className="text-xs font-bold" style={{ color }}>{timeLeft}s</span>
        </div>
    );
};

// ============================================================
// MAIN IQRA COMPONENT
// ============================================================
const Iqra = ({ setActiveTab, currentUser }) => {
    const [activeLevel, setActiveLevel] = useState(1);
    const [progress, setProgress] = useState({ 1: 1 });

    const [currentView, setCurrentView] = useState('path');

    // Lesson states
    const [lessonData, setLessonData] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [activeStage, setActiveStage] = useState(1);
    const [hearts, setHearts] = useState(3);
    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [isExamMode, setIsExamMode] = useState(false);
    const [isPlacementMode, setIsPlacementMode] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showAllRanks, setShowAllRanks] = useState(false);

    // Load total score and leaderboard
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userKey = currentUser ? (currentUser.username || currentUser.id) : '';
            const scoreKey = userKey ? `rqs_iqra_score_${userKey}` : 'rqs_iqra_score';
            const gamifiedKey = userKey ? `rqs_iqra_gamified_${userKey}` : 'rqs_iqra_gamified';
            
            const savedScore = localStorage.getItem(scoreKey);
            if (savedScore) setTotalScore(parseInt(savedScore));
            
            const savedProgress = localStorage.getItem(gamifiedKey);
            if (savedProgress) setProgress(JSON.parse(savedProgress));
            
            const usersData = localStorage.getItem('rqs_users');
            if (usersData) {
                const users = JSON.parse(usersData);
                const lb = [];
                users.forEach(u => {
                    const uKey = u.username || u.id;
                    const uScore = localStorage.getItem(`rqs_iqra_score_${uKey}`);
                    if (uScore && parseInt(uScore) > 0) {
                        lb.push({ name: u.nama || u.username, score: parseInt(uScore), isMe: uKey === userKey });
                    }
                });
                lb.sort((a,b) => b.score - a.score);
                setLeaderboard(lb);
            }
        }
    }, [currentUser]);

    // Timed exam
    const [timeLeft, setTimeLeft] = useState(EXAM_TIME);
    const timerRef = useRef(null);

    const levelMeta = LEVEL_META[activeLevel] || LEVEL_META[1];

    // ------- AUDIO -------
    const playAudio = useCallback((text, isArabic = true) => {
        if (typeof window === 'undefined') return;
        const lang = isArabic ? 'ar-SA' : 'id-ID';
        setIsSpeaking(true);
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(text);
            utt.lang = lang;
            utt.rate = 0.7;
            utt.pitch = 1;
            utt.volume = 1;
            utt.onend = () => setIsSpeaking(false);
            utt.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utt);
        } else {
            setIsSpeaking(false);
        }
    }, []);

    // Auto play when question changes
    useEffect(() => {
        if (currentView === 'lesson' && lessonData.length > 0) {
            const q = lessonData[currentQIndex];
            if (q) {
                const timer = setTimeout(() => {
                    playAudio(q.target.ar, true);
                }, 400);
                return () => clearTimeout(timer);
            }
        }
    }, [currentQIndex, currentView, lessonData, playAudio]);

    // Timed exam countdown
    useEffect(() => {
        if (currentView !== 'lesson' || !isExamMode) return;
        if (isAnswerChecked) {
            clearInterval(timerRef.current);
            return;
        }
        setTimeLeft(EXAM_TIME);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    // Time's up: mark wrong
                    setIsCorrect(false);
                    setIsAnswerChecked(true);
                    setHearts(h => Math.max(0, h - 1));
                    playWrongSFX();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [currentQIndex, currentView, isExamMode, isAnswerChecked]);

    const saveProgress = (newProgress) => {
        setProgress(newProgress);
        const userKey = currentUser ? (currentUser.username || currentUser.id) : '';
        const gamifiedKey = userKey ? `rqs_iqra_gamified_${userKey}` : 'rqs_iqra_gamified';
        localStorage.setItem(gamifiedKey, JSON.stringify(newProgress));
    };

    // ------- LESSON LOGIC -------
    const startLesson = (stage) => {
        if (stage === 'jump') {
            if (window.confirm(`Anda ingin loncat ke Iqra ${activeLevel}? Anda harus menyelesaikan Ujian Penempatan (15 soal acak) dengan maksimal salah 5 kali. Mulai sekarang?`)) {
                startPlacementExam(activeLevel);
            }
            return;
        }

        const exam = isTimedExamStage(stage);
        setActiveStage(stage);
        setIsExamMode(exam);
        setIsPlacementMode(false);
        const questions = generateLesson(activeLevel, stage);
        setLessonData(questions);
        setCurrentQIndex(0);
        setSelectedOption(null);
        setIsAnswerChecked(false);
        setHearts(exam ? 5 : 3);
        setScore(0);
        setTimeLeft(EXAM_TIME);
        setCurrentView('lesson');
    };

    const startPlacementExam = (targetLevel) => {
        setIsPlacementMode(true);
        setActiveStage(1);
        setIsExamMode(true);
        const questions = generatePlacementExam(targetLevel);
        setLessonData(questions);
        setCurrentQIndex(0);
        setSelectedOption(null);
        setIsAnswerChecked(false);
        setHearts(5); // 5 hearts for 15 questions
        setScore(0);
        setTimeLeft(EXAM_TIME);
        setCurrentView('lesson');
    };

    useEffect(() => {
        if (isPlacementMode && hearts <= 0 && currentView === 'lesson') {
            clearInterval(timerRef.current);
            setTimeout(() => {
                alert("Maaf, Anda terlalu banyak salah. Anda GAGAL ujian penempatan. Silakan coba lagi.");
                setIsPlacementMode(false);
                setCurrentView('path');
            }, 300);
        }
    }, [hearts, isPlacementMode, currentView]);

    const handleOptionSelect = (opt) => {
        if (isAnswerChecked) return;
        setSelectedOption(opt);
        const q = lessonData[currentQIndex];
        if (q.type === 'ar-to-lt') playAudio(opt.lt, false);
        else playAudio(opt.ar, true);
    };

    const handleCheckVoice = (isCorrectAnswer, transcript = "") => {
        clearInterval(timerRef.current);
        setIsCorrect(isCorrectAnswer);
        setIsAnswerChecked(true);
        if (isCorrectAnswer) {
            playCorrectSFX();
            const points = isExamMode ? 15 : 10;
            setScore(s => s + points);
            setTotalScore(ts => {
                const newTs = ts + points;
                if (typeof window !== 'undefined') {
                    const userKey = currentUser ? (currentUser.username || currentUser.id) : '';
                    const scoreKey = userKey ? `rqs_iqra_score_${userKey}` : 'rqs_iqra_score';
                    localStorage.setItem(scoreKey, newTs);
                }
                return newTs;
            });
        } else {
            playWrongSFX();
            setHearts(h => Math.max(0, h - 1));
        }
    };

    const startVoiceRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Peramban Anda tidak mendukung sensor suara. Harap gunakan Chrome.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setVoiceTranscript('');
        };
        recognition.onresult = (event) => {
            setIsListening(false);
            const transcript = event.results[0][0].transcript;
            setVoiceTranscript(transcript);
            
            const q = lessonData[currentQIndex];
            const cleanTranscript = transcript.toLowerCase().replace(/[\s-']/g, '');
            const targetLt = q.target.lt.toLowerCase().replace(/[\s-']/g, '');
            
            if (cleanTranscript.includes(targetLt) || targetLt.includes(cleanTranscript)) {
                handleCheckVoice(true);
            } else {
                handleCheckVoice(false);
            }
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const handleCheck = () => {
        if (isAnswerChecked) {
            clearInterval(timerRef.current);
            if (currentQIndex < lessonData.length - 1) {
                setCurrentQIndex(currentQIndex + 1);
                setSelectedOption(null);
                setIsAnswerChecked(false);
                setVoiceTranscript('');
                setTimeLeft(EXAM_TIME);
            } else {
                handleLessonComplete();
            }
        } else {
            if (!selectedOption) return;
            clearInterval(timerRef.current);
            const currentQ = lessonData[currentQIndex];
            const correct = selectedOption.ar === currentQ.target.ar;
            setIsCorrect(correct);
            setIsAnswerChecked(true);
            if (correct) {
                playCorrectSFX();
                const points = isExamMode ? 15 : 10;
                setScore(s => s + points);
                setTotalScore(ts => {
                    const newTs = ts + points;
                    if (typeof window !== 'undefined') localStorage.setItem('rqs_iqra_score', newTs);
                    return newTs;
                });
            } else {
                playWrongSFX();
                setHearts(h => Math.max(0, h - 1));
            }
        }
    };

    const handleLessonComplete = () => {
        if (isPlacementMode) {
            alert(`Selamat! Anda lulus Ujian Penempatan dan berhak masuk Iqra ${activeLevel}!`);
            saveProgress({ ...progress, [activeLevel]: 1 });
            setIsPlacementMode(false);
            setCurrentView('path');
            return;
        }
        setCurrentView('success');
        setTimeout(() => playCorrectSFX(), 100);
        setTimeout(() => playCorrectSFX(), 400);
        setTimeout(() => playCorrectSFX(), 700);
    };

    // ------- PATH VIEW -------
    if (currentView === 'path') {
        const currentUnlocked = progress[activeLevel] || 0;

        let allUsers = [...leaderboard];
        const isMyScoreInLeaderboard = allUsers.some(u => u.isMe);
        // Only include "Anda (Saya)" in leaderboard if we don't have a score in the real leaderboard yet but we have totalScore locally
        // Or actually, if it's already in `leaderboard`, it's marked `isMe`.
        if (!isMyScoreInLeaderboard && totalScore > 0) {
            allUsers.push({ name: currentUser?.nama || 'Saya', score: totalScore, isMe: true });
            allUsers.sort((a, b) => b.score - a.score);
        }
        
        let myRankText = "Belum Ada Peringkat";
        const myIndex = allUsers.findIndex(u => u.isMe);
        if (myIndex !== -1) {
            myRankText = `Peringkat #${myIndex + 1}`;
        }

        return (
            <div className="pb-32 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-screen">
                {/* Header */}
                <div className="flex items-center p-4 bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
                    <button onClick={() => setActiveTab('kategori')} className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                        <PhosphorIcon icon="arrow-left" size={24} />
                    </button>
                    <div className="flex-1 text-center pr-10">
                        <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Total Skor Iqra</h2>
                        <div className="text-sm font-bold text-yellow-500 flex items-center justify-center gap-1">
                            <PhosphorIcon icon="star" weight="fill" size={16} /> {totalScore}
                        </div>
                    </div>
                </div>

                {/* Level Tabs */}
                <div className="sticky top-[65px] z-40 bg-white border-b border-gray-100 shadow-sm px-2 py-3 overflow-x-auto whitespace-nowrap hide-scrollbar flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map(lvl => (
                        <button
                            key={lvl}
                            onClick={() => setActiveLevel(lvl)}
                            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0"
                            style={activeLevel === lvl
                                ? { background: LEVEL_META[lvl].color, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }
                                : { background: '#F3F4F6', color: '#6B7280' }}
                        >
                            {LEVEL_META[lvl].title}
                        </button>
                    ))}
                </div>

                {/* Level Info Banner */}
                <div className="mx-4 mt-4 mb-3 rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: levelMeta.light, border: `1.5px solid ${levelMeta.border}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                        style={{ background: levelMeta.color }}>
                        {activeLevel}
                    </div>
                    <div>
                        <div className="font-bold text-sm" style={{ color: levelMeta.color }}>{levelMeta.title} — {levelMeta.desc}</div>
                        <div className="text-xs font-medium text-gray-600">{currentUnlocked > 30 ? '30' : currentUnlocked - 1}/30 stage selesai</div>
                    </div>
                </div>

                {/* Leaderboard / Papan Peringkat */}
                <div className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ background: '#F59E0B' }} />
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                            <PhosphorIcon icon="trophy" weight="fill" className="text-yellow-500" size={20} /> 
                            Peringkat Kelas
                        </h3>
                        {myIndex !== -1 && (
                            <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg">{myRankText}</span>
                        )}
                    </div>
                    {allUsers.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-4">Belum ada peserta yang memiliki skor. Mulai belajar sekarang!</div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {allUsers.slice(0, showAllRanks ? allUsers.length : 3).map((user, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-2 rounded-xl text-sm ${user.isMe ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 text-center font-bold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-gray-400'}`}>
                                                {idx + 1}
                                            </span>
                                            <span className={`font-medium ${user.isMe ? 'text-blue-700 font-bold' : 'text-gray-700'}`}>{user.name}</span>
                                        </div>
                                        <span className={`font-bold ${user.isMe ? 'text-blue-700' : 'text-gray-600'}`}>{user.score} pt</span>
                                    </div>
                                ))}
                            </div>
                            {!showAllRanks && allUsers.length > 3 && (
                                <button onClick={() => setShowAllRanks(true)} className="w-full text-center text-xs text-blue-600 font-bold py-2 mt-2 bg-blue-50 rounded-lg active:scale-95 transition-all">
                                    Lihat Peringkat Lainnya ({allUsers.length - 3})
                                </button>
                            )}
                            {showAllRanks && (
                                <button onClick={() => setShowAllRanks(false)} className="w-full text-center text-xs text-gray-500 font-bold py-2 mt-2 bg-gray-50 rounded-lg active:scale-95 transition-all">
                                    Sembunyikan Peringkat
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Path — with SVG connectors */}
                <div className="relative w-full mx-auto pb-8 mt-4" style={{ height: `${30 * STAGE_HEIGHT + 50}px`, maxWidth: '400px' }}>
                    <PathBackground currentUnlocked={currentUnlocked} levelColor={levelMeta.color} />
                    
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(stage => {
                        let status = 'locked';
                        
                        if (currentUnlocked > 0) {
                            if (stage < currentUnlocked) status = 'completed';
                            else if (stage === currentUnlocked || currentUnlocked > 30) status = 'current';
                        } else {
                            // Level locked, but stage 1 is the jump exam trigger
                            if (stage === 1 && activeLevel > 1) status = 'jump';
                        }

                        const exam = isTimedExamStage(stage);
                        const xOffset = getZigzagPos(stage) * ZIGZAG_WIDTH;

                        return (
                            <div 
                                key={stage}
                                className="absolute flex flex-col items-center"
                                style={{
                                    top: `${(stage - 1) * STAGE_HEIGHT}px`,
                                    left: '50%',
                                    transform: `translateX(calc(-50% + ${xOffset}px))`,
                                    zIndex: 10
                                }}
                            >
                                <PathNode
                                    stage={stage}
                                    status={status}
                                    onClick={(s) => {
                                        if (status === 'jump') startLesson('jump');
                                        else startLesson(s);
                                    }}
                                    levelColor={levelMeta.color}
                                    isExam={exam}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ------- LESSON VIEW -------
    if (currentView === 'lesson') {
        const q = lessonData[currentQIndex];
        if (!q) return null;
        const progressPct = (currentQIndex / lessonData.length) * 100;
        const maxHearts = isExamMode ? 5 : 3;

        return (
            <div className="bg-white min-h-screen flex flex-col fixed inset-0 z-[9999] animate-in slide-in-from-bottom-full duration-300">
                {/* Top Bar */}
                <div className="flex items-center px-4 pt-4 pb-3 gap-3 border-b border-gray-100 shrink-0">
                    <button onClick={() => {
                        clearInterval(timerRef.current);
                        setCurrentView('path');
                    }} className="text-gray-400 hover:text-gray-600 shrink-0">
                        <PhosphorIcon icon="x" size={24} weight="bold" />
                    </button>
                    <div className="flex-1">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                            <div
                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%`, background: levelMeta.color }}
                            />
                            <div className="absolute top-1 left-2 right-2 h-1 bg-white/40 rounded-full" />
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                            {isExamMode ? '⏱ Mode Ujian Waktu' : `Iqra ${activeLevel} • Stage ${activeStage}`} — Soal {currentQIndex + 1}/{lessonData.length}
                        </div>
                    </div>
                    {/* Hearts */}
                    <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: maxHearts }).map((_, i) => (
                            <span key={i} className={`text-base ${i < hearts ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
                        ))}
                    </div>
                </div>

                {/* Timed exam bar */}
                {isExamMode && (
                    <div className="px-4 pt-2 shrink-0">
                        <TimedExamBanner timeLeft={timeLeft} totalTime={EXAM_TIME} />
                    </div>
                )}

                {/* Hint */}
                {q.target.hint && (
                    <div className="mx-4 mt-2 px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 shrink-0">
                        <span className="text-[10px] text-gray-500 font-medium">💡 {q.target.hint}</span>
                    </div>
                )}

                {/* Question Content — scrollable */}
                <div className="flex-1 px-4 flex flex-col items-center justify-center overflow-y-auto py-4">
                    <div className="w-full max-w-sm">
                        <h2 className="text-base font-bold text-gray-800 mb-4">
                            {q.type === 'ar-to-lt' ? '🔊 Pilih bacaan yang benar' : '🔊 Pilih huruf yang tepat'}
                        </h2>

                        {/* Target Display */}
                        <div className="mb-6 flex justify-center">
                            {q.type === 'ar-to-lt' ? (
                                <button
                                    onClick={() => playAudio(q.target.ar, true)}
                                    className="min-w-[130px] px-6 py-4 rounded-3xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all relative shadow-md"
                                    style={{ background: levelMeta.light, border: `2.5px solid ${levelMeta.border}` }}
                                >
                                    <span className="font-arabic text-5xl font-bold leading-tight" style={{ color: '#4A1C14' }}>{q.target.ar}</span>
                                    <div className="mt-2 flex items-center gap-1 text-xs font-bold" style={{ color: levelMeta.color }}>
                                        <PhosphorIcon icon="speaker-high" size={14} weight="fill" />
                                        <span>{isSpeaking ? 'Memutar...' : 'Ketuk untuk dengar'}</span>
                                    </div>
                                </button>
                            ) : (
                                <button
                                    onClick={() => playAudio(q.target.lt, false)}
                                    className="w-36 min-h-[100px] px-4 py-4 rounded-3xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all relative shadow-md"
                                    style={{ background: '#EFF6FF', border: '2.5px solid #BFDBFE' }}
                                >
                                    <span className="text-2xl font-bold text-[#1D4ED8] text-center">{q.target.lt}</span>
                                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-blue-500">
                                        <PhosphorIcon icon="speaker-high" size={14} weight="fill" />
                                        <span>{isSpeaking ? 'Memutar...' : 'Ketuk untuk dengar'}</span>
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Score */}
                        <div className="text-center text-sm font-bold mb-3" style={{ color: levelMeta.color }}>
                            ⭐ Skor: {score}
                        </div>

                        {/* Answer Area */}
                        {q.type === 'voice' ? (
                            <div className="flex flex-col items-center mt-4 w-full">
                                <div className="text-sm font-bold text-gray-600 mb-6 text-center">
                                    Tekan mikrofon dan ucapkan bacaannya:
                                </div>
                                <button
                                    disabled={isAnswerChecked || isListening}
                                    onClick={startVoiceRecognition}
                                    className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 mb-4 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}
                                    style={isListening ? {} : { background: levelMeta.color, boxShadow: `0 6px 0 ${levelMeta.border}` }}
                                >
                                    <PhosphorIcon icon="microphone" size={48} weight="fill" className="text-white" />
                                </button>
                                {voiceTranscript && (
                                    <div className="mt-2 p-3 bg-gray-100 rounded-lg text-sm text-center">
                                        Anda mengucapkan: <span className="font-bold italic">"{voiceTranscript}"</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {q.options.map((opt, i) => {
                                    const isSelected = selectedOption?.ar === opt.ar;
                                    const isCorrectOpt = opt.ar === q.target.ar;

                                    let btnStyle = {
                                        border: '2px solid #E5E7EB',
                                        background: '#FFFFFF',
                                        color: '#374151',
                                        boxShadow: '0 4px 0 #E5E7EB'
                                    };

                                    if (isSelected && !isAnswerChecked) {
                                        btnStyle = {
                                            border: `2px solid ${levelMeta.color}`,
                                            background: levelMeta.light,
                                            color: levelMeta.color,
                                            boxShadow: `0 4px 0 ${levelMeta.border}`
                                        };
                                    } else if (isAnswerChecked) {
                                        if (isCorrectOpt) {
                                            btnStyle = { border: '2px solid #10B981', background: '#D1FAE5', color: '#065F46', boxShadow: '0 4px 0 #6EE7B7' };
                                        } else if (isSelected && !isCorrectOpt) {
                                            btnStyle = { border: '2px solid #EF4444', background: '#FEE2E2', color: '#991B1B', boxShadow: '0 4px 0 #FCA5A5' };
                                        }
                                    }

                                    return (
                                        <button
                                            key={i}
                                            disabled={isAnswerChecked}
                                            onClick={() => handleOptionSelect(opt)}
                                            style={btnStyle}
                                            className="min-h-[72px] py-3 px-2 rounded-2xl flex items-center justify-center font-bold transition-all active:scale-95 active:shadow-none active:translate-y-1"
                                        >
                                            {q.type === 'ar-to-lt' ? (
                                                <span className="font-sans text-sm text-center leading-tight">{opt.lt}</span>
                                            ) : (
                                                <span className="font-arabic text-3xl">{opt.ar}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Bar — fixed at bottom, tidak tertutup navbar karena fixed inset-0 */}
                <div className={`shrink-0 w-full border-t-2 p-4 ${
                    !isAnswerChecked
                        ? 'bg-white border-gray-100'
                        : isCorrect
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-red-50 border-red-200'
                }`}>
                    {isAnswerChecked && (
                        <div className={`flex items-start gap-2 mb-3 font-bold text-sm ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isCorrect ? (
                                <><PhosphorIcon icon="check-circle" size={20} weight="fill" className="mt-0.5 shrink-0" /> Luar biasa! +{isExamMode ? 15 : 10} poin</>
                            ) : (
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1">
                                        <PhosphorIcon icon="x-circle" size={20} weight="fill" className="shrink-0" />
                                        <span>Jawaban benar:</span>
                                    </div>
                                    <span className="font-arabic text-2xl text-gray-800">{lessonData[currentQIndex]?.target.ar}</span>
                                    <span className="text-xs text-gray-600 font-medium">{lessonData[currentQIndex]?.target.lt}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <button
                        disabled={!isAnswerChecked && (q.type === 'voice' || !selectedOption)}
                        onClick={handleCheck}
                        className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all active:scale-95 active:shadow-none active:translate-y-1"
                        style={
                            !isAnswerChecked
                                ? selectedOption
                                    ? { background: levelMeta.color, boxShadow: `0 4px 0 rgba(0,0,0,0.2)` }
                                    : { background: '#D1D5DB', color: '#9CA3AF', boxShadow: 'none' }
                                : isCorrect
                                    ? { background: '#10B981', boxShadow: '0 4px 0 #059669' }
                                    : { background: '#EF4444', boxShadow: '0 4px 0 #DC2626' }
                        }
                    >
                        {!isAnswerChecked ? 'PERIKSA' : currentQIndex < lessonData.length - 1 ? 'LANJUTKAN →' : 'SELESAI ✓'}
                    </button>
                </div>
            </div>
        );
    }

    // ------- SUCCESS VIEW -------
    if (currentView === 'success') {
        const maxScore = lessonData.length * (isExamMode ? 15 : 10);
        const percentage = Math.round((score / maxScore) * 100);
        const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : 1;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center fixed inset-0 z-[9999] animate-in fade-in duration-500 p-5"
                style={{ background: `linear-gradient(135deg, ${levelMeta.color}, ${levelMeta.color}99)` }}>

                {/* Stars */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex gap-2 mb-6"
                >
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl ${s <= stars ? 'bg-yellow-400' : 'bg-white/20'}`}>
                            <PhosphorIcon icon="star" size={32} weight="fill" className={s <= stars ? 'text-yellow-900' : 'text-white/30'} />
                        </div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                >
                    <h1 className="text-3xl font-bold text-white mb-1">
                        {isExamMode ? '🏅 Ujian Selesai!' : 'Stage Selesai! 🎉'}
                    </h1>
                    <p className="text-white/80 font-medium mb-1 text-sm">
                        {isExamMode ? 'Ujian' : 'Stage'} {activeStage} — {LEVEL_META[activeLevel].title}
                    </p>
                    <div className="bg-white/20 rounded-2xl px-6 py-3 mb-6 inline-flex flex-col items-center">
                        <span className="text-white font-bold text-2xl">⭐ {score} poin</span>
                        <span className="text-white/70 text-xs mt-0.5">{percentage}% benar • {hearts} hati tersisa</span>
                    </div>
                </motion.div>

                <div className="w-full max-w-sm flex flex-col gap-3">
                    <button
                        onClick={() => {
                            const newProgress = { ...progress };
                            if (activeStage >= (progress[activeLevel] || 1) && activeStage < 30) {
                                newProgress[activeLevel] = activeStage + 1;
                                saveProgress(newProgress);
                            }
                            if (activeStage < 30) {
                                startLesson(activeStage + 1);
                            } else {
                                setCurrentView('path');
                            }
                        }}
                        className="w-full bg-white py-4 rounded-2xl font-bold text-lg shadow-[0_4px_0_rgba(0,0,0,0.2)] active:scale-95 transition-all"
                        style={{ color: levelMeta.color }}
                    >
                        {activeStage < 30 ? `LANJUT KE STAGE ${activeStage + 1} →` : 'SELESAI! 🏆'}
                    </button>
                    <button
                        onClick={() => startLesson(activeStage)}
                        className="w-full bg-white/20 py-3 rounded-2xl font-bold text-base text-white active:scale-95 transition-all"
                    >
                        🔁 Ulangi Stage Ini
                    </button>
                    <button
                        onClick={() => setCurrentView('path')}
                        className="w-full bg-white/10 py-3 rounded-2xl font-bold text-base text-white/80 active:scale-95 transition-all"
                    >
                        KEMBALI KE PETA
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default Iqra;
