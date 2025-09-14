import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { token, logout, user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  
  // View states
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'stores', 'users', 'add-store', 'add-admin'
  
  // Stores data
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  
  // Users data
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Filter states
  const [storeFilters, setStoreFilters] = useState({
    name: '',
    email: '',
    address: '',
    rating: ''
  });
  
  const [userFilters, setUserFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  });
  
  // Selected user details
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  // Add store with owner form state
  const [newStoreWithOwner, setNewStoreWithOwner] = useState({
    storeName: '',
    storeEmail: '',
    storeAddress: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerAddress: ''
  });
  const [addStoreLoading, setAddStoreLoading] = useState(false);

  // Add admin form state
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [addAdminLoading, setAddAdminLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Token from context:', token);
        
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:4000/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        console.log('Dashboard response:', res.data);
        
        if (res.data.success && res.data.data) {
          setStats(res.data.data);
        } else if (res.data.totalUsers !== undefined) {
          setStats(res.data);
        } else {
          setError("Invalid response format");
        }
        
      } catch (err) {
        console.error("Failed to load dashboard", err);
        console.error("Error response:", err.response);
        
        if (err.response?.status === 401) {
          setError("Authentication failed. Please login again.");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to access this page.");
        } else {
          setError(err.response?.data?.message || "Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    } else {
      setError("Please login to access this page");
      setLoading(false);
    }
  }, [token]);

  // Fetch stores data
  const fetchStores = async () => {
    try {
      setStoresLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (storeFilters.name) queryParams.append('name', storeFilters.name);
      if (storeFilters.email) queryParams.append('email', storeFilters.email);
      if (storeFilters.address) queryParams.append('address', storeFilters.address);
      if (storeFilters.rating) queryParams.append('rating', storeFilters.rating);
      
      const res = await axios.get(`http://localhost:4000/admin/stores?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStores(res.data.data?.stores || res.data);
    } catch (err) {
      console.error("Failed to fetch stores", err);
      setError(err.response?.data?.message || "Failed to fetch stores");
    } finally {
      setStoresLoading(false);
    }
  };

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (userFilters.name) queryParams.append('name', userFilters.name);
      if (userFilters.email) queryParams.append('email', userFilters.email);
      if (userFilters.address) queryParams.append('address', userFilters.address);
      if (userFilters.role) queryParams.append('role', userFilters.role);
      
      const res = await axios.get(`http://localhost:4000/admin/users?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter out STORE_OWNER users before setting state
      const allUsers = res.data.data?.users || res.data;
      const filteredUsers = allUsers.filter(user => user.role !== 'STORE_OWNER');
      setUsers(filteredUsers);

    } catch (err) {
      console.error("Failed to fetch users", err);
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:4000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedUser(res.data.data || res.data);
      setShowUserDetails(true);
    } catch (err) {
      console.error("Failed to fetch user details", err);
      setError(err.response?.data?.message || "Failed to fetch user details");
    }
  };

  // Handle create store with owner
  const handleCreateStoreWithOwner = async (e) => {
    e.preventDefault();
    
    try {
      setAddStoreLoading(true);
      setError(null);
      setSuccess("");

      // Validate required fields
      if (!newStoreWithOwner.storeName || !newStoreWithOwner.storeEmail || 
          !newStoreWithOwner.ownerName || !newStoreWithOwner.ownerEmail || 
          !newStoreWithOwner.ownerPassword) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate password length
      if (newStoreWithOwner.ownerPassword.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      // Format data to match backend expectations
      const requestData = {
        store: {
          name: newStoreWithOwner.storeName,
          email: newStoreWithOwner.storeEmail,
          address: newStoreWithOwner.storeAddress
        },
        owner: {
          name: newStoreWithOwner.ownerName,
          email: newStoreWithOwner.ownerEmail,
          password: newStoreWithOwner.ownerPassword,
          address: newStoreWithOwner.ownerAddress
        }
      };

      // Make API call to create store with owner
      const response = await axios.post(
        "http://localhost:4000/admin/create-store-with-owner", 
        requestData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess("Store and owner created successfully!");
        
        // Clear the form
        setNewStoreWithOwner({
          storeName: '',
          storeEmail: '',
          storeAddress: '',
          ownerName: '',
          ownerEmail: '',
          ownerPassword: '',
          ownerAddress: ''
        });
      } else {
        setError(response.data.error || response.data.message || "Failed to create store and owner");
      }

    } catch (err) {
      console.error("Failed to create store with owner", err);
      
      if (err.response?.status === 400) {
        setError(err.response.data.error || err.response.data.message || "Invalid data provided");
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || "Failed to create store and owner");
      }
    } finally {
      setAddStoreLoading(false);
    }
  };

  // Handle create admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    try {
      setAddAdminLoading(true);
      setError(null);
      setSuccess("");

      // Validate required fields
      if (!newAdmin.name || !newAdmin.email || !newAdmin.password || !newAdmin.confirmPassword) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate password length
      if (newAdmin.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      // Validate password confirmation
      if (newAdmin.password !== newAdmin.confirmPassword) {
        setError("Password and confirm password do not match");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAdmin.email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Format data for API call
      const requestData = {
        name: newAdmin.name,
        email: newAdmin.email,
        password: newAdmin.password,
        address: newAdmin.address,
        role: 'ADMIN'
      };

      // Make API call to create admin
      const response = await axios.post(
        "http://localhost:4000/admin/create-admin", 
        requestData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess("Admin created successfully!");
        
        // Clear the form
        setNewAdmin({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          address: ''
        });
      } else {
        setError(response.data.error || response.data.message || "Failed to create admin");
      }

    } catch (err) {
      console.error("Failed to create admin", err);
      
      if (err.response?.status === 400) {
        setError(err.response.data.error || err.response.data.message || "Invalid data provided");
      } else if (err.response?.status === 409) {
        setError("An admin with this email already exists");
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || "Failed to create admin");
      }
    } finally {
      setAddAdminLoading(false);
    }
  };

  // Handle view changes
  const handleViewChange = (view) => {
    setActiveView(view);
    setError(null);
    setSuccess("");
    
    if (view === 'stores') {
      fetchStores();
    } else if (view === 'users') {
      fetchUsers();
    }
  };

  // Filter handlers
  const handleStoreFilterChange = (field, value) => {
    setStoreFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleUserFilterChange = (field, value) => {
    setUserFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearMessages = () => {
    setError(null);
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error && activeView === 'dashboard') {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.email}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="dashboard-nav">
        <button 
          className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleViewChange('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-btn ${activeView === 'stores' ? 'active' : ''}`}
          onClick={() => handleViewChange('stores')}
        >
          Stores
        </button>
        <button 
          className={`nav-btn ${activeView === 'users' ? 'active' : ''}`}
          onClick={() => handleViewChange('users')}
        >
          Users
        </button>
        <button 
          className={`nav-btn ${activeView === 'add-store' ? 'active' : ''}`}
          onClick={() => handleViewChange('add-store')}
        >
          Add Store
        </button>
        <button 
          className={`nav-btn ${activeView === 'add-admin' ? 'active' : ''}`}
          onClick={() => handleViewChange('add-admin')}
        >
          Add Admin
        </button>
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

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="dashboard-content">
          <div className="stats-cards">
            <div className="stat-card users-card">
              <h3>Total Users</h3>
              <p>{stats.totalUsers || 0}</p>
            </div>
            <div className="stat-card stores-card">
              <h3>Total Stores</h3>
              <p>{stats.totalStores || 0}</p>
            </div>
            <div className="stat-card ratings-card">
              <h3>Total Ratings</h3>
              <p>{stats.totalRatings || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin View */}
      {activeView === 'add-admin' && (
        <div className="dashboard-content">
          <h2>Create New Admin Account</h2>
          
          <div className="add-admin-form-container">
            <form onSubmit={handleCreateAdmin} className="add-admin-form">
              
              {/* Admin Information Section */}
              <div className="form-section">
                <h3>Admin Account Information</h3>
                
                <div className="form-group">
                  <label htmlFor="adminName">Full Name *</label>
                  <input
                    type="text"
                    id="adminName"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    placeholder="Enter admin's full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="adminEmail">Email Address *</label>
                  <input
                    type="email"
                    id="adminEmail"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    placeholder="Enter admin's email address"
                    required
                  />
                  <small>This email will be used to login to the admin dashboard</small>
                </div>

                <div className="form-group">
                  <label htmlFor="adminPassword">Password *</label>
                  <input
                    type="password"
                    id="adminPassword"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    minLength="6"
                    required
                  />
                  <small>Password must be at least 6 characters long</small>
                </div>

                <div className="form-group">
                  <label htmlFor="adminConfirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="adminConfirmPassword"
                    value={newAdmin.confirmPassword}
                    onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                    placeholder="Confirm the password"
                    minLength="6"
                    required
                  />
                  <small>Re-enter the password to confirm</small>
                </div>

                <div className="form-group">
                  <label htmlFor="adminAddress">Address</label>
                  <textarea
                    id="adminAddress"
                    value={newAdmin.address}
                    onChange={(e) => setNewAdmin({ ...newAdmin, address: e.target.value })}
                    placeholder="Enter admin's address (optional)"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setNewAdmin({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    address: ''
                  })}
                  className="clear-btn"
                  disabled={addAdminLoading}
                >
                  Clear Form
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={addAdminLoading}
                >
                  {addAdminLoading ? "Creating Admin..." : "Create Admin Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Store with Owner View */}
      {activeView === 'add-store' && (
        <div className="dashboard-content">
          <h2>Create New Store with Owner</h2>
          
          <div className="add-store-form-container">
            <form onSubmit={handleCreateStoreWithOwner} className="add-store-form">
              
              {/* Store Information Section */}
              <div className="form-section">
                <h3>Store Information</h3>
                
                <div className="form-group">
                  <label htmlFor="storeName">Store Name *</label>
                  <input
                    type="text"
                    id="storeName"
                    value={newStoreWithOwner.storeName}
                    onChange={(e) => setNewStoreWithOwner({ ...newStoreWithOwner, storeName: e.target.value })}
                    placeholder="Enter store name (e.g., Tech Store, Book Shop)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="storeEmail">Store Email *</label>
                  <input
                    type="email"
                    id="storeEmail"
                    value={newStoreWithOwner.storeEmail}
                    onChange={(e) => setNewStoreWithOwner({ ...newStoreWithOwner, storeEmail: e.target.value })}
                    placeholder="Enter store email (e.g., contact@techstore.com)"
                    required
                  />
                  <small>This email will be used for store identification</small>
                </div>

                <div className="form-group">
                  <label htmlFor="storeAddress">Store Address</label>
                  <textarea
                    id="storeAddress"
                    value={newStoreWithOwner.storeAddress}
                    onChange={(e) => setNewStoreWithOwner({ ...newStoreWithOwner, storeAddress: e.target.value })}
                    placeholder="Enter store address (optional)"
                    rows="2"
                  />
                </div>
              </div>

              {/* Store Owner Information Section */}
              <div className="form-section">
                <h3>Store Owner Information</h3>
                
                <div className="form-group">
                  <label htmlFor="ownerName">Owner Name *</label>
                  <input
                    type="text"
                    id="ownerName"
                    value={newStoreWithOwner.ownerName}
                    onChange={(e) => setNewStoreWithOwner({ ...newStoreWithOwner, ownerName: e.target.value })}
                    placeholder="Enter owner's full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ownerEmail">Owner Email *</label>
                  <input
                    type="email"
                    id="ownerEmail"
                    value={newStoreWithOwner.ownerEmail}
                    onChange={(e) => setNewStoreWithOwner({ ...newStoreWithOwner, ownerEmail: e.target.value })}
                    placeholder="Enter owner's email address"
                    required
                  />
                  <small>Owner will use this email to login and manage their store</small>
                </div>

                <div className="form-group">
                  <label htmlFor="ownerPassword">Owner Password *</label>
                  <input
                    type="password"
                    id="ownerPassword"
                    value={newStoreWithOwner.ownerPassword}
                    onChange={(e) => setNewStoreWithOwner({ ...newStoreWithOwner, ownerPassword: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    minLength="6"
                    required
                  />
                  <small>Owner will use this password to login to their store dashboard</small>
                </div>

                <div className="form-group">
                  <label htmlFor="ownerAddress">Owner Address</label>
                  <textarea
                    id="ownerAddress"
                    value={newStoreWithOwner.ownerAddress}
                    onChange={(e) => setNewStoreWithOwner({ ...newStoreWithOwner, ownerAddress: e.target.value })}
                    placeholder="Enter owner's address (optional)"
                    rows="2"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setNewStoreWithOwner({
                    storeName: '',
                    storeEmail: '',
                    storeAddress: '',
                    ownerName: '',
                    ownerEmail: '',
                    ownerPassword: '',
                    ownerAddress: ''
                  })}
                  className="clear-btn"
                  disabled={addStoreLoading}
                >
                  Clear Form
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={addStoreLoading}
                >
                  {addStoreLoading ? "Creating..." : "Create Store & Owner"}
                </button>
              </div>
            </form>

            <div className="form-help">
              <h4>How it works:</h4>
              <ul>
                <li><strong>One Store, One Owner:</strong> Each store gets a dedicated owner account</li>
                <li><strong>Owner Login:</strong> Owner uses their email and password to access store dashboard</li>
                <li><strong>Store Access:</strong> Owner can only manage their assigned store</li>
                <li><strong>Unique Emails:</strong> Both store email and owner email must be unique</li>
                <li><strong>Auto Linking:</strong> Store and owner are automatically linked in the database</li>
                <li>Fields marked with * are required</li>
                <li>Owner password must be at least 6 characters long</li>
              </ul>
              
              <div className="example-box">
                <h5>Example:</h5>
                <p><strong>Store:</strong> "Tech World" (techworld@example.com)</p>
                <p><strong>Owner:</strong> "John Smith" (john.smith@email.com)</p>
                <p>John can login with john.smith@email.com and manage only "Tech World"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stores View */}
      {activeView === 'stores' && (
        <div className="dashboard-content">
          <h2>Store Management</h2>
          
          {/* Store Filters */}
          <div className="filters-section">
            <h3>Filters</h3>
            <div className="filters-grid">
              <input
                type="text"
                placeholder="Filter by store name..."
                value={storeFilters.name}
                onChange={(e) => handleStoreFilterChange('name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Filter by store email..."
                value={storeFilters.email}
                onChange={(e) => handleStoreFilterChange('email', e.target.value)}
              />
              <input
                type="text"
                placeholder="Filter by address..."
                value={storeFilters.address}
                onChange={(e) => handleStoreFilterChange('address', e.target.value)}
              />
              <select
                value={storeFilters.rating}
                onChange={(e) => handleStoreFilterChange('rating', e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
              <button onClick={fetchStores} className="filter-btn">
                Apply Filters
              </button>
              <button 
                onClick={() => {
                  setStoreFilters({ name: '', email: '', address: '', rating: '' });
                  fetchStores();
                }}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Stores List */}
          {storesLoading ? (
            <div className="loading">Loading stores...</div>
          ) : (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Store ID</th>
                    <th>Store Name</th>
                    <th>Store Email</th>
                    <th>Address</th>
                    <th>Owner Name</th>
                    <th>Rating</th>
                    <th>Total Ratings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id}>
                      <td>{store.id}</td>
                      <td>{store.name}</td>
                      <td>{store.email}</td>
                      <td>{store.address || 'N/A'}</td>
                      <td>{store.owner?.name || 'N/A'}</td>
                      <td>
                        {store.averageRating > 0 ? 
                          `${store.averageRating} ⭐` : 
                          'No ratings'
                        }
                      </td>
                      <td>{store.totalRatings || 0}</td>
                      <td>
                        <button 
                          onClick={() => fetchUserDetails(store.ownerId)}
                          className="details-btn"
                          disabled={!store.ownerId}
                        >
                          View Owner
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stores.length === 0 && (
                <div className="no-data">No stores found matching the filters.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Users View */}
      {activeView === 'users' && (
        <div className="dashboard-content">
          <h2>User Management</h2>
          
          {/* User Filters */}
          <div className="filters-section">
            <h3>Filters</h3>
            <div className="filters-grid">
              <input
                type="text"
                placeholder="Filter by name..."
                value={userFilters.name}
                onChange={(e) => handleUserFilterChange('name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Filter by email..."
                value={userFilters.email}
                onChange={(e) => handleUserFilterChange('email', e.target.value)}
              />
              <input
                type="text"
                placeholder="Filter by address..."
                value={userFilters.address}
                onChange={(e) => handleUserFilterChange('address', e.target.value)}
              />
              {/* Removed the STORE_OWNER option from the filter select */}
              <select
                value={userFilters.role}
                onChange={(e) => handleUserFilterChange('role', e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>

              <button
                onClick={fetchUsers}
                className="filter-btn"
              >
                Apply Filters
              </button>

              <button
                onClick={() => {
                  setUserFilters({ name: '', email: '', address: '', role: '' });
                  fetchUsers();
                }}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Users List */}
          {usersLoading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Role</th>
                    <th>Stores Owned</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.address || 'N/A'}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.role === 'STORE_OWNER' ? 
                          (user.stores?.length || 0) : 
                          'N/A'
                        }
                      </td>
                      <td>
                        <button 
                          onClick={() => fetchUserDetails(user.id)}
                          className="details-btn"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="no-data">No users found matching the filters.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>User Details</h3>
              <button 
                onClick={() => setShowUserDetails(false)}
                className="close-modal-btn"
              >
                ×
              </button>
            </div>
            
            <div className="user-details-content">
              <div className="detail-row">
                <strong>ID:</strong> {selectedUser.id}
              </div>
              <div className="detail-row">
                <strong>Name:</strong> {selectedUser.name}
              </div>
              <div className="detail-row">
                <strong>Email:</strong> {selectedUser.email}
              </div>
              <div className="detail-row">
                <strong>Address:</strong> {selectedUser.address || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Role:</strong> 
                <span className={`role-badge ${selectedUser.role.toLowerCase()}`}>
                  {selectedUser.role}
                </span>
              </div>
              {selectedUser.role === 'STORE_OWNER' && (
                <>
                  <div className="detail-row">
                    <strong>Number of Stores:</strong> {selectedUser.stores?.length || 0}
                  </div>
                  {selectedUser.stores && selectedUser.stores.length > 0 && (
                    <div className="detail-row">
                      <strong>Owned Stores:</strong>
                      <ul>
                        {selectedUser.stores.map((store) => (
                          <li key={store.id}>
                            {store.name} - {store.email}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              <div className="detail-row">
                <strong>Account Created:</strong> 
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowUserDetails(false)}
                className="close-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}