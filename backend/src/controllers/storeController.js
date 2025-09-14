const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// GET all stores with search functionality
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user.userId;

    // Build where clause for search
    let whereClause = {};
    if (search && search.trim()) {
      whereClause = {
        OR: [
          {
            name: {
              contains: search.trim()
            }
          },
          {
            address: {
              contains: search.trim()
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
        const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
        averageRating = sum / ratings.length;
      }

      // Find user's rating
      const userRating = ratings.find(rating => rating.user.id === userId);

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        averageRating: averageRating,
        userRating: userRating ? userRating.rating : null
      };
    });

    res.json(processedStores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST rate a store
router.post('/rate', authenticateToken, async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.userId;

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
        userId: userId,
        storeId: parseInt(storeId)
      }
    });

    if (existingRating) {
      // Update existing rating
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: { rating: parseInt(rating) }
      });
    } else {
      // Create new rating
      await prisma.rating.create({
        data: {
          userId: userId,
          storeId: parseInt(storeId),
          rating: parseInt(rating)
        }
      });
    }

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;