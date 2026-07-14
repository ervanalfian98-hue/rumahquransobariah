import React, { useState } from 'react';
import PhosphorIcon from './PhosphorIcon';

const SIRAH_DATA = [
    {
        id: "kelahiran",
        title: "Kelahiran & Masa Kecil",
        period: "Tahun Gajah (570 M)",
        icon: "baby",
        desc: "Nabi Muhammad ﷺ lahir di Mekkah pada hari Senin, 12 Rabiul Awal Tahun Gajah (570 M). Beliau lahir yatim karena ayahnya wafat. Beliau disusui oleh Halimah As-Sa'diyah, kemudian diasuh kakek dan pamannya setelah ibunya wafat.",
        fullStory: [
            "Nabi Muhammad ﷺ dilahirkan di kota suci Mekkah pada subuh hari Senin, tanggal 12 Rabiul Awal pada Tahun Gajah, yang bertepatan dengan tahun 570 Masehi. Dinamakan Tahun Gajah karena pada tahun tersebut, pasukan bergajah yang dipimpin oleh Abrahah dari Yaman berusaha menghancurkan Ka'bah, namun Allah SWT menghancurkan mereka dengan mengirimkan burung Ababil.",
            "Beliau lahir dalam keadaan yatim. Ayahnya, Abdullah bin Abdul Muthalib, wafat di Madinah saat berniaga ketika Nabi Muhammad masih dalam kandungan ibunya, Aminah binti Wahb, sekitar usia kandungan dua bulan.",
            "Sesuai dengan tradisi bangsawan Arab saat itu, bayi yang baru lahir diserahkan kepada wanita pedesaan untuk disusui agar tumbuh di lingkungan yang sehat dan memiliki bahasa Arab yang murni. Beliau disusui oleh Tsuwaibah (budak Abu Lahab) sebentar, lalu diserahkan kepada Halimah As-Sa'diyah dari Bani Sa'ad. Bersama keluarga Halimah, beliau tinggal selama kurang lebih empat tahun. Di masa inilah terjadi peristiwa pembelahan dada (Syaqqus Sadr) oleh Malaikat Jibril untuk mengeluarkan bagian syaitan dari hatinya dan menyucikannya dengan air zam-zam.",
            "Pada usia enam tahun, ibundanya Aminah wafat di Abwa (antara Mekkah dan Madinah) saat mereka dalam perjalanan pulang setelah berziarah ke makam ayahanda beliau dan kerabat di Madinah. Beliau kemudian diasuh dengan penuh kasih sayang oleh kakeknya, Abdul Muthalib. Namun dua tahun kemudian kakeknya wafat.",
            "Estafet pengasuhan kemudian beralih kepada pamannya, Abu Thalib. Meski Abu Thalib bukanlah paman yang kaya dan memiliki banyak anak, ia sangat menyayangi dan melindungi keponakannya itu melebihi anak-anaknya sendiri, hingga kelak Nabi dewasa."
        ]
    },
    {
        id: "masa-muda",
        title: "Masa Muda & Pernikahan",
        period: "Usia 12 - 25 Tahun",
        icon: "handshake",
        desc: "Di usia remaja, beliau ikut pamannya berdagang ke Syam dan dikenal sangat jujur (Al-Amin). Pada usia 25 tahun, beliau menikah dengan Siti Khadijah, seorang saudagar wanita kaya dan mulia.",
        fullStory: [
            "Sejak masa kecil, Nabi Muhammad ﷺ tumbuh menjadi pribadi yang terjaga dari keburukan tradisi jahiliyah. Beliau pernah bekerja menggembalakan kambing milik penduduk Mekkah dengan upah beberapa qirath, sebuah pekerjaan yang melatih kesabaran dan sifat memelihara.",
            "Saat berusia 12 tahun, Abu Thalib mengajak beliau pergi berdagang ke Syam (Suriah). Di kota Bushra, rombongan mereka bertemu dengan seorang pendeta Nasrani bernama Buhaira. Pendeta tersebut melihat tanda-tanda kenabian pada diri Muhammad ﷺ, seperti awan yang selalu menaunginya dan stempel kenabian (Khatamun Nubuwwah) di antara kedua pundaknya. Buhaira memperingatkan Abu Thalib agar membawa pulang keponakannya dan menjaganya dari orang-orang Yahudi yang mungkin berniat jahat jika mengetahuinya.",
            "Beranjak dewasa, beliau dikenal luas di kalangan penduduk Mekkah sebagai pemuda yang memiliki akhlak paling mulia, paling menepati janji, dan paling jujur, sehingga masyarakat menggelarinya 'Al-Amin' (Orang yang dapat dipercaya).",
            "Mendengar reputasi luar biasa ini, seorang wanita bangsawan dan saudagar kaya raya bernama Khadijah binti Khuwailid menawarkan kepada beliau untuk menjalankan barang dagangannya ke Syam. Beliau berangkat ditemani Maisarah, pelayan Khadijah. Perdagangan ini menghasilkan keuntungan yang sangat besar berkat kejujuran dan keberkahan beliau.",
            "Kagum dengan laporan Maisarah tentang keluhuran budi pekerti Muhammad ﷺ, Khadijah—yang saat itu banyak menolak lamaran para pemuka Quraisy—mengutus temannya, Nafisah binti Munya, untuk menyampaikan niatnya melamar beliau. Pernikahan pun berlangsung saat Nabi Muhammad ﷺ berusia 25 tahun dan Khadijah berusia 40 tahun. Khadijah menjadi pendamping paling setia, mencurahkan seluruh harta dan cintanya untuk mendukung perjuangan beliau kelak."
        ]
    },
    {
        id: "wahyu",
        title: "Turunnya Wahyu Pertama",
        period: "Usia 40 Tahun (610 M)",
        icon: "book-open-text",
        desc: "Nabi Muhammad ﷺ bertahannuts di Gua Hira. Pada bulan Ramadhan, Malaikat Jibril datang membawa wahyu pertama (Surah Al-Alaq 1-5). Peristiwa ini menandai diangkatnya beliau menjadi Nabi.",
        fullStory: [
            "Menjelang usia 40 tahun, Nabi Muhammad ﷺ mulai merasakan keresahan melihat kemerosotan moral, penyembahan berhala, dan kebodohan (jahiliyah) kaumnya. Beliau kemudian mulai sering mengasingkan diri (tahannuts) di Gua Hira, yang terletak di puncak Jabal Nur, sekitar beberapa kilometer dari Mekkah.",
            "Di dalam gua yang sempit dan gelap itu, beliau menghabiskan waktu berhari-hari pada bulan Ramadhan untuk merenung dan beribadah mencari kebenaran hakiki, dengan berbekal makanan yang dibawakan oleh istrinya, Khadijah.",
            "Puncaknya, pada malam 17 Ramadhan (atau menurut beberapa riwayat 21 atau 24 Ramadhan), datanglah sosok Malaikat Jibril dalam wujud aslinya yang menutupi ufuk, lalu kemudian menemuinya di dalam gua. Jibril merengkuh dan memeluk beliau dengan sangat kuat hingga beliau kesulitan bernapas, seraya berkata: 'Iqra!' (Bacalah!).",
            "Nabi ﷺ dalam keadaan gemetar dan ketakutan menjawab, 'Maa ana biqaari' (Aku tidak bisa membaca). Hal ini diulang sampai tiga kali. Setelah pelukan ketiga dilepaskan, Jibril membacakan lima ayat pertama dari Surah Al-Alaq: 'Bacalah dengan (menyebut) nama Tuhanmu yang menciptakan. Dia telah menciptakan manusia dari segumpal darah...'",
            "Itulah wahyu pertama yang secara resmi menandai pengangkatan beliau sebagai Nabi dan utusan Allah untuk seluruh alam. Nabi pulang dalam keadaan menggigil luar biasa dan meminta Khadijah menyelimutinya ('Zammiluunii, Zammiluunii').",
            "Khadijah menenangkan beliau dengan kata-kata yang sangat menguatkan: 'Demi Allah, Allah tidak akan pernah menghinakanmu! Engkau selalu menyambung tali silaturahmi, memikul beban orang yang lemah, memberi makan orang miskin, memuliakan tamu, dan menolong orang yang membela kebenaran.' Khadijah lalu membawanya ke Waraqah bin Naufal (sepupunya yang menguasai kitab Injil lama), yang kemudian mengonfirmasi bahwa yang datang itu adalah Namus (Malaikat Jibril) yang juga pernah datang kepada Nabi Musa."
        ]
    },
    {
        id: "dakwah-mekkah",
        title: "Dakwah di Mekkah",
        period: "Selama 13 Tahun",
        icon: "megaphone",
        desc: "Fase sembunyi-sembunyi dan terang-terangan yang penuh penolakan serta siksaan. Terjadi 'Amul Huzni' (Tahun Kesedihan) lalu disusul mukjizat Isra' Mi'raj sebagai pelipur lara.",
        fullStory: [
            "Setelah menerima wahyu kedua (Surah Al-Muddassir) yang berisi perintah untuk berdakwah, Nabi Muhammad ﷺ mulai menyebarkan agama Islam. Fase di Mekkah yang berlangsung selama kurang lebih 13 tahun ini dibagi menjadi dua periode: Dakwah Sirriyah (sembunyi-sembunyi) dan Dakwah Jahriyah (terang-terangan).",
            "Selama 3 tahun pertama, dakwah dilakukan secara sembunyi-sembunyi dan berpusat di rumah Arqam bin Abil Arqam. Pada masa ini, orang-orang terdekat beliau masuk Islam, seperti Khadijah (istri), Ali bin Abi Thalib (sepupu), Abu Bakar Ash-Shiddiq (sahabat karib), dan Zaid bin Haritsah (anak angkat). Mereka dikenal sebagai 'Assabiqunal Awwalun' (orang-orang pertama yang masuk Islam).",
            "Setelah turun Surah Al-Hijr ayat 94, Nabi diperintahkan berdakwah secara terang-terangan. Beliau naik ke Bukit Shafa dan mengumpulkan penduduk Mekkah untuk memperingatkan mereka tentang azab Allah. Abu Lahab, pamannya sendiri, langsung menentang dan mencelanya.",
            "Fase terang-terangan ini memicu gelombang penolakan, penyiksaan, dan diskriminasi yang luar biasa dari pembesar Quraisy. Sahabat-sahabat yang status sosialnya lemah disiksa dengan kejam; Bilal bin Rabah dijemur di padang pasir lalu ditindih batu raksasa, dan keluarga Yasir syahid ditombak Abu Jahal.",
            "Quraisy juga melakukan pemboikotan ekonomi dan sosial secara total terhadap Bani Hasyim selama 3 tahun di sebuah lembah. Kaum Muslimin kelaparan hingga terpaksa memakan dedaunan.",
            "Setelah masa boikot berakhir, pada tahun ke-10 kenabian, Nabi diuji dengan kehilangan dua pelindung utamanya: Abu Thalib dan Siti Khadijah wafat dalam waktu yang berdekatan. Tahun ini disebut 'Amul Huzni' (Tahun Kesedihan). Beliau sempat berdakwah ke Thaif namun dilempari batu hingga kakinya berdarah.",
            "Sebagai pelipur lara yang agung, Allah SWT memperjalankan Nabi dalam peristiwa Isra' Mi'raj pada malam 27 Rajab. Beliau diperjalankan dari Masjidil Haram ke Masjidil Aqsha, lalu dinaikkan melintasi tujuh langit hingga Sidratul Muntaha untuk menerima langsung perintah sholat lima waktu."
        ]
    },
    {
        id: "hijrah",
        title: "Hijrah ke Madinah",
        period: "Tahun 622 M",
        icon: "camel",
        desc: "Akibat ancaman pembunuhan dari Quraisy, Nabi berhijrah ke Yatsrib (Madinah) ditemani Abu Bakar. Penduduk Madinah menyambut mereka dengan penuh suka cita.",
        fullStory: [
            "Ketika siksaan Quraisy di Mekkah makin tak tertahankan, ada secercah harapan dari utara. Sekelompok penduduk Yatsrib (sekarang Madinah) datang ke Mekkah pada musim haji, memeluk Islam, dan melakukan Bai'at Aqabah pertama dan kedua. Mereka mengundang Nabi untuk memimpin kota mereka dan berjanji akan melindungi beliau layaknya keluarga sendiri.",
            "Allah pun mengizinkan kaum Muslimin untuk berhijrah (berpindah) secara sembunyi-sembunyi ke Madinah, meninggalkan rumah, harta, dan keluarga mereka demi menyelamatkan keimanan.",
            "Menyadari eksodus ini, para pemuka Quraisy berkumpul di Darun Nadwah. Atas usulan Abu Jahal, mereka memutuskan untuk membunuh Nabi Muhammad ﷺ malam itu juga secara serentak oleh pemuda-pemuda dari seluruh kabilah agar Bani Hasyim tidak bisa menuntut balas.",
            "Malaikat Jibril memberitahukan rencana makar ini. Malam itu, Nabi meminta Ali bin Abi Thalib tidur di ranjangnya menggunakan selimut hijaunya. Nabi pun keluar rumah, menaburkan debu ke kepala para pemuda Quraisy yang sedang mengepung rumahnya sambil membaca Surah Yasin ayat 9, sehingga Allah membutakan pandangan mereka.",
            "Nabi kemudian menemui Abu Bakar Ash-Shiddiq dan memulai perjalanan hijrah. Untuk mengelabui kejaran, mereka tidak langsung pergi ke utara (arah Madinah), melainkan bersembunyi di Gua Tsur di arah selatan selama tiga hari tiga malam.",
            "Ketika tim pelacak Quraisy sampai tepat di mulut gua, Abu Bakar sangat ketakutan, namun Nabi menenangkannya: 'Laa tahzan, innallaaha ma'anaa' (Jangan bersedih, sesungguhnya Allah bersama kita). Allah melindungi gua itu dengan sarang laba-laba dan sarang burung merpati di mulutnya.",
            "Setelah situasi reda, mereka menyewa penunjuk jalan ahli dan menempuh rute pesisir yang tidak biasa. Setelah perjalanan panjang yang menegangkan, rombongan akhirnya tiba di perkampungan Quba (dan membangun masjid pertama, Masjid Quba). Beberapa hari kemudian, beliau memasuki Madinah disambut oleh gegap gempita lantunan 'Thala'al Badru 'Alaina' dari kaum Anshar."
        ]
    },
    {
        id: "periode-madinah",
        title: "Membangun Masyarakat Islam",
        period: "Madinah (Tahun 1-8 H)",
        icon: "mosque",
        desc: "Nabi membangun peradaban Islam di Madinah. Mempersaudarakan Muhajirin dan Anshar, membuat Piagam Madinah, dan memimpin pertahanan militer (Perang Badar, Uhud, Khandaq).",
        fullStory: [
            "Setibanya di Madinah, Nabi Muhammad ﷺ bukan lagi sekadar seorang dai yang diasingkan, melainkan seorang kepala negara dan pemimpin peradaban baru. Yatsrib pun diubah namanya menjadi Madinatun-Nabi (Kota Nabi).",
            "Langkah pertama yang luar biasa adalah membangun Masjid Nabawi sebagai pusat peribadatan, pemerintahan, pendidikan, dan strategi. Lahan tersebut dibeli dari dua anak yatim, lalu dibangun secara gotong royong dengan dinding tanah liat dan atap pelepah kurma.",
            "Langkah kedua adalah 'Al-Mu'akhah' (Mempersaudarakan). Nabi mengambil langkah sosiologis yang brilian dengan mempersaudarakan secara individual antara kaum Muhajirin (pendatang dari Mekkah yang kehilangan segalanya) dengan kaum Anshar (penduduk asli Madinah). Kaum Anshar dengan ikhlas membagi separuh harta, rumah, dan kebun mereka untuk saudara baru mereka.",
            "Langkah ketiga adalah membuat kesepakatan politik yang dikenal dengan 'Piagam Madinah' (Konstitusi Madinah). Ini adalah perjanjian damai antara kaum Muslimin, kaum Yahudi, dan sisa musyrikin Madinah untuk saling menghormati kebebasan beragama dan bersatu membela Madinah dari serangan luar.",
            "Namun, kafir Quraisy di Mekkah terus melakukan provokasi militer dan menyita harta kaum Muslimin. Allah pun mengizinkan peperangan untuk membela diri. Terjadilah Perang Badar (Tahun 2 H), pertempuran epik di mana 313 Muslimin berhasil mengalahkan 1.000 pasukan Quraisy bersenjata lengkap berkat bantuan para malaikat.",
            "Kekalahan di Badar memicu dendam Quraisy yang kembali menyerang setahun kemudian dalam Perang Uhud (Tahun 3 H). Dalam perang ini kaum Muslimin nyaris menang, namun karena pasukan pemanah melanggar perintah Nabi untuk tidak turun dari bukit, keadaan berbalik. Pamanda Nabi, Hamzah bin Abdul Muthalib gugur syahid, dan Nabi sendiri terluka parah.",
            "Pada Tahun 5 H, Quraisy bersekutu dengan seluruh kabilah Arab dan Yahudi pengkhianat untuk menghancurkan Madinah dalam Perang Ahzab (Khandaq). Atas saran Salman Al-Farisi, Nabi memerintahkan pembuatan parit pertahanan yang panjang. Pasukan musuh tertahan nyaris sebulan lamanya sebelum akhirnya dihancurkan oleh angin topan kiriman Allah."
        ]
    },
    {
        id: "fathu-makkah",
        title: "Fathu Makkah (Penaklukan Mekkah)",
        period: "Ramadhan, Tahun 8 H",
        icon: "flag-banner",
        desc: "Kafir Quraisy melanggar Perjanjian Hudaibiyah. Nabi pun datang memimpin 10.000 pasukan untuk membebaskan Mekkah tanpa pertumpahan darah dan menghancurkan berhala.",
        fullStory: [
            "Pada Tahun 6 H, Nabi ﷺ bermimpi melakukan Umrah dan bertolak ke Mekkah bersama 1.400 sahabat. Kafir Quraisy menghalangi mereka di wilayah Hudaibiyah. Terjadilah Perjanjian Hudaibiyah, sebuah genjatan senjata selama 10 tahun yang pada awalnya terlihat merugikan umat Islam, namun sebenarnya merupakan strategi brilian ('Kemenangan yang Nyata') karena memberi masa damai yang sangat pesat bagi penyebaran Islam ke seluruh Jazirah Arab.",
            "Namun dua tahun kemudian, suku Bani Bakr (sekutu Quraisy) menyerang suku Khuza'ah (sekutu Muslimin) di malam hari dan membantai mereka, dengan bantuan persenjataan dari tokoh Quraisy secara diam-diam. Tragedi ini otomatis membatalkan Perjanjian Hudaibiyah.",
            "Merespons pengkhianatan ini, pada bulan Ramadhan Tahun 8 Hijriyah, Nabi Muhammad ﷺ mengumpulkan 10.000 pasukan Muslim bersenjata lengkap dan bergerak menuju Mekkah secara rahasia. Ketika pasukan berkemah di luar Mekkah dan menyalakan 10.000 api unggun di malam hari, mental para pemuka Quraisy (termasuk Abu Sufyan) langsung runtuh menyadari kekuatan Islam yang tak tertandingi.",
            "Nabi memerintahkan pasukannya memasuki Mekkah dari empat penjuru dengan instruksi ketat untuk tidak menumpahkan darah kecuali diserang lebih dulu. Mekkah pun jatuh ke pangkuan kaum Muslimin nyaris tanpa perlawanan bersenjata.",
            "Saat penduduk Mekkah yang dahulu menyiksa, membunuh, dan mengusir kaum Muslimin berkumpul dengan gemetar di dekat Ka'bah menunggu nasib mereka, Nabi ﷺ menundukkan kepalanya tanda tawadhu' di atas untanya, lalu bersabda: 'Pergilah kalian! Hari ini kalian semua bebas (Al-Thulaqa')!'.",
            "Sikap pemaaf dan pengampunan total (amnesti umum) yang luar biasa ini meluluhkan hati seluruh penduduk Mekkah. Mereka pun berbondong-bondong memeluk Islam. Nabi kemudian masuk ke dalam Ka'bah dan menghancurkan ke-360 berhala di sekelilingnya, menancapkan tauhid kembali ke akar kota suci tersebut."
        ]
    },
    {
        id: "wafat",
        title: "Haji Wada' & Wafatnya Nabi",
        period: "Tahun 10 - 11 H (632 M)",
        icon: "dove",
        desc: "Nabi melaksanakan haji perpisahan. Beliau jatuh sakit dan wafat di usia 63 tahun, meninggalkan warisan peradaban Al-Qur'an dan Sunnah.",
        fullStory: [
            "Pada Tahun 10 Hijriyah, Jazirah Arab secara keseluruhan telah memeluk Islam. Merasakan bahwa tugas kerasulannya hampir paripurna, Nabi Muhammad ﷺ mengumumkan niatnya untuk melaksanakan ibadah Haji. Sekitar 100.000 hingga 144.000 umat Islam berkumpul untuk menunaikan haji bersama beliau, yang kelak dikenal sebagai Haji Wada' (Haji Perpisahan).",
            "Di padang Arafah, saat Wukuf di Jabal Rahmah, beliau menyampaikan Khutbah Wada' yang sangat bersejarah. Khutbah tersebut berisi deklarasi hak asasi manusia universal, penghapusan tradisi balas dendam jahiliyah, penghapusan riba, perintah memuliakan wanita, dan persaudaraan umat Islam yang tidak memandang warna kulit kecuali ketakwaannya.",
            "Di hari itu pula turunlah wahyu terakhir yang menegaskan kesempurnaan agama Islam (Surah Al-Ma'idah ayat 3). Abu Bakar yang mendengar ayat ini langsung menangis sejadi-jadinya, menyadari bahwa jika tugas telah selesai, maka waktu sang Utusan untuk kembali kepada-Nya telah dekat.",
            "Dua bulan setelah pulang ke Madinah, Nabi ﷺ mulai menderita sakit kepala dan demam tinggi. Sakitnya semakin parah sehingga beliau tidak sanggup lagi mengimami sholat berjamaah di masjid, dan menunjuk Abu Bakar untuk menggantikannya. Selama masa sakitnya, beliau dirawat di kamar istri tercintanya, Aisyah binti Abu Bakar.",
            "Di saat-saat terakhirnya, beliau menyedekahkan sisa dirham di rumahnya dan terus mewasiatkan umatnya: 'Peliharalah sholat kalian... dan perhatikanlah hamba sahaya kalian...'",
            "Pada pagi hari Senin, tanggal 12 Rabiul Awal Tahun 11 Hijriyah (bertepatan dengan 8 Juni 632 Masehi), dengan kepala bersandar di dada Aisyah, Nabi Muhammad ﷺ berbisik sambil menatap ke atas, 'Ila Ar-Rafiqil A'la' (Menuju Kekasih Yang Tertinggi). Hembusan napas terakhir pun terlepas. Sang Pelita Alam, sebaik-baik manusia yang pernah menginjakkan kaki di bumi, telah wafat pada usia 63 tahun.",
            "Wafatnya beliau membawa kesedihan yang sangat mendalam dan mengguncang seluruh Madinah. Umar bin Khattab saking terpukulnya sempat menghunus pedang menolak percaya. Namun Abu Bakar menenangkan umat dengan pidatonya yang abadi: 'Barangsiapa menyembah Muhammad, sesungguhnya Muhammad telah wafat. Dan barangsiapa menyembah Allah, sesungguhnya Allah Maha Hidup dan tidak akan pernah mati.' Beliau kemudian dimakamkan tepat di tempat ia wafat, di dalam kamar Aisyah yang kini masuk ke dalam kompleks Masjid Nabawi."
        ]
    }
];

