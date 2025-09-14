const express = require("express");
const { login, signup, updatePassword } = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/signup", signup);

// Protected for all roles
router.put("/update-password", authMiddleware(["USER", "STORE_OWNER", "ADMIN"]), updatePassword);

module.exports = router;
