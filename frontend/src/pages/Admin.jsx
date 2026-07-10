import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getResources, createResource, deleteResource, toggleAvailability, getAllBookings } from "../utils/api";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["room", "equipment", "lab", "sports", "other"];

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resources");

  const [form, setForm] = useState({ name: "", description: "", category: "other", location: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Fix 1: added navigate to dependency array
  useEffect(() => {
    if (user && user.role !== "admin") navigate("/dashboard");
  }, [user, navigate]);

  // Fix 2: AbortController for loadData
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const [r, b] = await Promise.all([getResources(), getAllBookings()]);
        if (!controller.signal.aborted) {
          setResources(r);
          setBookings(b);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => controller.abort(); // cleanup on unmount
  }, []);

  async function handleCreateResource(e) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const newResource = await createResource(form);
      setResources((prev) => [newResource, ...prev]);
      setForm({ name: "", description: "", category: "other", location: "" });
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 2000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this resource? This cannot be undone.")) return;
    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleToggle(id) {
    try {
      await toggleAvailability(id);
      setResources((prev) =>
        prev.map((r) => r.id === id ? { ...r, is_available: !r.is_available } : r)
      );
    } catch (err) {
      alert(err.message);
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Panel</h1>
          <p style={styles.subtitle}>Manage resources and monitor bookings.</p>
        </div>

        <div style={styles.tabs}>
          {["resources", "bookings"].map((tab) => (
            <button
              key={tab}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span style={styles.tabCount}>
                {tab === "resources" ? resources.length : bookings.length}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "resources" && (
          <div>
            <div style={styles.formCard}>
              <h2 style={styles.formTitle}>Add new resource</h2>
              <form onSubmit={handleCreateResource} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Name *</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Conference Room A"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Category</label>
                    <select
                      style={styles.input}
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Location</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Building 2, Room 101"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Description</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Seats 10 people, has projector"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                </div>
                {formError && <div style={styles.error}>{formError}</div>}
                {formSuccess && <div style={styles.success}>Resource added successfully!</div>}
                <button
                  type="submit"
                  style={{ ...styles.addBtn, ...(formLoading ? styles.btnDisabled : {}) }}
                  disabled={formLoading}
                >
                  {formLoading ? "Adding..." : "Add resource"}
                </button>
              </form>
            </div>

            {loading ? (
              <div style={styles.skeletonList}>
                {[1, 2, 3].map((i) => <div key={i} style={styles.skeletonRow} />)}
              </div>
            ) : (
              <div style={styles.list}>
                {resources.map((resource) => (
                  <div key={resource.id} style={styles.resourceRow}>
                    <div style={styles.resourceInfo}>
                      <div style={styles.resourceName}>{resource.name}</div>
                      <div style={styles.resourceMeta}>
                        {resource.category} {resource.location && `· ${resource.location}`}
                      </div>
                    </div>
                    <div style={styles.resourceActions}>
                      <span style={{
                        ...styles.availBadge,
                        backgroundColor: resource.is_available ? "#f0fdf4" : "#fff5f5",
                        color: resource.is_available ? "#16a34a" : "#dc2626",
                      }}>
                        {resource.is_available ? "Available" : "Unavailable"}
                      </span>
                      <button style={styles.toggleBtn} onClick={() => handleToggle(resource.id)}>
                        Toggle
                      </button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(resource.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div style={styles.list}>
            {loading ? (
              [1, 2, 3].map((i) => <div key={i} style={styles.skeletonRow} />)
            ) : bookings.length === 0 ? (
              <div style={styles.empty}>No bookings yet.</div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} style={styles.bookingRow}>
                  <div>
                    <div style={styles.resourceName}>
                      Booking #{booking.id} — Resource #{booking.resource_id}
                    </div>
                    <div style={styles.resourceMeta}>
                      User #{booking.user_id} · {formatDate(booking.start_time)} → {formatDate(booking.end_time)}
                    </div>
                    {booking.purpose && (
                      <div style={styles.purpose}>{booking.purpose}</div>
                    )}
                  </div>
                  <span style={{
                    ...styles.availBadge,
                    backgroundColor: booking.status === "active" ? "#f0fdf4" : "#f5f5f5",
                    color: booking.status === "active" ? "#16a34a" : "#888888",
                  }}>
                    {booking.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#fafafa", fontFamily: "Inter, -apple-system, sans-serif" },
  main: { maxWidth: "960px", margin: "0 auto", padding: "48px 24px" },
  header: { marginBottom: "32px" },
  title: { fontSize: "28px", fontWeight: "700", color: "#0f0f0f", letterSpacing: "-0.4px", margin: "0 0 8px 0" },
  subtitle: { fontSize: "14px", color: "#666666", margin: 0 },
  tabs: { display: "flex", gap: "4px", borderBottom: "1px solid #e5e5e5", marginBottom: "28px" },
  tab: {
    padding: "10px 16px", border: "none", background: "none", fontSize: "14px",
    fontWeight: "500", color: "#888888", cursor: "pointer", borderBottom: "2px solid transparent",
    marginBottom: "-1px", fontFamily: "inherit", display: "flex", alignItems: "center",
    gap: "8px", transition: "all 0.15s ease",
  },
  tabActive: { color: "#0f0f0f", borderBottomColor: "#0f0f0f" },
  tabCount: { fontSize: "11px", backgroundColor: "#f0f0f0", color: "#666666", padding: "1px 6px", borderRadius: "999px" },
  formCard: { backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "24px", marginBottom: "24px" },
  formTitle: { fontSize: "15px", fontWeight: "600", color: "#0f0f0f", margin: "0 0 20px 0" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "500", color: "#333333" },
  input: { padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "13px", color: "#0f0f0f", outline: "none", fontFamily: "inherit", backgroundColor: "#ffffff" },
  addBtn: { alignSelf: "flex-start", padding: "9px 20px", backgroundColor: "#0f0f0f", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  error: { padding: "10px 14px", backgroundColor: "#fff5f5", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#dc2626" },
  success: { padding: "10px 14px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", fontSize: "13px", color: "#16a34a" },
  skeletonList: { display: "flex", flexDirection: "column", gap: "8px" },
  skeletonRow: { height: "64px", borderRadius: "10px", backgroundColor: "#e5e5e5" },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  resourceRow: { display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "10px", padding: "14px 20px", gap: "16px" },
  resourceInfo: { flex: 1, minWidth: 0 },
  resourceName: { fontSize: "14px", fontWeight: "600", color: "#0f0f0f", marginBottom: "3px" },
  resourceMeta: { fontSize: "12px", color: "#888888", textTransform: "capitalize" },
  resourceActions: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 },
  availBadge: { fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "999px" },
  toggleBtn: { padding: "5px 12px", border: "1px solid #e0e0e0", borderRadius: "6px", background: "none", fontSize: "12px", fontWeight: "500", color: "#333333", cursor: "pointer", fontFamily: "inherit" },
  deleteBtn: { padding: "5px 12px", border: "1px solid #fecaca", borderRadius: "6px", background: "#fff5f5", fontSize: "12px", fontWeight: "500", color: "#dc2626", cursor: "pointer", fontFamily: "inherit" },
  bookingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "10px", padding: "14px 20px", gap: "16px" },
  purpose: { fontSize: "12px", color: "#888", fontStyle: "italic", marginTop: "2px" },
  empty: { textAlign: "center", padding: "48px", color: "#888888", fontSize: "14px" },
};
