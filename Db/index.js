const mongoose = require("mongoose");

//Databse Connection
try {
  mongoose.connect(
    "mongodb+srv://np03cs4a230180:9AZhbah9y2aQDrrZ@pratikcluster.xg6nhfe.mongodb.net/ecom"
  );
  console.log("Database Connection Success!");
} catch (error) {
  console.log(`Database Connection Success! ${error}`);
}

//Defining Schema

const adminSchema = mongoose.Schema({
  email: String,
  password: String,
});

const userSchema = mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  password: String,
});

const AllProductsSchema = mongoose.Schema({
  name: String,
  originalPrice: Number,
  discountedPrice: Number,
  images: [String],
  desc: String,
});

const AllProducts = mongoose.model("Products", AllProductsSchema);

const admin = mongoose.model("Admin", adminSchema);

const user = mongoose.model("User", userSchema);

module.exports = { AllProducts, admin, user };
