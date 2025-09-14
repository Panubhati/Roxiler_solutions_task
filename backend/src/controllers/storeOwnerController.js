const prisma = require("../../prismaClient");
const bcrypt = require("bcryptjs");


const getMyStore = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        _count: { select: { ratings: true } }
      }
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({ 
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        totalRatings: store._count.ratings,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt
      }
    });
  } catch (err) {
    console.error("Get My Store Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get My Ratings
const getMyRatings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const avgRating = store.ratings.length > 0
      ? store.ratings.reduce((sum, r) => sum + r.value, 0) / store.ratings.length
      : 0;

    res.json({ 
      storeName: store.name,
      totalRatings: store.ratings.length,
      averageRating: parseFloat(avgRating.toFixed(2)),
      ratings: store.ratings.map(r => ({
        id: r.id,
        value: r.value,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          name: r.user.name,
          email: r.user.email
        }
      }))
    });
  } catch (err) {
    console.error("Get My Ratings Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//Get Dashboard
const getStoreOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const avgRating = store.ratings.length > 0
      ? store.ratings.reduce((sum, r) => sum + r.value, 0) / store.ratings.length
      : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    store.ratings.forEach(rating => {
      ratingDistribution[rating.value]++;
    });

    const recentRatings = store.ratings.slice(0, 5);

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        totalRatings: store.ratings.length,
        averageRating: parseFloat(avgRating.toFixed(2)),
        ratingDistribution,
        recentRatings: recentRatings.map(r => ({
          id: r.id,
          value: r.value,
          createdAt: r.createdAt,
          user: { id: r.user.id, name: r.user.name, email: r.user.email }
        })),
        usersRated: store.ratings.map(r => ({
          id: r.user.id,
          name: r.user.name,
          email: r.user.email,
          rating: r.value,
          ratedAt: r.createdAt
        }))
      }
    });
  } catch (err) {
    console.error("Store Owner Dashboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//Update Password
const updatePassword = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const owner = await prisma.user.findUnique({
      where: { id: ownerId }
    });

    if (!owner) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, owner.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: ownerId },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Update Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  getMyStore, 
  getMyRatings, 
  getStoreOwnerDashboard,
  updatePassword
};