import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/game");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>MONSTER GAME</h1>
      <p style={styles.subtitle}>Not a tamagotchi copy in a crapy version.</p>

      <div style={styles.card}>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
        >
          {loading ? "Logging in…" : "Click here login ! !"}
        </button>

        {error && <p style={styles.errorMsg}>{error}</p>}

        <p style={styles.registerText}>
          New Member?{" "}
          <a href="/register" style={styles.link}>
            click here to create an account
          </a>{" "}
          !
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#fff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1rem",
  },
  title: {
    fontFamily: "'Alfa Slab One', sans-serif",
    fontSize: 75,
    letterSpacing: 4,
    color: "#1a1a1a",
    lineHeight: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    margin: "4px 0 2rem",
  },
  card: {
    border: "1.5px solid #ddd",
    background: "#f7f7f7",
    width: "100%",
    maxWidth: 380,
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  field: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    fontWeight: 500,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "7px 10px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    border: "1px solid #ccc",
    background: "#fff",
    outline: "none",
    borderRadius: 3,
  },
  btn: {
    marginTop: "0.5rem",
    background: "#e8e8e8",
    border: "1.5px solid #ddd",
    padding: "10px 16px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    borderRadius: 3,
    color: "#1a1a1a",
    transition: "background 0.15s",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  errorMsg: {
    fontSize: 13,
    color: "#a32d2d",
    marginTop: 8,
  },
  registerText: {
    marginTop: "1rem",
    fontSize: 13,
    color: "#555",
  },
  link: {
    color: "#0077aa",
    textDecoration: "underline",
  },
};
