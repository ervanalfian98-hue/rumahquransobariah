'use client';

import React, { useState, useEffect, useRef } from 'react';
import BerandaScreen from '../components/Beranda';
import PendidikanScreen from '../components/Pendidikan';
import QuranScreen from '../components/AlQuran';
import KategoriScreen from '../components/Kategori';
import MasterScreen from '../components/Master';
import KalenderScreen from '../components/Kalender';
import KiblatScreen from '../components/Kiblat';
import FloatingDock from '../components/FloatingDock';
import HadistScreen from '../components/Hadist';
import AdzanScreen from '../components/Adzan';
import AsbabunNuzulScreen from '../components/AsbabunNuzul';
import TafsirScreen from '../components/Tafsir';
import BacaanSholatScreen from '../components/BacaanSholat';
import TasbihScreen from '../components/Tasbih';
import SirahNabiScreen from '../components/SirahNabi';
import AsmaulHusnaScreen from '../components/AsmaulHusna';
import Kisah25NabiScreen from '../components/Kisah25Nabi';
import AmalScreen from '../components/Amal';
import DzikirScreen from '../components/Dzikir';
import DoaScreen from '../components/Doa';
import RenunganScreen from '../components/Renungan';
import ArtikelScreen from '../components/Artikel';
import IqraScreen from '../components/Iqra';
import QurbanScreen from '../components/Qurban';
import DonasiScreen from '../components/Donasi';
import SosmedScreen from '../components/Sosmed';
import TamyizScreen from '../components/Tamyiz';
import KepengurusanScreen from '../components/Kepengurusan';
import PengajarScreen from '../components/Pengajar';
import ZakatScreen from '../components/Zakat';
import MerchandiseScreen from '../components/Merchandise';
import RqsBerdayaScreen from '../components/RqsBerdaya';
import RqsHerbalScreen from '../components/RqsHerbal';
import RqsMlpScreen from '../components/RqsMlp';

