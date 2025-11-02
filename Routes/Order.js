const express = require("express");
const { Order, OrderItem, Product, User } = require("../Db");
const { authMiddleware } = require("../Middleware/ZodValidiation");
const router = express.Router();

router.use(express.json());

// Create new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "Order must contain items" });
    }

    // Calculate total price
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Product with ID ${item.productId} not found` });
      }
      totalAmount += product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      UserId: userId,
      totalAmount,
      status: "pending",
      shippingAddress,
      paymentMethod
    });

    // Create order items
    for (const item of items) {
      await OrderItem.create({
        OrderId: order.id,
        ProductId: item.productId,
        quantity: item.quantity,
        price: (await Product.findByPk(item.productId)).price
      });
    }

    res.status(201).json({ 
      msg: "Order created successfully", 
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get user orders
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.findAll({
      where: { UserId: userId },
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get order by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    
    const order = await Order.findOne({
      where: { 
        id: orderId,
        UserId: userId
      },
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    
    res.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update order status (admin only)
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    // Check if user is admin (you might want to use adminMiddleware instead)
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: "Not authorized" });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }
    
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    
    order.status = status;
    await order.save();
    
    res.json({ msg: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Cancel order
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    
    const order = await Order.findOne({
      where: { 
        id: orderId,
        UserId: userId
      }
    });
    
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ msg: "Cannot cancel order at current status" });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json({ msg: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;