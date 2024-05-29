const express = require("express");
const jwt = require("jsonwebtoken");
const { userCredentialsValidiation } = require("../middleware/ZodValidiation");
const { user, promo } = require("../Db");
const app = express();

app.use(express.json());

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
      res.json({ promo:response });
    } else {
      res.status(403).json({ msg: "Invalid Promo code" });
    }
  } catch (error) {
    res.status(403).json({ msg: "Something Went Wrong" });
  }
});

app.listen(PORT);