const SirahNabiScreen = ({ setActiveTab }) => {
    const [expandedId, setExpandedId] = useState('kelahiran');

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('kategori')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Sirah Nabawiyah</h2>
                    <p className="text-[10px] text-[#B88A44]">Sejarah Perjalanan Nabi Muhammad ﷺ</p>
                </div>
            </div>

            {/* Banner */}
            <div className="bg-[#4A1C14] text-white p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#B88A44] opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#4A1C14] to-transparent"></div>
                <div className="relative z-10">
                    <PhosphorIcon icon="scroll" size={40} className="text-[#E8D2A6] mb-3 opacity-90" />
                    <h2 className="text-2xl font-bold font-serif mb-1">Mengenal Sang Kekasih</h2>
                    <p className="text-sm text-[#E8D2A6]/90 leading-relaxed font-medium max-w-sm">
                        "Sesungguhnya telah ada pada (diri) Rasulullah itu suri teladan yang baik bagimu..." (Al-Ahzab: 21)
                    </p>
                </div>
            </div>

            {/* Timeline List */}
            <div className="p-5">
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[1.15rem] top-4 bottom-8 w-px bg-gradient-to-b from-[#B88A44]/80 via-[#E8D2A6] to-transparent"></div>
                    
                    <div className="space-y-6">
                        {SIRAH_DATA.map((item, index) => {
                            const isExpanded = expandedId === item.id;
                            
                            return (
                                <div key={item.id} className="relative pl-12 animate-in slide-in-from-right-4" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                                    {/* Timeline Dot */}
                                    <div 
                                        className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center border-[3px] shadow-sm transition-colors duration-300 z-10 ${
                                            isExpanded 
                                            ? 'bg-[#B88A44] border-white text-white' 
                                            : 'bg-white border-[#E8D2A6]/50 text-[#B88A44]'
                                        }`}
                                    >
                                        <PhosphorIcon icon={item.icon} size={18} weight={isExpanded ? "fill" : "duotone"} />
                                    </div>
                                    
                                    {/* Content Card */}
                                    <div 
                                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                        className={`bg-white rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                                            isExpanded 
                                            ? 'border-[#B88A44]/40 shadow-md ring-1 ring-[#B88A44]/10' 
                                            : 'border-[#E8D2A6]/40 shadow-sm hover:border-[#B88A44]/30'
                                        }`}
                                    >
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <h3 className={`font-bold text-sm ${isExpanded ? 'text-[#4A1C14]' : 'text-[#4A1C14]/90'}`}>
                                                    {item.title}
                                                </h3>
                                                <p className="text-[10px] text-[#B88A44] font-medium uppercase tracking-wider mt-0.5">
                                                    {item.period}
                                                </p>
                                            </div>
                                            <PhosphorIcon 
                                                icon="caret-down" 
                                                size={16} 
                                                className={`text-[#B88A44] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                                            />
                                        </div>
                                        
                                        <div 
                                            className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                                isExpanded ? 'max-h-[2000px] opacity-100 pb-5' : 'max-h-0 opacity-0'
                                            }`}
                                        >
                                            <div className="px-5">
                                                <div className="bg-[#FCF7E8]/50 p-4 rounded-xl border border-[#E8D2A6]/30 mb-5 relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#B88A44] rounded-l-xl"></div>
                                                    <p className="text-[13px] font-bold text-[#4A1C14]/90 leading-relaxed italic">
                                                        "{item.desc}"
                                                    </p>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    {item.fullStory.map((paragraph, pIdx) => (
                                                        <p key={pIdx} className="text-[13px] text-[#4A1C14]/85 leading-relaxed text-justify">
                                                            {paragraph}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SirahNabiScreen;
