import { useEffect, useState } from "react";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building2,
  Loader2,
  Users2,
} from "lucide-react";

import {
  createStaff,
  updateStaff,
  getStaffList,
  deleteStaff,
} from "../../../services/adminService";
import StaffFormModal from "../StaffFormModal/StaffFormModal"; // Path to your new modal component

import "./AdminStaff.css";

function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal Visibility States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Single source of truth for form data
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
  });

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaffList();
      const list = Array.isArray(data) ? data : data?.data || [];
      setStaff(list);
      setFiltered(list);
    } catch (err) {
      console.error("Failed loading staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    const value = search.toLowerCase().trim();
    if (!value) {
      setFiltered(staff);
      return;
    }

    const result = staff.filter(
      (item) =>
        item.name?.toLowerCase().includes(value) ||
        item.email?.toLowerCase().includes(value) ||
        item.department?.toLowerCase().includes(value),
    );

    setFiltered(result);
  }, [search, staff]);

  // Open Edit Modal & Hydrate Form Data
  const openEditModal = (member) => {
    setEditingStaffId(member.id);
    setForm({
      name: member.name || "",
      email: member.email || "",
      password: "", // Keep blank for security during edits
      phone: member.phone || "",
      department: member.department || "",
    });
    setShowEditModal(true);
  };

  // Safe reset utility when closing modals
  const resetFormAndClose = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      department: "",
    });
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingStaffId(null);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      alert("Name, Email and Password are required.");
      return;
    }

    try {
      setSaving(true);
      const response = await createStaff(form);

      if (!response.success) {
        alert(response.message || "Failed to create staff.");
        return;
      }

      alert(response.message || "Staff created successfully.");
      await loadStaff();
      resetFormAndClose();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Unable to create staff. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const response = await updateStaff(editingStaffId, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        department: form.department,
      });

      if (!response.success) {
        alert(response.message || "Failed to update staff.");
        return;
      }

      alert("Staff updated successfully.");
      await loadStaff();
      resetFormAndClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update staff.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this staff member?",
    );
    if (!ok) return;

    try {
      await deleteStaff(id);
      setStaff((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete staff.");
    }
  };

  if (loading) {
    return (
      <div className="staff-loading-viewport">
        <Loader2 size={40} className="staff-spin-loader" />
        <h3>Hydrating staff registry directory...</h3>
      </div>
    );
  }

  return (
    <div className="admin-staff-page-root-viewport">
      {/* Upper Framework Identity Header Panel */}
      <div className="staff-identity-panel">
        <div className="identity-meta-stack">
          <h1>Staff Directory Management</h1>
          <p>
            Allocate administrative profiles, look up service divisions, and
            modify permissions
          </p>
        </div>

        <button
          type="button"
          className="staff-add-trigger-btn"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={14} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Filter and Telemetry Controls */}
      <div className="staff-telemetry-controls-strip">
        <div className="staff-search-input-field-wrapper">
          <Search size={16} className="search-decorator-icon" />
          <input
            type="text"
            className="staff-interactive-search-input"
            placeholder="Search operator registry by name, email, or department node..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Grid Viewport System */}
      {filtered.length > 0 ? (
        <div className="staff-allocation-cards-grid">
          {filtered.map((member) => (
            <div key={member.id} className="staff-profile-node-card">
              <div className="staff-avatar-initials-badge">
                <span>{member.name?.charAt(0).toUpperCase() || "?"}</span>
              </div>

              <div className="staff-meta-identity-block">
                <h3>{member.name || "Unnamed Operator"}</h3>
                <span className="staff-functional-role-tag">
                  {member.role || "Staff Operator"}
                </span>
              </div>

              <div className="staff-contact-telemetry-stack">
                <div className="telemetry-item-row">
                  <Mail size={14} />
                  <span title={member.email}>
                    {member.email || "No email assigned"}
                  </span>
                </div>

                <div className="telemetry-item-row">
                  <Phone size={14} />
                  <span>{member.phone || "No phone route"}</span>
                </div>

                <div className="telemetry-item-row">
                  <Building2 size={14} />
                  <span>{member.department || "Unassigned Node"}</span>
                </div>
              </div>

              <div className="staff-actions-commit-row">
                <button
                  type="button"
                  className="action-pill-btn variant-edit"
                  onClick={() => openEditModal(member)}
                >
                  <Edit size={13} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  className="action-pill-btn variant-delete"
                  onClick={() => handleDelete(member.id)}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="staff-empty-intercept-viewport">
          <div className="intercept-alignment-shield">
            <Users2 size={38} className="intercept-icon-decor" />
            <h4>No Operators Found</h4>
            <p>
              Your directory lookup criteria didn't match any index entries in
              our registers.
            </p>
          </div>
        </div>
      )}

      {/* Reusable Modal for ADDING Staff */}
      <StaffFormModal
        open={showAddModal}
        title="Add Staff Member"
        form={form}
        setForm={setForm}
        onSubmit={handleCreateStaff}
        onClose={resetFormAndClose}
        saving={saving}
        isEdit={false}
      />

      {/* Reusable Modal for EDITING Staff */}
      <StaffFormModal
        open={showEditModal}
        title="Edit Staff Member"
        form={form}
        setForm={setForm}
        onSubmit={handleUpdateStaff}
        onClose={resetFormAndClose}
        saving={saving}
        isEdit={true}
      />
    </div>
  );
}

export default AdminStaff;
