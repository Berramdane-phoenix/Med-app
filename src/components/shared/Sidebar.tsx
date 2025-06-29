import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldPlus, Home, Calendar, LogOut, FileText, Users, User, Settings, Bell, Pill, HelpCircle, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const MOBILE_BREAKPOINT = 1024;

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const width = useWindowWidth();
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [showMenu, setShowMenu] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    if (location.pathname.startsWith('/appointments')) {
      setActiveSubmenu('appointments');
    } else {
      setActiveSubmenu(null);
    }
  }, [location.pathname]);

  const toggleSubmenu = (key: string) => {
    setActiveSubmenu((prev) => (prev === key ? null : key));
  };

  const isActive = (path: string, exact = true) =>
    exact
      ? location.pathname === path
      : location.pathname.startsWith(path) && location.pathname !== '/';

  // Mobile sidebar
  if (width <= MOBILE_BREAKPOINT) {
    return (
      <div className="sidebar-mobile">
        {[
          { to: '/', icon: <Home size={18} />, label: 'Home' },
          { to: '/appointments', icon: <Calendar size={18} />, label: 'Appointments' },
          { to: '/medical-records', icon: <FileText size={18} />, label: 'Records' },
          { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
          { to: '/profile', icon: <User size={18} />, label: 'Profile' }
        ].map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-mobile__item${isActive ? ' active' : ''}`
            }
          >
            {icon}
            <span className="sr-only">{label}</span>
          </NavLink>
        ))}
      </div>
    );
  }

  // Desktop sidebar
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Link to="/" className="logo">
          <ShieldPlus size={20} />
          <span>MediCare</span>
        </Link>
      </div>

      <div className="sidebar__content">
        <nav className="nav-menu">
          <div className="nav-menu__section">
            <ul className="nav-menu__list">
              <li className="nav-menu__item">
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                  <Home size={18} />
                  Dashboard
                </Link>
              </li>

              <li className="nav-menu__item nav-menu__item--has-submenu">
                <button
                  className={`nav-link w-100 ${isActive('/appointments', false) ? 'active' : ''}`}
                  onClick={() => toggleSubmenu('appointments')}
                  aria-expanded={activeSubmenu === 'appointments'}
                >
                  <Calendar size={18} />
                  Appointments
                  <ChevronDown
                    size={14}
                    className={`chevron ${activeSubmenu === 'appointments' ? 'open' : ''}`}
                  />
                </button>
                <ul className={`nav-menu__submenu ${activeSubmenu === 'appointments' ? 'open' : ''}`}>
                  <li>
                    <Link to="/appointments" className={isActive('/appointments') ? 'active' : ''}>
                      View All
                    </Link>
                  </li>
                  <li>
                    <Link to="/appointments/book" className={isActive('/appointments/book') ? 'active' : ''}>
                      Book New
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-menu__item">
                <Link to="/medical-records" className={`nav-link ${isActive('/medical-records') ? 'active' : ''}`}>
                  <FileText size={18} />
                  Medical Records
                </Link>
              </li>

              <li className="nav-menu__item">
                <Link to="/doctors" className={`nav-link ${isActive('/doctors') ? 'active' : ''}`}>
                  <Users size={18} />
                  Doctors
                </Link>
              </li>
            </ul>
          </div>

          <div className="nav-menu__section">
            <div className="nav-menu__section-title">Personal</div>
            <ul className="nav-menu__list">
              <li className="nav-menu__item">
                <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                  <User size={18} />
                  My Profile
                </Link>
              </li>
              <li className="nav-menu__item">
                <Link to="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
                  <Settings size={18} />
                  Settings
                </Link>
              </li>
              <li className="nav-menu__item">
                <Link to="/notifications" className={`nav-link ${isActive('/notifications') ? 'active' : ''}`}>
                  <Bell size={18} />
                  Notifications
                </Link>
              </li>
              <li className="nav-menu__item">
                <Link to="/medications" className={`nav-link ${isActive('/medications') ? 'active' : ''}`}>
                  <Pill size={18} />
                  Medications
                </Link>
              </li>
            </ul>
          </div>

          <div className="nav-menu__section">
            <div className="nav-menu__section-title">Support</div>
            <ul className="nav-menu__list">
              <li className="nav-menu__item">
                <Link to="/help" className={`nav-link ${isActive('/help') ? 'active' : ''}`}>
                  <HelpCircle size={18} />
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="sidebar__footer">
        <div className="user-info" onClick={() => setShowMenu(!showMenu)}>
          <div className="avatar">{getUserInitials()}</div>
          <div className="details">
            <div className="name">{getUserName()}</div>
            <div className="role">Patient</div>
          </div>

          {showMenu && (
            <div className="dropdown-menu show">
              <button className="user-profile__dropdown-a" onClick={() => navigate('/profile')}>
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button className="btn btn--primary" onClick={handleLogout}>
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;