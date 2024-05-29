const express = require("express");
const { admin, promo, AllProducts } = require("../Db");
const jwt = require("jsonwebtoken");
const { adminCredentialsValidiation } = require("../middleware/ZodValidiation");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/adminRegister", adminCredentialsValidiation, async (req, res) => {
  const { email, password } = req.body;
  const respone = await admin.findOne({ email });
  if (respone) {
    res.status(403).json({ msg: `Admin with email ${email} already exists` });
  } else {
    admin
      .create({ email, password })
      .then(() => res.status(200).json({ msg: "Admin Created Succesfully" }));
  }
});

app.post("/adminLogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await admin.findOne({ email, password });
    if (response) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET);
      res.status(200).json({ token });
    } else {
      res.status(203).json({ msg: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/addPromo", async (req, res) => {
  const { cappedAt, code, discount, minspend } = req.body;
  const token = req.headers.authorization;
  try {
    const email = jwt.verify(token, process.env.JWT_SECRET).email;
    const dbResponse = admin.findOne({ email });
    if (dbResponse) {
      const promos = await promo.findOne({ code });
      if (promos) {
        res.status(400).json({ msg: `Code:${code} already exist` });
      } else {
        promo
          .create({
            cappedAt,
            code,
            discount,
            minspend,
          })
          .then(() =>
            res.status(400).json({ msg: `Code:${code} added succesfully` })
          );
      }
    }
  } catch (error) {
    res.json({
      msg: "Permission Denied: You need to be an admin to perform this task",
    });
  }
});

app.post("/addProducts", async (req, res) => {
  const { name, originalPrice, discountedPrice, desc, images } = req.body;
  const token = req.headers.authorization;
  try {
    const email = jwt.verify(token, process.env.JWT_SECRET).email;
    const dbResposne = admin.findOne({ email });
    if (dbResposne) {
      const findName = await AllProducts.findOne({ name });
      const finddesc = await AllProducts.findOne({ desc });
      if (findName && finddesc) {
        res.json({ msg: "Product already in the database" });
      } else {
        AllProducts.create({
          name,
          originalPrice,
          discountedPrice,
          desc,
          images,
        });
        res.status(200).json({ msg: "Product Created Scccesfully" });
      }
    }
  } catch (error) {
    res.json({
      msg: "Permission Denied: You need to be an admin to perform this task",
    });
  }

  // need correction here
});
app.listen(PORT);
