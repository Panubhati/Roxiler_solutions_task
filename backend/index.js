const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/admin");
const storeRoutes = require("./src/routes/store");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

// Store routes - handles both regular user operations AND store owner operations
app.use("/api/stores", storeRoutes);

// Keep this for backward compatibility if needed
app.use("/api/store-owner", storeRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));