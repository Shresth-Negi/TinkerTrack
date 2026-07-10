import { useState } from "react";
import { createBooking } from "../utils/api";

export default function BookingModal({ resource, onClose, onSuccess }) {
  const [form, setForm] = useState({ start_time: "", end_time: "", purpose: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!form.start_time || !form.end_time) {
      setError("Please select both start and end times.");
      return;
    }
    if (new Date(form.start_time) >= new Date(form.end_time)) {
      setError("End time must be after start time.");
      return;
    }

    setLoading(true);
    try {
      await createBooking({
        resource_id: resource.id,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        purpose: form.purpose || null,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Click backdrop to close
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div style={styles.backdrop} onClick={handleBackdropClick}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Book resource</h2>
            <p style={styles.modalSubtitle}>{resource.name}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Success state */}
        {success ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <p style={styles.successText}>Booking confirmed!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Start time</label>
              <input
                style={styles.input}
                type="datetime-local"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>End time</label>
              <input
                style={styles.input}
                type="datetime-local"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Purpose <span style={styles.optional}>(optional)</span></label>
              <input
                style={styles.input}
                type="text"
                name="purpose"
                placeholder="e.g. Study session, Team meeting"
                value={form.purpose}
                onChange={handleChange}
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.modalFooter}>
              <button type="button" style={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                style={{ ...styles.submitBtn, ...(loading ? styles.btnDisabled : {}) }}
                disabled={loading}
              >
                {loading ? "Booking..." : "Confirm booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
    padding: "24px",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "440px",
    padding: "32px",
    fontFamily: "Inter, sans-serif",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f0f0f",
    margin: "0 0 4px 0",
    letterSpacing: "-0.3px",
  },
  modalSubtitle: {
    fontSize: "13px",
    color: "#888888",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "16px",
    color: "#888888",
    cursor: "pointer",
    padding: "4px",
    lineHeight: 1,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#333333",
  },
  optional: {
    color: "#999999",
    fontWeight: "400",
  },
  input: {
    padding: "10px 14px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#0f0f0f",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s ease",
  },
  error: {
    padding: "10px 14px",
    backgroundColor: "#fff5f5",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#dc2626",
  },
  modalFooter: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "4px",
  },
  cancelBtn: {
    padding: "9px 18px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    background: "none",
    fontSize: "13px",
    fontWeight: "500",
    color: "#333333",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  submitBtn: {
    padding: "9px 18px",
    backgroundColor: "#0f0f0f",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.15s ease",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  // Success
  successBox: {
    textAlign: "center",
    padding: "32px 0",
  },
  successIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    fontSize: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  successText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f0f0f",
    margin: 0,
  },
};
