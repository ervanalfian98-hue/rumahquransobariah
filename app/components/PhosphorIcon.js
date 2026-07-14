import React from 'react';

const PhosphorIcon = ({ icon, size = 24, weight = "duotone", className = "" }) => {
    if (icon === 'tasbih') {
        return (
            <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                width={size} 
                height={size} 
                className={className}
            >
                {/* Tali utama / benang */}
                <circle cx="12" cy="9" r="6" strokeWidth="0.5" strokeDasharray="none" />
                {/* Manik-manik tasbih */}
                <circle cx="12" cy="9" r="6" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="0 4.71" />
                {/* Imam tasbih (kepala) */}
                <path d="M12 15 v3" strokeWidth="2.5" strokeLinecap="round" />
                {/* Tassel / rumbai */}
                <path d="M12 18 L10.5 22 M12 18 L13.5 22 M12 18 v4" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10.5 19 h3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        );
    }
    
    if (icon === '99') {
        return (
            <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                width={size} 
                height={size} 
                className={className}
            >
                <text 
                    x="12" 
                    y="17" 
                    textAnchor="middle" 
                    fontSize="18" 
                    fontWeight="900" 
                    fontFamily="system-ui, -apple-system, sans-serif"
                >
                    99
                </text>
            </svg>
        );
    }
    
    if (icon === 'person-simple-pray') {
        return (
            <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                width={size} 
                height={size} 
                className={className}
            >
                {/* Sajadah outline */}
                <path d="M7 4h10l2 16H5z" />
                {/* Sajadah fringe bottom */}
                <path d="M5 20v2 M8 20v2 M11 20v2 M14 20v2 M17 20v2 M19 20v2" />
                {/* Inner arch / mihrab */}
                <path d="M9 12V9a3 3 0 0 1 6 0v3" />
                {/* Ground line */}
                <path d="M7 16h10" />
            </svg>
        );
    }
    
    if (icon === 'coffin') {
        return (
            <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                width={size} 
                height={size} 
                className={className}
            >
                {/* Tombstone / Batu Nisan */}
                <path d="M8 20V9a4 4 0 0 1 8 0v11" />
                {/* Ground */}
                <path d="M4 20h16" />
                {/* Inner decorations: Bulan Sabit (Crescent) */}
                <path d="M13.5 10.5a2.5 2.5 0 1 0 0 4 3 3 0 0 1 0-4z" fill="currentColor" stroke="none" />
            </svg>
        );
    }

    return (
        <i className={`ph-${weight} ph-${icon} ${className}`} style={{ fontSize: size }}></i>
    );
};

export default PhosphorIcon;
