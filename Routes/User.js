const express = require("express");
const jwt = require("jsonwebtoken");
const {
  userCredentialsValidiation,
  authMiddleware,
  reviewValidation,
} = require("../Middleware/ZodValidiation");
const { User, PromoCode, Product, Review } = require("../Db");
const router = express.Router();

router.use(express.json());

// Register a new user
router.post("/register", userCredentialsValidiation, async (req, res) => {
  const { name, phone, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(403)
        .json({ msg: `User with email ${email} already exists` });
    }

    const newUser = await User.create({
      name,
      phone,
      email,
      password, // In a production app, you should hash this password
    });

    res.status(201).json({
      msg: "User Created Successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email, password } });
    if (!user) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "phone", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
  const { name, phone } = req.body;
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;

    await user.save();

    res.json({
      msg: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Validate promo code
router.get("/promos/:code", async (req, res) => {
  const code = req.params.code;
  try {
    const promo = await PromoCode.findOne({ where: { code } });

    if (!promo) {
      return res.status(404).json({ msg: "Invalid Promo code" });
    }

    // Check if promo is expired
    if (promo.until && new Date(promo.until) < new Date()) {
      return res.status(400).json({ msg: "Promo code has expired" });
    }

    res.json({ promo });
  } catch (error) {
    console.error("Error validating promo:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get products by category
router.get("/products/category", async (req, res) => {
  const category = req.query.q;
  try {
    const products = await Product.findAll({ where: { category } });

    if (products.length === 0) {
      return res.status(200).json({ msg: "No products in this category" });
    }

    res.json({ products });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get product by ID
router.get("/products/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Add product review
router.post("/reviews", authMiddleware, reviewValidation, async (req, res) => {
  const { productId, rating, comment } = req.body;
  try {
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: {
        UserId: req.user.id,
        ProductId: productId,
      },
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();

      return res.json({
        msg: "Review updated successfully",
        review: existingReview,
      });
    }

    // Create new review
    const review = await Review.create({
      rating,
      comment,
      UserId: req.user.id,
      ProductId: productId,
    });

    res.status(201).json({
      msg: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
