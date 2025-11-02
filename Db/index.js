const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// Database Connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database Connection Success!");
  } catch (error) {
    console.error(`Database Connection Failed: ${error}`);
  }
};

testConnection();

// Define Models
const Admin = sequelize.define("Admin", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  originalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  discountedPrice: {
    type: DataTypes.FLOAT,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
  },
  desc: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.STRING,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

const PromoCode = sequelize.define("PromoCode", {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  discount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  cappedAt: {
    type: DataTypes.FLOAT,
  },
  minspend: {
    type: DataTypes.FLOAT,
  },
  until: {
    type: DataTypes.DATE,
  },
});

// New models for enhanced functionality
const Order = sequelize.define("Order", {
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled"
    ),
    defaultValue: "pending",
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  promoApplied: {
    type: DataTypes.STRING,
  },
  discountAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
});

const OrderItem = sequelize.define("OrderItem", {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

const Review = sequelize.define("Review", {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
  },
});

// Define relationships
User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

User.hasMany(Review);
Review.belongsTo(User);

Product.hasMany(Review);
Review.belongsTo(Product);

// Sync all models with database
sequelize
  .sync()
  .then(() => console.log("All models were synchronized successfully."))
  .catch((err) => console.error("Error synchronizing models:", err));

module.exports = {
  sequelize,
  Admin,
  User,
  Product,
  PromoCode,
  Order,
  OrderItem,
  Review,
};
