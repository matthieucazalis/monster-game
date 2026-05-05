import { useState } from "react";
import "./style/auth.css";

const API_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000";

export default function Register() {
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

      const data = await res.json();

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
    <div className="auth-wrap">
      <h1 className="auth-title">MONSTER GAME</h1>
      <p className="auth-subtitle">Not a tamagotchi copy in a crapy version.</p>

      <div className="auth-card">
        {/* Left — formulaire */}
        <div className="auth-left">
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              className="auth-input"
              name="pseudo"
              type="text"
              value={form.pseudo}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirm password</label>
            <input
              className="auth-input"
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-check-row">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              checked={form.consent}
              onChange={handleChange}
            />
            <label htmlFor="consent" className="auth-check-label">
              I CONSENT that this game contain is… yeah
            </label>
          </div>

          <p className="auth-nav-text">
            Old member?{" "}
            <a href="/login" className="auth-link">
              click here to login
            </a>{" "}
            !
          </p>
        </div>

        {/* Right — infos + bouton */}
        <div className="auth-right">
          <p className="auth-spoiler-title">TW : spoilers.</p>
          <p className="auth-spoiler-label">THIS GAME CONTAIN :</p>
          <ul className="auth-feature-list">
            <li className="auth-feature-item">
              5 monsters with unique designs !
            </li>
            <li className="auth-feature-item">
              Objects to collect and decorate with !
            </li>
            <li className="auth-feature-item">
              And that's it, just be patient with your lil monsters.
            </li>
          </ul>

          <button
            className="auth-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Creating account…"
              : "Click here to create your account !"}
          </button>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}
        </div>
      </div>
    </div>
  );
}
