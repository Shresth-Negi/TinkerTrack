import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.logo} onClick={() => navigate("/dashboard")}>
        <span style={styles.logoIcon}>⬡</span>
        <span style={styles.logoText}>TinkerTrack</span>
      </div>

      <div style={styles.links}>
        <button
          style={{ ...styles.link, ...(isActive("/dashboard") ? styles.linkActive : {}) }}
          onClick={() => navigate("/dashboard")}
        >
          Home
        </button>
        <button
          style={{ ...styles.link, ...(isActive("/resources") ? styles.linkActive : {}) }}
          onClick={() => navigate("/resources")}
        >
          Resources
        </button>
        <button
          style={{ ...styles.link, ...(isActive("/my-bookings") ? styles.linkActive : {}) }}
          onClick={() => navigate("/my-bookings")}
        >
          My Bookings
        </button>
        {user?.role === "admin" && (
          <>
            <button
              style={{ ...styles.link, ...(isActive("/admin") ? styles.linkActive : {}) }}
              onClick={() => navigate("/admin")}
            >
              Admin
            </button>
            <button
              style={{ ...styles.link, ...(isActive("/analytics") ? styles.linkActive : {}) }}
              onClick={() => navigate("/analytics")}
            >
              Analytics
            </button>
          </>
        )}
      </div>

      <div style={styles.right}>
        <span style={styles.userName}>{user?.name}</span>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 48px", height: "60px", borderBottom: "1px solid #e5e5e5",
    backgroundColor: "#ffffff", position: "sticky", top: 0, zIndex: 100,
  },
  logo: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
  logoIcon: { fontSize: "20px", color: "#0f0f0f" },
  logoText: { fontSize: "16px", fontWeight: "700", color: "#0f0f0f", letterSpacing: "-0.3px", fontFamily: "Inter, sans-serif" },
  links: { display: "flex", alignItems: "center", gap: "4px" },
  link: {
    padding: "6px 12px", border: "none", background: "none", fontSize: "14px",
    color: "#666666", cursor: "pointer", borderRadius: "6px", fontFamily: "Inter, sans-serif",
    fontWeight: "500", transition: "all 0.15s ease",
  },
  linkActive: { color: "#0f0f0f", backgroundColor: "#f5f5f5" },
  right: { display: "flex", alignItems: "center", gap: "16px" },
  userName: { fontSize: "13px", color: "#666666", fontFamily: "Inter, sans-serif" },
  logoutBtn: {
    padding: "6px 14px", border: "1px solid #e0e0e0", background: "none",
    fontSize: "13px", color: "#333333", cursor: "pointer", borderRadius: "6px",
    fontFamily: "Inter, sans-serif", fontWeight: "500", transition: "all 0.15s ease",
  },
};
