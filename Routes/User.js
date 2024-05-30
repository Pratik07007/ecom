const express = require("express");
const jwt = require("jsonwebtoken");
const { userCredentialsValidiation } = require("../middleware/ZodValidiation");
const { user, promo, AllProducts } = require("../Db");
const app = express();
const cors = require("cors")

app.use(express.json());

const corsOptions = {
  credentials: true,
  origin: ['http://localhost:5173'] 
};

app.use(cors(corsOptions)); 


const PORT = process.env.PORT || 3000;

app.post("/userRegister", userCredentialsValidiation, async (req, res) => {
  const { name, phone, email, password } = req.body;
  const response = await user.findOne({ email });
  if (response) {
    res.status(403).json({ msg: `User with email ${email} already exists` });
  } else {
    user
      .create({
        name,
        phone,
        email,
        password,
      })
      .then(() => res.status(200).json({ msg: "User Created Succesfully" }));
  }
});

app.post("/userLogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await user.findOne({ email, password });
    if (response) {
      const token = jwt.sign({ email }, "12345");
      res.status(200).json({ token });
    } else {
      res.status(203).json({ msg: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/promos/:code", async (req, res) => {
  const code = req.params.code;
  try {
    const response = await promo.findOne({ code });
    if (response) {
      res.json({ promo: response });
    } else {
      res.status(403).json({ msg: "Invalid Promo code" });
    }
  } catch (error) {
    res.status(403).json({ msg: "Something Went Wrong" });
  }
});

app.get("/allProducts", async (req, res) => {
  try {
    const product = await AllProducts.find({});
    res.json({ product });
  } catch (error) {
    res.status(400).json({ msg: "Something went wrong" });
  }
});

app.get("/category", async (req, res) => {
  try {
    const category = req.query.q;
    const products = await AllProducts.find({ category });
    if (products.length == 0) {
      res.status(200).json({ msg: "No Product in this category" });
    } else {
      res.json({ products });
    }
  } catch (error) {
    res.status(400).json({ msg: "Something went wrong" });
  }
});

app.listen(PORT);
