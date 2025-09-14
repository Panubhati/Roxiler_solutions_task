import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:4000/auth/login", { email, password });
      login(res.data.user, res.data.token);

      if (res.data.user.role === "ADMIN") navigate("/admin");
      else if (res.data.user.role === "STORE_OWNER") navigate("/owner");
      else navigate("/user");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Login Card */}
      <div className="login-card">
        <div className="login-header">
          <div className="logo-box">
            <div className="logo-bg">
              <Shield className="logo-icon" size={28} />
            </div>
          </div>
          <h2 className="login-title">Roxiler Systems</h2>
          <p className="login-subtitle">Sign in to your account</p>
          <p className="login-tagline">
            <h2>Store Rating System</h2>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-box">
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          <div className="input-group">
            <Mail className="input-icon" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? <span className="loader"></span> : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup")}>Sign up</span>
          </p>
          <p onClick={() => navigate("/forgot-password")}>Forgot password?</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="copyright">
        © {new Date().getFullYear()} Roxiler Systems. All rights reserved.
      </div>
    </div>
  );
}