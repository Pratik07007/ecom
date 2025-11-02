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