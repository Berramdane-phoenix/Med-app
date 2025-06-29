import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer app-layout__footer">
      <div className="container">
        {/* Uncomment or update the main footer content here */}
          {/* <div className="footer__container">
          <div className="footer__brand">
            <div className="logo">
              <Stethoscope size={24} />
              <span>MediCare</span>
            </div>
            <div className="description">
              Providing quality healthcare services for you and your family. Access your medical records, book appointments with specialists, and manage your health journey all in one place.
            </div>
            <div className="social">
              <a href="#" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div className="footer__links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/appointments">Appointments</Link></li>
              <li><Link to="/medical-records">Medical Records</Link></li>
              <li><Link to="/doctors">Doctors</Link></li>
              <li><Link to="/profile">My Profile</Link></li>
            </ul>
          </div>

          <div className="footer__links">
            <h4>Resources</h4>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">News</a></li>
              <li><a href="#">Research</a></li>
            </ul>
          </div>

          <div className="footer__contact">
            <h4>Contact Us</h4>
            <ul>
              <li>
                <MapPin size={18} />
                <span>123 Medical Center Blvd<br />Boston, MA 02215</span>
              </li>
              <li>
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <Mail size={18} />
                <span>support@medicare.com</span>
              </li>
            </ul>
          </div>
        </div> */}
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
