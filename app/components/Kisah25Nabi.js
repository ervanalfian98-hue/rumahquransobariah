import React, { useState } from 'react';
import PhosphorIcon from './PhosphorIcon';

const NABI_DATA = [
    {
        id: 1, name: "Nabi Adam AS", title: "Manusia Pertama",
        story: "Nabi Adam adalah manusia dan nabi pertama yang diciptakan oleh Allah SWT dari tanah liat. Beliau dan Hawa diturunkan ke bumi setelah digoda iblis untuk memakan buah khuldi.",
        fullStory: [
            "Allah SWT menciptakan Nabi Adam sebagai manusia pertama dan merencanakan menjadikannya khalifah (pemimpin) di muka bumi. Beliau diciptakan langsung dari berbagai jenis tanah liat, kemudian ditiupkan ruh ke dalamnya. Allah juga mengajarkan kepadanya nama-nama segala benda yang ada di semesta, sebuah ilmu yang bahkan tidak dimiliki oleh para malaikat.",
            "Saat Allah memerintahkan para malaikat dan iblis untuk bersujud menghormati Adam, seluruh malaikat taat, namun iblis menolak karena kesombongannya yang merasa lebih mulia tercipta dari api. Akibatnya, iblis dikutuk dan diusir dari surga.",
            "Nabi Adam kemudian tinggal di surga dan Allah menciptakan Hawa dari tulang rusuknya sebagai pendamping. Mereka diizinkan menikmati seluruh isi surga kecuali satu larangan: mendekati pohon Khuldi. Namun iblis berhasil memperdaya mereka dengan sumpah palsunya, sehingga mereka memakan buah larangan tersebut. Atas pelanggaran itu, Allah menurunkan Adam dan Hawa ke bumi. Setelah bertaubat dengan sungguh-sungguh, Allah menerima taubat mereka. Dari keturunan merekalah (termasuk kisah Qabil dan Habil) peradaban manusia di bumi dimulai."
        ]
    },
    {
        id: 2, name: "Nabi Idris AS", title: "Manusia Pertama Penulis",
        story: "Nabi Idris adalah keturunan keenam Nabi Adam. Beliau adalah manusia pertama yang pandai membaca, menulis dengan pena, dan menjahit pakaian.",
        fullStory: [
            "Nabi Idris diutus untuk berdakwah kepada keturunan Qabil yang saat itu sudah mulai berbuat kerusakan. Beliau dianugerahi banyak keistimewaan oleh Allah; di antaranya adalah manusia pertama yang menulis menggunakan pena, merintis ilmu menjahit pakaian, serta memiliki kecerdasan dalam ilmu perbintangan dan matematika.",
            "Nama Idris diambil dari kata 'daras' yang berarti belajar, karena beliau sangat rajin mengkaji shuhuf (lembaran wahyu) peninggalan Nabi Adam dan Nabi Syits.",
            "Nabi Idris dikenal dengan ibadahnya yang luar biasa giat. Disebutkan bahwa beliau pernah meminta kepada malaikat maut untuk merasakan kematian agar rasa takutnya kepada Allah semakin bertambah, lalu dihidupkan kembali. Beliau juga pernah memohon untuk melihat surga dan neraka. Karena ketaatan dan kesucian hatinya yang luar biasa, Al-Qur'an mengabadikan bahwa Allah mengangkatnya ke tempat yang sangat tinggi (langit)."
        ]
    },
    {
        id: 3, name: "Nabi Nuh AS", title: "Rasul Pertama & Pembuat Bahtera",
        story: "Nabi Nuh berdakwah selama 950 tahun namun hanya sedikit yang beriman. Beliau membuat bahtera besar untuk menyelamatkan orang beriman dari banjir bah.",
        fullStory: [
            "Nabi Nuh diutus ketika umat manusia mulai pertama kali menyembah berhala (patung-patung orang saleh masa lalu seperti Wadd, Suwa', Yaghuts). Beliau diangkat menjadi rasul pertama dan berdakwah dengan penuh kesabaran siang dan malam selama kurang lebih 950 tahun. Namun, dari rentang waktu yang sangat panjang itu, pengikutnya tidak lebih dari 80 orang saja.",
            "Kaumnya selalu mengejek dan menutup telinga saat didakwahi. Bahkan istrinya dan salah satu putranya (Kan'an) ikut menentang beliau. Merasa kaumnya sudah sangat kelewat batas dan tidak ada harapan lagi untuk beriman, Nabi Nuh memohon kepada Allah agar tidak membiarkan satu pun orang kafir tersisa di bumi.",
            "Allah lalu memerintahkan Nabi Nuh untuk merakit sebuah kapal (bahtera) kayu raksasa di atas bukit yang kering kerontang. Pembuatan kapal ini justru mengundang ejekan luar biasa dari kaumnya yang menganggap beliau gila. Setelah bahtera selesai, Allah memancarkan air dari tungku-tungku bumi dan menurunkan hujan badai dari langit yang menenggelamkan seluruh bumi. Seluruh kaum kafir binasa, termasuk putra Nabi Nuh, Kan'an, yang menolak naik ke kapal. Nabi Nuh beserta umatnya yang beriman, dan sepasang hewan dari setiap jenisnya, selamat dalam bahtera."
        ]
    },
    {
        id: 4, name: "Nabi Hud AS", title: "Utusan Kaum 'Ad",
        story: "Nabi Hud diutus kepada Kaum 'Ad yang bertubuh besar dan kuat namun menyembah berhala. Karena menolak dakwahnya, mereka diazab dengan angin topan pembeku.",
        fullStory: [
            "Nabi Hud diutus kepada Kaum 'Ad, suku Arab kuno yang bermukim di daerah Al-Ahqaf (bukit-bukit pasir antara Yaman dan Oman). Kaum ini dikaruniai Allah postur tubuh raksasa, kekuatan fisik yang luar biasa, serta kemajuan dalam arsitektur karena mereka mampu membangun gedung-gedung tinggi dengan pilar-pilar besar yang tiada duanya di masa itu.",
            "Namun, segala nikmat tersebut justru membuat mereka sombong. Mereka merasa paling kuat di muka bumi dan menyembah berhala. Nabi Hud mengajak mereka untuk bersyukur dan menyembah Allah semata. Namun para pembesar Kaum 'Ad membalas dakwahnya dengan hinaan, menyebut Nabi Hud sebagai pendusta dan kurang waras.",
            "Setelah peringatan berulang kali diabaikan, Allah menguji mereka dengan kemarau panjang yang mengeringkan sumur-sumur mereka. Saat mereka melihat gumpalan awan hitam mendekat, mereka bersorak kegirangan mengira itu awan hujan. Padahal, awan tersebut adalah azab. Allah melepaskan angin topan (angin Sarsar) yang sangat dingin, menderu sangat kencang tiada henti selama 7 malam 8 hari. Angin itu mengangkat dan menghempaskan tubuh raksasa mereka bagaikan pohon kurma yang tumbang dari akarnya. Mereka binasa seutuhnya tanpa tersisa."
        ]
    },
    {
        id: 5, name: "Nabi Shaleh AS", title: "Mukjizat Unta Betina",
        story: "Nabi Shaleh diutus kepada Kaum Tsamud pemahat gunung. Mukjizatnya mengeluarkan unta betina dari batu, namun kaumnya membunuh unta tersebut sehingga diazab petir.",
        fullStory: [
            "Nabi Shaleh diutus kepada Kaum Tsamud (berdiam di wilayah Al-Hijr, dekat Madinah sekarang). Mereka sangat ahli dalam memahat bongkahan batu gunung untuk dijadikan istana dan rumah yang megah. Sama seperti kaum 'Ad, mereka pun menyekutukan Allah dan berlaku zalim.",
            "Saat didakwahi, kaum Tsamud menantang Nabi Shaleh untuk menunjukkan bukti kenabiannya yang tidak masuk akal: mereka meminta beliau mengeluarkan seekor unta betina berbulu tebal dan sedang hamil sepuluh bulan dari bongkahan batu karang yang keras di hadapan mereka. Nabi Shaleh berdoa, dan keajaiban pun terjadi. Batu itu terbelah dan keluarlah unta persis seperti yang mereka minta.",
            "Nabi Shaleh melarang mereka mengganggu unta tersebut dan membagi jadwal minum air sumur (satu hari untuk penduduk, satu hari khusus untuk unta). Meskipun unta itu menghasilkan susu yang melimpah bagi mereka, rasa dengki dan kekafiran membuat sekelompok pemuda berencana jahat. Mereka menyembelih unta betina itu dan bahkan berencana membunuh Nabi Shaleh.",
            "Mengetahui hal itu, Nabi Shaleh memberi tahu bahwa azab akan turun tiga hari lagi. Tepat pada hari ketiga, datanglah guncangan gempa yang hebat diiringi suara petir (teriakan) dari langit yang sangat keras, yang memecahkan gendang telinga dan menghancurkan jantung mereka seketika. Seluruh kaum kafir Tsamud mati bergelimpangan di dalam istana gunung kebanggaan mereka."
        ]
    },
    {
        id: 6, name: "Nabi Ibrahim AS", title: "Bapak Para Nabi (Abul Anbiya)",
        story: "Nabi Ibrahim berani berdebat dengan Raja Namrud dan selamat saat dibakar hidup-hidup. Beliau membangun Ka'bah bersama Nabi Ismail.",
        fullStory: [
            "Nabi Ibrahim lahir di Babilonia yang diperintah oleh Raja Namrud yang zalim dan mengaku sebagai tuhan. Sejak muda, Ibrahim telah menggunakan akal sehatnya mencari Tuhan sejati dengan mengamati bintang, bulan, dan matahari, hingga menemukan Allah SWT yang mengatur alam semesta.",
            "Untuk menyadarkan kaumnya yang bodoh menyembah patung, beliau pernah menyelinap dan menghancurkan semua berhala di kuil, lalu mengalungkan kapak pada berhala terbesar. Saat diinterogasi, beliau menyuruh mereka bertanya pada berhala besar itu, yang tentu tidak bisa bicara. Namrud yang marah besar kemudian mengikat dan melemparkan Ibrahim ke dalam api unggun raksasa. Namun Allah berfirman: 'Wahai api, menjadi dinginlah, dan menjadi keselamatanlah bagi Ibrahim!' Beliau pun keluar dari api tanpa terbakar sedikitpun.",
            "Perjalanan hidupnya penuh ujian berat. Beliau diuji dengan lamanya menanti keturunan, lalu diperintahkan meninggalkan istri dan bayinya (Ismail) di gurun Mekkah, dan puncaknya diperintahkan menyembelih putra kesayangannya itu. Berkat kesempurnaan ketaatannya, Allah mengganti sembelihan itu dan menjadikan Ibrahim sebagai 'Khalilullah' (Kekasih Allah).",
            "Dari kedua putranya, Ismail dan Ishaq, lahirlah silsilah nabi-nabi dan rasul besar bagi umat manusia, sehingga beliau digelari 'Abul Anbiya' (Bapak para Nabi)."
        ]
    },
    {
        id: 7, name: "Nabi Luth AS", title: "Utusan Kaum Sodom",
        story: "Nabi Luth diutus kepada kaum Sodom yang memiliki penyimpangan seksual (LGBT) dan merampok musafir. Mereka diazab dengan hujan batu belerang.",
        fullStory: [
            "Nabi Luth adalah keponakan Nabi Ibrahim yang diutus ke kota Sodom (dekat Laut Mati). Penduduk Sodom memiliki akhlak yang sangat bejat. Mereka suka merampok musafir dan merupakan kaum pertama di muka bumi yang melakukan penyimpangan seksual (homoseksual, pria menyukai pria).",
            "Nabi Luth tak henti-hentinya memperingatkan mereka tentang perbuatan keji yang belum pernah dilakukan siapapun sebelum mereka, namun mereka malah mengejek dan mengancam akan mengusir Nabi Luth dari kota jika terus menceramahi mereka.",
            "Puncaknya, Allah mengutus malaikat berwujud pemuda-pemuda yang sangat tampan bertamu ke rumah Nabi Luth. Istri Nabi Luth yang durhaka diam-diam membocorkan kehadiran pemuda tersebut kepada kaumnya. Ratusan pria Sodom kemudian mengepung rumah Nabi Luth dan mendobrak pintu demi melampiaskan syahwat mereka.",
            "Malaikat kemudian membutakan mata para penyerang tersebut dan memerintahkan Nabi Luth beserta keluarganya (kecuali istrinya) untuk pergi malam itu juga dan tidak menoleh ke belakang. Menjelang Subuh, Allah menjungkirbalikkan bumi Sodom (mengangkat kotanya lalu dihempaskan ke bawah) lalu menghujani mereka dengan batu belerang panas yang terbakar tanpa henti. Kaum Sodom pun hancur lebur tanpa sisa."
        ]
    },
    {
        id: 8, name: "Nabi Ismail AS", title: "Sejarah Zamzam & Qurban",
        story: "Nabi Ismail adalah putra Nabi Ibrahim. Saat bayi, hentakan kakinya memunculkan air Zamzam. Beliau rela disembelih demi perintah Allah (awal mula Qurban).",
        fullStory: [
            "Nabi Ismail lahir dari ibunda Hajar setelah penantian panjang Nabi Ibrahim. Atas perintah Allah, Ibrahim meninggalkan Hajar dan Ismail yang masih bayi di lembah Mekkah yang tandus tanpa tanaman dan air sedikitpun. Saat perbekalan habis dan Ismail menangis kehausan, Hajar berlari bolak-balik antara bukit Safa dan Marwah sebanyak tujuh kali (yang menjadi syariat Sa'i). Saat itulah, dari hentakan kaki Ismail yang sedang menangis, Allah memancarkan mata air Zamzam yang tidak pernah kering hingga kini.",
            "Ujian terbesar datang saat Ismail beranjak remaja. Nabi Ibrahim bermimpi (yang merupakan wahyu) bahwa ia menyembelih putranya. Ketika disampaikan, dengan penuh keteguhan iman, Ismail menjawab: 'Wahai ayahku, kerjakanlah apa yang diperintahkan kepadamu, insya Allah engkau akan mendapatiku termasuk orang-orang yang sabar.'",
            "Saat pisau sudah berada di leher Ismail, Allah SWT memanggil Ibrahim dan menyatakan ujian telah berhasil dilalui. Allah kemudian mengganti Ismail dengan seekor sembelihan yang besar (domba/kibas). Peristiwa pengorbanan suci inilah yang diperingati umat Islam setiap tahun sebagai ibadah Qurban (Idul Adha). Kelak, Ismail dewasa membantu ayahnya membangun Ka'bah."
        ]
    },
    {
        id: 9, name: "Nabi Ishaq AS", title: "Leluhur Bani Israil",
        story: "Nabi Ishaq lahir dari Siti Sarah saat usianya sudah sangat tua sebagai mukjizat. Dari keturunannya kelak terlahir nabi-nabi Bani Israil.",
        fullStory: [
            "Nabi Ishaq adalah putra kedua Nabi Ibrahim yang lahir dari istri pertamanya, Siti Sarah. Kelahirannya merupakan mukjizat dan hadiah dari Allah SWT, karena pada saat itu Siti Sarah sudah sangat tua dan mandul (berusia sekitar 90 tahun), sementara Nabi Ibrahim juga sudah sepuh (sekitar 100 tahun).",
            "Kabar gembira tentang kelahiran Ishaq disampaikan langsung oleh para malaikat tamu yang singgah ke kemah Nabi Ibrahim, sebelum malaikat-malaikat tersebut pergi untuk mengazab kaum Sodom.",
            "Nabi Ishaq tumbuh menjadi seorang rasul yang meneruskan syariat ayahnya di wilayah Palestina dan sekitarnya (Kanaan). Beliau menikah dengan Ribka dan dikaruniai putra kembar, yakni Esau dan Ya'qub. Dari jalur Ya'qub inilah kelak akan memanjang nasab nabi-nabi besar untuk kaum Bani Israil."
        ]
    },
    {
        id: 10, name: "Nabi Ya'qub AS", title: "Bapak Bani Israil",
        story: "Nabi Ya'qub memiliki 12 putra yang menjadi leluhur 12 suku Bani Israil. Beliau diuji kehilangan putra kesayangannya, Yusuf, hingga menangis buta.",
        fullStory: [
            "Nabi Ya'qub (juga dikenal dengan nama Israil) adalah putra Nabi Ishaq. Beliau diutus untuk berdakwah di daerah Syam. Beliau memiliki 12 putra dari beberapa istrinya. Anak-anaknya inilah yang kemudian menjadi pangkal dari dua belas kabilah (suku) Bani Israil di kemudian hari.",
            "Ujian terberat Nabi Ya'qub adalah ketika anak-anaknya yang lebih tua berkomplot membuang Yusuf (putra kesayangan Ya'qub dari istri Rahel) ke dalam sumur, dan membawa pulang kemeja Yusuf yang dilumuri darah palsu untuk menipu ayahnya.",
            "Meski tahu anak-anaknya berbohong, Nabi Ya'qub menghadapi ujian tersebut dengan 'Shabrun Jamil' (kesabaran yang indah). Ia menangisi kepergian Yusuf selama bertahun-tahun hingga matanya memutih dan buta karena duka yang sangat mendalam. Bertahun-tahun kemudian, kesabarannya berbuah manis. Beliau dikabari bahwa Yusuf masih hidup dan menjadi pejabat besar di Mesir. Matanya kembali bisa melihat setelah diusapkan dengan kemeja Yusuf, dan keluarga tersebut akhirnya berkumpul kembali dengan bahagia di Mesir."
        ]
    },
    {
        id: 11, name: "Nabi Yusuf AS", title: "Nabi Tertampan & Penafsir Mimpi",
        story: "Dibuang ke sumur oleh saudaranya, dijual ke Mesir, dipenjara karena fitnah Zulaikha. Karena pandai menafsir mimpi raja, beliau diangkat jadi menteri.",
        fullStory: [
            "Nabi Yusuf dianugerahi ketampanan yang sangat luar biasa (dikatakan bahwa beliau mewarisi separuh ketampanan dunia) dan ilmu menafsirkan mimpi. Kisahnya disebut dalam Al-Qur'an sebagai 'Sebaik-baik kisah'. Dimulai saat beliau dibuang ke sumur oleh saudara-saudaranya yang cemburu, lalu dipungut oleh kafilah dagang dan dijual sebagai budak di Mesir kepada seorang menteri (Al-Aziz).",
            "Saat dewasa, ketampanannya membuat Zulaikha (istri menteri) tergoda dan berusaha merayunya. Karena keteguhan imannya, Yusuf menolak. Meski terbukti tidak bersalah, demi menjaga nama baik pejabat istana, Yusuf dimasukkan ke dalam penjara selama bertahun-tahun.",
            "Di dalam penjara, beliau tetap berdakwah. Jalan kebebasannya terbuka ketika Raja Mesir bermimpi melihat 7 sapi gemuk dimakan 7 sapi kurus. Tidak ada pendeta yang bisa menafsirkannya kecuali Yusuf. Beliau menjelaskan bahwa Mesir akan panen raya 7 tahun, disusul paceklik hebat 7 tahun, sehingga negara harus menghemat. Terkesan dengan kecerdasannya, raja membebaskannya dan mengangkatnya sebagai Menteri Perbendaharaan Mesir.",
            "Pada masa paceklik itulah, saudara-saudara Yusuf datang ke Mesir mencari gandum. Yusuf memaafkan mereka tanpa dendam sedikitpun, lalu menyatukan kembali seluruh keluarganya."
        ]
    },
    {
        id: 12, name: "Nabi Ayyub AS", title: "Teladan Kesabaran Tanpa Batas",
        story: "Diuji dengan hilangnya seluruh harta, anak, dan menderita penyakit kulit parah. Beliau tetap sabar hingga Allah mengembalikan segalanya.",
        fullStory: [
            "Nabi Ayyub pada awalnya adalah nabi yang sangat kaya raya, memiliki ternak dan ladang yang luas, serta keluarga yang harmonis dengan banyak anak. Iblis yang iri dengan ketaatan Ayyub meminta izin kepada Allah untuk mengujinya, beranggapan bahwa Ayyub taat hanya karena ia kaya.",
            "Ujian pun turun silih berganti. Harta dan ladangnya musnah terbakar, lalu gedung menimpa anak-anaknya hingga semuanya wafat. Terakhir, tubuhnya diuji dengan penyakit kulit yang sangat parah dan menjijikkan (gatal, bernanah, hingga mengeluarkan belatung) dari ujung kepala hingga kaki, kecuali hati dan lidahnya yang tak pernah berhenti berdzikir.",
            "Akibatnya, beliau diusir oleh penduduk desa ke tempat terpencil dan ditinggalkan semua orang, kecuali istri setianya, Rahmah, yang merawatnya selama kurang lebih 18 tahun penderitaan.",
            "Meskipun begitu menderita, Ayyub menolak berdoa meminta kesembuhan karena malu, merasa masa sehatnya sebelumnya jauh lebih lama dibanding masa sakitnya. Setelah sekian lama, barulah ia berdoa dengan sangat santun. Allah menyuruhnya menghentakkan kaki ke tanah. Muncullah mata air dingin yang apabila digunakan untuk mandi dan minum, penyakitnya sembuh seketika. Allah kemudian mengembalikan usia mudanya, harta kekayaannya, dan memberikannya keturunan yang lebih banyak lagi sebagai balasan atas kesabarannya yang tak tertandingi."
        ]
    },
    {
        id: 13, name: "Nabi Syu'aib AS", title: "Utusan Kaum Madyan",
        story: "Nabi Syu'aib diutus kepada penduduk Madyan yang curang dalam takaran dagang. Karena keras kepala, mereka diazab gempa dan awan panas.",
        fullStory: [
            "Nabi Syu'aib diutus kepada penduduk Madyan. Kaum ini memiliki sifat yang sangat buruk dalam perniagaan; mereka ahli menipu, gemar mengurangi takaran dan timbangan saat berjualan, serta sering merampok musafir yang lewat.",
            "Nabi Syu'aib diberi julukan 'Khatibul Anbiya' (Ahli pidatonya para nabi) karena kefasihannya dan kelembutannya dalam berdakwah. Beliau mengajak mereka menyembah Allah dan berniaga dengan jujur, karena harta yang haram tidak akan membawa berkah. Namun kaumnya malah mengejek, mengolok-olok sholat Nabi Syu'aib, dan mengancam akan merajamnya jika ia bukan berasal dari keluarga yang dihormati.",
            "Keangkuhan kaum Madyan semakin menjadi-jadi, mereka bahkan menantang Nabi Syu'aib untuk menjatuhkan azab dari langit. Allah pun menjawab tantangan itu. Awalnya Allah mengirimkan hawa yang sangat panas mencekik selama berhari-hari. Saat mereka melihat gumpalan awan hitam (kegelapan), mereka berlari bernaung di bawahnya mengira itu awan teduh. Saat itulah awan tersebut menghujani mereka dengan api, disusul dengan teriakan malaikat dan gempa bumi yang dahsyat, membuat mereka mati bergelimpangan di rumah-rumah mereka sendiri."
        ]
    },
    {
        id: 14, name: "Nabi Musa AS", title: "Pembelah Laut Merah",
        story: "Diselamatkan dari sungai Nil, menerima kitab Taurat, membelah Laut Merah saat dikejar Firaun, dan memimpin Bani Israil keluar dari Mesir.",
        fullStory: [
            "Nabi Musa lahir di masa kelam Bani Israil, di mana Firaun Mesir memerintahkan agar setiap bayi laki-laki Israil dibunuh karena ramalan bahwa kerajaannya akan dihancurkan oleh pemuda Israil. Atas ilham Allah, ibunda Musa menghanyutkan bayinya dalam peti ke Sungai Nil. Peti itu justru ditemukan dan dipungut oleh Asiyah, istri Firaun. Musa pun dibesarkan di istana musuh terbesarnya.",
            "Saat beranjak dewasa, Musa tidak sengaja memukul seorang Mesir hingga tewas saat membela seorang Israil. Ia pun lari buron ke Madyan, menikahi putri Nabi Syu'aib, dan bekerja sebagai penggembala selama 10 tahun.",
            "Saat perjalanan kembali ke Mesir bersama keluarganya, Musa melihat api di bukit Thur (Tursina). Di sanalah Allah berbicara langsung padanya (Kalimullah), mengangkatnya jadi Rasul, dan memberinya mukjizat tongkat yang bisa menjadi ular besar dan tangan yang memancarkan cahaya.",
            "Musa kembali ke Mesir untuk berdakwah mendesak Firaun agar membebaskan Bani Israil. Firaun yang sombong mengaku tuhan menolak. Setelah adu mukjizat dengan penyihir Mesir dan turunnya berbagai wabah azab, Firaun akhirnya mengizinkan mereka pergi, namun kemudian menyesal dan mengejar Bani Israil dengan pasukan besar.",
            "Di tepi Laut Merah yang buntu, atas perintah Allah, Musa memukulkan tongkatnya. Laut terbelah menjadi jalan kering. Musa dan kaumnya selamat menyeberang, sementara Firaun dan pasukannya ditenggelamkan saat laut kembali menutup."
        ]
    },
    {
        id: 15, name: "Nabi Harun AS", title: "Juru Bicara Nabi Musa",
        story: "Kakak Nabi Musa yang fasih bicaranya. Beliau diangkat menjadi Rasul mendampingi Musa berdakwah menghadapi Firaun.",
        fullStory: [
            "Nabi Harun adalah kakak kandung Nabi Musa AS yang memiliki kepribadian lembut dan kemampuan berpidato (artikulasi) yang sangat fasih.",
            "Ketika Allah memerintahkan Musa untuk berdakwah menghadapi Firaun (penguasa paling tiran di masanya), Musa merasa memiliki kekakuan pada lidahnya akibat memakan bara api saat masih bayi. Musa berdoa memohon kepada Allah agar melapangkan dadanya, melepaskan kekakuan lidahnya, dan agar saudaranya, Harun, diangkat sebagai rasul pendamping sekaligus juru bicaranya. Allah mengabulkan doa tersebut.",
            "Harun selalu mendampingi Musa di setiap konfrontasi menegangkan melawan Firaun. Ujian terberat Harun datang ketika Musa harus pergi ke Gunung Tursina selama 40 hari untuk menerima kitab Taurat, meninggalkan Harun memimpin Bani Israil.",
            "Di masa itulah, seorang munafik bernama Samiri menyesatkan Bani Israil dengan membuat patung anak sapi dari emas yang bisa bersuara, lalu mengajak mereka menyembahnya. Nabi Harun berusaha keras mencegah mereka, namun kaum yang baru saja bebas dari perbudakan itu malah melawan dan nyaris membunuhnya. Ketika Musa kembali dan marah melihat kemusyrikan tersebut, ia sempat menarik jenggot Harun, namun kemudian memaafkannya setelah mendengar penjelasan Harun."
        ]
    },
    {
        id: 16, name: "Nabi Dzulkifli AS", title: "Raja yang Sangat Sabar",
        story: "Seorang raja adil (putra Nabi Ayyub) yang sanggup memenuhi sayembara: puasa siang hari, sholat malam, dan tidak pernah marah.",
        fullStory: [
            "Nabi Dzulkifli (nama aslinya Basyar) adalah salah satu putra dari Nabi Ayyub AS. Nama 'Dzulkifli' bermakna 'orang yang sanggup memegang janji/kesanggupan'.",
            "Gelar ini disandangnya ketika seorang raja yang sudah tua dan tidak memiliki keturunan (Nabi Ilyasa) mengadakan sayembara untuk mencari penerusnya. Syarat menjadi raja sangatlah berat: harus puasa di siang hari, sholat tahajud semalaman, dan sama sekali tidak boleh marah dalam menyelesaikan urusan rakyat.",
            "Hanya Basyar pemuda yang berani mengangkat tangan dan menyanggupi syarat tersebut. Setelah naik tahta menjadi raja, Dzulkifli benar-benar memenuhi janjinya. Iblis tidak terima dan berusaha keras memancing kemarahannya dengan menyamar menjadi kakek tua yang datang mengadu di waktu istirahat Dzulkifli siang dan malam, terus-menerus mengganggu waktunya. Namun, Dzulkifli tetap menyambut kakek jelmaan iblis itu dengan sangat ramah, sabar, dan penuh keadilan tanpa sedikitpun terpancing emosi. Keteguhan dan kesabarannya ini diabadikan Allah di dalam Al-Qur'an."
        ]
    },
    {
        id: 17, name: "Nabi Daud AS", title: "Penunduk Besi & Penerima Zabur",
        story: "Mengalahkan raja zalim Jalut. Memiliki mukjizat melunakkan besi, suara sangat merdu (Zabur), sehingga burung dan gunung ikut bertasbih.",
        fullStory: [
            "Nabi Daud pada awalnya hanyalah seorang prajurit muda dari Bani Israil di bawah pimpinan Raja Thalut. Ketika mereka harus menghadapi pasukan besar yang dipimpin oleh raksasa zalim bernama Jalut (Goliath), tak ada yang berani maju berduel kecuali Daud. Dengan hanya berbekal katapel dan beberapa butir batu kerikil, Daud berhasil melontarkan batu tepat ke dahi Jalut hingga raksasa itu tewas.",
            "Atas keberaniannya, beliau dinikahkan dengan putri raja dan kelak diangkat menjadi raja sekaligus nabi, menggabungkan kekuasaan duniawi dan kerasulan.",
            "Allah mengaruniakan kitab suci Zabur kepadanya dan suara yang sangat merdu. Jika Nabi Daud membaca kitab Zabur atau bertasbih, burung-burung yang terbang akan berhenti di udara dan gunung-gunung pun ikut bertasbih bersamanya. Allah juga memberikannya mukjizat fisik yang luar biasa: tangannya mampu melunakkan besi keras seperti lilin tanpa dipanaskan, yang ia gunakan untuk membuat baju besi berkualitas tinggi yang ringan dan tak tertembus senjata."
        ]
    },
    {
        id: 18, name: "Nabi Sulaiman AS", title: "Raja Seluruh Makhluk",
        story: "Mewarisi kerajaan ayahnya (Daud). Mengerti bahasa hewan, menguasai angin dan jin, serta memiliki kerajaan terkaya sepanjang sejarah.",
        fullStory: [
            "Nabi Sulaiman mewarisi kenabian dan kerajaan ayahnya, Nabi Daud. Beliau pernah memohon kepada Allah sebuah kerajaan besar yang tidak akan tertandingi oleh siapapun sesudahnya. Allah mengabulkannya dan menjadikannya penguasa terhebat dalam sejarah umat manusia.",
            "Bala tentaranya tidak hanya terdiri dari manusia, tetapi juga jin, burung, dan binatang buas. Mukjizatnya sangat banyak: beliau bisa berbicara dan mengerti bahasa hewan (seperti kisah saat pasukannya menghindari semut yang ketakutan), menundukkan bangsa jin untuk membangun gedung dan menyelam di laut, serta bisa mengendalikan angin yang sanggup membawanya terbang menempuh jarak perjalanan sebulan hanya dalam waktu setengah hari.",
            "Salah satu kisahnya yang terkenal adalah menundukkan Ratu Balqis dari negeri Saba' (Yaman) yang menyembah matahari. Sulaiman memerintahkan jin Ifrit (atau staf berilmu) untuk memindahkan singgasana Balqis ke istananya hanya dalam sekejap mata. Kecerdasan dan kekayaan Sulaiman membuat Ratu Balqis akhirnya berserah diri kepada Allah.",
            "Kematian Nabi Sulaiman sangat unik: beliau wafat dalam posisi berdiri bertelekan pada tongkatnya saat mengawasi para jin bekerja. Jin-jin itu terus bekerja tanpa henti mengira beliau masih hidup, hingga akhirnya rayap memakan tongkat tersebut dan tubuh Sulaiman tersungkur. Ini menjadi bukti bahwa jin tidak mengetahui hal yang ghaib."
        ]
    },
    {
        id: 19, name: "Nabi Ilyas AS", title: "Utusan Peringatan Bagi Penyembah Ba'al",
        story: "Diutus ke Bani Israil di Ba'albak yang menyembah berhala Ba'al. Karena menolak dakwahnya, Allah menimpakan kemarau panjang 3 tahun.",
        fullStory: [
            "Nabi Ilyas adalah keturunan Nabi Harun yang diutus untuk memandu Bani Israil yang saat itu bermukim di wilayah Ba'albak (daerah Lebanon saat ini). Nama kota itu sendiri dinamai dari berhala raksasa berlapis emas bernama 'Ba'al' yang disembah oleh penduduknya yang dipimpin seorang raja durhaka.",
            "Nabi Ilyas memperingatkan mereka untuk meninggalkan Ba'al dan menyembah Allah Tuhan semesta alam, namun mereka terus mendustakannya dan bahkan berniat membunuhnya, sehingga Nabi Ilyas terpaksa bersembunyi di dalam gua selama bertahun-tahun dengan bantuan burung gagak yang membawakan makanan.",
            "Akibat keingkaran mereka, Allah menghentikan hujan selama 3 tahun penuh yang menyebabkan kemarau ekstrem, kekeringan, dan kelaparan hebat. Saat penduduk tak tahan lagi, mereka meminta Nabi Ilyas memohon kepada Allah. Hujan pun turun menyelamatkan mereka. Sayangnya, begitu mereka kembali makmur, mereka kembali murtad menyembah berhala, sehingga azab yang lebih pedih kembali menimpa mereka."
        ]
    },
    {
        id: 20, name: "Nabi Ilyasa AS", title: "Penerus Tongkat Estafet Dakwah",
        story: "Anak angkat dan penerus Nabi Ilyas. Beliau terus memimpin Bani Israil ke jalan Allah, membawa kedamaian dan kemakmuran di masanya.",
        fullStory: [
            "Nabi Ilyasa (Elisa) adalah murid setia, teman seperjuangan, sekaligus anak angkat Nabi Ilyas. Ketika Nabi Ilyas sedang bersembunyi dari kejaran raja zalim di sebuah rumah, ia bertemu dengan pemuda bernama Ilyasa yang sedang sakit keras. Atas doa Nabi Ilyas, pemuda itu sembuh dan sejak itu ia terus menemani dan belajar mendampingi dakwah Nabi Ilyas.",
            "Setelah Nabi Ilyas wafat (atau diangkat ke langit menurut sebagian riwayat), Allah menetapkan Ilyasa sebagai Nabi untuk melanjutkan tongkat estafet dakwah kepada Bani Israil yang keras kepala.",
            "Pada masa kepemimpinan Nabi Ilyasa, beliau berhasil membimbing kaumnya kembali kepada syariat Taurat. Bani Israil yang mematuhi ajarannya pun dianugerahi masa-masa damai yang panjang, terbebas dari penjajahan, dan diberikan kemakmuran ekonomi yang luar biasa oleh Allah SWT sebelum akhirnya kaum tersebut kembali rusak sepeninggalnya."
        ]
    },
    {
        id: 21, name: "Nabi Yunus AS", title: "Ditelan Ikan Paus",
        story: "Putus asa melihat kaumnya tak mau beriman, beliau lari dan akhirnya ditelan paus. Beliau diselamatkan setelah bertobat di perut paus.",
        fullStory: [
            "Nabi Yunus (Dzun Nun) diutus kepada Suku Niwana di wilayah Mosul, Irak. Meskipun beliau berdakwah dengan gigih, dari 100.000 penduduknya tak ada satupun yang mau beriman. Kecewa dan marah, Nabi Yunus akhirnya kehilangan kesabaran. Beliau mengancam akan ada azab dalam tiga hari, lalu pergi meninggalkan mereka tanpa menunggu izin resmi dari Allah.",
            "Setelah kepergian Yunus, awan hitam pekat tanda azab benar-benar turun ke kota Niwana. Melihat kehancuran di depan mata, seluruh penduduk Niwana menangis, berteriak, meratap, dan bertaubat kepada Allah. Karena taubat mereka tulus, Allah mengampuni dan mengangkat azab itu. Ini adalah satu-satunya umat dalam sejarah yang azabnya dibatalkan setelah tanda-tandanya terlihat.",
            "Sementara itu, Yunus yang lari menaiki kapal layar dihantam badai hebat. Karena kapal kelebihan beban, mereka melakukan undian untuk membuang satu penumpang. Tiga kali diundi, nama Yunus selalu keluar. Ia pun melompat ke laut yang bergelombang dan seketika ditelan oleh ikan Paus raksasa atas perintah Allah.",
            "Di dalam tiga kegelapan (kegelapan perut paus, kegelapan dasar lautan, kegelapan malam), Nabi Yunus menyadari kesalahannya karena lari dari tanggung jawab. Beliau terus-menerus bertasbih dan meratap: 'Laa ilaaha illaa anta, subhaanaka innii kuntu minazh zhaalimiin' (Tidak ada Tuhan selain Engkau, Maha Suci Engkau, sungguh aku termasuk orang-orang yang zalim). Berkat doa itu, Allah memerintahkan paus memuntahkan Yunus ke daratan yang tandus. Setelah pulih, beliau kembali ke kaumnya dan disambut bahagia oleh 100.000 orang yang telah beriman."
        ]
    },
    {
        id: 22, name: "Nabi Zakaria AS", title: "Pengasuh Siti Maryam",
        story: "Tidak memiliki anak hingga usia sangat senja karena istri mandul. Terus berdoa di mihrab tanpa putus asa hingga dikaruniai putra, Yahya.",
        fullStory: [
            "Nabi Zakaria adalah seorang nabi dan pendeta di Baitul Maqdis (Masjidil Aqsa) yang terkenal karena kesalehannya. Beliau diberikan kehormatan untuk menjadi wali dan pengasuh Siti Maryam (ibunda Nabi Isa) yang bernazar mengabdi di masjid.",
            "Setiap kali Zakaria masuk ke mihrab (kamar khusus ibadah) Maryam, ia selalu menemukan makanan dan buah-buahan segar yang tidak sedang musimnya. Ketika ditanya dari mana asalnya, Maryam menjawab bahwa itu rezeki langsung dari Allah.",
            "Melihat keajaiban itu, iman Zakaria semakin berkobar. Saat itu usianya sudah sangat senja (sekitar 90 tahun) dengan rambut memutih, dan istrinya, Elisabet, adalah wanita yang divonis mandul sejak muda. Namun Zakaria tak pernah putus asa memohon penerus agar ada yang melanjutkan dakwah menjaga Bani Israil dari kesesatan.",
            "Ia berdoa dengan suara yang sangat lembut di tengah malam. Allah langsung mengabulkannya dengan mengutus malaikat Jibril yang memberinya kabar gembira tentang seorang putra yang akan diberi nama 'Yahya' (nama yang belum pernah digunakan sebelumnya). Sebagai tanda bukti, Zakaria tidak bisa berbicara selama tiga hari tiga malam kecuali hanya dengan isyarat."
        ]
    },
    {
        id: 23, name: "Nabi Yahya AS", title: "Nabi yang Suci dan Lembut Hati",
        story: "Putra Nabi Zakaria yang hafal Taurat sejak kecil. Mati syahid dipenggal raja kejam Herodes demi mempertahankan hukum larangan Allah.",
        fullStory: [
            "Kelahiran Nabi Yahya merupakan mukjizat dan jawaban atas doa ayahandanya. Sejak usia kanak-kanak, Allah telah mengaruniakan hikmah (kenabian), kecerdasan, dan kelembutan hati kepadanya. Ketika anak-anak seusianya mengajaknya bermain, Yahya menjawab bahwa manusia tidak diciptakan untuk bermain-main, melainkan beribadah.",
            "Beliau hafal isi kitab Taurat secara mendetail, hidup sangat zuhud (sering memakai baju dari bulu kasar dan makan makanan seadanya di hutan), dan tak pernah melakukan dosa syirik maupun maksiat sedikitpun sepanjang hidupnya.",
            "Sikapnya yang tegas membela kebenaran membawanya berhadapan dengan Raja Herodes, penguasa zalim di masanya. Sang raja ingin menikahi keponakannya sendiri (Herodia) yang sangat cantik, sebuah pernikahan sumbang (inses) yang diharamkan mutlak dalam Taurat. Nabi Yahya secara terbuka menentang dan memfatwakan haramnya pernikahan tersebut.",
            "Herodia yang menaruh dendam meminta hadiah pernikahan kepada raja, yaitu kepala Nabi Yahya. Raja Herodes yang dibutakan oleh hawa nafsu akhirnya memerintahkan prajurit memenggal kepala Nabi Yahya. Sang nabi suci pun wafat sebagai syuhada."
        ]
    },
    {
        id: 24, name: "Nabi Isa AS", title: "Lahir Tanpa Ayah & Penyembuh Ilahi",
        story: "Lahir dari Maryam tanpa ayah kandung. Mampu bicara sejak bayi, menyembuhkan kusta, dan diangkat ke langit saat hendak disalib.",
        fullStory: [
            "Nabi Isa adalah salah satu Rasul Ulul Azmi (rasul dengan keteguhan hati luar biasa). Kelahirannya sangat ajaib; beliau ditiupkan ruh ke dalam rahim Maryam yang perawan suci tanpa campur tangan seorang lelaki (ayah). Ketika masyarakat menuduh ibunya berzina, bayi Isa yang masih dalam buaian langsung berbicara dengan lantang membela kesucian ibunya dan menyatakan bahwa dirinya adalah hamba Allah yang akan diberi Kitab (Injil).",
            "Saat dewasa dan mulai berdakwah kepada Bani Israil yang sudah sangat keras hati dan materialistis, Allah membekalinya dengan mukjizat spektakuler untuk menundukkan akal mereka: atas izin Allah, beliau bisa menyembuhkan orang buta bawaan, menyembuhkan penyakit kusta, menghidupkan orang yang sudah mati, serta meniup burung yang dibuat dari tanah liat hingga hidup dan terbang.",
            "Ajaran Nabi Isa yang penuh kasih dan membersihkan syariat yang diselewengkan oleh para rahib Yahudi memicu kemarahan para pemuka agama saat itu. Mereka lalu berkomplot dan memfitnah Nabi Isa ke penguasa Romawi agar dihukum salib.",
            "Ketika tentara Romawi mengepung tempat persembunyiannya (berkat pengkhianatan muridnya, Yudas Iskariot), Allah menyelamatkan Nabi Isa dengan mengangkatnya langsung ke langit. Sementara itu, wajah Yudas diubah persis menyerupai Nabi Isa, sehingga Yudas-lah yang ditangkap, disiksa, dan disalib. Umat Islam meyakini bahwa Nabi Isa belum wafat dan akan diturunkan kembali ke bumi di akhir zaman untuk menumpas Dajjal."
        ]
    },
    {
        id: 25, name: "Nabi Muhammad SAW", title: "Khataman Nabiyyin (Penutup Para Nabi)",
        story: "Nabi terakhir dan rasul bagi seluruh umat manusia. Menerima mukjizat terbesar yakni Al-Qur'an dan menjadi suri teladan sempurna.",
        fullStory: [
            "Nabi Muhammad ﷺ adalah manusia paling agung, penutup para nabi dan rasul (Khataman Nabiyyin), di mana tidak akan ada lagi nabi sesudahnya. Beliau diutus bukan hanya untuk suatu kaum tertentu, melainkan sebagai 'Rahmatan Lil 'Alamin' (Rahmat bagi seluruh alam semesta).",
            "Beliau lahir yatim di Mekkah, dikenal sebagai 'Al-Amin' karena kejujurannya yang tak tertandingi, lalu menerima wahyu di usia 40 tahun. Selama 23 tahun masa kerasulannya (13 tahun di Mekkah dan 10 tahun di Madinah), beliau mengalami seluruh spektrum ujian hidup manusia: dari kehilangan keluarga yang dicintai, diboikot kelaparan, disiksa secara fisik, hingga harus memimpin perang bertahan hidup.",
            "Mukjizat terbesar yang diberikan kepadanya adalah Al-Qur'an, kitab suci abadi yang tak bisa diubah, tak tertandingi keindahan bahasanya, dan relevan sepanjang zaman. Mukjizat fisiknya pun banyak, seperti peristiwa Isra' Mi'raj (perjalanan ke langit ketujuh dalam semalam), air memancar dari sela-sela jarinya, hingga membelah bulan menjadi dua.",
            "Dalam waktu hanya dua dekade, beliau berhasil mengubah bangsa Arab yang liar, biadab, dan terbelakang menjadi bangsa yang memimpin peradaban dunia dengan pilar tauhid, keadilan sosial, dan ilmu pengetahuan. Ketika beliau wafat, Jazirah Arab telah damai dalam naungan Islam, dan ajarannya terus menerangi hati milyaran manusia hingga hari kiamat kelak."
        ]
    }
];

