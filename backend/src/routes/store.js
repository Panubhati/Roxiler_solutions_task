const express = require("express");
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = express.Router();


const getAllStores = async (req, res) => {
  try {
    const { search } = req.query;
    
    // Correctly access the user's ID
    const userId = req.user?.id;

    // Normalize search text
    const searchTerm = search ? search.trim().toLowerCase() : "";

    // Build where clause for search
    let whereClause = {};
    if (searchTerm) {
      whereClause = {
        OR: [
          {
            name: {
              contains: searchTerm
            }
          },
          {
            address: {
              contains: searchTerm
            }
          }
        ]
      };
    }

    // Get stores with ratings
    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    // Process stores to include average rating and user's rating
    const processedStores = stores.map(store => {
      const ratings = store.ratings;

      // Calculate average rating
      let averageRating = 0;
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
        averageRating = sum / ratings.length;
      }

      // Find user's rating
      const userRating = ratings.find(rating => userId && rating.user.id === userId);

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        averageRating: averageRating || null,
        userRating: userRating ? userRating.value : null
      };
    });

    res.json(processedStores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const rateStore = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    
    // Correctly access the user's ID
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: parseInt(storeId) }
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user has already rated this store
    const existingRating = await prisma.rating.findFirst({
      where: {
        userId: parseInt(userId),
        storeId: parseInt(storeId)
      }
    });

    if (existingRating) {
      // Update existing rating
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: { value: parseInt(rating) }
      });
    } else {
      // Create new rating
      await prisma.rating.create({
        data: {
          value: parseInt(rating),
        
          store: {
            connect: {
              id: parseInt(storeId)
            }
          },
          user: {
            connect: {
              id: parseInt(userId)
            }
          }
        }
      });
    }

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const removeRating = async (req, res) => {
  try {
    console.log('=== DELETE ROUTE HIT ===');
    console.log('Store ID from params:', req.params.storeId);
    console.log('User from token:', req.user);

    const { storeId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: parseInt(storeId) }
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user has rated this store
    const existingRating = await prisma.rating.findFirst({
      where: {
        userId: parseInt(userId),
        storeId: parseInt(storeId)
      }
    });

    if (!existingRating) {
      return res.status(404).json({ 
        message: 'No rating found to remove' 
      });
    }

    // Delete the rating
    await prisma.rating.delete({
      where: { id: existingRating.id }
    });

    res.json({ 
      message: 'Rating removed successfully' 
    });

  } catch (error) {
    console.error('Error removing rating:', error);
    res.status(500).json({ 
      message: 'Failed to remove rating. Please try again.' 
    });
  }
};


const getMyStore = async (req, res) => {
  try {
    const storeOwnerId = req.user?.id;

    if (!storeOwnerId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const store = await prisma.store.findFirst({
      where: { ownerId: parseInt(storeOwnerId) },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMyRatings = async (req, res) => {
  try {
    const storeOwnerId = req.user?.id;

    if (!storeOwnerId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const store = await prisma.store.findFirst({
      where: { ownerId: parseInt(storeOwnerId) },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store.ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStoreOwnerDashboard = async (req, res) => {
  try {
    const storeOwnerId = req.user?.id;
    if (!storeOwnerId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const store = await prisma.store.findFirst({
      where: { ownerId: parseInt(storeOwnerId) },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Calculate statistics
    const ratings = store.ratings;
    const totalRatings = ratings.length;

    let averageRating = 0;
    if (totalRatings > 0) {
      const sum = ratings.reduce((acc, rating) => acc + rating.value, 0); 
      averageRating = sum / totalRatings;
    }

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      ratingDistribution[rating.value]++ 
    });

    // Get recent ratings (last 5)
    const recentRatings = ratings.slice(0, 5).map(rating => ({
      id: rating.id,
      value: rating.value, 
      user: {
        name: rating.user.name
      },
      createdAt: rating.createdAt
    }));

    // Get all users who rated
    const usersRated = ratings.map(rating => ({
      id: rating.user.id,
      name: rating.user.name,
      email: rating.user.email,
      rating: rating.value, 
      ratedAt: rating.createdAt
    }));

    const storeData = {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating,
      totalRatings,
      ratingDistribution,
      recentRatings,
      usersRated
    };

    res.json({ store: storeData });
  } catch (error) {
    console.error('Error fetching store dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const storeOwnerId = req.user?.id;

    if (!storeOwnerId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find the store owner user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(storeOwnerId) }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    //hash newPassword
    await prisma.user.update({
      where: { id: parseInt(storeOwnerId) },
      data: { password: newPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

router.get("/my-store", authMiddleware(["STORE_OWNER"]), getMyStore);
router.get("/my-ratings", authMiddleware(["STORE_OWNER"]), getMyRatings);
router.get("/dashboard", authMiddleware(["STORE_OWNER"]), getStoreOwnerDashboard);
router.put("/update-password", authMiddleware(["STORE_OWNER"]), updatePassword);


router.get("/", authMiddleware(["USER", "ADMIN", "STORE_OWNER"]), getAllStores);
router.post("/rate", authMiddleware(["USER", "ADMIN"]), rateStore);

//  Add DELETE route for removing ratings 
router.delete("/rate/:storeId", authMiddleware(["USER", "ADMIN"]), removeRating);

module.exports = router;