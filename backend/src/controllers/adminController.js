const prisma = require("../../prismaClient");
const bcrypt = require("bcrypt");

const getDashboard = async (req, res) => {
  try {
    console.log("=== DASHBOARD DEBUG START ===");

    // Count totals
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    console.log("Total Users:", totalUsers);

    const totalStores = await prisma.store.count();
    console.log("Total Stores:", totalStores);

    const totalRatings = await prisma.rating.count();
    console.log("Total Ratings:", totalRatings);

    const allUsers = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
    const allStores = await prisma.store.findMany({ select: { id: true, name: true, ownerId: true } });
    const allRatings = await prisma.rating.findMany({
      select: {
        id: true,
        value: true,
        userId: true,
        storeId: true,
        createdAt: true
      }
    });

    const dashboardData = {
      totalUsers,
      totalStores,
      totalRatings,
      debug: {
        actualUsers: allUsers.length,
        actualStores: allStores.length,
        actualRatings: allRatings.length,
        usersList: allUsers,
        storesList: allStores,
        ratingsList: allRatings
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Error retrieving dashboard data", error: error.message });
  }
};


const createUser = async (req, res) => {
  try {
    const { email, password, role = "USER", name, address } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ success: false, message: "User with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, role, name, address },
      select: { id: true, email: true, role: true, name: true, address: true, createdAt: true }
    });

    res.status(201).json({ success: true, message: "User created successfully", data: newUser });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ success: false, message: "Error creating user", error: error.message });
  }
};

// create admin
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address"
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "An admin with this email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address: address || null,
        role: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    console.log("New admin created:", { id: newAdmin.id, email: newAdmin.email, role: newAdmin.role });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: newAdmin
    });

  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create admin",
      message: error.message
    });
  }
};

const getUsers = async (req, res) => {
  console.log("Attempting to get ALL users...");
  try {
    const { page = 1, limit = 10, role, name, email, address } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    

    let whereClause = {};
    
    if (role) whereClause.role = role;
    if (name) whereClause.name = { contains: name };
    if (email) whereClause.email = { contains: email };
    if (address) whereClause.address = { contains: address };

    const users = await prisma.user.findMany({
      where: whereClause,
      select: { 
        id: true, 
        email: true, 
        role: true, 
        name: true, 
        address: true, 
        createdAt: true, 
        updatedAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const totalUsers = await prisma.user.count({ where: whereClause });

    res.json({
      success: true,
      data: {
        users,
        pagination: { 
          page: parseInt(page), 
          limit: parseInt(limit), 
          total: totalUsers, 
          pages: Math.ceil(totalUsers / parseInt(limit)) 
        }
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Error retrieving users", error: error.message });
  }
};

// get user details
const getUserDetails = async (req, res) => {
  console.log("Attempting to get details for user ID:", req.params.id);
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parsedId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        ratings: {
          select: {
            id: true,
            value: true,
            createdAt: true,
            store: { select: { id: true, name: true } }
          }
        },
        stores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ success: false, message: "Error retrieving user details", error: error.message });
  }
};

// create store
const createStore = async (req, res) => {
  try {
    const { name, description, category, address, phone, email, ownerId } = req.body;

    const existingStore = await prisma.store.findFirst({ where: { name } });
    if (existingStore) return res.status(400).json({ success: false, message: "Store with this name already exists" });

    const newStore = await prisma.store.create({
      data: { name, description, category, address, phone, email, ownerId: ownerId || null }
    });

    res.status(201).json({ success: true, message: "Store created successfully", data: newStore });
  } catch (error) {
    console.error("Create store error:", error);
    res.status(500).json({ success: false, message: "Error creating store", error: error.message });
  }
};

// get stores - FIXED for MySQL compatibility
const getStores = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, name, email, address, rating } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {};
    
    if (category) whereClause.category = category;
    // FIXED: Removed mode: 'insensitive' for MySQL compatibility
    if (name) whereClause.name = { contains: name };
    if (email) whereClause.email = { contains: email };
    if (address) whereClause.address = { contains: address };

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: { 
        ratings: { select: { value: true } }, 
        _count: { select: { ratings: true } },
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    let storesWithAvgRating = stores.map(store => {
      const totalRatings = store.ratings.length;
      const avgRating = totalRatings ? store.ratings.reduce((sum, r) => sum + r.value, 0) / totalRatings : 0;
      return { 
        ...store, 
        averageRating: parseFloat(avgRating.toFixed(2)), 
        totalRatings, 
        ratings: undefined 
      };
    });

    // Filter by rating 
    if (rating) {
      const minRating = parseFloat(rating);
      storesWithAvgRating = storesWithAvgRating.filter(store => store.averageRating >= minRating);
    }

    const totalStores = await prisma.store.count({ where: whereClause });

    res.json({
      success: true,
      data: { 
        stores: storesWithAvgRating, 
        pagination: { 
          page: parseInt(page), 
          limit: parseInt(limit), 
          total: totalStores, 
          pages: Math.ceil(totalStores / parseInt(limit)) 
        } 
      }
    });
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({ success: false, message: "Error retrieving stores", error: error.message });
  }
};

// create the store
const createStoreWithOwner = async (req, res) => {
  try {
    const { store, owner } = req.body;

    // Validate required fields
    if (!store.name || !store.email || !owner.name || !owner.email || !owner.password) {
      return res.status(400).json({ 
        success: false,
        error: 'Store name, store email, owner name, owner email, and owner password are required' 
      });
    }

    // Validate password length
    if (owner.password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if owner email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: owner.email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'Owner email already exists' 
      });
    }

    // Check if store email already exists
    const existingStore = await prisma.store.findFirst({
      where: { email: store.email }
    });

    if (existingStore) {
      return res.status(400).json({ 
        success: false,
        error: 'Store email already exists' 
      });
    }

    // Hash the owner's password
    const hashedPassword = await bcrypt.hash(owner.password, 12);

    // Create the store owner user first
    const newOwner = await prisma.user.create({
      data: {
        name: owner.name,
        email: owner.email,
        password: hashedPassword,
        address: owner.address || null,
        role: 'STORE_OWNER'
      }
    });

    // Create the store with the owner's ID
    const newStore = await prisma.store.create({
      data: {
        name: store.name,
        email: store.email,
        address: store.address || null,
        ownerId: newOwner.id,
        avgRating: 0
      }
    });

    console.log("Store and owner created:", { 
      storeId: newStore.id, 
      ownerId: newOwner.id, 
      storeName: newStore.name,
      ownerEmail: newOwner.email 
    });

    res.status(201).json({
      success: true,
      message: 'Store and owner created successfully',
      data: {
        store: newStore,
        owner: {
          id: newOwner.id,
          name: newOwner.name,
          email: newOwner.email,
          role: newOwner.role
        }
      }
    });

  } catch (error) {
    console.error('Error creating store with owner:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create store with owner',
      message: error.message 
    });
  }
};

// exports
module.exports = {
  getDashboard,
  createUser,
  createAdmin,
  getUsers,
  getUserDetails,
  createStore,
  getStores,
  createStoreWithOwner
};