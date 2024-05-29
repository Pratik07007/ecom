const express = require("express");
const { admin, promo } = require("../Db");
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
      const token = jwt.sign({ email }, process.env.JWTSECRET);
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
  const response = await promo.findOne({ code });
  if (response) {
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
});



app.listen(PORT);
