const express = require("express");
const { 
  getDashboard,
  createUser,
  getUsers,
  getUserDetails,
  createStore,
  getStores,
  createStoreWithOwner,
  createAdmin  
} = require("../controllers/adminController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();


console.log('authMiddleware type:', typeof authMiddleware);

// Admin-only endpoints
router.get("/dashboard", authMiddleware(["ADMIN"]), getDashboard);
router.post("/users", authMiddleware(["ADMIN"]), createUser);


router.get("/users", authMiddleware(["ADMIN"]), getUsers);
router.get("/users/:id", authMiddleware(["ADMIN"]), getUserDetails);

router.post("/stores", authMiddleware(["ADMIN"]), createStore);
router.get("/stores", authMiddleware(["ADMIN"]), getStores);


router.post('/create-admin', authMiddleware(["ADMIN"]), createAdmin);

router.post("/create-store-with-owner", authMiddleware(["ADMIN"]), createStoreWithOwner);

module.exports = router;
