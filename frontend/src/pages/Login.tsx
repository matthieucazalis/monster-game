import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/auth.css";

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
    <div className="auth-wrap">
      <h1 className="auth-title">MONSTER GAME</h1>
      <p className="auth-subtitle">Not a tamagotchi copy in a crapy version.</p>

      <div className="auth-card-single">
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

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Logging in…" : "Click here login ! !"}
        </button>

        {error && <p className="auth-error">{error}</p>}

        <p className="auth-nav-text">
          New Member?{" "}
          <a href="/register" className="auth-link">
            click here to create an account
          </a>{" "}
          !
        </p>
      </div>
    </div>
  );
}
