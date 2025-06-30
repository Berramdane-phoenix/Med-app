import React, { useState } from 'react';
import AppLoader from '../../components/shared/SplashScreen';

export default function Welcome() {
  const [showSplash, setShowSplash] = useState(true);

  const handleLoadComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) return <AppLoader onLoadComplete={handleLoadComplete} minLoadTime={2000} />;

  return (
    <div className="welcome-page">
      {/* Main content after splash */}
    </div>
  );
}
