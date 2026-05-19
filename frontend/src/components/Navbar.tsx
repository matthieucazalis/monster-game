import { useNavigate, useLocation } from "react-router-dom";
import "../pages/style/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-center">
        {/* HOME */}
        <button
          className={`navbar-item ${isActive("/game") ? "active" : ""}`}
          onClick={() => navigate("/game")}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          Home
        </button>

        {/* INVENTAIRE */}
        <button
          className={`navbar-item ${isActive("/inventaire") ? "active" : ""}`}
          onClick={() => navigate("/inventaire")}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18v2H3V6zm0 4h18v10H3V10z" />
          </svg>
          Inventaire
        </button>

        {/* BOUTIQUE */}
        <button
          className={`navbar-item ${isActive("/boutique") ? "active" : ""}`}
          onClick={() => navigate("/boutique")}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-1V6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zm-7-3c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm3.586 7H8v3h8v-3z" />
          </svg>
          Boutique
        </button>
      </div>

      {/* SETTINGS */}
      <button className="navbar-settings" onClick={() => navigate("/settings")}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path
            d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 
          0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.02 
          7.02 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 
          0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 
          0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 
          1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 
          1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 
          1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 
          0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 
          1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 
          0 0 0-.12-.61l-2.01-1.58zM12 
          15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 
          3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
          />
        </svg>
      </button>
    </nav>
  );
}
