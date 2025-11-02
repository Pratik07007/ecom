const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
require('./Db');

// Import routes
const userRoutes = require('./Routes/User');
const adminRoutes = require('./Routes/Admin');
const productRoutes = require('./Routes/Product');
const orderRoutes = require('./Routes/Order');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

const corsOptions = {
  credentials: true,
  origin: ['http://localhost:5173']
};

app.use(cors(corsOptions));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the E-commerce API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});