import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Camera,
  Save,
  Loader2,
} from "lucide-react";

import { getProfile, updateProfile } from "../../../services/profileService";
import { uploadFile } from "../../../services/uploadService";

import "./AdminProfile.css";

function AdminProfile() {
  const initialState = {
    name: "",
    email: "",
    phone: "",
    department: "",
    bio: "",
    profile_image: "",
  };

  const [profile, setProfile] = useState(initialState);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const data = await getProfile();

      const profileData = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        department: data.department || "",
        bio: data.bio || "",
        profile_image: data.profile_image || "",
        role: data.role,
        id: data.id,
      };

      setProfile(profileData);

      // Keep localStorage in sync
      localStorage.setItem("user", JSON.stringify(profileData));

      window.dispatchEvent(new Event("userUpdated"));
    } catch (error) {
      console.error("Profile loading failed:", error);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");

      return;
    }

    try {
      setUploading(true);

      const url = await uploadFile(file);

      setProfile((prev) => ({
        ...prev,

        profile_image: url,
      }));
    } catch (error) {
      console.error("Image upload failed:", error);

      alert("Image upload failed");
    } finally {
      setUploading(false);

      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const updated = await updateProfile(profile);

      const updatedProfile = {
        ...profile,
        ...updated,
      };

      setProfile(updatedProfile);

      // Update localStorage so Sidebar & Topbar get latest data
      const existingUser = JSON.parse(localStorage.getItem("user")) || {};

      const newUser = {
        ...existingUser,
        ...updatedProfile,
      };

      localStorage.setItem("user", JSON.stringify(newUser));

      // Notify other components in the same tab
      window.dispatchEvent(new Event("userUpdated"));

      alert("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);

      alert(error?.response?.data?.message || "Profile update failed");
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
    <div className="admin-profile-root-viewport">
      <form className="profile-composite-card" onSubmit={handleSubmit}>
        {/* PROFILE IMAGE */}

        <div className="profile-avatar-node-section">
          <div className="profile-avatar-bounding-shield">
            {profile.profile_image ? (
              <img src={profile.profile_image} alt="Profile" />
            ) : (
              <User size={42} className="avatar-fallback-decor-icon" />
            )}
          </div>

          <label className="avatar-upload-trigger-btn">
            {uploading ? (
              <Loader2 size={14} className="profile-spin-loader" />
            ) : (
              <Camera size={14} />
            )}

            <span>Change Photo</span>

            <input
              type="file"
              hidden
              accept="image/*"
              disabled={uploading}
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {/* FORM GRID */}

        <div className="profile-telemetry-grid">
          <div className="telemetry-form-group">
            <label className="form-group-label-string">
              <User size={15} />
              Full Name
            </label>

            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="telemetry-interactive-input"
              required
            />
          </div>

          <div className="telemetry-form-group field-disabled">
            <label className="form-group-label-string">
              <Mail size={15} />
              Email
            </label>

            <input
              value={profile.email}
              disabled
              className="telemetry-interactive-input"
            />
          </div>

          <div className="telemetry-form-group">
            <label className="form-group-label-string">
              <Phone size={15} />
              Phone
            </label>

            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="telemetry-interactive-input"
            />
          </div>

          <div className="telemetry-form-group">
            <label className="form-group-label-string">
              <Building2 size={15} />
              Department
            </label>

            <input
              name="department"
              value={profile.department}
              onChange={handleChange}
              className="telemetry-interactive-input"
            />
          </div>
        </div>

        <div className="telemetry-form-group full-width-span">
          <label className="form-group-label-string">Bio</label>

          <textarea
            name="bio"
            rows="5"
            value={profile.bio}
            onChange={handleChange}
            className="telemetry-interactive-textarea"
          />
        </div>

        <div className="profile-control-commit-strip">
          <button
            type="submit"
            className="profile-save-trigger-btn"
            disabled={saving || uploading}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="profile-spin-loader" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminProfile;
