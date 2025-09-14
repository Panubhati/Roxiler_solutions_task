import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


import Login from "./pages/Login";
import Signup from "./pages/Signup";

import AdminDashboard from "./pages/AdminDashboard";
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard"; 
import UserDashboard from "./pages/UserDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
      
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Store Owner Dashboard */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["STORE_OWNER"]}>
              <StoreOwnerDashboard /> 
            </ProtectedRoute>
          }
        />

        {/* Normal User Dashboard */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
