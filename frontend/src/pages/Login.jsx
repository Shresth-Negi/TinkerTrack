import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser, getMe } from "../utils/api";
import { useAuth } from "../utils/AuthContext";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true); // toggle between login/register
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Update form fields
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error when user types
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // LOGIN FLOW
        const { access_token } = await loginUser(form.email, form.password);
        // temporarily set token so getMe() works
        localStorage.setItem("token", access_token);
        const me = await getMe();
        login(access_token, me);
        navigate("/dashboard");
      } else {
        // REGISTER FLOW
        await registerUser(form.name, form.email, form.password);
        // After registering, log them in automatically
        const { access_token } = await loginUser(form.email, form.password);
        localStorage.setItem("token", access_token);
        const me = await getMe();
        login(access_token, me);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Left panel - branding */}
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logo}>⬡</div>
          <h1 style={styles.brandName}>TinkerTrack</h1>
          <p style={styles.brandTagline}>
            Book shared spaces and equipment — simply.
          </p>
        </div>
        <div style={styles.features}>
          {["Browse available resources", "Reserve in seconds", "Manage your bookings"].map(
            (f) => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureDot} />
                <span style={styles.featureText}>{f}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Right panel - form */}
      <div style={styles.right}>
        <div style={styles.card}>
          {/* Tab switcher */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }}
              onClick={() => { setIsLogin(true); setError(""); }}
            >
              Sign in
            </button>
            <button
              style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }}
              onClick={() => { setIsLogin(false); setError(""); }}
            >
              Create account
            </button>
          </div>

          <h2 style={styles.formTitle}>
            {isLogin ? "Welcome back" : "Get started"}
          </h2>
          <p style={styles.formSubtitle}>
            {isLogin
              ? "Sign in to your account to continue."
              : "Create an account to start booking resources."}
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Name field - only for register */}
            {!isLogin && (
              <div style={styles.field}>
                <label style={styles.label}>Full name</label>
                <input
                  style={styles.input}
                  type="text"
                  name="name"
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder={isLogin ? "Your password" : "At least 8 characters"}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Error message */}
            {error && <div style={styles.error}>{error}</div>}

            <button
              style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign in"
                : "Create account"}
            </button>
          </form>

          <p style={styles.switchText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              style={styles.switchLink}
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: "#ffffff",
  },

  // Left branding panel
  left: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    padding: "64px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  logo: {
    fontSize: "32px",
    color: "#ffffff",
    lineHeight: 1,
  },
  brandName: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  brandTagline: {
    fontSize: "16px",
    color: "#888888",
    margin: 0,
    lineHeight: "1.6",
    maxWidth: "280px",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  featureDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    flexShrink: 0,
  },
  featureText: {
    fontSize: "14px",
    color: "#aaaaaa",
  },

  // Right form panel
  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px",
    backgroundColor: "#ffffff",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
  },

  // Tabs
  tabs: {
    display: "flex",
    borderBottom: "1px solid #e5e5e5",
    marginBottom: "32px",
  },
  tab: {
    flex: 1,
    padding: "12px 0",
    border: "none",
    background: "none",
    fontSize: "14px",
    fontWeight: "500",
    color: "#999999",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    marginBottom: "-1px",
    transition: "all 0.15s ease",
  },
  tabActive: {
    color: "#0f0f0f",
    borderBottomColor: "#0f0f0f",
  },

  // Form
  formTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f0f0f",
    margin: "0 0 8px 0",
    letterSpacing: "-0.3px",
  },
  formSubtitle: {
    fontSize: "14px",
    color: "#666666",
    margin: "0 0 32px 0",
    lineHeight: "1.5",
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
  input: {
    padding: "10px 14px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#0f0f0f",
    outline: "none",
    transition: "border-color 0.15s ease",
    fontFamily: "inherit",
  },
  error: {
    padding: "10px 14px",
    backgroundColor: "#fff5f5",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#dc2626",
  },
  button: {
    padding: "11px",
    backgroundColor: "#0f0f0f",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "4px",
    transition: "opacity 0.15s ease",
    fontFamily: "inherit",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  switchText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#666666",
    marginTop: "24px",
  },
  switchLink: {
    background: "none",
    border: "none",
    color: "#0f0f0f",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
    textDecoration: "underline",
  },
};
