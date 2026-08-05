import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Lock,
  Bell,
  Cpu,
  Save,
  Loader2,
} from "lucide-react";

import "./Settings.css";
import {
  getSettings,
  updateSettings,
  changePassword,
} from "../../../services/settingsService";

function Settings() {
  const [form, setForm] = useState({
    aiEnabled: false,
    notification: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await getSettings();
      // Handle response or nested response.data safely
      const settings = response?.data || response || {};

      setForm({
        aiEnabled: Boolean(settings.aiEnabled),
        notification: Boolean(settings.notification),
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
      setForm({ aiEnabled: false, notification: false });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, checked, type, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await updateSettings({
        aiEnabled: form.aiEnabled,
        notification: form.notification,
      });
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Save settings error:", error);
      alert("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.old_password || !passwordForm.new_password) {
      alert("Please fill in both password fields.");
      return;
    }

    try {
      await changePassword(passwordForm);
      alert("Password updated successfully!");
      setShowPasswordModal(false);
      setPasswordForm({
        old_password: "",
        new_password: "",
      });
    } catch (error) {
      console.error("Password update error:", error);
      alert("Failed to update password. Please try again.");
    }
  };

  if (loading) {
    return (
      <div
        className="admin-settings-page-root-viewport"
        style={{ display: "flex", gap: "10px", alignItems: "center" }}
      >
        <Loader2 className="animate-spin" size={20} />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="admin-settings-page-root-viewport">
      {/* Header Panel */}
      <div className="settings-header-panel">
        <div className="panel-identity-stack">
          <h1>System Settings</h1>
          <p>
            Manage AI features, automated notifications, and account security
            parameters
          </p>
        </div>
        <div className="settings-header-accent-icon">
          <SettingsIcon size={24} />
        </div>
      </div>

      <div className="settings-cards-stack-container">
        {/* Security Settings Card */}
        <div className="settings-composite-card">
          <div className="card-identity-title-row">
            <Lock size={18} />
            <h2>Account Security</h2>
          </div>
          <div className="card-action-content-block">
            <p className="setting-description-fallback">
              Update your password regularly to keep your administrator access
              secure.
            </p>
            <button
              type="button"
              className="change-password-trigger-btn"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Account Password
            </button>
          </div>
        </div>
        {/* 
        AI Features Card
        <div className="settings-composite-card">
          <div className="card-identity-title-row">
            <Cpu size={18} />
            <h2>AI Assistant Settings</h2>
          </div>
          <div className="toggle-telemetry-row">
            <div className="toggle-meta-strings">
              <h3>Auto-Categorize Complaints</h3>
              <p>
                Use AI to read, sort, and tag student complaints automatically
                when they arrive.
              </p>
            </div>
            <label className="switch-toggle-wrapper">
              <input
                type="checkbox"
                name="aiEnabled"
                checked={form.aiEnabled}
                onChange={handleChange}
              />
              <span className="switch-slider-element" />
            </label>
          </div>
        </div> */}

        {/* Notifications Card */}
        {/* <div className="settings-composite-card">
          <div className="card-identity-title-row">
            <Bell size={18} />
            <h2>Notification Channels</h2>
          </div>
          <div className="toggle-telemetry-row">
            <div className="toggle-meta-strings">
              <h3>Email Alerts for Urgent Cases</h3>
              <p>
                Send automatic email updates to department heads whenever an
                urgent ticket is raised.
              </p>
            </div>
            <label className="switch-toggle-wrapper">
              <input
                type="checkbox"
                name="notification"
                checked={form.notification}
                onChange={handleChange}
              />
              <span className="switch-slider-element" />
            </label>
          </div>
        </div> */}
      </div>

      {/* Save Action Bar */}
      {/* <div className="settings-control-commit-strip">
        <button
          type="button"
          className="settings-save-trigger-btn"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Save size={14} />
          )}
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </div> */}

      {/* Change Password Dialog Modal */}
      {showPasswordModal && (
        <div
          className="assign-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="assign-modal"
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <h3 style={{ margin: "0 0 1.5rem 0" }}>Update Password</h3>
            <form
              onSubmit={handleUpdatePassword}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <label style={{ fontSize: "0.85rem", fontWeight: "500" }}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="old_password"
                  value={passwordForm.old_password}
                  onChange={handlePasswordChange}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                  }}
                  required
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <label style={{ fontSize: "0.85rem", fontWeight: "500" }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                  }}
                  required
                />
              </div>
              <div
                className="modal-actions-wrapper"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.5rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ oldPassword: "", newPassword: "" });
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit-btn"
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    border: "none",
                    background: "#3b82f6",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
