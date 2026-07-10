import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BookingModal from "../components/BookingModal";
import { getResources } from "../utils/api";

const CATEGORY_LABELS = {
  room: "Room",
  equipment: "Equipment",
  lab: "Lab",
  sports: "Sports",
  other: "Other",
};

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResource, setSelectedResource] = useState(null); // for booking modal
  const [filter, setFilter] = useState("all"); // category filter

useEffect(() => {
    const controller = new AbortController(); // ← tracks if component is still mounted

    async function loadResources() {
        try {
            const data = await getResources();
            if (!controller.signal.aborted) { // ← only update state if still mounted
                setResources(data);
                setError("");
            }
        } catch (err) {
            if (!controller.signal.aborted) {
                setError(err.message || "Failed to load resources.");
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }

    loadResources();

    return () => controller.abort(); // ← cleanup when component unmounts
}, []);

  // Filter resources by category
  const categories = ["all", ...new Set(resources.map((r) => r.category))];
  const filtered =
    filter === "all" ? resources : resources.filter((r) => r.category === filter);

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Resources</h1>
            <p style={styles.subtitle}>Browse and book available spaces and equipment.</p>
          </div>
        </div>

        {/* Category filter tabs */}
        <div style={styles.filters}>
          {categories.map((cat) => (
            <button
              key={cat}
              style={{ ...styles.filterBtn, ...(filter === cat ? styles.filterActive : {}) }}
              onClick={() => setFilter(cat)}
            >
              {cat === "all" ? "All" : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={styles.skeletonCard} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📭</div>
            <p style={styles.emptyText}>No resources found.</p>
          </div>
        )}

        {/* Resource cards grid */}
        {!loading && !error && filtered.length > 0 && (
          <div style={styles.grid}>
            {filtered.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onBook={() => setSelectedResource(resource)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Booking modal */}
      {selectedResource && (
        <BookingModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onSuccess={() => {
            setSelectedResource(null);
          }}
        />
      )}
    </div>
  );
}

function ResourceCard({ resource, onBook }) {
  return (
    <div style={styles.card}>
      {/* Category badge */}
      <div style={styles.cardTop}>
        <span style={styles.badge}>
          {CATEGORY_LABELS[resource.category] || resource.category}
        </span>
        <span style={{
          ...styles.availBadge,
          backgroundColor: resource.is_available ? "#f0fdf4" : "#fff5f5",
          color: resource.is_available ? "#16a34a" : "#dc2626",
        }}>
          {resource.is_available ? "Available" : "Unavailable"}
        </span>
      </div>

      {/* Card content */}
      <h3 style={styles.cardTitle}>{resource.name}</h3>
      {resource.description && (
        <p style={styles.cardDesc}>{resource.description}</p>
      )}
      {resource.location && (
        <p style={styles.cardLocation}>📍 {resource.location}</p>
      )}

      {/* Book button */}
      <button
        style={{
          ...styles.bookBtn,
          ...(resource.is_available ? {} : styles.bookBtnDisabled),
        }}
        onClick={onBook}
        disabled={!resource.is_available}
      >
        {resource.is_available ? "Book this resource" : "Not available"}
      </button>
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
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f0f0f",
    letterSpacing: "-0.4px",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666666",
    margin: 0,
  },

  // Filters
  filters: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "6px 14px",
    border: "1px solid #e0e0e0",
    borderRadius: "999px",
    background: "#ffffff",
    fontSize: "13px",
    color: "#666666",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
    fontWeight: "500",
    transition: "all 0.15s ease",
  },
  filterActive: {
    backgroundColor: "#0f0f0f",
    borderColor: "#0f0f0f",
    color: "#ffffff",
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  skeletonCard: {
    height: "200px",
    borderRadius: "12px",
    backgroundColor: "#e5e5e5",
  },

  // Resource card
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  availBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "999px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f0f0f",
    margin: 0,
  },
  cardDesc: {
    fontSize: "13px",
    color: "#666666",
    margin: 0,
    lineHeight: "1.5",
  },
  cardLocation: {
    fontSize: "12px",
    color: "#888888",
    margin: 0,
  },
  bookBtn: {
    marginTop: "auto",
    padding: "9px",
    backgroundColor: "#0f0f0f",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
    transition: "opacity 0.15s ease",
  },
  bookBtnDisabled: {
    backgroundColor: "#e5e5e5",
    color: "#999999",
    cursor: "not-allowed",
  },

  // States
  error: {
    padding: "16px",
    backgroundColor: "#fff5f5",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "14px",
  },
  empty: {
    textAlign: "center",
    padding: "80px 0",
  },
  emptyIcon: {
    fontSize: "40px",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "14px",
    color: "#888888",
  },
};
