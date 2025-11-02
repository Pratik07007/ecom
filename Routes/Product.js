const express = require("express");
const { Product, Review, User } = require("../Db");
const { authMiddleware, productValidation } = require("../Middleware/ZodValidiation");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.use(express.json());

// Admin middleware to check if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ msg: "Authentication required" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
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

// Get products by category
router.get("/category/:category", async (req, res) => {
  const category = req.params.category;
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

// Search products
router.get("/search/:query", async (req, res) => {
  const query = req.params.query;
  const { Op } = require("sequelize");
  
  try {
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { desc: { [Op.iLike]: `%${query}%` } },
          { category: { [Op.iLike]: `%${query}%` } }
        ]
      }
    });
    
    res.json({ products });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get product reviews
router.get("/:id/reviews", async (req, res) => {
  const productId = req.params.id;
  try {
    const reviews = await Review.findAll({
      where: { ProductId: productId },
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ADMIN ROUTES

// Add product
router.post("/", adminMiddleware, productValidation, async (req, res) => {
  const { name, originalPrice, discountedPrice, desc, images, category, stock } = req.body;
  try {
    const existingProduct = await Product.findOne({ where: { name } });
    if (existingProduct) {
      return res.status(400).json({ msg: "Product already in the database" });
    }
    
    const product = await Product.create({
      name,
      originalPrice,
      discountedPrice,
      desc,
      images,
      category,
      stock: stock || 0
    });
    
    res.status(201).json({ 
      msg: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update product
router.put("/:id", adminMiddleware, async (req, res) => {
  const productId = req.params.id;
  const { name, originalPrice, discountedPrice, desc, images, category, stock } = req.body;
  
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    
    // Update product fields
    if (name) product.name = name;
    if (originalPrice) product.originalPrice = originalPrice;
    if (discountedPrice !== undefined) product.discountedPrice = discountedPrice;
    if (desc) product.desc = desc;
    if (images) product.images = images;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    
    await product.save();
    
    res.json({ 
      msg: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete product
router.delete("/:id", adminMiddleware, async (req, res) => {
  const productId = req.params.id;
  
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    
    await product.destroy();
    
    res.json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;