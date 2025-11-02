const express = require("express");
const { Admin, PromoCode } = require("../Db");
const jwt = require("jsonwebtoken");
const { adminCredentialsValidiation } = require("../Middleware/ZodValidiation");
const router = express.Router();
const cors = require("cors");

router.use(express.json());

const corsOptions = {
  credentials: true,
  origin: ['http://localhost:5173'] 
};

router.use(cors(corsOptions)); 

// Admin register
router.post("/register", adminCredentialsValidiation, async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(403).json({ msg: `Admin with email ${email} already exists` });
    }
    
    await Admin.create({ email, password });
    res.status(201).json({ msg: "Admin Created Successfully" });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { email, password } });
    if (!admin) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }
    
    const token = jwt.sign({ id: admin.id, email, isAdmin: true }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });
    
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

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

// Add promo code
router.post("/promos", adminMiddleware, async (req, res) => {
  const { cappedAt, code, discount, minspend, until } = req.body;
  try {
    const existingPromo = await PromoCode.findOne({ where: { code } });
    if (existingPromo) {
      return res.status(400).json({ msg: `Code: ${code} already exists` });
    }
    
    const promo = await PromoCode.create({
      code,
      discount,
      cappedAt,
      minspend,
      until
    });
    
    res.status(201).json({ 
      msg: `Code: ${code} added successfully`,
      promo
    });
  } catch (error) {
    console.error("Error adding promo:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all promos
router.get("/promos", adminMiddleware, async (req, res) => {
  try {
    const promos = await PromoCode.findAll();
    res.json({ promos });
  } catch (error) {
    console.error("Error fetching promos:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete promo
router.delete("/promos/:id", adminMiddleware, async (req, res) => {
  const promoId = req.params.id;
  
  try {
    const promo = await PromoCode.findByPk(promoId);
    if (!promo) {
      return res.status(404).json({ msg: "Promo not found" });
    }
    
    await promo.destroy();
    
    res.json({ msg: "Promo deleted successfully" });
  } catch (error) {
    console.error("Error deleting promo:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
