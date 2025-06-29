import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldPlus, Bell, Menu, X, User, Calendar, Pill,
  FileText, Users, Settings, LogOut, HelpCircle, CheckCircle, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { RealtimeChannel } from '@supabase/supabase-js';

interface HeaderProps {
  toggleSidebar: () => void;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  created_at: string;
  read: boolean;
}

function Header({ toggleSidebar }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [markingReadIds, setMarkingReadIds] = useState<Set<string>>(new Set());

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setLoadingNotifs(false);
      return;
    }

    async function fetchNotifications() {
      setLoadingNotifs(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      } else {
        setNotifications(data || []);
      }
      setLoadingNotifs(false);
    }

    fetchNotifications();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase.channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.new.user_id === user.id) {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (notifRef.current && !notifRef.current.contains(target) && notificationsOpen) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target) && userMenuOpen) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen, userMenuOpen, mobileMenuOpen]);

  async function markAsRead(id: string) {
    if (markingReadIds.has(id)) return;
    setMarkingReadIds(new Set(markingReadIds).add(id));
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setNotifications(data || []);
    } catch (err: any) {
      console.error('Mark as read error', err.message);
    } finally {
      const newSet = new Set(markingReadIds);
      newSet.delete(id);
      setMarkingReadIds(newSet);
    }
  }

  const toggleUserMenu = () => {
    setUserMenuOpen((prev) => !prev);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen((prev) => !prev);
    setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';

    const fullName = user.user_metadata?.full_name;
    if (fullName) {
      const names = fullName.trim().split(' ').filter(Boolean);
      return names.length === 1
        ? names[0].substring(0, 2).toUpperCase()
        : (names[0][0] + names[1][0]).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <header className="header app-layout__header">
      <div className="container-fluid">
        <div className="header__container">
          <a href="/" className="header__logo" aria-label="MediCare home">
            <ShieldPlus size={24} aria-hidden="true" />
            <span>MediCare</span>
          </a>

          <nav className="header__nav" aria-label="Primary navigation">
            <ul>
              <li><Link to="/" className={currentPath === '/' ? 'active' : ''}>Dashboard</Link></li>
              <li><Link to="/appointments" className={currentPath.startsWith('/appointments') ? 'active' : ''}>Appointments</Link></li>
              <li><Link to="/medical-records" className={currentPath.startsWith('/medical-records') ? 'active' : ''}>Medical Records</Link></li>
              <li><Link to="/doctors" className={currentPath.startsWith('/doctors') ? 'active' : ''}>Doctors</Link></li>
            </ul>
          </nav>

          <div className="header__actions">
            <div className="header__notification" ref={notifRef}>
              <button className="btn-icon" onClick={toggleNotifications} aria-label="Toggle notifications" aria-expanded={notificationsOpen}
            aria-controls="notifications-dropdown">
                <Bell size={20} aria-hidden="true"/>
                {notifications.length > 0 && <span className="badge" aria-live="polite"
                aria-atomic="true" >{notifications.length}</span>}
              </button>
              {notificationsOpen && (
                <div className="notifications__dropdown" role="region" aria-label="Notifications list">
                  <div className="notifications__header"><h3 className='ml-2'>Notifications</h3></div>
                  <ul className="notifications__list">
                    {loadingNotifs ? (
                      <li className="notification-item loading">Loading...</li>
                    ) : notifications.length === 0 ? (
                      <li className="empty-notification">No new notifications</li>
                    ) : (
                      <>
                        {notifications.slice(0, 1).map(({ id, title, message, created_at }) => (
                          <li key={id} className="notification-item mb-2 unread">
                            <p className="notification-title"><strong>{title}</strong></p>
                            <p className="notification-message">{message}</p>
                            <p className="notification-timestamp">
                              <small>{new Date(created_at).toLocaleString()}</small>
                            </p>
                            <button
                              type="button"
                              className="btn btn--primary btn-sm"
                              onClick={() => markAsRead(id)}
                              disabled={markingReadIds.has(id)}
                              title="Mark as read"
                              aria-label="Mark notification as read"
                            >
                              {markingReadIds.has(id) ? (
                                <Loader2 className="icon-spin" size={16} />
                              ) : (
                                <>
                                  <CheckCircle size={16} /> <span>Mark as read</span>
                                </>
                              )}
                            </button>
                          </li>
                        ))}
                        {notifications.length > 1 && (
                          <li className="more-indicator m-3 text-sm form-text text-center">...and more</li>
                        )}
                      </>
                    )}
                  </ul>

                  <div className="notifications__footer">
                    <Link to="/notifications" className="btn btn-sm btn--success ml-2" onClick={() => setNotificationsOpen(false)}>
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="header__user" ref={userMenuRef}>
              <button className="btn-icon" onClick={toggleUserMenu} aria-label="Open user menu" aria-expanded={userMenuOpen}>
                <div className="avatar">{getUserInitials()}</div>
              </button>
              {userMenuOpen && (
                <div className="user-profile__dropdown">
                  <Link to="/profile" className="user-profile__dropdown-a" onClick={() => setUserMenuOpen(false)}>
                    <User size={16} aria-hidden="true"/> <span>My Profile</span>
                  </Link>
                  <Link to="/settings" className="user-profile__dropdown-a" onClick={() => setUserMenuOpen(false)}>
                    <Settings size={16} aria-hidden="true"/> <span>Settings</span>
                  </Link>
                  <button onClick={handleLogout} className='btn btn-outline btn-primary btn-sm'>
                    <LogOut size={16} aria-hidden="true"/> Sign Out
                  </button>
                </div>
              )}
            </div>

            <button
              className="header__mobile-toggle"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}
        role="menu"
        aria-label="Mobile menu"
        ref={mobileMenuRef}
      >
        <div className="mobile-menu__header">
          <button className="close" onClick={() => setMobileMenuOpen(false)} aria-label="Close mobile menu">
            <X size={24} />
          </button>
        </div>
        <div className="mobile-menu__content">
          <ul>
            <li><Link to="/" role="menuitem"><User size={24} aria-hidden="true"/> Dashboard</Link></li>
            <li><Link to="/appointments" role="menuitem"><Calendar size={20} aria-hidden="true"/> Appointments</Link></li>
            <li><Link to="/medical-records" role="menuitem"><FileText size={20} aria-hidden="true"/> Medical Records</Link></li>
            <li><Link to="/doctors" role="menuitem"><Users size={20} aria-hidden="true"/> Doctors</Link></li>
            <li><Link to="/medications" role="menuitem"><Pill size={20} aria-hidden="true"/> Medications</Link></li>
            <li><Link to="/settings" role="menuitem"><Settings size={20} aria-hidden="true"/> Settings</Link></li>
            <li><Link to="/help" role="menuitem"><HelpCircle size={20} aria-hidden="true"/> Support</Link></li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Header;