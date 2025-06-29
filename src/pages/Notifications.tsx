import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Bell, Filter, Calendar, AlertCircle, Loader2, Check, X } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";


interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, [limit, filter]);

  async function loadNotifications() {
    setLoading(true);
    setError(null);
    
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      let query = supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(0, limit - 1);

      if (filter === "read") {
        query = query.eq("read", true);
      } else if (filter === "unread") {
        query = query.eq("read", false);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setNotifications(data || []);
      setHasMore((count || 0) > limit);
    } catch (err: any) {
      console.error("Failed to load notifications", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  }

  async function markAllAsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setMarkingAllRead(true);

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (!error) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read", err);
    } finally {
      setMarkingAllRead(false);
    }
  }

  const formatNotificationDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, 'MMM d, yyyy h:mm a') : 'Invalid date';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <main className="notifications-page">
      <div className="notifications-page__container">
        {/* Header */}
        <header className="notifications-page__header">
          <div className="header-content">
            <div className="header-info">
              <h1 className="header-title">Notifications</h1>
              <p className="header-subtitle">
                Stay updated with your healthcare information
              </p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <Bell className="stat-badge__icon" aria-hidden="true" />
                <span className="stat-badge__count">{notifications.length}</span>
                <span className="stat-badge__label">Total</span>
              </div>
              {unreadCount > 0 && (
                <div className="stat-badge stat-badge--unread">
                  <AlertCircle className="stat-badge__icon" aria-hidden="true" />
                  <span className="stat-badge__count">{unreadCount}</span>
                  <span className="stat-badge__label">Unread</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Controls */}
        <section className="notifications-controls" aria-label="Notification controls">
          <div className="filter-group" role="group" aria-labelledby="filter-label">
            <span id="filter-label" className="filter-label">
              <Filter className="filter-label__icon" aria-hidden="true" />
              Filter by:
            </span>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === "all" ? "filter-btn--active" : ""}`}
                onClick={() => setFilter("all")}
                aria-pressed={filter === "all"}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === "unread" ? "filter-btn--active" : ""}`}
                onClick={() => setFilter("unread")}
                aria-pressed={filter === "unread"}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="filter-btn__badge" aria-label={`${unreadCount} unread notifications`}>
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                className={`filter-btn ${filter === "read" ? "filter-btn--active" : ""}`}
                onClick={() => setFilter("read")}
                aria-pressed={filter === "read"}
              >
                Read
              </button>
            </div>
          </div>

          {unreadCount > 0 && (
            <button 
              className="mark-all-btn"
              onClick={markAllAsRead}
              disabled={markingAllRead}
              aria-label={`Mark all ${unreadCount} notifications as read`}
            >
              {markingAllRead ? (
                <>
                  <Loader2 className="mark-all-btn__icon mark-all-btn__icon--spinning" aria-hidden="true" />
                  Marking as read...
                </>
              ) : (
                <>
                  <CheckCircle className="mark-all-btn__icon" aria-hidden="true" />
                  Mark All as Read
                </>
              )}
            </button>
          )}
        </section>

        {/* Error State */}
        {error && (
          <div className="error-message" role="alert">
            <AlertCircle className="error-message__icon" aria-hidden="true" />
            <div className="error-message__content">
              <h2 className="error-message__title">Error Loading Notifications</h2>
              <p className="error-message__text">{error}</p>
              <button 
                className="error-message__retry"
                onClick={() => loadNotifications()}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader2 className="loading-spinner" aria-hidden="true" />
            <span className="loading-text">Loading notifications...</span>
          </div>
        )}

        {/* Notifications List */}
        {!loading && !error && (
          <section className="notifications-content" aria-label="Notifications list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell className="empty-state__icon" aria-hidden="true" />
                <h2 className="empty-state__title">No Notifications</h2>
                <p className="empty-state__message">
                  {filter === "all" 
                    ? "You don't have any notifications yet."
                    : filter === "unread"
                    ? "You don't have any unread notifications."
                    : "You don't have any read notifications."
                  }
                </p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map(({ id, title, message, created_at, read }) => (
                  <article 
                    key={id}
                    className={`notification-item ${read ? "notification-item--read" : "notification-item--unread"}`}
                    aria-labelledby={`notification-title-${id}`}
                  >
                    <div className="notification-item__indicator" aria-hidden="true">
                      {read ? (
                        <Check className="notification-item__check" />
                      ) : (
                        <div className="notification-item__dot"></div>
                      )}
                    </div>

                    <div className="notification-item__content">
                      <header className="notification-item__header">
                        <h3 id={`notification-title-${id}`} className="notification-item__title">
                          {title}
                        </h3>
                        <time 
                          className="notification-item__time"
                          dateTime={created_at}
                        >
                          <Calendar className="notification-item__time-icon" aria-hidden="true" />
                          {formatNotificationDate(created_at)}
                        </time>
                      </header>
                      
                      <p className="notification-item__message">{message}</p>
                      
                      {!read && (
                        <div className="notification-item__actions">
                          <button
                            onClick={() => markAsRead(id)}
                            className="mark-read-btn"
                            aria-label={`Mark "${title}" as read`}
                          >
                            <CheckCircle className="mark-read-btn__icon" aria-hidden="true" />
                            Mark as Read
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Load More */}
            {!loading && hasMore && notifications.length > 0 && (
              <div className="load-more-section">
                <button
                  onClick={() => setLimit(limit + 10)}
                  className="load-more-btn"
                  aria-label="Load 10 more notifications"
                >
                  Load More Notifications
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}