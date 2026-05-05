import { useState } from "react";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

export default function Register() {
  console.log("register page rendered");

  const [form, setForm] = useState({
    pseudo: "",
    password: "",
    confirm: "",
    email: "",
    consent: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!form.pseudo || !form.password || !form.email) {
      setError("Please fill all fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.consent) {
      setError("You must consent to proceed.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pseudo: form.pseudo,
          email: form.email,
          password: form.password,
        }),
      });

      console.log("Response register:", res);

      const data = await res.json();

      console.log("Data register:", data);

      if (!res.ok) {
        setError(data.message ?? "Registration failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Account created! Redirecting…");

      setTimeout(() => {
        window.location.href = "/game";
      }, 1200);
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
        {/* Left — form */}
        <div style={styles.left}>
          <Field label="Username">
            <input
              name="pseudo"
              type="text"
              value={form.pseudo}
              onChange={handleChange}
              style={styles.input}
            />
          </Field>

          <Field label="Password">
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
            />
          </Field>

          <Field label="Confirm password">
            <input
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              style={styles.input}
            />
          </Field>

          <Field label="Email">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />
          </Field>

          <div style={styles.checkRow}>
            <input
              id="consent"
              name="consent"
              type="checkbox"
              checked={form.consent}
              onChange={handleChange}
              style={{ width: 15, height: 15, marginTop: 3, flexShrink: 0 }}
            />
            <label htmlFor="consent" style={styles.checkLabel}>
              I CONSENT that this game contain is… yeah
            </label>
          </div>
          <p style={styles.loginText}>
            Old member?{" "}
            <a href="/login" style={styles.link}>
              click here to login
            </a>
            !
          </p>
        </div>

        <div style={styles.right}>
          <p style={styles.spoilerTitle}>TW : spoilers.</p>
          <p style={styles.spoilerLabel}>THIS GAME CONTAIN :</p>
          <ul style={styles.featureList}>
            <li style={styles.featureItem}>5 monsters with unique designs !</li>
            <li style={styles.featureItem}>
              Objects to collect and decorate with !
            </li>
            <li style={styles.featureItem}>
              And that's it, just be patient with your lil monsters.
            </li>
          </ul>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...styles.btn,
              ...(loading ? styles.btnDisabled : {}),
            }}
          >
            {loading
              ? "Creating account…"
              : "Click here to create your account !"}
          </button>

          {error && <p style={styles.errorMsg}>{error}</p>}
          {success && <p style={styles.successMsg}>{success}</p>}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={styles.label}>{label}</label>
      {children}
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
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    border: "1.5px solid #ddd",
    background: "#f7f7f7",
    width: "100%",
    maxWidth: 680,
  },
  left: {
    padding: "1.5rem",
    borderRight: "1.5px solid #ddd",
  },
  right: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
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
  checkRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    marginTop: "0.5rem",
  },
  checkLabel: {
    fontSize: 13,
    color: "#555",
  },
  loginText: {
    marginTop: "1rem",
    fontSize: 13,
    color: "#555",
  },
  link: {
    color: "#0077aa",
    textDecoration: "underline",
  },
  spoilerTitle: {
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "underline",
    color: "#1a1a1a",
    margin: "0 0 0.5rem",
  },
  spoilerLabel: {
    fontSize: 13,
    color: "#555",
    fontWeight: 500,
    marginBottom: "0.75rem",
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 auto",
  },
  featureItem: {
    fontSize: 14,
    color: "#444",
    marginBottom: "0.75rem",
    paddingLeft: "1rem",
    position: "relative",
  },
  btn: {
    marginTop: "1.5rem",
    background: "#f7f7f7",
    border: "1.5px solid #bbb",
    padding: "10px 16px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    borderRadius: 3,
    color: "#1a1a1a",
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
  successMsg: {
    fontSize: 13,
    color: "#3b6d11",
    marginTop: 8,
  },
};
