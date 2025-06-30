import React from 'react';
import { Link } from 'react-router-dom';


function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer app-layout__footer">
      <div className="container">
        <div className="legal d-flex align-items-center justify-content-center ">
          <a className="ft-link  mr-3" href="https://www.netlify.com" target="_blank" rel="noopener noreferrer" aria-label="Netlify">
            <img src="/assets/logo-netlify.svg" alt=""  width="30" height="30"/>
          </a>

          <a className="ft-link  mr-3" href="https://supabase.com" aria-label="Supabase">
            <img src="/assets/logo-supabase.svg" alt="" width="30" height="30"/>
          </a>
          <a className="ft-link  mr-3" href="https://bolt.new" aria-label="Bolt.new" >
            <img src="/assets/logo-bolt.svg" alt="" width="30" height="30"/>
          </a>
        </div>
        <div className="footer__bottom">
          <div className="copyright">
            &copy; {currentYear} MediCare. All rights reserved.
          </div>
          <div className="legal space-x-4">
            <Link to="/privacy-policy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="underline hover:text-primary">
              Terms of Service
            </Link>
            <Link to="/cookie-policy" className="underline hover:text-primary">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