export default function App() {
    const [activeTab, setActiveTab] = useState('beranda');
    const [currentUser, setCurrentUser] = useState(null);
    const activeTabRef = useRef(activeTab);

    useEffect(() => {
        const user = localStorage.getItem('rqs_currentUser');
        if (user) {
            setCurrentUser(JSON.parse(user));
        } else {
            window.location.href = '/';
        }
    }, []);

    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    useEffect(() => {
        if (!document.querySelector('script[src*="phosphor-icons"]')) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@phosphor-icons/web';
            script.async = true;
            document.head.appendChild(script);
        }
        if (!document.querySelector('script[src*="iconify-icon"]')) {
            const script = document.createElement('script');
            script.src = 'https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js';
            script.async = true;
            document.head.appendChild(script);
        }

        // Setup Back Button Handler
        window.history.replaceState({ page: 'home' }, '');
        window.history.pushState({ tab: 'beranda' }, '');

        const handlePopState = (event) => {
            const backEvent = new CustomEvent('app-back-pressed', { cancelable: true });
            window.dispatchEvent(backEvent);

            if (backEvent.defaultPrevented) {
                // Submenu closed itself
                window.history.pushState({ tab: activeTabRef.current }, '');
                return;
            }

            if (activeTabRef.current !== 'beranda') {
                setActiveTab('beranda');
                window.history.pushState({ tab: 'beranda' }, '');
            } else {
                const confirmExit = window.confirm("Apakah anda yakin ingin keluar dari aplikasi ini?");
                if (!confirmExit) {
                    window.history.pushState({ tab: 'beranda' }, '');
                } else {
                    window.location.href = '/';
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Global Adzan Notification Check
    useEffect(() => {
        let lastCheckedMinute = -1;

        const checkAdzan = async () => {
            const now = new Date();
            // Only check once per minute to save resources
            if (now.getMinutes() === lastCheckedMinute) return;
            lastCheckedMinute = now.getMinutes();

            const savedNotif = localStorage.getItem('rqs_adzan_notif');
            let notifSettings = { Fajr: true, Sunrise: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };
            if (savedNotif) {
                try {
                    notifSettings = JSON.parse(savedNotif);
                } catch (e) {}
            }

            // Fetch latest today's timings. We can cache it for the day to avoid spamming the API.
            const todayStr = now.toISOString().split('T')[0];
            let timings = null;
            
            const cachedTimings = localStorage.getItem('rqs_daily_timings_' + todayStr);
            if (cachedTimings) {
                timings = JSON.parse(cachedTimings);
            } else {
                try {
                    const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Sukabumi&country=Indonesia&method=11');
                    const data = await res.json();
                    if (data.code === 200) {
                        timings = data.data.timings;
                        localStorage.setItem('rqs_daily_timings_' + todayStr, JSON.stringify(timings));
                    }
                } catch (e) {
                    console.error("Failed to fetch timings for adzan check", e);
                }
            }

            if (!timings) return;

            const prayers = [
                { id: 'Fajr', name: 'Subuh', time: timings.Fajr },
                { id: 'Sunrise', name: 'Dhuha', time: timings.Sunrise },
                { id: 'Dhuhr', name: 'Dzuhur', time: timings.Dhuhr },
                { id: 'Asr', name: 'Ashar', time: timings.Asr },
                { id: 'Maghrib', name: 'Maghrib', time: timings.Maghrib },
                { id: 'Isha', name: 'Isya', time: timings.Isha }
            ];

            for (let prayer of prayers) {
                if (!notifSettings[prayer.id] || !prayer.time || prayer.time === '--:--') continue;

                const [h, m] = prayer.time.split(':').map(Number);
                if (now.getHours() === h && now.getMinutes() === m) {
                    const notifKey = `adzan_notif_sent_${todayStr}_${prayer.id}`;
                    if (!localStorage.getItem(notifKey)) {
                        localStorage.setItem(notifKey, 'true');
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification(`Waktu ${prayer.name}`, {
                                body: `Telah masuk waktu sholat ${prayer.name} untuk wilayah Sukabumi dan sekitarnya.`,
                                icon: '/icon-192x192.png'
                            });
                        }
                    }
                }
            }
        };

        const timer = setInterval(checkAdzan, 10000); // check every 10s
        checkAdzan(); // check immediately

        return () => clearInterval(timer);
    }, []);

    const handleTabChange = (newTab) => {
        if (newTab !== activeTab) {
            window.history.pushState({ tab: newTab }, '');
            setActiveTab(newTab);
        }
    };

    const renderScreen = () => {
        if (!currentUser) return null; // Wait until loaded

        return (
            <>
                <div style={{ display: activeTab === 'beranda' ? 'block' : 'none' }}>
                    <BerandaScreen setActiveTab={handleTabChange} currentUser={currentUser} />
                </div>
                {activeTab === 'pendidikan' ? <PendidikanScreen currentUser={currentUser} />
                : activeTab === 'quran' ? <QuranScreen currentUser={currentUser} />
                : activeTab === 'kategori' ? <KategoriScreen setActiveTab={handleTabChange} />
                : activeTab === 'pengajar' ? <PengajarScreen setActiveTab={handleTabChange} />
                : activeTab === 'master' ? <MasterScreen />
                : activeTab === 'kalender' ? <KalenderScreen setActiveTab={handleTabChange} currentUser={currentUser} />
                : activeTab === 'kiblat' ? <KiblatScreen setActiveTab={handleTabChange} />
                : activeTab === 'hadist' ? <HadistScreen setActiveTab={handleTabChange} />
                : activeTab === 'zakat' ? <ZakatScreen setActiveTab={handleTabChange} />
                : activeTab === 'merchandise' ? <MerchandiseScreen setActiveTab={handleTabChange} />
                : activeTab === 'adzan' ? <AdzanScreen setActiveTab={handleTabChange} />
                : activeTab === 'kepengurusan' ? <KepengurusanScreen setActiveTab={handleTabChange} />
                : activeTab === 'rqs-berdaya' ? <RqsBerdayaScreen setActiveTab={handleTabChange} />
                : activeTab === 'rqs-herbal' ? <RqsHerbalScreen setActiveTab={handleTabChange} />
                : activeTab === 'rqs-mlp' ? <RqsMlpScreen setActiveTab={handleTabChange} />
                : activeTab === 'asbabun-nuzul' ? <AsbabunNuzulScreen setActiveTab={handleTabChange} />
                : activeTab === 'tafsir' ? <TafsirScreen setActiveTab={handleTabChange} />
                : activeTab === 'bacaan-sholat' ? <BacaanSholatScreen setActiveTab={handleTabChange} />
                : activeTab === 'tasbih' ? <TasbihScreen setActiveTab={handleTabChange} currentUser={currentUser} />
                : activeTab === 'sirah-nabi' ? <SirahNabiScreen setActiveTab={handleTabChange} />
                : activeTab === 'asmaul-husna' ? <AsmaulHusnaScreen setActiveTab={handleTabChange} />
                : activeTab === 'kisah-25-nabi' ? <Kisah25NabiScreen setActiveTab={handleTabChange} />
                : activeTab === 'tamyiz' ? <TamyizScreen setActiveTab={handleTabChange} />
                : activeTab === 'amal' ? <AmalScreen setActiveTab={handleTabChange} currentUser={currentUser} />
                : activeTab === 'dzikir' ? <DzikirScreen setActiveTab={handleTabChange} />
                : activeTab === 'iqra' ? <IqraScreen setActiveTab={handleTabChange} currentUser={currentUser} />
                : activeTab === 'artikel' ? <ArtikelScreen setActiveTab={handleTabChange} />
                : activeTab === 'renungan' ? <RenunganScreen setActiveTab={handleTabChange} />
                : activeTab === 'doa' ? <DoaScreen setActiveTab={handleTabChange} />
                : activeTab === 'qurban' ? <QurbanScreen setActiveTab={handleTabChange} />
                : activeTab === 'donasi' ? <DonasiScreen setActiveTab={handleTabChange} />
                : activeTab === 'sosmed' ? <SosmedScreen setActiveTab={handleTabChange} />
                : null}
            </>
        );
    };

    return (
        <div className="fixed inset-0 w-full sm:max-w-md mx-auto bg-[#FDFBF7] flex flex-col font-sans shadow-2xl sm:border-x sm:border-[#E8D2A6]/50 z-0">
            <div className="flex-1 overflow-y-auto hide-scrollbar relative">
                {renderScreen()}
            </div>
            {currentUser && <FloatingDock activeTab={activeTab} setActiveTab={handleTabChange} currentUser={currentUser} />}
        </div>
    );
}
