import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Pencil, Camera, X, LoaderCircle } from "lucide-react";

import { getProfile, updateProfile } from "../../../services/profileService";

import { uploadFile } from "../../../services/uploadService";

import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [editing, setEditing] = useState(false);

  const emptyForm = {
    name: "",
    phone: "",
    department: "",
    roll_number: "",
    hostel: "",
    bio: "",
    profile_image: "",
  };

  const [form, setForm] = useState(emptyForm);

  const setProfileForm = (data) => {
    setForm({
      name: data?.name || "",

      phone: data?.phone || "",

      department: data?.department || "",

      roll_number: data?.roll_number || "",

      hostel: data?.hostel || "",

      bio: data?.bio || "",

      profile_image: data?.profile_image || "",
    });
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getProfile();

        if (mounted && data) {
          setProfile(data);

          setProfileForm(data);
        }
      } catch (error) {
        console.error("Profile loading failed:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select image file only");

      return;
    }

    try {
      setUploading(true);

      const url = await uploadFile(file);

      setForm((prev) => ({
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

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await updateProfile(form);

      // Support different backend response formats
      const updated =
        response?.data?.data ||
        response?.data?.user ||
        response?.data ||
        response?.user ||
        response?.profile ||
        response;

      if (!updated) {
        throw new Error("Invalid profile response");
      }

      // Update page state
      setProfile(updated);
      setProfileForm(updated);

      // Update localStorage so Sidebar & Topbar use latest data
      const oldUser = JSON.parse(localStorage.getItem("user") || "{}");

      const newUser = {
        ...oldUser,
        ...updated,
      };

      localStorage.setItem("user", JSON.stringify(newUser));

      // Notify the whole app
      window.dispatchEvent(new Event("userUpdated"));

      setEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileForm(profile);

    setEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-loading-viewport">
        <LoaderCircle className="profile-spin-loader" size={40} />

        <h2>Loading Profile...</h2>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error-viewport">
        <h2>Profile Not Found</h2>

        <p>Unable to load user information.</p>
      </div>
    );
  }

  const avatar =
    form.profile_image ||
    `https://ui-avatars.com/api/?background=4f46e5&color=fff&size=256&name=${encodeURIComponent(
      form.name || "User",
    )}`;

  return (
    <div className="profile-page-container">
      <div className="profile-card-layout">
        {/* HEADER */}

        <div className="profile-top-hero">
          <div className="avatar-composition-box">
            <img src={avatar} alt="profile" className="user-profile-avatar" />

            {editing && (
              <div className="camera-overlay-action">
                <label htmlFor="profileUpload" className="camera-trigger-label">
                  {uploading ? (
                    <LoaderCircle className="spin-inline" size={16} />
                  ) : (
                    <Camera size={16} />
                  )}
                </label>

                <input
                  id="profileUpload"
                  type="file"
                  hidden
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleUpload}
                />
              </div>
            )}
          </div>

          <div className="profile-identity-meta">
            <h2>{profile.name || "Student"}</h2>

            <p className="meta-email">{profile.email}</p>

            <span className="role-security-badge">
              {profile.role
                ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                : "Student"}
            </span>
          </div>

          <div className="profile-action-header-cta">
            {!editing ? (
              <button
                className="edit-toggle-btn"
                onClick={() => setEditing(true)}
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            ) : (
              <button
                className="cancel-toggle-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={15} />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* FORM */}

        <form className="profile-form-body" onSubmit={handleSave}>
          <div className="form-fields-grid">
            {[
              ["name", "Full Name"],

              ["phone", "Contact Number"],

              ["department", "Department"],

              ["roll_number", "Roll Number"],

              ["hostel", "Hostel"],
            ].map(([key, label]) => (
              <div className="field-group-cell" key={key}>
                <label>{label}</label>

                <input
                  name={key}
                  value={form[key]}
                  disabled={!editing || saving}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="field-group-cell grid-span-full">
              <label>Bio</label>

              <textarea
                name="bio"
                rows="4"
                value={form.bio}
                disabled={!editing || saving}
                onChange={handleChange}
              />
            </div>
          </div>

          {editing && (
            <div className="form-persistence-actions-bar">
              <button
                className="save-submit-btn"
                disabled={saving || uploading}
              >
                {saving ? (
                  <>
                    <LoaderCircle size={16} className="spin-inline" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Profile;
