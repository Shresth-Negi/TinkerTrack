import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getMyBookings, cancelBooking } from "../utils/api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);


  useEffect(() => {
    const controller = new AbortController();

    async function loadBookings() {
      try {
        const data = await getMyBookings();
        if (!controller.signal.aborted) {
          setBookings(data);
          setError("");
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "Failed to load bookings.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => controller.abort(); // cleanup on unmount
  }, []);

  async function handleCancel(bookingId) {
    if (!confirm("Cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b)
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  function formatDate(isoString) {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const activeBookings = bookings.filter((b) => b.status === "active");
  const pastBookings = bookings.filter((b) => b.status === "cancelled");

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Bookings</h1>
          <p style={styles.subtitle}>View and manage your reservations.</p>
        </div>

        {loading && (
          <div style={styles.loadingList}>
            {[1, 2, 3].map((i) => <div key={i} style={styles.skeletonRow} />)}
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📅</div>
            <p style={styles.emptyTitle}>No bookings yet</p>
            <p style={styles.emptyText}>Head to Resources to make your first booking.</p>
          </div>
        )}

        {!loading && activeBookings.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Active ({activeBookings.length})</h2>
            <div style={styles.list}>
              {activeBookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  formatDate={formatDate}
                  onCancel={handleCancel}
                  cancelling={cancellingId === booking.id}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && pastBookings.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Cancelled ({pastBookings.length})</h2>
            <div style={styles.list}>
              {pastBookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  formatDate={formatDate}
                  onCancel={null}
                  cancelling={false}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function BookingRow({ booking, formatDate, onCancel, cancelling }) {
  const isActive = booking.status === "active";

  return (
    <div style={styles.row}>
      <div style={styles.rowLeft}>
        <div style={{
          ...styles.dot,
          backgroundColor: isActive ? "#16a34a" : "#d1d5db",
        }} />
        <div>
          <div style={styles.rowTitle}>Resource #{booking.resource_id}</div>
          <div style={styles.rowTime}>
            {formatDate(booking.start_time)} → {formatDate(booking.end_time)}
          </div>
          {booking.purpose && (
            <div style={styles.rowPurpose}>{booking.purpose}</div>
          )}
        </div>
      </div>

      <div style={styles.rowRight}>
        <span style={{
          ...styles.statusBadge,
          backgroundColor: isActive ? "#f0fdf4" : "#f5f5f5",
          color: isActive ? "#16a34a" : "#888888",
        }}>
          {booking.status}
        </span>
        {isActive && onCancel && (
          <button
            style={{ ...styles.cancelBtn, ...(cancelling ? styles.btnDisabled : {}) }}
            onClick={() => onCancel(booking.id)}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
    fontFamily: "Inter, -apple-system, sans-serif",
  },
  main: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "48px 24px",
  },
  header: { marginBottom: "36px" },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f0f0f",
    letterSpacing: "-0.4px",
    margin: "0 0 8px 0",
  },
  subtitle: { fontSize: "14px", color: "#666666", margin: 0 },
  loadingList: { display: "flex", flexDirection: "column", gap: "10px" },
  skeletonRow: { height: "72px", borderRadius: "10px", backgroundColor: "#e5e5e5" },
  section: { marginBottom: "40px" },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#888888",
    margin: "0 0 12px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "10px",
    padding: "16px 20px",
    gap: "16px",
  },
  rowLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    flex: 1,
    minWidth: 0,
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginTop: "5px",
    flexShrink: 0,
  },
  rowTitle: { fontSize: "14px", fontWeight: "600", color: "#0f0f0f", marginBottom: "3px" },
  rowTime: { fontSize: "12px", color: "#666666", marginBottom: "2px" },
  rowPurpose: { fontSize: "12px", color: "#888888", fontStyle: "italic" },
  rowRight: { display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "999px",
    textTransform: "capitalize",
  },
  cancelBtn: {
    padding: "5px 12px",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    background: "#fff5f5",
    fontSize: "12px",
    fontWeight: "500",
    color: "#dc2626",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.15s ease",
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  error: {
    padding: "16px",
    backgroundColor: "#fff5f5",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "14px",
  },
  empty: { textAlign: "center", padding: "80px 0" },
  emptyIcon: { fontSize: "40px", marginBottom: "12px" },
  emptyTitle: { fontSize: "16px", fontWeight: "600", color: "#0f0f0f", marginBottom: "6px" },
  emptyText: { fontSize: "13px", color: "#888888", margin: 0 },
};
