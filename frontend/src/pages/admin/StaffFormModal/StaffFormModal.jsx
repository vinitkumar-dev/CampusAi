import React from "react";
import "./StaffFormModal.css";

function StaffFormModal({
  open,
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  saving,
  isEdit = false,
}) {
  if (!open) return null;

  return (
    <div className="staff-modal-overlay">
      <form className="staff-modal" onSubmit={onSubmit}>
        <h2>{title}</h2>

        <div className="form-group">
          <label>Full Name *</label>

          <input
            required
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Email *</label>

          <input
            required
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />
        </div>

        {!isEdit && (
          <div className="form-group">
            <label>Password *</label>

            <input
              required
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </div>
        )}

        <div className="form-group">
          <label>Phone</label>

          <input
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Department</label>

          <input
            value={form.department}
            onChange={(e) =>
              setForm({
                ...form,
                department: e.target.value,
              })
            }
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="modal-btn-save" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Staff" : "Create Staff"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StaffFormModal;
