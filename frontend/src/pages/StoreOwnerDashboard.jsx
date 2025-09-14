import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./StoreOwnerDashboard.css";

const StoreOwnerDashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(""); // Added current password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Added confirm password
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "http://localhost:4000/api/store-owner/dashboard",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.store) {
          setStoreData(res.data.store);
        } else {
          setError("Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    } else {
      setError("No authentication token found");
      setLoading(false);
    }
  }, [token]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  // Update password with proper validation
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      setPasswordMessage("");
      
      // Client-side validation
      if (!currentPassword || !newPassword) {
        setPasswordMessage("Current and new password are required");
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setPasswordMessage("New passwords do not match");
        return;
      }
      
      if (newPassword.length < 6) {
        setPasswordMessage("New password must be at least 6 characters long");
        return;
      }

      const res = await axios.put(
        "http://localhost:4000/api/store-owner/update-password",
        { 
          currentPassword: currentPassword,
          newPassword: newPassword 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPasswordMessage(res.data.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage("");
      }, 1500);
    } catch (err) {
      console.error(err);
      setPasswordMessage(err.response?.data?.message || "Failed to update password");
    }
  };

  // Reset form when modal closes
  const handleModalClose = () => {
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("");
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!storeData) return <div className="error">No store data available</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Store Dashboard</h1>
        <div className="header-actions">
          <button
            className="update-password-btn"
            onClick={() => setShowPasswordModal(true)}
          >
            Update Password
          </button>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* Store Information */}
      <div className="store-info-card">
        <h2>{storeData.name}</h2>
        <div className="store-details">
          <p>
            <strong>Email:</strong> {storeData.email}
          </p>
          <p>
            <strong>Address:</strong> {storeData.address}
          </p>
          <div className="rating-summary">
            <p>
              <strong>Average Rating:</strong>{" "}
              <span className="rating-value">
                {storeData.averageRating.toFixed(1)}{" "}
                <span className="stars">
                  {renderStars(Math.round(storeData.averageRating))}
                </span>
              </span>
            </p>
            <p>
              <strong>Total Ratings:</strong> {storeData.totalRatings}
            </p>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {storeData.ratingDistribution && (
        <div className="rating-distribution">
          <h3>Rating Distribution</h3>
          <div className="distribution-bars">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="distribution-row">
                <span className="star-label">{star} ★</span>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${
                        storeData.totalRatings > 0
                          ? (storeData.ratingDistribution[star] /
                              storeData.totalRatings) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="count">
                  {storeData.ratingDistribution[star]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Ratings */}
      {storeData.recentRatings && storeData.recentRatings.length > 0 && (
        <div className="recent-ratings">
          <h3>Recent Ratings</h3>
          <div className="recent-ratings-list">
            {storeData.recentRatings.map((rating) => (
              <div key={rating.id} className="rating-item">
                <div className="rating-header">
                  <span className="user-name">{rating.user.name}</span>
                  <span className="rating-stars">
                    {renderStars(rating.value)}
                  </span>
                </div>
                <div className="rating-meta">
                  <span className="rating-date">
                    {formatDate(rating.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users Who Rated */}
      <div className="ratings-section">
        <h3>
          All Customers Who Rated Your Store (
          {storeData.usersRated?.length || 0})
        </h3>
        {!storeData.usersRated || storeData.usersRated.length === 0 ? (
          <div className="no-ratings">
            <p>No ratings yet. Encourage your customers to rate your store!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Rating</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {storeData.usersRated.map((user) => (
                  <tr key={`${user.id}-${user.rating}`}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="rating-cell">
                        <span className="rating-number">{user.rating}</span>
                        <span className="rating-stars-small">
                          {renderStars(user.rating)}
                        </span>
                      </span>
                    </td>
                    <td>
                      {user.ratedAt ? formatDate(user.ratedAt) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Password</h3>
            <form onSubmit={handlePasswordUpdate}>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="6"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
              />
              <div className="modal-buttons">
                <button type="submit">Update</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleModalClose}
                >
                  Cancel
                </button>
              </div>
            </form>
            {passwordMessage && (
              <p className={`password-message ${passwordMessage.includes('successfully') ? 'success' : 'error'}`}>
                {passwordMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;