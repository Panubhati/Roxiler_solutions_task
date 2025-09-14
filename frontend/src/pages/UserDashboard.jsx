import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./UserDashboard.css";

export default function UserDashboard() {
  const { token, logout, user } = useContext(AuthContext);
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load all stores initially (no search)
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await axios.get(
        `http://localhost:4000/api/stores?search=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStores(res.data);
    } catch (err) {
      console.error("Error fetching stores", err);
      setError("Failed to fetch stores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (storeId, rating) => {
    try {
      setError("");
      setSuccess("");
      
      await axios.post(
        "http://localhost:4000/api/stores/rate",
        { storeId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("Rating submitted successfully!");
      fetchStores();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error rating store", err);
      setError(err.response?.data?.message || "Failed to submit rating. Please try again.");
    }
  };

  // remove/undo rating
  const removeRating = async (storeId) => {
    try {
      setError("");
      setSuccess("");
      
      await axios.delete(
        `http://localhost:4000/api/stores/rate/${storeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("Rating removed successfully!");
      fetchStores();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error removing rating", err);
      setError(err.response?.data?.message || "Failed to remove rating. Please try again.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match!");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const isStoreOwner = user?.role === 'STORE_OWNER';
      const endpoint = isStoreOwner 
        ? "http://localhost:4000/api/stores/update-password"
        : "http://localhost:4000/auth/update-password";
      
      // Debug logs
      console.log("User role:", user?.role);
      console.log("Is store owner:", isStoreOwner);
      console.log("Endpoint:", endpoint);
      console.log("Request data:", {
        currentPassword: passwordData.currentPassword ? "[PROVIDED]" : "[MISSING]",
        newPassword: passwordData.newPassword ? "[PROVIDED]" : "[MISSING]"
      });
      console.log("Token:", token ? "[PROVIDED]" : "[MISSING]");
      
      await axios.put(
        endpoint,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error changing password", err);
      
      // Debug the error response
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);
      console.error("Error response headers:", err.response?.headers);
      
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  return (
    <div className="user-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.email}</span>
          <div className="header-buttons">
            <button 
              className="change-password-btn"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="message error-message">
          {error}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}
      {success && (
        <div className="message success-message">
          {success}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}

      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search stores by name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button onClick={fetchStores} className="search-btn">
          Search
        </button>
      </div>

      {/* Stores Section */}
      <div className="stores-section">
        <h2>All Registered Stores</h2>
        
        {loading && <div className="loading">Loading stores...</div>}
        
        {!loading && stores.length === 0 && (
          <div className="no-stores">
            {search ? `No stores found matching "${search}"` : "No stores available"}
          </div>
        )}
        
        <div className="stores-grid">
          {stores.map((store) => (
            <div key={store.id} className="store-card">
              <div className="store-header">
                <h3>{store.name}</h3>
              </div>
              
              <div className="store-info">
                <p className="store-address">
                  <strong>Address:</strong> {store.address}
                </p>
                
                <div className="rating-info">
                  <p className="overall-rating">
                    <strong>Overall Rating:</strong> 
                    <span className="rating-value">
                      {store.averageRating ? store.averageRating.toFixed(1) : 'No ratings yet'}
                      {store.averageRating && <span className="star">⭐</span>}
                    </span>
                  </p>
                  
                  <p className="user-rating">
                    <strong>Your Rating:</strong> 
                    <span className="rating-value">
                      {store.userRating ? (
                        <>
                          {store.userRating} <span className="star">⭐</span>
                        </>
                      ) : (
                        <em>Not rated yet</em>
                      )}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="rating-section">
                <h4>{store.userRating ? "Modify your rating:" : "Submit your rating:"}</h4>
                <div className="rating-buttons">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => submitRating(store.id, num)}
                      className={`rating-btn ${store.userRating === num ? "active" : ""}`}
                      title={`Rate ${num} star${num > 1 ? 's' : ''}`}
                    >
                      {num} ⭐
                    </button>
                  ))}
                </div>
                
                {/* Add Remove Rating button if user has already rated */}
                {store.userRating && (
                  <div className="remove-rating-section">
                    <button
                      onClick={() => removeRating(store.id)}
                      className="remove-rating-btn"
                      title="Remove your rating"
                    >
                      Remove Rating
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Change Password</h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="close-modal-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value
                  })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value
                  })}
                  minLength="6"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value
                  })}
                  minLength="6"
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  className="cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}