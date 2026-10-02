import { useEffect } from "react";
import { LogOut } from "lucide-react";

import "./LogoutModal.css";

function LogoutModal({ open, onCancel, onConfirm }) {
  // Handle Escape key to close the modal
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling when modal is active
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="logout-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="logout-card" onClick={(e) => e.stopPropagation()}>
        <div className="logout-icon-box">
          <LogOut size={22} />
        </div>

        <h2 id="modal-title">Confirm Logout</h2>
        <p>Are you sure you want to log out of CampusAI?</p>

        <div className="logout-buttons">
          <button type="button" className="logout-cancel" onClick={onCancel}>
            Cancel
          </button>

          <button type="button" className="logout-confirm" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
