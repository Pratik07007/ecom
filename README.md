This is a part of my backEnd practise series

## API URL
The API is deployed and accessible at: http://ecomapi.pratikdhimal.com.np:3000/

## Docker Deployment
To run this application using Docker:

1. Build the Docker image:
   ```
   docker build -t ecom-backend .
   ```

2. Run the container:
   ```
   docker run -p 3000:3000 -e DATABASE_URL="your-database-url" -e JWT_SECRET="your-jwt-secret" ecom-backend
   ```

Replace the environment variables with your actual values.

---

## API Usage Guide

### Environment Variables
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT authentication

### Admin Routes
- **Register Admin:** `POST /admin/register`
- **Login Admin:** `POST /admin/login`
- **Add Promo Code:** `POST /admin/promocode`
- **Get All Promo Codes:** `GET /admin/promocode`
- **Delete Promo Code:** `DELETE /admin/promocode/:id`

### User Routes
- **Register User:** `POST /user/register`
- **Login User:** `POST /user/login`
- **Get Profile:** `GET /user/profile` (JWT required)
- **Get Products:** `GET /user/products`
- **Get Product Details:** `GET /user/products/:id`
- **Add Review:** `POST /user/reviews` (JWT required)

### Product Routes
- **Get All Products:** `GET /product/`
- **Get Product by ID:** `GET /product/:id`
- **Get Products by Category:** `GET /product/category/:category`
- **Search Products:** `GET /product/search?query=...`
- **Add Product (Admin):** `POST /product/` (JWT required)
- **Update Product (Admin):** `PUT /product/:id` (JWT required)
- **Delete Product (Admin):** `DELETE /product/:id` (JWT required)

### Order Routes
- **Create Order:** `POST /order/` (JWT required)
- **Get User Orders:** `GET /order/` (JWT required)
- **Get Order by ID:** `GET /order/:id` (JWT required)
- **Update Order Status (Admin):** `PUT /order/:id` (JWT required)
- **Cancel Order:** `DELETE /order/:id` (JWT required)

---

## Example Requests

### Register User
```json
POST /user/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword",
  "phone": "1234567890"
}
```

### Login User
```json
POST /user/login
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

### Add Product (Admin)
```json
POST /product/
Headers: { "Authorization": "Bearer <admin-jwt-token>" }
{
  "name": "Product Name",
  "originalPrice": 100,
  "discountedPrice": 80,
  "desc": "Product description",
  "images": ["url1", "url2"],
  "category": "Electronics",
  "stock": 10
}
```

### Create Order
```json
POST /order/
Headers: { "Authorization": "Bearer <user-jwt-token>" }
{
  "items": [
    { "productId": 1, "quantity": 2 }
  ],
  "shippingAddress": "123 Main St",
  "paymentMethod": "card"
}
```

---

For more details, check each route file in the `Routes/` directory.