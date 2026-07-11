import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getResources, getAllBookings } from "../utils/api";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== "admin") navigate("/dashboard");
  }, [user, navigate]);

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
        if (!controller.signal.aborted) console.error(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, []);

  // --- Compute stats ---
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status === "active").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
  const cancellationRate = totalBookings
    ? Math.round((cancelledBookings / totalBookings) * 100)
    : 0;
  const totalResources = resources.length;
  const availableResources = resources.filter((r) => r.is_available).length;

  // Most booked resources
  const bookingCounts = {};
  bookings.forEach((b) => {
    bookingCounts[b.resource_id] = (bookingCounts[b.resource_id] || 0) + 1;
  });
  const mostBooked = resources
    .map((r) => ({ ...r, count: bookingCounts[r.id] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Bookings by category
  const categoryCount = {};
  bookings.forEach((b) => {
    const resource = resources.find((r) => r.id === b.resource_id);
    if (resource) {
      categoryCount[resource.category] = (categoryCount[resource.category] || 0) + 1;
    }
  });
  const categoryData = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = Math.max(...categoryData.map(([, v]) => v), 1);

  // Bookings per resource for bar chart
  const maxBookingCount = Math.max(...mostBooked.map((r) => r.count), 1);

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Analytics</h1>
          <p style={styles.subtitle}>Overview of resource usage and booking trends.</p>
        </div>

        {loading ? (
          <div style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((i) => <div key={i} style={styles.skeletonCard} />)}
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={styles.statsGrid}>
              {[
                { label: "Total bookings", value: totalBookings, color: "#0f0f0f" },
                { label: "Active bookings", value: activeBookings, color: "#16a34a" },
                { label: "Cancellation rate", value: `${cancellationRate}%`, color: "#dc2626" },
                { label: "Resources available", value: `${availableResources}/${totalResources}`, color: "#2563eb" },
              ].map((stat) => (
                <div key={stat.label} style={styles.statCard}>
                  <span style={{ ...styles.statValue, color: stat.color }}>{stat.value}</span>
                  <span style={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>

            <div style={styles.chartsRow}>
              {/* Most booked resources - horizontal bar chart */}
              <div style={styles.chartCard}>
                <h2 style={styles.chartTitle}>Most booked resources</h2>
                {mostBooked.length === 0 ? (
                  <div style={styles.noData}>No bookings yet</div>
                ) : (
                  <div style={styles.barList}>
                    {mostBooked.map((resource) => (
                      <div key={resource.id} style={styles.barRow}>
                        <div style={styles.barLabel}>{resource.name}</div>
                        <div style={styles.barTrack}>
                          <div
                            style={{
                              ...styles.barFill,
                              width: `${(resource.count / maxBookingCount) * 100}%`,
                            }}
                          />
                        </div>
                        <div style={styles.barCount}>{resource.count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bookings by category */}
              <div style={styles.chartCard}>
                <h2 style={styles.chartTitle}>Bookings by category</h2>
                {categoryData.length === 0 ? (
                  <div style={styles.noData}>No bookings yet</div>
                ) : (
                  <div style={styles.barList}>
                    {categoryData.map(([category, count]) => (
                      <div key={category} style={styles.barRow}>
                        <div style={{ ...styles.barLabel, textTransform: "capitalize" }}>
                          {category}
                        </div>
                        <div style={styles.barTrack}>
                          <div
                            style={{
                              ...styles.barFill,
                              width: `${(count / maxCategoryCount) * 100}%`,
                              backgroundColor: "#2563eb",
                            }}
                          />
                        </div>
                        <div style={styles.barCount}>{count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Resource utilization table */}
            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>Resource utilization</h2>
              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <span>Resource</span>
                  <span>Category</span>
                  <span>Total bookings</span>
                  <span>Status</span>
                </div>
                {resources.map((resource) => (
                  <div key={resource.id} style={styles.tableRow}>
                    <span style={styles.tableName}>{resource.name}</span>
                    <span style={{ ...styles.tableCell, textTransform: "capitalize" }}>
                      {resource.category}
                    </span>
                    <span style={styles.tableCell}>
                      {bookingCounts[resource.id] || 0}
                    </span>
                    <span style={{
                      ...styles.availBadge,
                      backgroundColor: resource.is_available ? "#f0fdf4" : "#fff5f5",
                      color: resource.is_available ? "#16a34a" : "#dc2626",
                    }}>
                      {resource.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                ))}
                {resources.length === 0 && (
                  <div style={styles.noData}>No resources added yet</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#fafafa", fontFamily: "Inter, -apple-system, sans-serif" },
  main: { maxWidth: "960px", margin: "0 auto", padding: "48px 24px" },
  header: { marginBottom: "36px" },
  title: { fontSize: "28px", fontWeight: "700", color: "#0f0f0f", letterSpacing: "-0.4px", margin: "0 0 8px 0" },
  subtitle: { fontSize: "14px", color: "#666666", margin: 0 },

  // Skeleton
  skeletonGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  skeletonCard: { height: "96px", borderRadius: "12px", backgroundColor: "#e5e5e5" },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  statCard: {
    backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "12px",
    padding: "24px", display: "flex", flexDirection: "column", gap: "6px",
  },
  statValue: { fontSize: "32px", fontWeight: "700", letterSpacing: "-1px", lineHeight: 1 },
  statLabel: { fontSize: "12px", color: "#888888" },

  // Charts
  chartsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
  chartCard: {
    backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "12px",
    padding: "24px", marginBottom: "16px",
  },
  chartTitle: { fontSize: "14px", fontWeight: "600", color: "#0f0f0f", margin: "0 0 20px 0" },

  // Bar chart
  barList: { display: "flex", flexDirection: "column", gap: "14px" },
  barRow: { display: "flex", alignItems: "center", gap: "12px" },
  barLabel: { fontSize: "13px", color: "#333333", width: "120px", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  barTrack: { flex: 1, height: "8px", backgroundColor: "#f0f0f0", borderRadius: "999px", overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: "#0f0f0f", borderRadius: "999px", transition: "width 0.3s ease" },
  barCount: { fontSize: "13px", fontWeight: "600", color: "#0f0f0f", width: "24px", textAlign: "right", flexShrink: 0 },

  // Table
  table: { display: "flex", flexDirection: "column" },
  tableHeader: {
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
    padding: "8px 12px", fontSize: "11px", fontWeight: "600",
    color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px",
    borderBottom: "1px solid #f0f0f0",
  },
  tableRow: {
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
    padding: "12px", fontSize: "13px", alignItems: "center",
    borderBottom: "1px solid #f9f9f9",
  },
  tableName: { fontWeight: "500", color: "#0f0f0f" },
  tableCell: { color: "#666666" },
  availBadge: { fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "999px", width: "fit-content" },
  noData: { textAlign: "center", padding: "32px", color: "#888888", fontSize: "13px" },
};
