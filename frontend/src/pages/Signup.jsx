import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Lock, Mail, User, Shield, MapPin, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import "./Login.css"; // reuse same CSS

export default function Signup() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Form validation functions
  const validateName = (name) => name.length >= 20 && name.length <= 60;
  const validateAddress = (address) => address.length <= 400;
  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(password);
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate before sending request
    if (!validateName(name)) {
      setError("Name must be between 20 and 60 characters.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email address.");
      return;
    }
    if (!validateAddress(address)) {
      setError("Address must be maximum 400 characters.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be 8-16 chars, include one uppercase letter and one special character.");
      return;
    }

    setIsLoading(true);

    try {
      // Signup request for normal users only
      const res = await axios.post("http://localhost:4000/auth/signup", {
        name,
        email,
        address,
        password,
        role: "USER", // fixed role
      });

      // Store user email for confirmation message
      setUserEmail(email);
      
      // Show success message instead of auto-login
      setSignupSuccess(true);

    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => navigate("/login");

  if (signupSuccess) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-box">
              <div className="logo-bg" style={{ backgroundColor: '#10b981' }}>
                <CheckCircle className="logo-icon" size={28} />
              </div>
            </div>
            <h2 className="login-title">Account Created Successfully!</h2>
            <p className="login-subtitle">Welcome to Roxiler Platform</p>
          </div>

          <div className="success-message" style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px 0',
            textAlign: 'center'
          }}>
            <CheckCircle size={24} style={{ color: '#10b981', marginBottom: '8px' }} />
            <h3 style={{ margin: '8px 0', color: '#1f2937' }}>Registration Complete</h3>
            <p style={{ margin: '8px 0', color: '#6b7280' }}>
              Your account has been created successfully with email: <strong>{userEmail}</strong>
            </p>
            <p style={{ margin: '8px 0', color: '#6b7280' }}>
              You can now log in to access your dashboard and start using the platform.
            </p>
          </div>

          <button 
            onClick={handleBackToLogin}
            className="submit-btn"
            style={{
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={18} />
            Go to Login
          </button>
        </div>

        <div className="copyright">
          © {new Date().getFullYear()} Roxiler Systems. All rights reserved.
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-box">
            <div className="logo-bg">
              <Shield className="logo-icon" size={28} />
            </div>
          </div>
          <h2 className="login-title">Roxiler Platform</h2>
          <p className="login-subtitle">Sign up for a normal user account</p>
        </div>

        {error && (
          <div className="error-box">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <User className="input-icon" />
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          <div className="input-group">
            <MapPin className="input-icon" />
            <input
              type="text"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

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

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? <span className="loader"></span> : "Sign up"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Already have an account? <span onClick={() => navigate("/login")}>Sign in</span>
          </p>
        </div>
      </div>

      <div className="copyright">
        © {new Date().getFullYear()} Roxiler Systems. All rights reserved.
      </div>
    </div>
  );
}
