import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle, Sparkles } from "lucide-react";

import { registerUser } from "../../../services/authService";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setError("");

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Student self-registration only.
  // Backend enforces this as well.
  const validateCollegeEmail = (email) => {
    return /^[0-9]+@nitkkr\.ac\.in$/i.test(email.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (form.name.trim().length < 3) {
      setError("Please enter a valid full name.");
      return;
    }

    if (!validateCollegeEmail(form.email)) {
      setError(
        "Only official NIT Kurukshetra email IDs are allowed.\nExample: 123105042@nitkkr.ac.in",
      );
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "student",
      });

      if (!response.success) {
        setError(response.message || "Registration failed.");
        return;
      }

      alert(response.message || "Registration successful.");

      navigate("/login", {
        replace: true,
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.message || err?.response?.data?.message || "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-viewport-wrapper">
      <div className="register-branding-decor">
        <div className="decor-glow-orb-1"></div>
        <div className="decor-glow-orb-2"></div>
      </div>

      <div className="register-card-container">
        <div className="register-card-header">
          <div className="brand-badge-row">
            <Sparkles size={18} className="brand-sparkle-icon" />
            <span className="brand-badge-text">Secure Enrolment Node</span>
          </div>

          <h1>CampusAI</h1>

          <p>Initialize a secure tenant workspace inside the ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="register-functional-form">
          <div className="input-field-group">
            <label htmlFor="register-name">Full Name</label>

            <input
              id="register-name"
              name="name"
              type="text"
              placeholder="John Smith"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="input-field-group">
            <label htmlFor="register-email">College Email</label>

            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="123105042@nitkkr.ac.in"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              required
              autoComplete="email"
            />

            <small
              style={{
                color: "#64748b",
                marginTop: "6px",
                display: "block",
                fontSize: "12px",
              }}
            >
              Only NIT Kurukshetra student email IDs can self-register.
            </small>
          </div>

          <div className="input-field-group">
            <label htmlFor="register-password">Password</label>

            <div className="password-input-wrapper">
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                required
                minLength={8}
                autoComplete="new-password"
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

          <div className="input-field-group">
            <label>Account Type</label>

            <div className="select-wrapper">
              <input type="text" value="Student" disabled />

              <input type="hidden" name="role" value="student" />
            </div>
          </div>

          {error && (
            <div
              style={{
                color: "#dc2626",
                fontSize: "14px",
                marginBottom: "12px",
                whiteSpace: "pre-line",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`register-submit-cta-btn ${
              loading ? "is-executing" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle size={16} className="btn-spin-loader" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="login-redirect-footer">
          <span>Already have an account?</span>

          <Link to="/login" className="login-inline-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
