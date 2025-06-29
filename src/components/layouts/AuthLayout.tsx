import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthProvider';
import SplashScreen from '../../components/shared/SplashScreen';

function AuthLayout() {
  const [showSplash, setShowSplash] = useState(true);

  const { user } = useAuth();
    useEffect(() => {
    if (user) {
      // if logged in, skip splash immediately
      setShowSplash(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [user]);

  if (showSplash) return <SplashScreen />;
  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__banner">
          <div className="banner-content">
            <div className="header">
              <h1>Your Health, Our Priority</h1>
              <p className='text-sm w-90'>
                Access world-class healthcare services from the comfort of your home with MediCare.
              </p>

            </div>
            <div className="features">
              <div className="feature">
                <Check size={24} />
                <div className="feature-content">
                  <div className="title">Easy Appointment Booking</div>
                  <div className="description">
                    Schedule appointments with specialists in just a few clicks
                  </div>
                </div>
              </div>

              <div className="feature">
                <Check size={24} />
                <div className="feature-content">
                  <div className="title">Secure Medical Records</div>
                  <div className="description">
                    Access your complete medical history anytime, anywhere
                  </div>
                </div>
              </div>

              <div className="feature">
                <Check size={24} />
                <div className="feature-content">
                  <div className="title">Medication Reminders</div>
                  <div className="description">
                    Never miss a dose with our smart reminder system
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth__content">
          <div className="auth__content-inner">
            <Outlet />
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default AuthLayout;
