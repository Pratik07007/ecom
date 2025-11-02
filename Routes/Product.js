const express = require("express");
const { Product, Review, User } = require("../Db");
const router = express.Router();

router.use(express.json());

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

module.exports = router;