const Kisah25NabiScreen = ({ setActiveTab }) => {
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(1);

    const filteredNabi = NABI_DATA.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="pb-28 animate-in fade-in duration-500 bg-[#FAFAFA] min-h-full">
            {/* Header */}
            <div className="flex items-center p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-[#E8D2A6]/30">
                <button onClick={() => setActiveTab('kategori')} className="p-2 -ml-2 mr-2 text-[#4A1C14] hover:bg-[#FCF7E8] rounded-full transition-colors">
                    <PhosphorIcon icon="arrow-left" size={24} weight="bold" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#4A1C14] leading-tight">Kisah 25 Nabi</h2>
                    <p className="text-[10px] text-[#B88A44]">Sejarah lengkap rasul utusan Allah</p>
                </div>
            </div>
            
            {/* Banner */}
            <div className="bg-[#4A1C14] text-white p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#B88A44] opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#4A1C14] to-transparent"></div>
                <div className="relative z-10">
                    <PhosphorIcon icon="users-three" size={40} className="text-[#E8D2A6] mb-3 opacity-90" />
                    <h2 className="text-2xl font-bold font-serif mb-1">Para Utusan Mulia</h2>
                    <p className="text-sm text-[#E8D2A6]/90 leading-relaxed font-medium max-w-sm">
                        Mengenal perjalanan hidup dan keteguhan iman 25 Nabi dan Rasul pilihan Allah.
                    </p>
                </div>
            </div>

            <div className="p-5">
                {/* Search Bar */}
                <div className="relative mb-6">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nabi (contoh: Yusuf, Musa)..."
                        className="w-full bg-white border border-[#E8D2A6]/60 rounded-2xl py-3 pl-11 pr-4 text-sm text-[#4A1C14] placeholder:text-[#B88A44]/60 focus:outline-none focus:ring-2 focus:ring-[#B88A44]/30 shadow-sm"
                    />
                    <PhosphorIcon icon="magnifying-glass" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B88A44]" />
                </div>

                {/* Timeline List */}
                <div className="relative mt-2">
                    {/* Vertical Line */}
                    <div className="absolute left-[1.15rem] top-4 bottom-8 w-px bg-gradient-to-b from-[#B88A44]/80 via-[#E8D2A6] to-transparent"></div>
                    
                    <div className="space-y-6">
                        {filteredNabi.map((nabi, index) => {
                            const isExpanded = expandedId === nabi.id;
                            
                            return (
                                <div key={nabi.id} className="relative pl-12 animate-in slide-in-from-right-4" style={{ animationDelay: `${(index % 10) * 50}ms`, animationFillMode: 'both' }}>
                                    {/* Timeline Dot with Number */}
                                    <div 
                                        className={`absolute left-0 top-2 w-10 h-10 rounded-full flex items-center justify-center border-[3px] shadow-sm transition-colors duration-300 z-10 font-black text-sm ${
                                            isExpanded 
                                            ? 'bg-[#B88A44] border-white text-white' 
                                            : 'bg-white border-[#E8D2A6]/50 text-[#B88A44]'
                                        }`}
                                    >
                                        {nabi.id}
                                    </div>
                                    
                                    {/* Content Card */}
                                    <div 
                                        className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                                            isExpanded 
                                            ? 'border-[#B88A44]/40 shadow-md ring-1 ring-[#B88A44]/10' 
                                            : 'border-[#E8D2A6]/40 shadow-sm hover:border-[#B88A44]/30'
                                        }`}
                                    >
                                        <button 
                                            onClick={() => setExpandedId(isExpanded ? null : nabi.id)}
                                            className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
                                        >
                                            <div>
                                                <h3 className={`font-bold text-[15px] mb-0.5 ${isExpanded ? 'text-[#4A1C14]' : 'text-[#4A1C14]/90'}`}>
                                                    {nabi.name}
                                                </h3>
                                                <p className="text-[11px] text-[#B88A44] font-medium tracking-wide">
                                                    {nabi.title}
                                                </p>
                                            </div>
                                            <PhosphorIcon 
                                                icon="caret-down" 
                                                size={16} 
                                                className={`text-[#B88A44] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                                            />
                                        </button>
                                        
                                        <div 
                                            className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                                isExpanded ? 'max-h-[2000px] opacity-100 pb-5' : 'max-h-0 opacity-0'
                                            }`}
                                        >
                                            <div className="px-5">
                                                <div className="h-px w-full bg-[#E8D2A6]/20 mb-4"></div>
                                                
                                                {/* Summary Quote Box */}
                                                <div className="bg-[#FCF7E8]/50 p-4 rounded-xl border border-[#E8D2A6]/30 mb-5 relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#B88A44] rounded-l-xl"></div>
                                                    <p className="text-[13px] font-bold text-[#4A1C14]/90 leading-relaxed italic">
                                                        "{nabi.story}"
                                                    </p>
                                                </div>
                                                
                                                {/* Full Story Paragraphs */}
                                                <div className="space-y-4">
                                                    {nabi.fullStory.map((paragraph, pIdx) => (
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

                        {filteredNabi.length === 0 && (
                            <div className="text-center py-10 flex flex-col items-center gap-2">
                                <PhosphorIcon icon="file-search" size={32} className="text-[#B88A44]/50" />
                                <p className="text-gray-500 text-sm">Nabi tidak ditemukan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Kisah25NabiScreen;
