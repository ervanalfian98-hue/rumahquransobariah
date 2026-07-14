import React from 'react';
import PhosphorIcon from './PhosphorIcon';

const DOCK_ITEMS = [
    { id: 'beranda', label: 'Beranda', icon: 'house' },
    { id: 'pendidikan', label: 'Pendidikan', icon: 'graduation-cap' },
    { id: 'quran', label: 'Al-Quran', icon: 'book-open' },
];

const FloatingDock = ({ activeTab, setActiveTab, currentUser }) => {
    const activeIndex = DOCK_ITEMS.findIndex(item => item.id === activeTab);
    const isMasterActive = activeTab === 'master';
    const isTholibah = currentUser?.role === 'tholibah';

    return (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[320px] h-[60px] flex justify-between z-50 gap-3">
            <div className="relative flex-1 bg-[#4A1C14] rounded-[30px] shadow-2xl shadow-[#4A1C14]/40 flex">
                {activeIndex !== -1 && (
                    <div
                        className="absolute top-[-12px] w-[56px] h-[56px] transition-all duration-500 ease-out pointer-events-none z-0"
                        style={{ left: `calc(${(activeIndex * 33.33) + 16.66}% - 28px)` }}
                    >
                        <div className="absolute w-full h-full bg-[#4A1C14] rounded-full"></div>

                        <div
                            className={`absolute top-[12px] -left-[20px] w-[20px] h-[20px] bg-transparent rounded-tr-[20px] transition-opacity duration-200 ${activeIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
                            style={{ boxShadow: '10px 10px 0 0 #4A1C14' }}
                        ></div>

                        <div
                            className={`absolute top-[12px] -right-[20px] w-[20px] h-[20px] bg-transparent rounded-tl-[20px] transition-opacity duration-200 ${activeIndex === DOCK_ITEMS.length - 1 ? 'opacity-0' : 'opacity-100'}`}
                            style={{ boxShadow: '-10px 10px 0 0 #4A1C14' }}
                        ></div>
                    </div>
                )}

                {DOCK_ITEMS.map((item) => (
                    <NavItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        id={item.id}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                ))}
            </div>

            {/* Master Button Circle */}
            {!isTholibah && (
                <div className="relative w-[60px] h-[60px] bg-[#4A1C14] rounded-full shadow-2xl shadow-[#4A1C14]/40 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('master')}
                        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center outline-none"
                    >
                        <div className={`transition-all duration-500 ease-out flex items-center justify-center absolute
                    ${isMasterActive
                                ? 'top-[6px] w-[46px] h-[46px] bg-[#FCF7E8] text-[#4A1C14] rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] border-2 border-[#E8D2A6]'
                                : 'top-[10px] w-[28px] h-[28px] text-[#FCF7E8] hover:text-[#B88A44]'
                            }
                `}>
                            <PhosphorIcon icon="gear" size={isMasterActive ? 24 : 22} />
                        </div>

                        <span className={`absolute bottom-[8px] text-[10px] font-bold transition-all duration-500 
                    ${isMasterActive ? 'text-[#FCF7E8] opacity-0' : 'text-[#FCF7E8]/70'}
                `}>
                            Master
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

const NavItem = ({ icon, label, id, activeTab, setActiveTab }) => {
    const isActive = activeTab === id;

    return (
        <button
            onClick={() => setActiveTab(id)}
            className="relative flex-1 h-full flex flex-col items-center justify-end pb-[6px] z-10 outline-none"
        >
            <div className={`absolute transition-all duration-500 ease-out flex items-center justify-center
        ${isActive
                    ? 'bottom-[21px] w-[46px] h-[46px] bg-[#FCF7E8] text-[#4A1C14] rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] border-2 border-[#E8D2A6]'
                    : 'bottom-[18px] w-[28px] h-[28px] text-[#FCF7E8] hover:text-[#B88A44]'
                }
      `}>
                <PhosphorIcon icon={icon} size={isActive ? 24 : 22} />
            </div>

            <span className={`text-[10px] font-bold transition-all duration-500 
        ${isActive ? 'text-[#FCF7E8] translate-y-[2px] opacity-100' : 'text-[#FCF7E8]/70'}
      `}>
                {label}
            </span>
        </button>
    );
};

export default FloatingDock;
export { DOCK_ITEMS as NAV_ITEMS };
