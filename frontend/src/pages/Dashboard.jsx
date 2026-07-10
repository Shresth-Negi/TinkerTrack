import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../utils/AuthContext";
import { getResources, getMyBookings } from "../utils/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ resources: 0, activeBookings: 0, totalBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [resources, bookings] = await Promise.all([
          getResources(),
          getMyBookings(),
        ]);
        setStats({
          resources: resources.length,
          activeBookings: bookings.filter((b) => b.status === "active").length,
          totalBookings: bookings.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: "Available resources", value: stats.resources, path: "/resources" },
    { label: "Active bookings", value: stats.activeBookings, path: "/my-bookings" },
    { label: "Total bookings", value: stats.totalBookings, path: "/my-bookings" },
  ];

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        {/* Welcome section */}
        <div style={styles.welcome}>
          <h1 style={styles.greeting}>Good to see you, {user?.name?.split(" ")[0]}.</h1>
          <p style={styles.subtext}>Book a resource or check your upcoming reservations.</p>
        </div>

        {/* Stats row */}
        {loading ? (
          <div style={styles.loadingRow}>
            {[1, 2, 3].map((i) => <div key={i} style={styles.skeletonCard} />)}
          </div>
        ) : (
          <div style={styles.statsRow}>
            {statCards.map((card) => (
              <div
                key={card.label}
                style={styles.statCard}
                onClick={() => navigate(card.path)}
              >
                <span style={styles.statValue}>{card.value}</span>
                <span style={styles.statLabel}>{card.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick actions</h2>
          <div style={styles.actionsRow}>
            <div style={styles.actionCard} onClick={() => navigate("/resources")}>
              <div style={styles.actionIcon}>🏠</div>
              <div>
                <div style={styles.actionTitle}>Browse resources</div>
                <div style={styles.actionDesc}>Find and book available spaces</div>
              </div>
            </div>
            <div style={styles.actionCard} onClick={() => navigate("/my-bookings")}>
              <div style={styles.actionIcon}>📋</div>
              <div>
                <div style={styles.actionTitle}>My bookings</div>
                <div style={styles.actionDesc}>View and manage your reservations</div>
              </div>
            </div>
            {user?.role === "admin" && (
              <div style={styles.actionCard} onClick={() => navigate("/admin")}>
                <div style={styles.actionIcon}>⚙️</div>
                <div>
                  <div style={styles.actionTitle}>Admin panel</div>
                  <div style={styles.actionDesc}>Manage resources and bookings</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
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
    maxWidth: "960px",
    margin: "0 auto",
    padding: "48px 24px",
  },
  welcome: {
    marginBottom: "40px",
  },
  greeting: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f0f0f",
    letterSpacing: "-0.5px",
    margin: "0 0 8px 0",
  },
  subtext: {
    fontSize: "15px",
    color: "#666666",
    margin: 0,
  },

  // Stats
  loadingRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "48px",
  },
  skeletonCard: {
    height: "96px",
    borderRadius: "12px",
    backgroundColor: "#e5e5e5",
    animation: "pulse 1.5s infinite",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "48px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    padding: "24px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    transition: "border-color 0.15s ease",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#0f0f0f",
    letterSpacing: "-1px",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "13px",
    color: "#888888",
  },

  // Actions
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f0f0f",
    margin: "0 0 16px 0",
  },
  actionsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "12px",
  },
  actionCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer",
    transition: "border-color 0.15s ease",
  },
  actionIcon: {
    fontSize: "24px",
    flexShrink: 0,
  },
  actionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f0f0f",
    marginBottom: "2px",
  },
  actionDesc: {
    fontSize: "12px",
    color: "#888888",
  },
};
