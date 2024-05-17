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

const allProductsSchema = mongoose.Schema({
  name: String,
  originalPrice: Number,
  discountedPrice: Number,
  images: [String],
  desc: String,
});

const promoCodesSchema = mongoose.Schema({
  code: String,
  discount: Number,
  cappedAt: Number,
  minspend: Number,
});
//creating model

const AllProducts = mongoose.model("Products", allProductsSchema);

const admin = mongoose.model("Admin", adminSchema);

const user = mongoose.model("User", userSchema);

const promo = mongoose.model("Promo", promoCodesSchema);

module.exports = { AllProducts, admin, user, promo };
