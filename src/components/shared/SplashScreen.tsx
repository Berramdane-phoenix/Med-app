import React from 'react';

const SplashScreen = () => {
  return (
    <div className="page-loader spline-logo-wrapper w-100 h-100">
      <div className="page-loader__content w-100 h-100">
        <div className="overlay" />
        <iframe
          src="https://my.spline.design/infinitecircles-PaLk2LpyqBBbRAn45h4I0Qn7/"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title="Capsule"
        />
      </div>
    </div>
  );
};

export default SplashScreen;
