// src/pages/Welcome.tsx
import React, { useEffect, useState } from 'react';
import SplashScreen from '../../components/shared/SplashScreen';

export default function Welcome() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
        setShowSplash(false);
        }, 40000);
        return () => clearTimeout(timer);
    }, []);

    if (showSplash) return <SplashScreen />;
    return (
   <div className="welcome-page">
    </div>
    );
};

