const zod = require("zod");
const jwt = require("jsonwebtoken");

const adminCredentialsValidiation = (req, res, next) => {
  const body = req.body;
  const userSchema = zod.object({
    email: zod.string().email(),
    password: zod
      .string()
      .min(8, "Password must be at least 8 character Long")
      .max(16, "Password cannot be more than 16 character long")
      .regex(/[A-Z]/, "Password must contain at least one upper case character")
      .regex(/[0-9]/, "Password must contain one number")
      .regex(
        /[~!@#$%^&*()_+=-}{[\|';/.,<>?":}]/,
        "Password must contain at least one special character"
      ),
  });
  const response = userSchema.safeParse(body);
  if (response.success) {
    next();
  } else {
    res.status(400).json({ error: response.error.issues[0].message });
  }
};

const userCredentialsValidiation = (req, res, next) => {
  const body = req.body;
  const userSchema = zod.object({
    name: zod.string(),
    phone: zod.string(),
    email: zod.string().email(),
    password: zod
      .string()
      .min(8, "Password must be at least 8 character Long")
      .max(16, "Password cannot be more than 16 character long")
      .regex(/[A-Z]/, "Password must contain at least one upper case character")
      .regex(/[0-9]/, "Password must contain one number")
      .regex(
        /[~!@#$%^&*()_+=-}{[\|';/.,<>?":}]/,
        "Password must contain at least one special character"
      ),
  });
  const response = userSchema.safeParse(body);
  if (response.success) {
    next();
  } else {
    res.status(400).json({ error: response.error.issues[0].message });
  }
};

const productValidation = (req, res, next) => {
  const body = req.body;
  const productSchema = zod.object({
    name: zod.string().min(3, "Product name must be at least 3 characters"),
    originalPrice: zod.number().positive("Price must be positive"),
    discountedPrice: zod.number().optional(),
    images: zod.array(zod.string()).optional(),
    desc: zod.string().min(10, "Description must be at least 10 characters"),
    category: zod.string(),
    stock: zod.number().int().nonnegative().optional()
  });
  const response = productSchema.safeParse(body);
  if (response.success) {
    next();
  } else {
    res.status(400).json({ error: response.error.issues[0].message });
  }
};

const orderValidation = (req, res, next) => {
  const body = req.body;
  const orderSchema = zod.object({
    items: zod.array(
      zod.object({
        productId: zod.number().int().positive(),
        quantity: zod.number().int().positive()
      })
    ),
    shippingAddress: zod.string().min(10, "Please provide a complete shipping address"),
    paymentMethod: zod.string(),
    promoCode: zod.string().optional()
  });
  const response = orderSchema.safeParse(body);
  if (response.success) {
    next();
  } else {
    res.status(400).json({ error: response.error.issues[0].message });
  }
};

const reviewValidation = (req, res, next) => {
  const body = req.body;
  const reviewSchema = zod.object({
    productId: zod.number().int().positive(),
    rating: zod.number().int().min(1).max(5),
    comment: zod.string().optional()
  });
  const response = reviewSchema.safeParse(body);
  if (response.success) {
    next();
  } else {
    res.status(400).json({ error: response.error.issues[0].message });
  }
};

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { 
  adminCredentialsValidiation, 
  userCredentialsValidiation,
  productValidation,
  orderValidation,
  reviewValidation,
  authMiddleware
};
