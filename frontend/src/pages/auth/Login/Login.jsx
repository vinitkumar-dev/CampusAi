import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle, Sparkles } from "lucide-react";

import { loginUser } from "../../../services/authService";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // ==========================
  // Already Logged In?
  // ==========================
  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    const rawUser =
      localStorage.getItem("user") || localStorage.getItem("currentUser");

    if (!token || !rawUser) return;

    try {
      const user = JSON.parse(rawUser);

      switch (user.role?.toLowerCase()) {
        case "student":
          navigate("/student/dashboard", { replace: true });
          break;

        case "staff":
          navigate("/staff/dashboard", { replace: true });
          break;

        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;

        default:
          localStorage.clear();
      }
    } catch {
      localStorage.clear();
    }
  }, [navigate]);

  const handleChange = (e) => {
    setError("");

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Student registration is restricted,
  // but login must work for Student, Staff & Admin.
  const validateEmail = (email) => {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(
      email.trim(),
    );
  };

  const redirectByRole = (role) => {
    switch (role?.toLowerCase()) {
      case "student":
        navigate("/student/dashboard", { replace: true });
        break;

      case "staff":
        navigate("/staff/dashboard", { replace: true });
        break;

      case "admin":
        navigate("/admin/dashboard", { replace: true });
        break;

      default:
        navigate("/", { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (!result.success) {
        setError(result.message || "Login failed.");
        return;
      }

      redirectByRole(result.user.role);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Authentication failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-viewport-wrapper">
      <div className="login-branding-decor">
        <div className="decor-glow-orb-1"></div>
        <div className="decor-glow-orb-2"></div>
      </div>

      <div className="login-card-container">
        <div className="login-card-header">
          <div className="brand-badge-row">
            <Sparkles size={20} className="brand-sparkle-icon" />
            <span className="brand-badge-text">v2.1 Enterprise Ready</span>
          </div>

          <h1>CampusAI</h1>

          <p>Smart Campus Grievance &amp; Help Desk Routing System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-functional-form">
          <div className="input-field-group">
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              required
              autoComplete="username"
            />
          </div>

          <div className="input-field-group">
            <div className="password-label-row">
              <label htmlFor="login-password">Password</label>
            </div>

            <div className="password-input-wrapper">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-visibility-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                color: "#dc2626",
                fontSize: "14px",
                marginBottom: "12px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`login-submit-cta-btn ${loading ? "is-executing" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle size={16} className="btn-spin-loader" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="register-redirect-footer">
          <span>Don't have an account?</span>

          <Link to="/register" className="register-inline-link">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
