// SplashScreen.tsx
import React, { useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';
import { Activity, Heart, Shield, ShieldPlus} from 'lucide-react';

interface AppLoaderProps {
  onLoadComplete: () => void;
  minLoadTime?: number;
}

const AppLoader: React.FC<AppLoaderProps> = ({ 
  onLoadComplete, 
  minLoadTime = 2000 
}) => {
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const [isMinTimeElapsed, setIsMinTimeElapsed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');

  // Loading steps for better UX
  const loadingSteps = [
    'Initializing application...',
    'Loading medical data...',
    'Preparing dashboard...',
    'Almost ready...'
  ];

  useEffect(() => {
    // Simulate asset loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Update loading steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const currentIndex = loadingSteps.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingSteps.length;
        return loadingSteps[nextIndex];
      });
    }, 800);

    // Simulate assets loading
    const assetsTimer = setTimeout(() => {
      setIsAssetsLoaded(true);
    }, 1500);

    // Minimum loading time
    const minTimeTimer = setTimeout(() => {
      setIsMinTimeElapsed(true);
    }, minLoadTime);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(assetsTimer);
      clearTimeout(minTimeTimer);
    };
  }, [minLoadTime]);

  useEffect(() => {
    // Check if everything is ready
    if (isSplineLoaded && isAssetsLoaded && isMinTimeElapsed && !isExiting) {
      setIsExiting(true);
      // Wait for exit animation to complete
      setTimeout(() => {
        onLoadComplete();
      }, 800);
    }
  }, [isSplineLoaded, isAssetsLoaded, isMinTimeElapsed, isExiting, onLoadComplete]);

  const handleSplineLoad = () => {
    setIsSplineLoaded(true);
  };

  const handleSplineError = () => {
    console.warn('Spline failed to load, using fallback animation');
    setIsSplineLoaded(true);
  };

  return (
    <div className={`app-loader ${isExiting ? 'app-loader--exiting' : ''}`}>
      <div className="app-loader__background">
        <div className="app-loader__gradient"></div>
      </div>

      {/* Spline Animation Container */}
      <div className="app-loader__spline-container">
        {/* <Spline
          scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
          onLoad={handleSplineLoad}
          onError={handleSplineError}
          className="app-loader__spline"
        />
         */}
        {/* Fallback animation if Spline fails */}
        {!isSplineLoaded && (
          <div className="app-loader__fallback">
            <div className="app-loader__fallback-icons">
              <div className="fallback-icon fallback-icon--1">
                <Heart />
              </div>
              <div className="fallback-icon fallback-icon--2">
                <Activity />
              </div>
              <div className="fallback-icon fallback-icon--3">
                <Shield />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Content */}
      <div className="app-loader__content">
        <div className="app-loader__brand">
          <div className="brand-icon">
            {/* <Activity className="brand-icon__svg" /> */}
          </div>
          <h1 className="brand-title d-flex align-items-center"><ShieldPlus size={30} className='mr-2'/>
          <span>MediCare</span></h1>
          <p className="brand-subtitle">Healthcare Management System</p>
        </div>

        <div className="app-loader__progress">
          <div className="progress-bar">
            <div 
              className="progress-bar__fill"
              style={{ width: `${Math.min(loadingProgress, 100)}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <span className="progress-text">{currentStep}</span>
            <span className="progress-percentage">
              {Math.round(Math.min(loadingProgress, 100))}%
            </span>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="app-loader__decorations">
        <div className="decoration decoration--1"></div>
        <div className="decoration decoration--2"></div>
        <div className="decoration decoration--3"></div>
        <div className="decoration decoration--4"></div>
      </div>
    </div>
  );
};

export default AppLoader;