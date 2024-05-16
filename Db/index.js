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
const AllProductsSchema = mongoose.Schema({
  name: String,
  originalPrice: Number,
  discountedPrice: Number,
  images: [String],
  desc: String,
});

const AllProducts = mongoose.model("Products", AllProductsSchema);

AllProducts.create({
  name:"Pratik",
  originalPrice: 123,
  discountedPrice: 1234,
  images: ["asfaf","afaf","asfasf"],
  desc: "HEllooo",
})
