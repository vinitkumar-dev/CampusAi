import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  BadgeCheck,
  Save,
  Loader2,
} from "lucide-react";

import { getProfile, updateProfile } from "../../../services/profileService";
import "./StaffProfile.css";

function StaffProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      const data = response?.data || response || {};

      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        department: data.department || "",
        // Fallback to role since 'designation' is not present in payload
        designation: data.role ? data.role.toUpperCase() : "STAFF",
      });
    } catch (err) {
      console.error("Failed to load staff profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      // Update profile
      await updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
      });

      // Fetch latest profile from backend
      const response = await getProfile();
      const updatedData = response?.data || response || {};

      const newProfileState = {
        name: updatedData.name || "",
        email: updatedData.email || "",
        phone: updatedData.phone || "",
        department: updatedData.department || "",
        designation: updatedData.role
          ? updatedData.role.toUpperCase()
          : "STAFF",
      };

      setProfile(newProfileState);

      // Update localStorage so Topbar & Sidebar refresh
      const oldUser = JSON.parse(localStorage.getItem("user")) || {};
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          ...updatedData,
        }),
      );

      // Notify other components
      window.dispatchEvent(new Event("userUpdated"));

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to save profile changes:", err);
      alert("Unable to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-viewport">
        <Loader2 size={40} className="profile-spin-loader" />
        <h3>Loading profile...</h3>
      </div>
    );
  }

  return (
    <div className="staff-profile-page-root-viewport">
      <div className="profile-containment-card">
        {/* Profile Avatar Header */}
        <div className="profile-identity-header">
          <div className="profile-avatar-large-badge">
            <span>{profile.name?.charAt(0).toUpperCase() || "?"}</span>
          </div>

          <div className="profile-identity-meta-stack">
            <h2>{profile.name || "Staff Member"}</h2>
            <p>{profile.designation}</p>
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="profile-fields-interactive-grid">
          <div className="profile-input-group-field">
            <label htmlFor="field-name">
              <User size={15} />
              <span>Full Name</span>
            </label>
            <input
              id="field-name"
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="profile-input-group-field">
            <label htmlFor="field-email">
              <Mail size={15} />
              <span>Email Address</span>
            </label>
            <input
              id="field-email"
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="yourname@campus.edu"
            />
          </div>

          <div className="profile-input-group-field">
            <label htmlFor="field-phone">
              <Phone size={15} />
              <span>Phone Number</span>
            </label>
            <input
              id="field-phone"
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="profile-input-group-field">
            <label htmlFor="field-department">
              <Building2 size={15} />
              <span>Assigned Department</span>
            </label>
            <input
              id="field-department"
              type="text"
              name="department"
              value={profile.department}
              onChange={handleChange}
              placeholder="e.g., Electricity, Water"
            />
          </div>

          <div className="profile-input-group-field layout-span-full">
            <label htmlFor="field-designation">
              <BadgeCheck size={15} />
              <span>Account Role</span>
            </label>
            <input
              id="field-designation"
              type="text"
              name="designation"
              value={profile.designation}
              disabled
              style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="profile-actions-commit-strip">
          <button
            type="button"
            className="profile-save-action-trigger-btn"
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={15} className="profile-spin-loader" />
            ) : (
              <Save size={15} />
            )}
            <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaffProfile;
