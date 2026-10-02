import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCircle2, Loader2, RefreshCcw, BellOff } from "lucide-react";

import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
} from "../../../services/notificationService";

import Loader from "../../../components/common/Loader/Loader";
import "./Notifications.css";
import { formatIndianDateTime } from "../../../utils/dateUtils";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadNotifications = useCallback(async () => {
    try {
      const [list, unreadCount] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);

      setNotifications(Array.isArray(list) ? list : []);
      setUnread(Number(unreadCount) || 0);
    } catch (error) {
      console.error("Notification loading failed:", error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialLoad = async () => {
      setLoading(true);

      await loadNotifications();

      if (mounted) {
        setLoading(false);
      }
    };

    initialLoad();

    // Auto refresh every 5 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [loadNotifications]);

  const handleRefresh = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      await loadNotifications();
    } finally {
      setRefreshing(false);
    }
  };

  const markRead = async (id) => {
    if (processingId) return;

    try {
      setProcessingId(id);

      await markNotificationRead(id);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );

      setUnread((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Mark read failed:", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Loader text="Loading notifications..." />;
  }

  return (
    <div className="notifications-page-container">
      <div className="notification-dashboard-header">
        <div className="header-meta-group">
          <h1>Notifications</h1>

          <p className="unread-counter-badge">
            {unread} unread notification{unread !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          className="refresh-sync-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCcw
            size={15}
            className={refreshing ? "global-feed-spin" : ""}
          />

          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <div className="notifications-feed-body">
        {notifications.length === 0 ? (
          <div className="empty-notification-viewport">
            <BellOff size={36} />

            <h3>No Notifications</h3>

            <p>You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="notifications-stack-layout">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`notification-item-card ${
                  item.isRead ? "is-read" : "is-unread"
                }`}
              >
                <div className="notification-status-indicator-col">
                  <div className="badge-bullet-icon">
                    <Bell size={16} />
                  </div>
                </div>

                <div className="notification-payload-content-col">
                  <h4>{item.title}</h4>

                  <p>{item.message}</p>

                  {item.createdAt && (
                    <span>{formatIndianDateTime(item.createdAt)}</span>
                  )}
                </div>

                <div className="notification-interactive-actions-col">
                  {!item.isRead && (
                    <button
                      type="button"
                      disabled={processingId === item.id}
                      onClick={() => markRead(item.id)}
                      className="commit-read-action-btn"
                    >
                      {processingId === item.id ? (
                        <>
                          <Loader2 size={14} className="global-feed-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          Mark Read
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
